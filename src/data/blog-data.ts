// =============================================================================
// Blog Data — JM Services Africa (JMSA Builder)
// Central hub: imports articles from 4 category files (80 total)
// =============================================================================

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  categorySlug: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  metaDescription: string;
  metaKeywords: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  articleCount: number;
}

// =============================================================================
// CATEGORIES
// =============================================================================

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "cat-digital",
    name: "Digital",
    slug: "digital",
    description:
      "Decouvrez nos articles sur le developpement web, la transformation numerique et les outils digitaux pour les entreprises africaines.",
    color: "emerald",
    articleCount: 20,
  },
  {
    id: "cat-marketing",
    name: "Marketing",
    slug: "marketing",
    description:
      "Conseils et strategies marketing pour developper votre activite, maitriser les reseaux sociaux et attirer plus de clients.",
    color: "amber",
    articleCount: 20,
  },
  {
    id: "cat-conseils",
    name: "Conseils",
    slug: "conseils",
    description:
      "Astuces pratiques et conseils d'experts pour lancer et gerer votre activite en ligne efficacement.",
    color: "blue",
    articleCount: 20,
  },
  {
    id: "cat-actualites",
    name: "Actualites",
    slug: "actualites",
    description:
      "Les dernieres nouvelles de JM Services Africa : lancements de fonctionnalites, annonces et evenements.",
    color: "purple",
    articleCount: 20,
  },
];

// =============================================================================
// ALL ARTICLES (80 total)
// =============================================================================

import { DIGITAL_ARTICLES } from './articles-digital';
import { MARKETING_ARTICLES } from './articles-marketing';
import { CONSEILS_ARTICLES } from './articles-conseils';
import { ACTUALITES_ARTICLES } from './articles-actualites';

export const BLOG_ARTICLES: BlogArticle[] = [
  ...DIGITAL_ARTICLES,
  ...MARKETING_ARTICLES,
  ...CONSEILS_ARTICLES,
  ...ACTUALITES_ARTICLES,
];
