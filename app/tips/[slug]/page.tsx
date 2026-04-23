import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Icon } from '../../../components/ui/Icon';
import { articles, getArticle } from '../../../lib/articles';

const BASE = 'https://kjm-motors.com';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: `${a.title} | KJM Motors Cebu`,
    description: a.excerpt,
    keywords: ['scooter cebu', 'cebu travel guide', a.tag.toLowerCase()],
    alternates: { canonical: `${BASE}/tips/${a.slug}` },
    openGraph: {
      title: a.title,
      description: a.excerpt,
      url: `${BASE}/tips/${a.slug}`,
      images: [{ url: a.image, alt: a.title }],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const otherArticles = articles.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero */}
      <div className="relative aspect-[21/8] sm:aspect-[21/6] bg-neutral-900 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover object-center opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-8 pb-10 pt-6 max-w-4xl mx-auto w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tips" className="hover:text-white transition-colors">Tips & Guides</Link>
            <span>/</span>
            <span className="text-white/80">{article.tag}</span>
          </nav>
          <span className="inline-block px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full mb-3">
            {article.tag}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-2">{article.title}</h1>
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>{article.readTime}</span>
            <span>·</span>
            <span>By KJM Motors Team</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose-article space-y-8">
          {article.sections.map((section, i) => {
            if (section.cta) {
              return (
                <div key={i} className="bg-neutral-900 rounded-2xl p-8 text-center">
                  <p className="text-white font-bold text-lg mb-2">Ready to ride Cebu?</p>
                  <p className="text-neutral-400 text-sm mb-6">Free delivery · Free helmet · From ₱499/day</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/booking"
                      className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                    >
                      Book a Scooter
                    </Link>
                    <a
                      href="https://wa.me/639752984845"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className="space-y-4">
                {section.heading && (
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-10 first:mt-0">
                    {section.heading}
                  </h2>
                )}

                {section.body && (
                  <div className="space-y-4">
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j} className="text-neutral-700 leading-relaxed text-[15px]">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, j) => (
                      <li key={j} className="flex gap-3 text-sm text-neutral-700">
                        {item.label && (
                          <span className="font-bold text-neutral-900 shrink-0 min-w-[90px]">{item.label}</span>
                        )}
                        <span className="leading-relaxed">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.table && (
                  <div className="overflow-x-auto rounded-xl border border-neutral-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-100 border-b border-neutral-200">
                          {section.table.headers.map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-bold text-neutral-700 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, j) => (
                          <tr key={j} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                            {row.map((cell, k) => (
                              <td key={k} className="px-4 py-3 text-neutral-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.tip && (
                  <div className="flex gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4">
                    {/* @ts-ignore */}
                    <Icon icon="ph:lightbulb-fill" width={18} height={18} style={{ color: '#F97316' }} className="shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-900 leading-relaxed">{section.tip}</p>
                  </div>
                )}

                {section.warning && (
                  <div className="flex gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    {/* @ts-ignore */}
                    <Icon icon="ph:warning-fill" width={18} height={18} style={{ color: '#EF4444' }} className="shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900 leading-relaxed">{section.warning}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* More articles */}
        {otherArticles.length > 0 && (
          <div className="mt-16 pt-10 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">More Guides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/tips/${a.slug}`}
                  className="group bg-white border border-neutral-200 hover:border-primary-300 rounded-2xl overflow-hidden transition-colors"
                >
                  <div className="relative aspect-[16/9] bg-neutral-100">
                    <Image
                      src={a.image}
                      alt={a.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">{a.tag}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-neutral-900 leading-snug group-hover:text-primary-600 transition-colors">{a.title}</p>
                    <p className="text-xs text-neutral-400 mt-1">{a.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
