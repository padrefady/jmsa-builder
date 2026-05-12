'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Users, Search, Plus, Pencil, Trash2, FolderOpen, Upload, FileText,
  Image as ImageIcon, File, LogOut, Building2, Mail, Phone, MapPin,
  Loader2, X, Download, Eye, ChevronLeft, Folder, Filter,
} from 'lucide-react';

// ===================== TYPES =====================

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  media: MediaItem[];
  _count?: { media: number };
}

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  clientId: string;
  category: string;
  createdAt: string;
  client?: { id: string; name: string };
}

// ===================== HELPERS =====================

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
  return <File className="h-8 w-8 text-gray-500" />;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'actif': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactif': return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'prospect': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'vip': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'document': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'image': return 'bg-green-50 text-green-700 border-green-200';
    case 'contrat': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'facture': return 'bg-red-50 text-red-700 border-red-200';
    case 'autre': return 'bg-gray-50 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

// ===================== LOGIN =====================

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        toast.success('Connexion réussie !');
        onLogin();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Identifiants incorrects');
      }
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
      <Card className="w-full max-w-md relative z-10 border-white/10 bg-white/5 backdrop-blur-xl text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">JMSA Builder</CardTitle>
          <p className="text-gray-400 text-sm mt-1">Gestion Clients & Médiathèque</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@jmsa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Se connecter
            </Button>
          </form>
          <p className="text-center text-gray-500 text-xs mt-6">
            Identifiants par défaut : admin@jmsa.com / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== CLIENT FORM =====================

