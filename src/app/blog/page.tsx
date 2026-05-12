'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  Search,
  ChevronRight,
  Filter,
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

export default function BlogListingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleLocalCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  }, []);

  const filteredArticles = useMemo(() => {
    let articles = [...BLOG_ARTICLES];

    if (activeCategory !== 'all') {
      articles = articles.filter(a => a.categorySlug === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }

    articles.sort((a, b) => {
      const dateA = new Date(a.date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'));
      const dateB = new Date(b.date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'));
      return dateB.getTime() - dateA.getTime();
    });

    return articles;
  }, [activeCategory, searchQuery]);

  const ARTICLES_PER_PAGE = 9;
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE,
  );

  const getCategoryName = (slug: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 text-sm font-medium transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" /> Retour a l&apos;accueil
          </button>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Blog JM Services Africa</h1>
          <p className="text-emerald-100">Conseils, actualites et ressources pour les entrepreneurs africains</p>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => handleLocalCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {BLOG_CATEGORIES.map((cat) => {
            const colors = getCategoryColor(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => handleLocalCategoryChange(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat.slug
                    ? `${colors.badge} shadow-sm`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-400 mb-6 text-center">
          {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} trouve{filteredArticles.length !== 1 ? 's' : ''}
        </p>

        {/* Articles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((article) => {
            const colors = getCategoryColor(article.categorySlug);
            return (
              <Card key={article.id} className="card-lift border-gray-100 shadow-sm overflow-hidden group">
                <div
                  className="relative h-52 bg-gradient-to-br from-emerald-100 to-amber-50 overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/blog/${article.slug}`)}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <Badge className={`absolute top-3 left-3 bg-white/90 ${colors.text} border-0 text-xs`}>
                    {getCategoryName(article.categorySlug)}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                    <span>{article.date}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors leading-snug">{article.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
                  <button
                    onClick={() => router.push(`/blog/${article.slug}`)}
                    className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    Lire la suite <ChevronRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Precedent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun article trouve</h3>
            <p className="text-gray-500 mb-4">Essayez de modifier vos criteres de recherche ou de changer de categorie.</p>
            <Button variant="outline" className="rounded-full border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => { handleSearchChange(''); handleLocalCategoryChange('all'); }}>
              <Filter className="w-4 h-4 mr-2" /> Reinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
