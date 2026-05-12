'use client';

import { useCMSStore } from '@/store/cms-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, TrendingUp, Clock, Users, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatisticsView() {
  const { isLoading, user } = useCMSStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Visites totales',
      value: '1 247',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Visiteurs uniques',
      value: '843',
      change: '+8.3%',
      trend: 'up' as const,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Temps moyen',
      value: '2m 34s',
      change: '-5.2%',
      trend: 'down' as const,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Taux de rebond',
      value: '34.2%',
      change: '-2.1%',
      trend: 'down' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const topPages = [
    { page: 'Page d\'accueil', views: 534, percentage: 43 },
    { page: 'A propos', views: 231, percentage: 19 },
    { page: 'Services', views: 198, percentage: 16 },
    { page: 'Blog', views: 156, percentage: 12 },
    { page: 'Contact', views: 128, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Statistiques</h2>
          <p className="text-sm text-gray-500">
            Suivez les performances de votre site web
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1.5 px-3">
            30 derniers jours
          </Badge>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts area placeholder */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolution des visites</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64 bg-gradient-to-t from-emerald-50 to-transparent rounded-xl border border-emerald-100/50 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Graphique des visites disponibles apres activation
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Les donnees seront collectees des la mise en ligne de votre site
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pages les plus visitees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((item, idx) => (
                <div key={item.page} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.page}</p>
                      <span className="text-sm font-semibold text-gray-800 ml-2">{item.views}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'Recherche directe', value: 42, icon: <Globe className="w-4 h-4 text-emerald-500" /> },
                { source: 'Google', value: 28, icon: <TrendingUp className="w-4 h-4 text-blue-500" /> },
                { source: 'Reseaux sociaux', value: 20, icon: <Users className="w-4 h-4 text-purple-500" /> },
                { source: 'Autres', value: 10, icon: <Eye className="w-4 h-4 text-gray-400" /> },
              ].map((item) => (
                <div key={item.source} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800">{item.source}</p>
                      <span className="text-sm text-gray-500">{item.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-emerald-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
