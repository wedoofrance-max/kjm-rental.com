import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(request: NextRequest) {
  return request.cookies.get('kjm_admin')?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing required field: reportId' },
        { status: 400 }
      );
    }

    // Fetch report
    const report = await prisma.rentalReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Generate HTML for PDF
    const paymentBreakdown = typeof report.paymentBreakdown === 'string'
      ? JSON.parse(report.paymentBreakdown)
      : report.paymentBreakdown || {};
    const topVehicles = typeof report.topVehicles === 'string'
      ? JSON.parse(report.topVehicles)
      : report.topVehicles || [];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Rental Report - ${report.period}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #2c3e50;
          }
          .period {
            color: #666;
            font-size: 14px;
          }
          .section {
            margin: 30px 0;
          }
          .section h2 {
            color: #2c3e50;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-box {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #3498db;
            border-radius: 4px;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KJM Motors - Rental Report</h1>
          <p class="period">${report.period}</p>
          <p class="period">Generated on ${new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Bookings</div>
              <div class="stat-value">₱${report.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Bookings</div>
              <div class="stat-value">${report.totalBookings}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Confirmed</div>
              <div class="stat-value">${report.confirmedCount}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Avg. Booking</div>
              <div class="stat-value">₱${report.averageBooking.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Booking Status Breakdown</h2>
          <table>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
            <tr>
              <td>Confirmed</td>
              <td>${report.confirmedCount}</td>
            </tr>
            <tr>
              <td>Active</td>
              <td>${report.activeCount}</td>
            </tr>
            <tr>
              <td>Returned</td>
              <td>${report.returnedCount}</td>
            </tr>
            <tr>
              <td>Cancelled</td>
              <td>${report.cancelledCount}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Revenue Breakdown</h2>
          <table>
            <tr>
              <th>Metric</th>
              <th>Amount (₱)</th>
            </tr>
            <tr>
              <td>Total Revenue</td>
              <td>${report.totalRevenue.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Deposits Collected</td>
              <td>${report.depositCollected.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Final Payments</td>
              <td>${report.finalPayments.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Payment Methods</h2>
          <table>
            <tr>
              <th>Method</th>
              <th>Count</th>
            </tr>
            ${Object.entries(paymentBreakdown)
              .map(([method, count]) => `<tr><td>${method}</td><td>${count}</td></tr>`)
              .join('')}
          </table>
        </div>

        <div class="section">
          <h2>Top Vehicles</h2>
          <table>
            <tr>
              <th>Vehicle</th>
              <th>Bookings</th>
              <th>Revenue (₱)</th>
            </tr>
            ${topVehicles
              .map(
                (vehicle: any) =>
                  `<tr><td>${vehicle.name}</td><td>${vehicle.count}</td><td>${vehicle.revenue.toLocaleString()}</td></tr>`
              )
              .join('')}
          </table>
        </div>

        <div class="footer">
          <p>This report was automatically generated by KJM Motors rental system.</p>
          <p>For questions, please contact KJM Motors administration.</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML content with PDF headers (browser will download as PDF)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="KJM-Report-${report.period.replace(/\s+/g, '-')}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting report to PDF:', error);
    return NextResponse.json(
      { error: 'Failed to export report', details: error.message },
      { status: 500 }
    );
  }
}
