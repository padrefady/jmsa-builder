'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  MessageCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BLOG_ARTICLES,
  type BlogArticle,
} from '@/data/blog-data';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; badge: string; border: string }> = {
  digital: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    border: 'border-emerald-200',
  },
  marketing: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    border: 'border-amber-200',
  },
  conseils: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-blue-200',
  },
  actualites: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    border: 'border-purple-200',
  },
};

function getCategoryColor(slug: string) {
  return CATEGORY_COLORS[slug] || CATEGORY_COLORS.digital;
}

export default function ArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const article = BLOG_ARTICLES.find(a => a.slug === slug);

  const [comments, setComments] = useState<Array<{ id: string; author: string; date: string; content: string; website?: string }>>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', website: '', comment: '', honeypot: '' });
  const [commentStatus, setCommentStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // SEO metadata
  useEffect(() => {
    if (article) {
      document.title = article.title + ' \u2014 JMSA Builder';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', article.metaDescription);
      const metaKw = document.querySelector('meta[name="keywords"]');
      if (metaKw) metaKw.setAttribute('content', article.metaKeywords.join(', '));
    }
    return () => {
      document.title = 'JMSA Builder \u2014 Creez votre site web professionnel en Afrique';
    };
  }, [article]);

  // Fetch comments
  useEffect(() => {
    if (!article) return;
    let cancelled = false;
    setCommentsLoading(true);
    fetch(`/api/blog/comments?articleSlug=${article.slug}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) { setComments(data.comments || []); setCommentsLoading(false); } })
      .catch(() => { if (!cancelled) setCommentsLoading(false); });
    return () => { cancelled = true; };
  }, [article]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentForm.honeypot) return;
    if (!commentForm.name.trim() || !commentForm.comment.trim()) return;
    setCommentStatus('submitting');
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleSlug: article!.slug, ...commentForm }),
      });
      if (res.ok) {
        setCommentStatus('success');
        setCommentForm({ name: '', email: '', website: '', comment: '', honeypot: '' });
        const data = await res.json();
        if (data.comment) setComments(prev => [...prev, data.comment]);
      } else {
        setCommentStatus('error');
      }
    } catch {
      setCommentStatus('error');
    }
  };

  // Article not found
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouve</h1>
          <Button variant="outline" className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => router.push('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au blog
          </Button>
        </div>
      </div>
    );
  }

  const colors = getCategoryColor(article.categorySlug);
  const getCategoryName = (s: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === s);
    return cat ? cat.name : s;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Article header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors rounded-lg hover:bg-emerald-50 px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux articles
          </Link>
        </div>
      </div>

      {/* Article image */}
      <div className="relative h-56 sm:h-72 md:h-80 bg-gradient-to-br from-emerald-100 to-amber-50 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 -mt-16 relative">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 lg:p-10">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={`${colors.badge} text-xs font-medium`}>
              {getCategoryName(article.categorySlug)}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Calendar className="w-3.5 h-3.5" /> {article.date}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <User className="w-3.5 h-3.5" /> {article.author}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Clock className="w-3.5 h-3.5" /> {article.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-8">
            {article.title}
          </h1>

          {/* HTML Content */}
          <style>{`
            .article-content h2 {
              font-size: 1.25rem;
              font-weight: 700;
              color: #111827;
              margin-top: 2rem;
              margin-bottom: 0.75rem;
              line-height: 1.3;
            }
            .article-content h3 {
              font-size: 1.125rem;
              font-weight: 600;
              color: #1f2937;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              line-height: 1.4;
            }
            .article-content p {
              color: #4b5563;
              line-height: 1.75;
              margin-bottom: 1rem;
            }
            .article-content ul {
              list-style: disc;
              padding-left: 1.5rem;
              margin-bottom: 1rem;
              color: #4b5563;
            }
            .article-content ul li {
              line-height: 1.75;
              margin-bottom: 0.25rem;
            }
            .article-content blockquote {
              border-left: 4px solid #10b981;
              padding-left: 1rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
              margin-top: 1.5rem;
              margin-bottom: 1.5rem;
              background: rgba(236, 253, 245, 0.5);
              border-radius: 0 0.5rem 0.5rem 0;
              font-style: italic;
              color: #065f46;
            }
            .article-content strong {
              font-weight: 600;
              color: #1f2937;
            }
            .article-content a {
              color: #059669;
              text-decoration: underline;
            }
            .article-content em {
              font-style: italic;
            }
          `}</style>
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Commentaires {comments.length > 0 && `(${comments.length})`}
            </h2>
          </div>

          {/* Comment Form */}
          <Card className="border-gray-100 shadow-sm mb-8">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Laisser un commentaire</h3>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                {/* Honeypot */}
                <div className="overflow-hidden absolute w-0 h-0" aria-hidden="true">
                  <input
                    name="website_hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={commentForm.honeypot}
                    onChange={e => setCommentForm(f => ({ ...f, honeypot: e.target.value }))}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <Input
                      id="comment-name"
                      required
                      placeholder="Votre nom"
                      value={commentForm.name}
                      onChange={e => setCommentForm(f => ({ ...f, name: e.target.value }))}
                      className="rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
                    <Input
                      id="comment-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={commentForm.email}
                      onChange={e => setCommentForm(f => ({ ...f, email: e.target.value }))}
                      className="rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="comment-website" className="block text-sm font-medium text-gray-700 mb-1">Site web (optionnel)</label>
                  <Input
                    id="comment-website"
                    placeholder="https://votresite.com"
                    value={commentForm.website}
                    onChange={e => setCommentForm(f => ({ ...f, website: e.target.value }))}
                    className="rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-1">Commentaire *</label>
                  <textarea
                    id="comment-text"
                    required
                    rows={4}
                    placeholder="Votre commentaire..."
                    value={commentForm.comment}
                    onChange={e => setCommentForm(f => ({ ...f, comment: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:ring-emerald-400 focus:outline-none resize-none"
                  />
                </div>

                {commentStatus === 'success' && (
                  <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Votre commentaire a ete envoye avec succes ! Il sera visible apres validation.
                  </p>
                )}
                {commentStatus === 'error' && (
                  <p className="text-sm text-red-500 font-medium">Une erreur est survenue. Veuillez reessayer.</p>
                )}

                <Button
                  type="submit"
                  disabled={commentStatus === 'submitting'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
                >
                  {commentStatus === 'submitting' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Envoyer</span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Comments */}
          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {comments.map((c) => (
                <Card key={c.id} className="border-gray-100 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.author}</p>
                        <p className="text-xs text-gray-400">{c.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 inline-block">
                        {c.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Aucun commentaire pour le moment. Soyez le premier a reagir !</p>
          )}
        </div>
      </article>
    </div>
  );
}
