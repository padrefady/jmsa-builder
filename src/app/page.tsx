'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Globe, FileText, Palette, Eye, Briefcase, Users, Share2,
  BookOpen, Star, CheckCircle2, ArrowRight,
  Sparkles, Zap, Shield, Clock, TrendingUp, ChevronRight,
  Menu, X, LogIn, Search, BarChart3, Heart, Smartphone,
  Rocket, Wifi, Megaphone, Lock, Headphones, Layers,
  MessageCircle, ShieldCheck,
} from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BLOG_ARTICLES,
  type BlogArticle,
} from '@/data/blog-data';

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
function CTAButton({ children, className = '', href }: { children: React.ReactNode; className?: string; href?: string }) {
  const inner = (
    <>
      {children}
      <ArrowRight className="ml-2 size-5" />
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`cta-primary text-white font-semibold rounded-full shadow-lg px-8 py-4 text-lg inline-flex items-center justify-center ${className}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <Button
      size="lg"
      className={`cta-primary text-white font-semibold rounded-full shadow-lg px-8 py-4 text-lg ${className}`}
    >
      {inner}
    </Button>
  );
}

/* ─── Navbar ─── */
function Navbar() {
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
    { label: 'Blog', href: '/blog' },
  ];
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 leading-tight">JMSA Builder</span>
                <span className="text-[10px] text-gray-500 leading-tight hidden sm:block">Votre partenaire digital en Afrique</span>
              </div>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">{l.label}</Link>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/connect" className="inline-flex items-center rounded-full border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 border hover:bg-transparent px-5 py-2 text-sm font-medium transition-colors">
                <LogIn className="w-4 h-4 mr-1" /> Connexion
              </Link>
              <Link href="/connect" className="cta-primary text-white rounded-full text-sm px-5 py-2 inline-flex items-center">Devenir client</Link>
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
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="px-4 py-3 text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">{l.label}</Link>
              ))}
              <hr className="my-2 border-gray-100" />
              <Link href="/connect" onClick={() => setMobileOpen(false)} className="cta-primary text-white rounded-xl w-full mt-1 inline-flex items-center justify-center">
                Devenir client <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
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
              Confiez-nous votre projet. <span className="font-semibold text-gray-700">JMSA s&apos;occupe de tout</span> : creation, hebergement, blog et reseaux sociaux. Votre site est actif gratuitement pendant 45 jours.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <CTAButton className="min-w-[280px] !px-10 !py-5 !text-xl" href="/connect">Devenir client JMSA</CTAButton>
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
function HowItWorksSection() {
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
        <div className="text-center mt-14"><CTAButton href="/connect">Devenir client JMSA &mdash; c&apos;est gratuit</CTAButton></div>
      </div>
    </section>
  );
}

/* ─── Blog Preview Section (Landing Page) ─── */
function BlogSection() {
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
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="card-lift border-gray-100 shadow-sm overflow-hidden group block"
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
                  <span className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
                    Lire la suite <ChevronRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center rounded-full border-emerald-200 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 text-emerald-600 font-medium px-6 border border hover:bg-transparent transition-colors"
          >
            Voir tous les articles <ChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
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
              <li><Link href="#solution" className="hover:text-emerald-400 transition-colors">Solution</Link></li>
              <li><Link href="#advantages" className="hover:text-emerald-400 transition-colors">Avantages</Link></li>
              <li><Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">Comment ca marche</Link></li>
              <li><Link href="/blog" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
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
            <Link href="/admin" className="text-xs text-gray-600 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Administration
            </Link>
            <p className="text-sm text-gray-500">Fait avec <Heart className="w-3 h-3 inline text-red-400" /> en Afrique</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page ─── */
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AdvantagesSection />
        <HowItWorksSection />
        <BlogSection />
      </main>
      <Footer />
    </>
  );
}

/* ─── Main App Page ─── */
export default function JMSABuilderPage() {
  const [loaded, setLoaded] = useState(false);

  // Show preloader on first visit
  if (!loaded) {
    return <Preloader onComplete={() => setLoaded(true)} />;
  }

  return <LandingPage />;
}
