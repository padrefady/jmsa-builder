'use client';

import { useState, useEffect } from 'react';
import { useCMSStore } from '@/store/cms-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, ExternalLink, Plus, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Sample sites data (in real app, fetched from API)
interface SiteInfo {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'maintenance' | 'draft';
  pages: number;
  lastModified: string;
  visits: number;
}

const SAMPLE_SITES: SiteInfo[] = [
  {
    id: '1',
    name: 'Mon entreprise',
    domain: 'mon-entreprise.jmsa-builder.com',
    status: 'active',
    pages: 5,
    lastModified: '2025-04-28',
    visits: 1247,
  },
];

export default function SitesView() {
  const { isLoading, user } = useCMSStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function StatusBadge({ status }: { status: string }) {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">En ligne</Badge>;
      case 'maintenance':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Maintenance</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Brouillon</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sites web</h2>
          <p className="text-sm text-gray-500">
            Gerez vos sites web et leurs pages
          </p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau site
        </Button>
      </div>

      {/* Domain info */}
      {user?.domain && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800">{user.businessName || 'Mon site'}</h3>
                <p className="text-sm text-emerald-700">{user.domain}</p>
              </div>
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => window.open(`https://${user.domain}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                Visiter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sites list */}
      {SAMPLE_SITES.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun site web</h3>
            <p className="text-sm text-gray-500 mb-6">
              Votre site sera cree par JM Services Africa apres l&apos;activation de votre compte.
            </p>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Creer un site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {SAMPLE_SITES.map((site) => (
            <Card key={site.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{site.name}</h3>
                      <StatusBadge status={site.status} />
                    </div>
                    <p className="text-sm text-gray-500 truncate">{site.domain}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{site.pages}</p>
                      <p className="text-xs text-gray-500">Pages</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{site.visits.toLocaleString('fr-FR')}</p>
                      <p className="text-xs text-gray-500">Visites</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{formatDate(site.lastModified)}</p>
                      <p className="text-xs text-gray-500">Modifie</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      onClick={() => window.open(`https://${site.domain}`, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Voir</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ouvrir dans un nouvel onglet
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
