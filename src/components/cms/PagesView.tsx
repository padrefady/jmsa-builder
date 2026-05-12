'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCMSStore, type Page } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Search, Pencil, Trash2, FileText } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function PagesView() {
  const { pages, isLoading, fetchPages, createPage, updatePage, deletePage } = useCMSStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState<string>('draft');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormSlug('');
    setFormContent('');
    setFormStatus('draft');
    setFormSeoTitle('');
    setFormSeoDescription('');
    setEditingPage(null);
  }, []);

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(page: Page) {
    setEditingPage(page);
    setFormTitle(page.title);
    setFormSlug(page.slug);
    setFormContent(page.content);
    setFormStatus(page.status);
    setFormSeoTitle('');
    setFormSeoDescription('');
    setIsModalOpen(true);
  }

  function handleTitleChange(title: string) {
    setFormTitle(title);
    if (!editingPage) {
      setFormSlug(slugify(title));
    }
  }

  async function handleSave() {
    const data: Partial<Page> = {
      title: formTitle,
      slug: formSlug || slugify(formTitle),
      content: formContent,
      status: formStatus as Page['status'],
    };

    try {
      if (editingPage) {
        await updatePage(editingPage.id, data);
      } else {
        await createPage(data);
      }
      setIsModalOpen(false);
      resetForm();
    } catch {
      // error handled by store
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePage(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error handled by store
    }
  }

  // Filter pages
  const filteredPages = pages.filter((page) => {
    const matchSearch =
      !search ||
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function StatusBadge({ status }: { status: string }) {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Publie</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">Brouillon</Badge>;
      case 'archived':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Archive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">Pages</h2>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par titre ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publie</SelectItem>
            <SelectItem value="archived">Archive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucune page trouvee</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold">Titre</TableHead>
                <TableHead className="text-xs font-semibold hidden md:table-cell">Slug</TableHead>
                <TableHead className="text-xs font-semibold">Statut</TableHead>
                <TableHead className="text-xs font-semibold hidden sm:table-cell">Modifie le</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-sm">{page.title}</TableCell>
                  <TableCell className="text-sm text-gray-500 hidden md:table-cell font-mono">
                    /{page.slug}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={page.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 hidden sm:table-cell">
                    {formatDate(page.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-emerald-600"
                        onClick={() => openEdit(page)}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(page)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Modifier la page' : 'Nouvelle page'}
            </DialogTitle>
            <DialogDescription>
              {editingPage
                ? 'Modifiez les informations de la page ci-dessous.'
                : 'Remplissez les informations pour creer une nouvelle page.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">Titre</Label>
              <Input
                id="page-title"
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de la page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-slug">Slug</Label>
              <Input
                id="page-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="slug-de-la-page"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-content">Contenu</Label>
              <Textarea
                id="page-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Contenu de la page..."
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-status">Statut</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="published">Publie</SelectItem>
                  <SelectItem value="archived">Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">SEO</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="seo-title" className="text-xs text-gray-500">
                    Titre SEO
                  </Label>
                  <Input
                    id="seo-title"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-description" className="text-xs text-gray-500">
                    Description SEO
                  </Label>
                  <Textarea
                    id="seo-description"
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formTitle.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingPage ? 'Enregistrer' : 'Creer la page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer la page{' '}
              <span className="font-semibold">&laquo; {deleteTarget?.title} &raquo;</span> ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
