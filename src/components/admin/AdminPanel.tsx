'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  MessageSquare,
  BarChart3,
  LogOut,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Trash2,
  Lock,
  Globe,
  ExternalLink,
  Clock,
  ChevronDown,
  Loader2,
  AlertCircle,
  User as UserIcon,
  Mail,
  Eye,
  EyeOff,
  Ban,
} from 'lucide-react';

/* ─── Types ─── */
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  domain: string | null;
  betaUrl: string | null;
  businessName: string | null;
  phone: string | null;
  createdAt: string;
}

interface AdminComment {
  id: string;
  articleSlug: string;
  author: string;
  email: string | null;
  content: string;
  website: string | null;
  isApproved: boolean;
  createdAt: string;
}

type StatusType = 'pending' | 'analyzing' | 'beta_ready' | 'active';

/* ─── Status helpers ─── */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  pending: {
    label: 'En attente',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  analyzing: {
    label: 'En cours d\'analyse',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  beta_ready: {
    label: 'Beta pret',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  active: {
    label: 'Actif',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
};

const STATUSES: StatusType[] = ['pending', 'analyzing', 'beta_ready', 'active'];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/* ─── Login View ─── */
function AdminLogin({
  onLogin,
}: {
  onLogin: (token: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem('jmsa_admin_token', data.token);
        onLogin(data.token);
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative shadow-xl border-gray-200/80 bg-white">
        <CardContent className="p-8">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Image
                src="/favicon-jmsabuilder.png"
                alt="JMSA Builder"
                width={64}
                height={64}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              Accès réservé aux administrateurs
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@jmsabuilder.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 h-11"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Se connecter
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            JMSA Builder &mdash; par JM Services Africa
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bgColor} border ${config.borderColor}`}
    >
      {status === 'active' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'analyzing' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'beta_ready' && <Clock className="w-3 h-3" />}
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {config.label}
    </span>
  );
}

/* ─── User Row ─── */
function UserRow({
  user,
  onStatusChange,
  onSetBetaUrl,
  onSetDomain,
  onDelete,
}: {
  user: AdminUser;
  onStatusChange: (userId: string, status: StatusType) => void;
  onSetBetaUrl: (userId: string, url: string) => void;
  onSetDomain: (userId: string, domain: string) => void;
  onDelete: (userId: string) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleStatusChange = async (newStatus: StatusType) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${localUser.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('jmsa_admin_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLocalUser((prev) => ({ ...prev, status: newStatus }));
        onStatusChange(localUser.id, newStatus);
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-emerald-200/60 hover:shadow-sm transition-all">
      {/* User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shrink-0">
          <UserIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {localUser.businessName || localUser.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{localUser.email}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={localUser.status} />
        {updating && <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />}
      </div>

      {/* Plan */}
      <Badge
        variant="outline"
        className="shrink-0 text-xs font-medium text-gray-600 border-gray-200"
      >
        {localUser.plan === 'free' ? 'Gratuit' : localUser.plan === 'premium' ? 'Premium' : localUser.plan}
      </Badge>

      {/* Date */}
      <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {formatDate(localUser.createdAt)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        {/* Status change */}
        <Select
          value={localUser.status}
          onValueChange={(val) => handleStatusChange(val as StatusType)}
          disabled={updating}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs rounded-lg border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {STATUS_CONFIG[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Beta URL */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-lg border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
          onClick={() => onSetBetaUrl(localUser.id, localUser.betaUrl || '')}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Beta
        </Button>

        {/* Domain */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-lg border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
          onClick={() => onSetDomain(localUser.id, localUser.domain || '')}
        >
          <Globe className="w-3 h-3 mr-1" />
          Domaine
        </Button>

        {/* Delete */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          onClick={() => onDelete(localUser.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Comment Row ─── */
function CommentRow({
  comment,
  onApprove,
  onReject,
  onDelete,
}: {
  comment: AdminComment;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        !comment.isApproved
          ? 'bg-amber-50/50 border-amber-200/60'
          : 'bg-white border-gray-100 hover:border-emerald-200/60 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            !comment.isApproved
              ? 'bg-amber-100'
              : 'bg-emerald-100'
          }`}
        >
          <UserIcon
            className={`w-5 h-5 ${
              !comment.isApproved ? 'text-amber-600' : 'text-emerald-600'
            }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {comment.author}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400">
              {comment.email || 'Pas d\'email'}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Article slug */}
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Article: <span className="font-mono text-emerald-600">{comment.articleSlug}</span>
          </p>

          {/* Comment content */}
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {comment.content}
          </p>

          {comment.website && (
            <a
              href={comment.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-600 hover:text-emerald-700 mt-1 inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {comment.website.replace(/^https?:\/\//, '')}
            </a>
          )}

          {/* Status */}
          <div className="mt-2">
            {comment.isApproved ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approuvé
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                <Clock className="w-3 h-3 mr-1" /> En attente
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!comment.isApproved && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
              onClick={() => onApprove(comment.id)}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Approuver
            </Button>
          )}
          {comment.isApproved && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300"
              onClick={() => onReject(comment.id)}
            >
              <Ban className="w-3 h-3 mr-1" />
              Rejeter
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            onClick={() => onDelete(comment.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialogs
  const [betaUrlDialog, setBetaUrlDialog] = useState<{
    open: boolean;
    userId: string;
    currentUrl: string;
  }>({ open: false, userId: '', currentUrl: '' });
  const [domainDialog, setDomainDialog] = useState<{
    open: boolean;
    userId: string;
    currentDomain: string;
  }>({ open: false, userId: '', currentDomain: '' });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: '', userName: '' });

  // Dialog form state
  const [betaUrlInput, setBetaUrlInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.businessName || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSetBetaUrl = async () => {
    if (!betaUrlDialog.userId) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${betaUrlDialog.userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betaUrl: betaUrlInput }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === betaUrlDialog.userId ? { ...u, betaUrl: betaUrlInput } : u
          )
        );
        setBetaUrlDialog({ open: false, userId: '', currentUrl: '' });
      }
    } catch {
      // silently fail
    } finally {
      setDialogLoading(false);
    }
  };

  const handleSetDomain = async () => {
    if (!domainDialog.userId) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${domainDialog.userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domainInput }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === domainDialog.userId ? { ...u, domain: domainInput } : u
          )
        );
        setDomainDialog({ open: false, userId: '', currentDomain: '' });
      }
    } catch {
      // silently fail
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;
    setDialogLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteDialog.userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteDialog.userId));
        setDeleteDialog({ open: false, userId: '', userName: '' });
      }
    } catch {
      // silently fail
    } finally {
      setDialogLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, email ou entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-200">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && ` (${STATUS_CONFIG[statusFilter]?.label})`}
          </p>
        </div>

        {/* Users list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onStatusChange={(userId, status) => {
                  setUsers((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, status } : u))
                  );
                }}
                onSetBetaUrl={(userId, url) => {
                  setBetaUrlInput(url);
                  setBetaUrlDialog({ open: true, userId, currentUrl: url });
                }}
                onSetDomain={(userId, domain) => {
                  setDomainInput(domain);
                  setDomainDialog({ open: true, userId, currentDomain: domain });
                }}
                onDelete={(userId) => {
                  const u = users.find((x) => x.id === userId);
                  setDeleteDialog({
                    open: true,
                    userId,
                    userName: u?.businessName || u?.name || 'Cet utilisateur',
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
            <p className="text-sm text-gray-400 mt-1">
              Modifiez vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Beta URL Dialog */}
      <Dialog
        open={betaUrlDialog.open}
        onOpenChange={(open) =>
          setBetaUrlDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-emerald-500" />
              URL Beta du site
            </DialogTitle>
            <DialogDescription>
              Définissez l&apos;URL de la version beta du site pour cet
              utilisateur.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://beta.example.jmsabuilder.com"
            value={betaUrlInput}
            onChange={(e) => setBetaUrlInput(e.target.value)}
            className="rounded-lg"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setBetaUrlDialog({ open: false, userId: '', currentUrl: '' })
              }
              className="rounded-lg"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSetBetaUrl}
              disabled={dialogLoading || !betaUrlInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              {dialogLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Domain Dialog */}
      <Dialog
        open={domainDialog.open}
        onOpenChange={(open) =>
          setDomainDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              Domaine personnalisé
            </DialogTitle>
            <DialogDescription>
              Définissez le nom de domaine personnalisé pour cet utilisateur.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="www.example.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            className="rounded-lg"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDomainDialog({
                  open: false,
                  userId: '',
                  currentDomain: '',
                })
              }
              className="rounded-lg"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSetDomain}
              disabled={dialogLoading || !domainInput.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              {dialogLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Supprimer l&apos;utilisateur
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer{' '}
              <span className="font-semibold text-gray-700">
                {deleteDialog.userName}
              </span>{' '}
              ? Cette action est irréversible. Toutes les données associées
              (pages, articles, médias) seront supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialog({ open: false, userId: '', userName: '' })
              }
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={dialogLoading}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              {dialogLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── Comments Tab ─── */
function CommentsTab({ token }: { token: string }) {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    commentId: string;
    author: string;
  }>({ open: false, commentId: '', author: '' });
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/comments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const filteredComments = comments.filter((c) => {
    const matchesSearch =
      !search.trim() ||
      c.author.toLowerCase().includes(search.toLowerCase()) ||
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.articleSlug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !c.isApproved) ||
      (filter === 'approved' && c.isApproved);
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isApproved: true }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isApproved: true } : c))
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isApproved: false }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isApproved: false } : c))
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.commentId) return;
    setDialogLoading(true);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: deleteDialog.commentId }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.filter((c) => c.id !== deleteDialog.commentId)
        );
        setDeleteDialog({ open: false, commentId: '', author: '' });
      }
    } catch {
      // silently fail
    } finally {
      setDialogLoading(false);
    }
  };

  const pendingCount = comments.filter((c) => !c.isApproved).length;

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher par auteur, contenu ou article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-emerald-400 focus:ring-emerald-400"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg border-gray-200">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les commentaires</SelectItem>
              <SelectItem value="pending">
                En attente ({pendingCount})
              </SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredComments.length} commentaire
            {filteredComments.length !== 1 ? 's' : ''}
          </p>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {pendingCount} en attente
            </Badge>
          )}
        </div>

        {/* Comments list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-500">
                Chargement des commentaires...
              </p>
            </div>
          </div>
        ) : filteredComments.length > 0 ? (
          <div className="space-y-3">
            {filteredComments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={(id) => {
                  const c = comments.find((x) => x.id === id);
                  setDeleteDialog({
                    open: true,
                    commentId: id,
                    author: c?.author || 'Cet auteur',
                  });
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              Aucun commentaire trouvé
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Modifiez vos filtres de recherche
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Supprimer le commentaire
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le commentaire de{' '}
              <span className="font-semibold text-gray-700">
                {deleteDialog.author}
              </span>{' '}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialog({ open: false, commentId: '', author: '' })
              }
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={dialogLoading}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              {dialogLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Supprimer définitivement'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ─── Main Admin Panel ─── */
export default function AdminPanel({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const existingToken = sessionStorage.getItem('jmsa_admin_token');
    if (existingToken) {
      setToken(existingToken);
    }
    setCheckingAuth(false);
  }, []);

  // Fetch stats data when authenticated
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [usersRes, commentsRes] = await Promise.all([
          fetch('/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/comments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (usersRes.ok) {
          const userData = await usersRes.json();
          setUsers(userData.users || userData || []);
        }
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData.comments || commentsData || []);
        }
      } catch {
        // silently fail
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('jmsa_admin_token');
    setToken(null);
    setUsers([]);
    setComments([]);
    if (onClose) {
      onClose();
    } else {
      window.location.href = '/';
    }
  };

  // Calculate stats
  const stats = {
    total: users.length,
    pending: users.filter((u) => u.status === 'pending').length,
    analyzing: users.filter((u) => u.status === 'analyzing').length,
    active: users.filter((u) => u.status === 'active').length,
    pendingComments: comments.filter((c) => !c.isApproved).length,
  };

  // Show login
  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-[70] bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-gray-50 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <Image
                src="/favicon-jmsabuilder.png"
                alt="JMSA Builder"
                width={36}
                height={36}
                className="rounded-xl"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Administration
                </h1>
                <span className="text-[11px] text-gray-500 leading-tight hidden sm:block">
                  JMSA Builder &mdash; Tableau de bord
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-lg border-gray-200 hover:border-gray-300 text-gray-600 text-sm"
              >
                Fermer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-sm"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
              <StatCard
                icon={Users}
                label="Total utilisateurs"
                value={stats.total}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatCard
                icon={Clock}
                label="En attente"
                value={stats.pending}
                color="text-gray-600"
                bgColor="bg-gray-100"
              />
              <StatCard
                icon={BarChart3}
                label="En analyse"
                value={stats.analyzing}
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={CheckCircle2}
                label="Actifs"
                value={stats.active}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatCard
                icon={MessageSquare}
                label="Commentaires en attente"
                value={stats.pendingComments}
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white border border-gray-200 rounded-lg p-1">
                <TabsTrigger
                  value="users"
                  className="rounded-md data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  Utilisateurs
                  {stats.total > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 text-xs h-5 min-w-[20px] px-1.5"
                    >
                      {stats.total}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="rounded-md data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  Commentaires
                  {stats.pendingComments > 0 && (
                    <Badge className="ml-1.5 text-xs h-5 min-w-[20px] px-1.5 bg-amber-100 text-amber-700 border-amber-200 border">
                      {stats.pendingComments}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <UsersTab token={token} />
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <CommentsTab token={token} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
