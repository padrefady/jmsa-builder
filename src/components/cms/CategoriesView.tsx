'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCMSStore, type Category } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Tag, BookOpen } from 'lucide-react';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const PRESET_COLORS = [
  '#10B981', '#059669', '#047857', // emerald
  '#F59E0B', '#D97706', '#B45309', // amber
  '#3B82F6', '#2563EB', '#1D4ED8', // blue
  '#8B5CF6', '#7C3AED', '#6D28D9', // violet
  '#EF4444', '#DC2626', '#B91C1C', // red
  '#EC4899', '#DB2777', '#BE185D', // pink
  '#06B6D4', '#0891B2', '#0E7490', // cyan
  '#64748B', '#475569', '#334155', // slate
];

export default function CategoriesView() {
  const { categories, posts, isLoading, fetchCategories, fetchPosts, createCategory, updateCategory, deleteCategory } = useCMSStore();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  const resetForm = useCallback(() => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormColor(PRESET_COLORS[0]);
    setEditingCategory(null);
  }, []);

  function openCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormDescription(category.description ?? '');
    // Use stored color or default
    setFormColor(category.slug ? PRESET_COLORS[Math.abs(hashCode(category.slug)) % PRESET_COLORS.length] : PRESET_COLORS[0]);
    setIsModalOpen(true);
  }

  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }

  function handleNameChange(name: string) {
    setFormName(name);
    if (!editingCategory) {
      setFormSlug(slugify(name));
    }
  }

  async function handleSave() {
    const data: Partial<Category> = {
      name: formName,
      slug: formSlug || slugify(formName),
      description: formDescription || undefined,
    };

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
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
      await deleteCategory(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // error handled by store
    }
  }

  // Count posts per category
  function getPostCount(categoryId: string): number {
    return posts.filter((p) => p.categoryId === categoryId).length;
  }

  // Get color for a category based on its slug
  function getCategoryColor(slug: string): string {
    return PRESET_COLORS[Math.abs(hashCode(slug)) % PRESET_COLORS.length];
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-500">
            Organisez vos articles par categorie
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle categorie
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Aucune categorie</p>
          <p className="text-sm mt-1">Creez votre premiere categorie pour organiser vos articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const color = getCategoryColor(category.slug);
            const postCount = getPostCount(category.id);

            return (
              <Card
                key={category.id}
                className="shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Color bar */}
                <div className="h-1.5" style={{ backgroundColor: color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <h3 className="font-semibold text-gray-800 truncate">
                          {category.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-emerald-600"
                        onClick={() => openEdit(category)}
                        title="Modifier"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        onClick={() => setDeleteTarget(category)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {postCount} {postCount <= 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(category.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Modifier la categorie' : 'Nouvelle categorie'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Modifiez les informations de la categorie.'
                : 'Creez une nouvelle categorie pour vos articles.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom</Label>
              <Input
                id="cat-name"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nom de la categorie"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                placeholder="slug-de-la-categorie"
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description de la categorie (optionnel)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      formColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formName.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingCategory ? 'Enregistrer' : 'Creer la categorie'}
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
              Etes-vous sur de vouloir supprimer la categorie{' '}
              <span className="font-semibold">&laquo; {deleteTarget?.name} &raquo;</span> ?
              {deleteTarget && getPostCount(deleteTarget.id) > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Attention : {getPostCount(deleteTarget.id)} article(s) sont associe(s) a cette categorie.
                </span>
              )}
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