function ClientForm({
  client,
  onSave,
  onCancel,
}: {
  client: Partial<Client> | null;
  onSave: (data: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    company: client?.company || '',
    address: client?.address || '',
    notes: client?.notes || '',
    status: client?.status || 'actif',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nom *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du client" required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
        </div>
        <div className="space-y-2">
          <Label>Téléphone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+237 6XX XXX XXX" />
        </div>
        <div className="space-y-2">
          <Label>Entreprise</Label>
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nom de l'entreprise" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Adresse</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Adresse complète" />
      </div>
      <div className="space-y-2">
        <Label>Statut</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes internes..." rows={3} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {client?.id ? 'Mettre à jour' : 'Créer le client'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ===================== MEDIATHEQUE =====================

function Mediatheque({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('document');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/media?clientId=${client.id}`);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media);
      }
    } catch {
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('clientId', client.id);
    formData.append('category', uploadCategory);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.count} fichier(s) ajouté(s) avec succès`);
        await loadMedia();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de l\'upload');
      }
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/media/${mediaId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Fichier supprimé');
        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
        if (previewMedia?.id === mediaId) setPreviewMedia(null);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur serveur');
    }
  };

  const filteredMedia = filterCategory === 'all'
    ? media
    : media.filter((m) => m.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Médiathèque</h1>
                <p className="text-sm text-gray-500">{client.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="contrat">Contrat</SelectItem>
                  <SelectItem value="facture">Facture</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Ajouter des fichiers
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Filtres + Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Filtrer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous ({media.length})</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="contrat">Contrats</SelectItem>
                <SelectItem value="facture">Factures</SelectItem>
                <SelectItem value="autre">Autres</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">{filteredMedia.length} fichier(s)</p>
        </div>

        {/* Grille des fichiers */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredMedia.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun fichier</h3>
              <p className="text-gray-400 mb-4">
                Cliquez sur &quot;Ajouter des fichiers&quot; pour commencer
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Ajouter des fichiers
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <Card
                key={item.id}
                className="group hover:shadow-md transition-all cursor-pointer overflow-hidden"
                onClick={() => {
                  if (item.mimeType.startsWith('image/')) setPreviewMedia(item);
                }}
              >
                <div className="aspect-square flex items-center justify-center bg-gray-50 relative">
                  {item.mimeType.startsWith('image/') ? (
                    <img
                      src={`/${item.path}`}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                      {getFileIcon(item.mimeType)}
                      <span className="text-xs text-gray-500 truncate max-w-full px-2">
                        {item.originalName}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/${item.path}`, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate">{item.originalName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400">{formatFileSize(item.size)}</span>
                    <Badge variant="outline" className={`text-[10px] px-1 py-0 ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewMedia} onOpenChange={() => setPreviewMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewMedia?.originalName}</DialogTitle>
          </DialogHeader>
          {previewMedia && (
            <div className="space-y-4">
              <img
                src={`/${previewMedia.path}`}
                alt={previewMedia.originalName}
                className="w-full max-h-[70vh] object-contain rounded-lg bg-gray-100"
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatFileSize(previewMedia.size)}</span>
                <span>{formatDate(previewMedia.createdAt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== MAIN APP =====================

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Vérifier la session au montage
  useEffect(() => {
    void fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Charger les clients quand authentifié
  useEffect(() => {
    if (!authenticated) return;
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) setClients(data.clients);
      })
      .catch(() => toast.error('Erreur de chargement des clients'));
  }, [authenticated]);

  const handleLogin = () => {
    setAuthenticated(true);
    setUser({ name: 'Administrateur', email: 'admin@jmsa.com' });
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.clients) setClients(data.clients);
      });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'POST' });
    setAuthenticated(false);
    setUser(null);
    setClients([]);
    toast.success('Déconnecté');
  };

  const handleSaveClient = async (data: Record<string, string>) => {
    const url = editingClient?.id ? `/api/clients/${editingClient.id}` : '/api/clients';
    const method = editingClient?.id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const result = await res.json();
      toast.success(editingClient ? 'Client mis à jour' : 'Client créé');
      setShowForm(false);
      setEditingClient(null);

      if (editingClient?.id) {
        setClients((prev) => prev.map((c) => (c.id === editingClient.id ? { ...c, ...result.client } : c)));
      } else {
        setClients((prev) => [result.client, ...prev]);
      }
    } else {
      const err = await res.json();
      toast.error(err.error || 'Erreur');
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    const res = await fetch(`/api/clients/${deletingClient.id}`, { method: 'DELETE' });
    if (res.ok) {
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id));
      toast.success('Client supprimé');
      setDeletingClient(null);
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Ne pas rendre côté serveur
  if (!mounted) return null;

  // Login
  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Médiathèque
  if (selectedClient) {
    return <Mediatheque client={selectedClient} onClose={() => setSelectedClient(null)} />;
  }

  // Filtres
  const filteredClients = clients.filter((c) => {
    const matchSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'actif').length;
  const totalFiles = clients.reduce((sum, c) => sum + (c._count?.media || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">JMSA Builder</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Gestion Clients & Médiathèque</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.name}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Se déconnecter">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                <p className="text-sm text-gray-500">Total Clients</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                <p className="text-sm text-gray-500">Fichiers Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
                <p className="text-sm text-gray-500">Clients Actifs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre d'actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => { setEditingClient(null); setShowForm(true); }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </div>

        {/* Liste des clients */}
        {filteredClients.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {clients.length === 0 ? 'Aucun client' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-400 mb-4">
                {clients.length === 0
                  ? 'Commencez par ajouter votre premier client'
                  : 'Essayez de modifier vos critères de recherche'}
              </p>
              {clients.length === 0 && (
                <Button onClick={() => { setEditingClient(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{client.name}</CardTitle>
                        {client.company && (
                          <p className="text-xs text-gray-500 truncate">{client.company}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${getStatusColor(client.status)}`}>
                      {client.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 space-y-3">
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {client.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {client._count?.media || 0} fichier(s)
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(client.updatedAt)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                      onClick={() => setSelectedClient(client)}
                    >
                      <FolderOpen className="w-4 h-4 mr-1.5" />
                      Médiathèque
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setEditingClient(client); setShowForm(true); }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => setDeletingClient(client)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialog Créer/Modifier Client */}
      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingClient(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? `Modifier ${editingClient.name}` : 'Nouveau Client'}
            </DialogTitle>
          </DialogHeader>
          <ClientForm
            client={editingClient}
            onSave={handleSaveClient}
            onCancel={() => { setShowForm(false); setEditingClient(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Alert Supprimer */}
      <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {deletingClient?.name} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client et tous ses fichiers associés seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
