'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCMSStore, type Post } from '@/store/cms-store';
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
import { Loader2, Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function PostsView() {
  const { posts, categories, isLoading, fetchPosts, fetchCategories, createPost, updatePost, deletePost } = useCMSStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formStatus, setFormStatus] = useState<string>('draft');
  const [formCategoryId, setFormCategoryId] = useState<string>('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [fetchPosts, fetchCategories]);

  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormSlug('');
    setFormExcerpt('');
    setFormContent('');
    setFormFeaturedImage('');
    setFormStatus('draft');
    setFormCategoryId('');
    setEditingPost(null);
  }, []);

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(post: Post) {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormSlug(post.slug);
    setFormExcerpt(post.excerpt ?? '');
    setFormContent(post.content);
    setFormFeaturedImage(post.featuredImage ?? '');
    setFormStatus(post.status);
    setFormCategoryId(post.categoryId ?? '');
    setIsModalOpen(true);
  }

  function handleTitleChange(title: string) {
    setFormTitle(title);
    if (!editingPost) {
      setFormSlug(slugify(title));
    }
  }

  async function handleSave() {
    const data: Partial<Post> = {
      title: formTitle,
      slug: formSlug || slugify(formTitle),
      content: formContent,
      excerpt: formExcerpt || undefined,
      featuredImage: formFeaturedImage || undefined,
      status: formStatus as Post['status'],
      categoryId: formCategoryId || undefined,
    };

    try {
      if (editingPost) {
        await updatePost(editingPost.id, data);
      } else {
        await createPost(data);
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
      await deletePost(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error handled by store
    }
  }

  // Helper to find category name
  function getCategoryName(categoryId?: string) {
    if (!categoryId) return '—';
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? '—';
  }

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.slug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchCategory =
      categoryFilter === 'all' || post.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
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
        <h2 className="text-xl font-bold text-gray-800">Articles</h2>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun article trouve</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs font-semibold">Titre</TableHead>
                <TableHead className="text-xs font-semibold hidden md:table-cell">Categorie</TableHead>
                <TableHead className="text-xs font-semibold">Statut</TableHead>
                <TableHead className="text-xs font-semibold hidden sm:table-cell">Modifie le</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {post.featuredImage && (
                        <img
                          src={post.featuredImage}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <span className="truncate max-w-[180px]">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                    {getCategoryName(post.categoryId)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 hidden sm:table-cell">
                    {formatDate(post.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-emerald-600"
                        onClick={() => openEdit(post)}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(post)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Modifier l'article" : 'Nouvel article'}
            </DialogTitle>
            <DialogDescription>
              {editingPost
                ? "Modifiez les informations de l'article ci-dessous."
                : "Remplissez les informations pour creer un nouvel article."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="post-title">Titre</Label>
              <Input
                id="post-title"
                value={formTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Titre de l'article"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="post-slug">Slug</Label>
                <Input
                  id="post-slug"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="slug-de-l-article"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-status">Statut</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-category">Categorie</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune categorie</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-excerpt">Extrait</Label>
              <Textarea
                id="post-excerpt"
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                placeholder="Court resume de l'article..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content">Contenu</Label>
              <Textarea
                id="post-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Contenu principal de l'article... (Markdown supporte)"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-400">
                Editeur texte enrichi (MDXEditor) disponible dans une prochaine version.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-image">Image mise en avant (URL)</Label>
              <Input
                id="post-image"
                value={formFeaturedImage}
                onChange={(e) => setFormFeaturedImage(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
              />
              {formFeaturedImage && (
                <div className="mt-2">
                  <img
                    src={formFeaturedImage}
                    alt="Apercu"
                    className="w-full max-w-xs h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
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
              {editingPost ? 'Enregistrer' : "Creer l'article"}
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
              Etes-vous sur de vouloir supprimer l&apos;article{' '}
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
