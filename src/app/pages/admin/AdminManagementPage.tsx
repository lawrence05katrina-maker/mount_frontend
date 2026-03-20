import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import {
  Upload, Users, Trash2, Eye, EyeOff,
  Plus, Loader2, X, Search, Grid3X3, List,
  AlertCircle, CheckCircle2, Phone, Mail,
  Image as ImageIcon, Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface ManagementMember {
  id: number;
  name: string;
  position: string;
  description?: string;
  image_url?: string;
  image_name?: string;
  image_size?: number;
  image_mime?: string;
  phone?: string;
  email?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: string;
  active: string;
  inactive: string;
}

// ── Constants ──────────────────────────────────────
const BACKEND_HOST = BASE_URL.replace('/api', '');

const POSITIONS = [
  { value: 'Parish Priest',    label: 'Parish Priest'    },
  { value: 'Assistant Priest', label: 'Assistant Priest' },
  { value: 'President',        label: 'President'        },
  { value: 'Vice President',   label: 'Vice President'   },
  { value: 'Secretary',        label: 'Secretary'        },
  { value: 'Treasurer',        label: 'Treasurer'        },
  { value: 'Coordinator',      label: 'Coordinator'      },
  { value: 'Director',         label: 'Director'         },
];

const DEFAULT_FORM = {
  name: '', position: '', description: '',
  phone: '', email: '', display_order: 0,
  is_active: true, file: null as File | null,
};

// ── Helpers ────────────────────────────────────────
const getFullImageUrl = (member: ManagementMember): string => {
  if (member.image_url) {
    if (member.image_url.startsWith('/api')) return `${BACKEND_HOST}${member.image_url}`;
    if (member.image_url.startsWith('http')) return member.image_url;
  }
  return '';
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

// ── Component ──────────────────────────────────────
export const AdminManagementPage: React.FC = () => {
  const [members, setMembers]               = useState<ManagementMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ManagementMember[]>([]);
  const [loading, setLoading]               = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [showAddDialog, setShowAddDialog]   = useState(false);
  const [editingMember, setEditingMember]   = useState<ManagementMember | null>(null);
  const [deleteConfirm, setDeleteConfirm]   = useState<number | null>(null);
  const [dragOver, setDragOver]             = useState(false);
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [searchTerm, setSearchTerm]         = useState('');
  const [viewMode, setViewMode]             = useState<'grid' | 'list'>('grid');
  const [formData, setFormData]             = useState({ ...DEFAULT_FORM });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Filter effect ──────────────────────────────
  useEffect(() => {
    let f = members;
    if (selectedPosition !== 'all')
      f = f.filter(m => m.position.toLowerCase().includes(selectedPosition.toLowerCase()));
    if (searchTerm)
      f = f.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFilteredMembers(f);
  }, [members, selectedPosition, searchTerm]);

  useEffect(() => { loadMembers(); }, []);

  // ── Load Admin Members ─────────────────────────
  const loadMembers = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/bind/management/admin/all`, {
        headers: getAuthHeader().headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setMembers(data.data);
        setStats(data.stats);
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  // ── Create / Update ────────────────────────────
  const handleSubmit = async () => {
    if (!formData.name.trim())     { toast.error('Name is required'); return; }
    if (!formData.position.trim()) { toast.error('Position is required'); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('name',          formData.name);
      fd.append('position',      formData.position);
      fd.append('description',   formData.description);
      fd.append('phone',         formData.phone);
      fd.append('email',         formData.email);
      fd.append('display_order', String(formData.display_order));
      fd.append('is_active',     String(formData.is_active));
      if (formData.file) fd.append('image', formData.file);

      const url    = editingMember
        ? `${BASE_URL}/bind/management/${editingMember.id}`
        : `${BASE_URL}/add/management`;
      const method = editingMember ? 'PUT' : 'POST';

      const res  = await fetch(url, {
        method,
        headers: getAuthHeader().headers, // NO Content-Type — browser sets multipart boundary
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        toast.success(data.message);
        closeDialog();
        loadMembers();
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save member');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ─────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/management/${id}`, {
        method: 'DELETE', headers: getAuthHeader().headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        toast.success('Member deleted successfully');
        setDeleteConfirm(null);
        loadMembers();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // ── Toggle Active ──────────────────────────────
  const handleToggleActive = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/management/${id}/toggle`, {
        method: 'PATCH', headers: getAuthHeader().headers,
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); loadMembers(); }
      else throw new Error(data.message);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // ── Helpers ────────────────────────────────────
  const openEditDialog = (member: ManagementMember) => {
    setEditingMember(member);
    setFormData({
      name:          member.name,
      position:      member.position,
      description:   member.description || '',
      phone:         member.phone || '',
      email:         member.email || '',
      display_order: member.display_order,
      is_active:     member.is_active,
      file:          null,
    });
    setShowAddDialog(true);
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingMember(null);
    setFormData({ ...DEFAULT_FORM });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const allowed = ['image/jpeg','image/png','image/gif','image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPEG, PNG, GIF, WebP allowed'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setFormData(p => ({ ...p, file }));
  };

  const setField = (key: string, value: any) =>
    setFormData(p => ({ ...p, [key]: value }));

  // ── Loading ────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 text-green-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg font-medium">Loading management team...</span>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Management Team</h1>
            <p className="text-gray-600">Manage your shrine's leadership and team members</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm"
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              className="bg-green-100 text-green-700 hover:bg-green-200">
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
            <Button onClick={() => { setFormData({ ...DEFAULT_FORM }); setEditingMember(null); setShowAddDialog(true); }}
              className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: 'Total Members', val: stats.total,    bg: 'bg-green-50',  text: 'text-green-800',  Icon: Users       },
              { label: 'Active',        val: stats.active,   bg: 'bg-blue-50',   text: 'text-blue-800',   Icon: CheckCircle2},
              { label: 'Inactive',      val: stats.inactive, bg: 'bg-purple-50', text: 'text-purple-800', Icon: EyeOff      },
            ].map(s => (
              <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm ${s.text}`}>{s.label}</p>
                    <s.Icon className={`w-5 h-5 ${s.text} opacity-70`} />
                  </div>
                  <p className={`text-2xl font-bold ${s.text}`}>{s.val}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 w-4 h-4" />
                <Input placeholder="Search team members..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-white" />
              </div>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-full lg:w-48 border-0 bg-white">
                  <SelectValue placeholder="All Positions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {POSITIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <Card key={member.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-xl">
                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {getFullImageUrl(member) ? (
                    <img src={getFullImageUrl(member)} alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                      <Users className="w-16 h-16 text-green-400" />
                    </div>
                  )}
                  {!member.is_active && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500/90 text-white border-0">
                        <EyeOff className="w-3 h-3" />
                      </Badge>
                    </div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button onClick={() => openEditDialog(member)}
                        className="w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center text-blue-700 hover:bg-white">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(member.id)}
                        className="w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center text-green-700 hover:bg-white">
                        {member.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteConfirm(member.id)}
                        className="w-9 h-9 bg-white/90 rounded-lg flex items-center justify-center text-red-600 hover:bg-white">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-1 text-lg truncate">{member.name}</h4>
                    <p className="text-sm text-green-700 font-medium mb-3 bg-green-50 px-3 py-1 rounded-full inline-block">
                      {member.position}
                    </p>
                    {member.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{member.description}</p>
                    )}
                    <div className="space-y-1 mb-3">
                      {member.phone && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3 h-3" /> <span>{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3" /> <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <Badge className={`border-0 ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-gray-400">#{member.display_order}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredMembers.map(member => (
              <Card key={member.id} className="border-0 shadow-sm hover:shadow-lg transition-all bg-white rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {getFullImageUrl(member) ? (
                        <img src={getFullImageUrl(member)} alt={member.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                          <Users className="w-10 h-10 text-green-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h4 className="font-semibold text-gray-900 text-lg">{member.name}</h4>
                            <Badge className={`border-0 ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700 font-medium mb-2 bg-green-50 px-3 py-1 rounded-full inline-block">
                            {member.position}
                          </p>
                          {member.description && (
                            <p className="text-sm text-gray-600 mb-2">{member.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {member.phone}
                              </div>
                            )}
                            {member.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {member.email}
                              </div>
                            )}
                            <span>Order: {member.display_order}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(member)}
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleToggleActive(member.id)}
                            className="bg-green-50 text-green-700 hover:bg-green-100">
                            {member.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(member.id)}
                            className="bg-red-50 text-red-700 hover:bg-red-100">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && !loading && (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedPosition !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Add your first team member to get started'}
              </p>
              {!searchTerm && selectedPosition === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add First Member
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={open => { if (!open) closeDialog(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-green-800">
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Image Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-green-400 bg-green-50' : 'border-green-300 hover:border-green-400'}`}>
                {formData.file ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <ImageIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(formData.file.size)}</p>
                    <Button variant="ghost" size="sm"
                      onClick={e => { e.stopPropagation(); setField('file', null); }}
                      className="bg-red-100 text-red-700 hover:bg-red-200">
                      <X className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">Drop image here or click to browse</p>
                    <p className="text-sm text-gray-500">JPEG, PNG, GIF, WebP — Max 10MB</p>
                    {editingMember?.image_url && (
                      <p className="text-xs text-green-600">Current image will be kept if no new image selected</p>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => handleFileSelect(e.target.files)} />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Name <span className="text-red-500">*</span></Label>
                  <Input value={formData.name} onChange={e => setField('name', e.target.value)}
                    placeholder="Enter member name" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Position <span className="text-red-500">*</span></Label>
                  <Input value={formData.position} onChange={e => setField('position', e.target.value)}
                    placeholder="e.g., Parish Priest, Secretary..." className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setField('description', e.target.value)}
                    placeholder="Enter member description" rows={3} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input type="tel" value={formData.phone} onChange={e => setField('phone', e.target.value)}
                    placeholder="Phone number" className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={e => setField('email', e.target.value)}
                    placeholder="Email address" className="mt-1" />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={formData.display_order}
                    onChange={e => setField('display_order', parseInt(e.target.value) || 0)}
                    className="mt-1" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Switch checked={formData.is_active}
                    onCheckedChange={v => setField('is_active', v)} />
                  <Label>Active/Visible</Label>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t bg-white">
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200"
                onClick={closeDialog} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white">
                {uploading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingMember ? 'Updating...' : 'Adding...'}</>
                  : <><Upload className="w-4 h-4 mr-2" />{editingMember ? 'Update Member' : 'Add Member'}</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-800">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800">This action cannot be undone</p>
                  <p className="text-sm text-red-600">The member will be permanently deleted.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};