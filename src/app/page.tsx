'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Globe, FileText, Palette, Eye, Briefcase, Users, Share2,
  BookOpen, MessageCircle, Star, CheckCircle2, ArrowRight,
  Sparkles, Zap, Shield, Clock, TrendingUp, ChevronRight,
  Menu, X, LogIn, Search, BarChart3, Heart, Smartphone,
  Rocket, Wifi, Megaphone, Lock, Headphones, Layers,
  Calendar, User, ArrowLeft, Filter, Send, ShieldCheck,
} from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BLOG_ARTICLES,
  type BlogArticle,
  type BlogCategory,
} from '@/data/blog-data';

/* ─── Dynamic import CMS (no SSR) ─── */
const CMSLayout = dynamic(
  () => import('@/components/cms/CMSLayout').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    ),
  }
);

/* ─── Dynamic import Admin Panel (no SSR) ─── */
const AdminPanel = dynamic(
  () => import('@/components/admin/AdminPanel').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    ),
  }
);

/* ─── Category color helpers ─── */
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

/* ─── Preloader ─── */
function Preloader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const alreadyLoaded = sessionStorage.getItem('jmsa-preloaded');
    if (alreadyLoaded) {
      onComplete();
      return;
    }

    // Animate progress bar from 0 to 100 over ~2s
    const startTime = Date.now();
    const duration = 2000;
    let rafId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1700);

    const completeTimer = setTimeout(() => {
      sessionStorage.setItem('jmsa-preloaded', 'true');
      setVisible(false);
      onComplete();
    }, 2200);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Spinning ring */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-100" />
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 w-20 h-20 rounded-full border-2 border-transparent border-b-emerald-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo.png" alt="JMSA Builder" className="w-12 h-12 rounded-full object-contain shadow-lg" />
        </div>
      </div>
      {/* Brand name */}
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JMSA Builder</h1>
      <p className="text-sm text-gray-500 mt-1 mb-5">par JM Services Africa</p>
      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-[width] duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/* ─── CTA Button ─── */
function CTAButton({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      className={`cta-primary text-white font-semibold rounded-full shadow-lg px-8 py-4 text-lg ${className}`}
    >
      {children}
      <ArrowRight className="ml-2 size-5" />
    </Button>
  );
}

/* ─── Navbar ─── */
function Navbar({ onOpenCMS, onShowBlog, onOpenAdmin }: { onOpenCMS: () => void; onShowBlog: () => void; onOpenAdmin?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [
    { label: 'Solution', href: '#solution' },
    { label: 'Avantages', href: '#advantages' },
    { label: 'Comment ca marche', href: '#how-it-works' },
    { label: 'Blog', href: '#blog', action: onShowBlog },
  ];
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <a href="#" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">JMSA Builder</span>
                <span className="text-[10px] text-gray-500 leading-tight hidden sm:block">Votre partenaire digital en Afrique</span>
              </div>
            </a>
            <div className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                l.action ? (
                  <button
                    key={l.label}
                    onClick={(e) => { e.preventDefault(); l.action?.(); setMobileOpen(false); }}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    {l.label}
                  </button>
                ) : (
                  <a key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">{l.label}</a>
                )
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="outline" className="rounded-full border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50" size="sm" onClick={onOpenCMS}>
                <LogIn className="w-4 h-4 mr-1" /> Connexion
              </Button>
              <Button className="cta-primary text-white rounded-full text-sm px-5 py-2" onClick={onOpenCMS}>Devenir client</Button>
            </div>
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </nav>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                l.action ? (
                  <button
                    key={l.label}
                    onClick={() => { l.action?.(); setMobileOpen(false); }}
                    className="px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-left"
                  >
                    {l.label}
                  </button>
                ) : (
                  <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">{l.label}</a>
                )
              ))}
              <hr className="my-2 border-gray-100" />
              <Button className="cta-primary text-white rounded-xl w-full mt-1" onClick={() => { setMobileOpen(false); onOpenCMS(); }}>
                Devenir client <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero Section ─── */
