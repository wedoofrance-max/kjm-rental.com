import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

function isAuthed(req: NextRequest): boolean {
  const adminCookie = req.cookies.get('kjm_admin')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD || 'kjm2026';
  return adminCookie === adminPassword;
}

/**
 * POST: Cleanup old damage log photos
 * Deletes the 20 oldest photos if total count >= 20
 * This is triggered after every photo capture session
 */
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all damage logs with photos
    const damageLogs = await prisma.damageLog.findMany({
      select: {
        id: true,
        photoUrls: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Flatten all photos with metadata
    const allPhotos: Array<{ logId: string; url: string; createdAt: Date }> = [];
    damageLogs.forEach((log) => {
      if (log.photoUrls) {
        try {
          const urls = JSON.parse(log.photoUrls);
          if (Array.isArray(urls)) {
            urls.forEach((url: string) => {
              allPhotos.push({
                logId: log.id,
                url,
                createdAt: log.createdAt,
              });
            });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    // Check if cleanup is needed
    if (allPhotos.length < 20) {
      return NextResponse.json({
        success: true,
        message: 'No cleanup needed',
        totalPhotos: allPhotos.length,
        deletedCount: 0,
      });
    }

    // Get the 20 oldest photos to delete
    const photosToDelete = allPhotos.slice(0, 20);
    const deletedUrls = new Set<string>();

    // Delete physical files
    const uploadsDir = path.join(process.cwd(), 'public/uploads/damage-logs');
    for (const photo of photosToDelete) {
      deletedUrls.add(photo.url);
      const fileName = photo.url.split('/').pop();
      if (fileName) {
        try {
          const filePath = path.join(uploadsDir, fileName);
          await fs.unlink(filePath);
        } catch (e) {
          // File might already be deleted, ignore
        }
      }
    }

    // Update damage logs to remove deleted URLs
    for (const log of damageLogs) {
      if (log.photoUrls) {
        try {
          const urls = JSON.parse(log.photoUrls);
          if (Array.isArray(urls)) {
            const filtered = urls.filter((url: string) => !deletedUrls.has(url));
            if (filtered.length !== urls.length) {
              await prisma.damageLog.update({
                where: { id: log.id },
                data: {
                  photoUrls: JSON.stringify(filtered),
                },
              });
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${photosToDelete.length} oldest photos`,
      totalPhotos: allPhotos.length,
      deletedCount: photosToDelete.length,
      timestamp: new Date(),
    });
  } catch (err: any) {
    console.error('Error during cleanup:', err);
    return NextResponse.json(
      { error: 'Failed to cleanup photos', details: err.message },
      { status: 500 }
    );
  }
}