function HeroSection({ onOpenCMS }: { onOpenCMS: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient african-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl animate-float-delayed" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="inline-flex items-center gap-1.5 mb-6 px-4 py-1.5 bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Site gratuit pendant 45 jours
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              JM Services Africa cree{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">votre site web professionnel</span>{' '}
              en 24 a 72 heures
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Confiez-nous votre projet. <span className="font-semibold text-gray-700">JMSA s'occupe de tout</span> : creation, hebergement, blog et reseaux sociaux. Votre site est actif gratuitement pendant 45 jours.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <CTAButton className="min-w-[280px] !px-10 !py-5 !text-xl" onClick={onOpenCMS}>Devenir client JMSA</CTAButton>
            </div>
            <div className="flex items-center gap-6 mt-10 justify-center lg:justify-start flex-wrap">
              {[['Nous creons votre site'], ['Hebergement inclus'], ['Support WhatsApp & Email']].map(([t]) => (
                <div key={t} className="flex items-center gap-2 text-sm text-gray-500"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>{t}</span></div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400/20 via-amber-300/20 to-emerald-400/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/50">
              <img src="/images/hero-illustration.png" alt="JMSA Builder - Creez votre site web professionnel" className="w-full h-auto object-cover" loading="eager" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features Section ─── */
function FeaturesSection() {
  const feats = [
    { icon: Eye, t: 'Soyez visible sur Google', d: "Apparaissez quand vos clients vous cherchent. JMSA optimise votre site pour le referencement." },
    { icon: Briefcase, t: 'Presentez vos services', d: "JMSA cree une landing page professionnelle adaptee a votre activite." },
    { icon: FileText, t: 'Blog integre', d: "Publiez des articles et actualites pour attirer et fidéliser vos visiteurs." },
    { icon: Share2, t: 'Reseaux sociaux connectes', d: "WhatsApp, Facebook, Instagram, TikTok, Twitter, LinkedIn lies a votre site." },
  ];
  return (
    <section id="solution" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/30 to-amber-200/30 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/50">
              <img src="/images/features-illustration.png" alt="JMSA Builder - Tableau de bord et fonctionnalites" className="w-full h-auto" loading="lazy" />
            </div>
          </div>
          <div>
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200">La solution</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">JMSA Builder : votre espace digital en quelques minutes</h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">Simple et concu pour les entreprises africaines. Presentez votre activite et soyez contacte facilement.</p>
            <div className="grid sm:grid-cols-2 gap-5">
              {feats.map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0"><f.icon className="w-5 h-5 text-emerald-600" /></div>
                  <div><h3 className="font-semibold text-gray-900 mb-1">{f.t}</h3><p className="text-sm text-gray-600 leading-relaxed">{f.d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Advantages Section (MAXIMIZED) ─── */
function AdvantagesSection() {
  const advs = [
    { icon: Globe, t: 'Site web professionnel', d: "JM Services Africa cree et heberge votre site : landing page moderne, optimisee pour le referencement." },
    { icon: BookOpen, t: 'Blog integre', d: "JMSA configure votre espace blog pour publier des articles et actualites de votre activite." },
    { icon: Share2, t: 'Liens vers vos reseaux sociaux', d: 'Connectez WhatsApp, Facebook, Instagram, TikTok, Twitter et LinkedIn en un clic.' },
    { icon: Zap, t: 'Livraison en 24-72h', d: "Apres validation du contrat, JMSA livre votre site en version beta rapidement." },
    { icon: Clock, t: 'Visibilite 24h/24, 7j/7', d: "Votre site est accessible a tout moment, partout dans le monde." },
    { icon: Star, t: 'Image professionnelle', d: "Donnez une image serieuse et credible a votre activite en ligne." },
    { icon: Shield, t: 'Hebergement securise', d: "Votre site est heberge sur des serveurs fiables et sécurises par JMSA." },
    { icon: Smartphone, t: '100% responsive', d: "Votre site s'adapte parfaitement a tous les ecrans : telephone, tablette et ordinateur." },
    { icon: Search, t: 'Referencement SEO', d: "Structure optimisee par JMSA pour apparaitre dans les resultats de recherche Google." },
    { icon: TrendingUp, t: 'Suivi de statistiques', d: 'Accedez aux stats de visite de votre site directement depuis votre espace client.' },
    { icon: Heart, t: '45 jours d\'essai gratuit', d: 'Votre site est actif gratuitement pendant 45 jours. Sans engagement, sans carte bancaire.' },
    { icon: Headphones, t: 'Support dedie', d: "Une equipe JMSA a votre ecoute via WhatsApp et email pour vous accompagner." },
    { icon: Megaphone, t: 'Domaine personnalise', d: "Avec le forfait premium, obtenez votre propre nom de domaine (votresite.com)." },
    { icon: Layers, t: 'Personnalisation complete', d: "JMSA adapte les couleurs, images et textes a votre identite et votre marque." },
    { icon: Lock, t: 'Donnees protegees', d: "Vos informations et celles de vos clients sont en securite." },
    { icon: BarChart3, t: 'Espace client personnalise', d: "Un tableau de bord pour suivre vos stats et communiquer avec l'equipe JMSA." },
    { icon: Rocket, t: 'Evolutif', d: "Commencez avec l'essai gratuit 45 jours puis souscrivez pour garder votre site en ligne." },
    { icon: Wifi, t: 'Aucune competence requise', d: "JM Services Africa s'occupe de tout. Vous n'avez besoin d'aucune competence technique." },
  ];

  return (
    <section id="advantages" className="py-20 md:py-28 bg-gradient-to-b from-emerald-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200">Avantages cles</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">Tout ce dont vous avez besoin pour reussir en ligne</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">JM Services Africa cree, heberge et gere votre site web. Vous vous concentrez sur votre activite, on s'occupe du reste.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advs.map((a, i) => (
            <Card key={i} className="card-lift border-gray-100 shadow-sm h-full group hover:border-emerald-100">
              <CardContent className="p-6 lg:p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-5 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-colors"><a.icon className="w-7 h-7 text-emerald-600" /></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{a.t}</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed">{a.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorksSection({ onOpenCMS }: { onOpenCMS: () => void }) {
  const steps = [
    {
      icon: FileText,
      t: 'Inscrivez-vous chez JMSA',
      d: "Remplissez vos informations : activite, coordonnees, reseaux sociaux. Ca prend moins de 5 minutes.",
      detail: 'Inscription simple et rapide en 4 etapes.',
    },
    {
      icon: Search,
      t: 'JMSA analyse votre projet',
      d: "Notre equipe etudie votre dossier et vous contacte sous 24-72h via WhatsApp ou email pour valider ensemble les details.",
      detail: 'Echange personnel et transparent.',
    },
    {
      icon: Palette,
      t: 'JMSA cree votre site',
      d: "Apres signature du contrat, nous creons et livrons votre site : landing page personnalisee, blog et liens vers vos reseaux sociaux.",
      detail: 'Livraison en version beta.',
    },
    {
      icon: Rocket,
      t: 'Votre site est en ligne',
      d: "Votre site est actif gratuitement pendant 45 jours. Souscrivez après pour le garder en ligne. Sinon, il sera supprime.",
      detail: '45 jours d\'essai sans engagement.',
    },
  ];
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200">Comment ca marche</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">4 etapes simples</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">De l'inscription a la mise en ligne, JM Services Africa vous accompagne a chaque etape.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-emerald-300 to-emerald-100" />
              )}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-200 mb-4 relative z-10"><span className="text-2xl font-bold text-white">{i + 1}</span></div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-4"><s.icon className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{s.t}</h3>
              <p className="text-sm text-gray-600 max-w-[280px] mx-auto mb-2">{s.d}</p>
              <p className="text-xs text-emerald-600 font-medium">{s.detail}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-14"><CTAButton onClick={onOpenCMS}>Devenir client JMSA — c&apos;est gratuit</CTAButton></div>
      </div>
    </section>
  );
}

/* ─── Blog Preview Section (Landing Page) ─── */
function BlogSection({ onShowBlog, onSelectArticle }: { onShowBlog: () => void; onSelectArticle: (article: BlogArticle) => void }) {
  const latestArticles = useMemo(() => {
    return [...BLOG_ARTICLES]
      .sort((a, b) => {
        const dateA = new Date(a.date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'));
        const dateB = new Date(b.date.replace(/(\d+)\s+(\w+)\s+(\d+)/, '$2 $1, $3'));
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);
  }, []);

  const getCategoryName = (slug: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  return (
    <section id="blog" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border-emerald-200">Blog JMSA</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">Conseils, actualites et ressources</h2>
          <p className="text-lg text-gray-600 leading-relaxed">Retrouvez nos articles pour vous aider a developper votre activite en ligne et maitriser le digital en Afrique.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((article) => {
            const colors = getCategoryColor(article.categorySlug);
            return (
              <Card
                key={article.id}
                className="card-lift border-gray-100 shadow-sm overflow-hidden group cursor-pointer"
                onClick={() => onSelectArticle(article)}
              >
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-amber-50 overflow-hidden">
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
                  <p className="text-xs text-gray-400 mb-2">{article.date}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors leading-snug">{article.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{article.excerpt}</p>
                  <button className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
                    Lire la suite <ChevronRight className="w-4 h-4" />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full border-emerald-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 text-emerald-600 font-medium px-6" onClick={onShowBlog}>
            Voir tous les articles <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── Article Reading Overlay ─── */
function ArticleReadingView({
  article,
  onBack,
}: {
  article: BlogArticle;
  onBack: () => void;
}) {
  const colors = getCategoryColor(article.categorySlug);
  const getCategoryName = (slug: string) => {
    const cat = BLOG_CATEGORIES.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  /* ── Comments ── */
  const [comments, setComments] = useState<Array<{ id: string; author: string; date: string; content: string; website?: string }>>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', website: '', comment: '', honeypot: '' });
  const [commentStatus, setCommentStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  /* ── SEO metadata ── */
  useEffect(() => {
    document.title = article.title + ' \u2014 JMSA Builder';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', article.metaDescription);
    const metaKw = document.querySelector('meta[name="keywords"]');
    if (metaKw) metaKw.setAttribute('content', article.metaKeywords.join(', '));
    return () => {
      document.title = 'JMSA Builder \u2014 Creez votre site web professionnel en Afrique';
    };
  }, [article]);

  /* ── Fetch comments ── */
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/comments?articleSlug=${article.slug}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) { setComments(data.comments || []); setCommentsLoading(false); } })
      .catch(() => { if (!cancelled) setCommentsLoading(false); });
    return () => { cancelled = true; };
  }, [article.slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentForm.honeypot) return;
    if (!commentForm.name.trim() || !commentForm.comment.trim()) return;
    setCommentStatus('submitting');
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleSlug: article.slug, ...commentForm }),
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

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
      {/* Article header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 text-sm font-medium transition-colors rounded-lg hover:bg-emerald-50 px-3 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux articles
          </button>
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

        {/* ── Comments Section ── */}
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

/* ─── Blog Full Page ─── */
function BlogPage({
  onBack,
  selectedArticle,
  onSelectArticle,
  onDeselectArticle,
  activeCategory,
  onCategoryChange,
}: {
  onBack: () => void;
  selectedArticle: BlogArticle | null;
  onSelectArticle: (article: BlogArticle) => void;
  onDeselectArticle: () => void;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleLocalCategoryChange = useCallback((cat: string) => {
    onCategoryChange(cat);
    setCurrentPage(1);
  }, [onCategoryChange]);

  const filteredArticles = useMemo(() => {
    let articles = [...BLOG_ARTICLES];

    // Filter by category
    if (activeCategory !== 'all') {
      articles = articles.filter(a => a.categorySlug === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
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

  // If an article is selected, show the reading view directly (no duplicate header)
  if (selectedArticle) {
    return (
      <ArticleReadingView key={selectedArticle.slug} article={selectedArticle} onBack={onDeselectArticle} />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Blog Header (compact) */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 text-sm font-medium transition-colors">
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
                  onClick={() => onSelectArticle(article)}
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
                    onClick={() => onSelectArticle(article)}
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

/* ─── Footer ─── */
function Footer({ onOpenAdmin }: { onOpenAdmin?: () => void }) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="JMSA Builder" className="w-9 h-9 rounded-xl object-contain" />
              <span className="text-lg font-bold text-white">JMSA Builder</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">Votre partenaire digital en Afrique. Creez votre presence en ligne simplement et rapidement.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#solution" className="hover:text-emerald-400 transition-colors">Solution</a></li>
              <li><a href="#advantages" className="hover:text-emerald-400 transition-colors">Avantages</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Comment ca marche</a></li>
              <li><a href="#blog" className="hover:text-emerald-400 transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Landing page personnalisee</li>
              <li>Blog integre</li>
              <li>Nom de domaine</li>
              <li>Referencement SEO</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp</li>
              <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Email</li>
              <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-400" /> Cameroun & Afrique</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} JM Services Africa. Tous droits reserves.</p>
          <div className="flex items-center gap-4">
            <button onClick={onOpenAdmin} className="text-xs text-gray-600 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Administration
            </button>
            <p className="text-sm text-gray-500">Fait avec <Heart className="w-3 h-3 inline text-red-400" /> en Afrique</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */
function LandingPage({ onOpenCMS, onShowBlog, onSelectArticle, onOpenAdmin }: { onOpenCMS: () => void; onShowBlog: () => void; onSelectArticle: (article: BlogArticle) => void; onOpenAdmin?: () => void }) {
  return (
    <>
      <Navbar onOpenCMS={onOpenCMS} onShowBlog={onShowBlog} onOpenAdmin={onOpenAdmin} />
      <main>
        <HeroSection onOpenCMS={onOpenCMS} />
        <FeaturesSection />
        <AdvantagesSection />
        <HowItWorksSection onOpenCMS={onOpenCMS} />
        <BlogSection onShowBlog={onShowBlog} onSelectArticle={onSelectArticle} />
      </main>
      <Footer onOpenAdmin={onOpenAdmin} />
    </>
  );
}

/* ─── Main App Page ─── */
export default function JMSABuilderPage() {
  const [showCMS, setShowCMS] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleOpenCMS = useCallback(() => setShowCMS(true), []);
  const handleShowBlog = useCallback(() => setShowBlog(true), []);
  const handleOpenAdmin = useCallback(() => setShowAdmin(true), []);
  const handleCloseAdmin = useCallback(() => setShowAdmin(false), []);
  const handleBackFromBlog = useCallback(() => {
    setShowBlog(false);
    setSelectedArticle(null);
    setActiveCategory('all');
  }, []);
  const handleSelectArticle = useCallback((article: BlogArticle) => {
    setSelectedArticle(article);
    setShowBlog(true);
  }, []);
  const handleDeselectArticle = useCallback(() => {
    setSelectedArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  // Show preloader on first visit
  if (!loaded) {
    return <Preloader onComplete={() => setLoaded(true)} />;
  }

  if (showCMS) {
    return <CMSLayout />;
  }

  // Admin panel overlay
  if (showAdmin) {
    return <AdminPanel onClose={handleCloseAdmin} />;
  }

  if (showBlog && selectedArticle) {
    return (
      <>
        <BlogPage
          onBack={handleBackFromBlog}
          selectedArticle={selectedArticle}
          onSelectArticle={handleSelectArticle}
          onDeselectArticle={handleDeselectArticle}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        <ArticleReadingView article={selectedArticle} onBack={handleDeselectArticle} />
      </>
    );
  }

  if (showBlog) {
    return (
      <BlogPage
        onBack={handleBackFromBlog}
        selectedArticle={selectedArticle}
        onSelectArticle={handleSelectArticle}
        onDeselectArticle={handleDeselectArticle}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />
    );
  }

  return <LandingPage onOpenCMS={handleOpenCMS} onShowBlog={handleShowBlog} onSelectArticle={handleSelectArticle} onOpenAdmin={handleOpenAdmin} />;
}
