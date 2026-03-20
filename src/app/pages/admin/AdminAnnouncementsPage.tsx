import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Megaphone, Plus, Edit, Trash2,
  Eye, EyeOff, Calendar, Clock,
  Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title: string;
  content: string;
  type: string;
  priority: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

// ── Constants ──────────────────────────────────────
const ANNOUNCEMENT_TYPES = [
  { value: 'General',   label: 'General' },
  { value: 'Mass',      label: 'Mass Schedule' },
  { value: 'Event',     label: 'Event' },
  { value: 'Holiday',   label: 'Holiday' },
  { value: 'Emergency', label: 'Emergency' },
];

const PRIORITIES = [
  { value: 'Low',    label: 'Low Priority' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High',   label: 'High Priority' },
  { value: 'Urgent', label: 'Urgent' },
];

const DEFAULT_FORM: FormData = {
  title: '',
  content: '',
  type: 'General',
  priority: 'Normal',
  is_active: true,
  start_date: '',
  end_date: '',
};

// ── Component ──────────────────────────────────────
export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements]     = useState<Announcement[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [submitting, setSubmitting]           = useState(false);
  const [showAddDialog, setShowAddDialog]     = useState(false);
  const [editingItem, setEditingItem]         = useState<Announcement | null>(null);
  const [deleteConfirm, setDeleteConfirm]     = useState<number | null>(null);
  const [filter, setFilter]                   = useState<string>('all');
  const [formData, setFormData]               = useState<FormData>(DEFAULT_FORM);

  useEffect(() => { loadAnnouncements(); }, []);

  // ── Load All (Admin) ─────────────────────────────
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res  = await fetch(
        `${BASE_URL}/bind/announcements/admin/all`,
        { headers: getAuthHeader().headers }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) setAnnouncements(data.data);
      else throw new Error(data.message || 'Failed to load');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // ── Create / Update ──────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const url    = editingItem
        ? `${BASE_URL}/bind/announcements/${editingItem.id}`
        : `${BASE_URL}/add/announcements`;
      const method = editingItem ? 'PUT' : 'POST';

      const body = {
        ...formData,
        start_date: formData.start_date || null,
        end_date:   formData.end_date   || null,
      };

      const res  = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader().headers,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        toast.success(`Announcement ${editingItem ? 'updated' : 'created'} successfully`);
        closeDialog();
        loadAnnouncements();
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Active ────────────────────────────────
  const handleToggleActive = async (id: number) => {
    try {
      const res  = await fetch(
        `${BASE_URL}/bind/announcements/${id}/toggle`,
        { method: 'PATCH', headers: getAuthHeader().headers }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        toast.success(data.message);
        loadAnnouncements();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  // ── Delete ───────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const res  = await fetch(
        `${BASE_URL}/bind/announcements/${id}`,
        { method: 'DELETE', headers: getAuthHeader().headers }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        toast.success('Announcement deleted successfully');
        setDeleteConfirm(null);
        loadAnnouncements();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // ── Helpers ──────────────────────────────────────
  const handleEdit = (a: Announcement) => {
    setEditingItem(a);
    setFormData({
      title:      a.title,
      content:    a.content,
      type:       a.type,
      priority:   a.priority,
      is_active:  a.is_active,
      start_date: a.start_date ? a.start_date.split('T')[0] : '',
      end_date:   a.end_date   ? a.end_date.split('T')[0]   : '',
    });
    setShowAddDialog(true);
  };

  const closeDialog = () => {
    setShowAddDialog(false);
    setEditingItem(null);
    setFormData(DEFAULT_FORM);
  };

  const setField = (key: keyof FormData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  // ── Priority Badge ───────────────────────────────
  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      Urgent: 'bg-red-100 text-red-800',
      High:   'bg-orange-100 text-orange-800',
      Normal: 'bg-blue-100 text-blue-800',
      Low:    'bg-gray-100 text-gray-800',
    };
    return (
      <Badge className={`${map[priority] || 'bg-gray-100 text-gray-800'} border-0`}>
        {priority}
      </Badge>
    );
  };

  // ── Type Badge ───────────────────────────────────
  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      General:   'bg-green-100 text-green-800',
      Mass:      'bg-purple-100 text-purple-800',
      Event:     'bg-blue-100 text-blue-800',
      Holiday:   'bg-yellow-100 text-yellow-800',
      Emergency: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={`${map[type] || 'bg-gray-100 text-gray-800'} border-0`}>
        {type}
      </Badge>
    );
  };

  // ── Stats ────────────────────────────────────────
  const statusCounts = {
    all:      announcements.length,
    active:   announcements.filter(a => a.is_active).length,
    inactive: announcements.filter(a => !a.is_active).length,
  };

  const filteredAnnouncements = filter === 'all'
    ? announcements
    : announcements.filter(a =>
        filter === 'active' ? a.is_active : !a.is_active
      );

  // ── Loading ──────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 text-green-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg font-medium">Loading announcements...</span>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Announcements Management</h1>
            <p className="text-gray-600">Create and manage important announcements for your shrine</p>
          </div>
          <Button
            onClick={() => { setEditingItem(null); setFormData(DEFAULT_FORM); setShowAddDialog(true); }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Announcement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total', count: statusCounts.all,      color: 'bg-green-50', textColor: 'text-green-800', icon: Megaphone, sub: 'All announcements' },
            { label: 'Active', count: statusCounts.active,   color: 'bg-blue-50',  textColor: 'text-blue-800',  icon: Eye,       sub: 'Visible to public' },
            { label: 'Inactive', count: statusCounts.inactive, color: 'bg-red-50',   textColor: 'text-red-800',   icon: EyeOff,    sub: 'Hidden from public' },
          ].map(s => (
            <Card key={s.label} className={`border-0 shadow-sm ${s.color}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm ${s.textColor}`}>{s.label}</p>
                  <s.icon className={`w-5 h-5 ${s.textColor}`} />
                </div>
                <p className={`text-2xl font-bold ${s.textColor}`}>{s.count}</p>
                <p className={`text-xs mt-1 ${s.textColor} opacity-80`}>{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Buttons */}
        <Card className="mb-6 border-0 shadow-sm bg-green-50">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all',      label: 'All',      count: statusCounts.all },
                { key: 'active',   label: 'Active',   count: statusCounts.active },
                { key: 'inactive', label: 'Inactive', count: statusCounts.inactive },
              ].map(({ key, label, count }) => (
                <Button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={filter === key
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-white text-green-700 hover:bg-green-100 border-0'}
                >
                  {label} ({count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* List */}
        {filteredAnnouncements.length > 0 ? (
          <div className="space-y-6">
            {filteredAnnouncements.map(a => (
              <Card key={a.id} className={`border-0 shadow-sm hover:shadow-lg transition-shadow bg-white border-l-4 ${
                a.priority === 'Urgent' ? 'border-l-red-500'
                : a.priority === 'High' ? 'border-l-orange-500'
                : 'border-l-green-500'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900">{a.title}</h3>
                        {getPriorityBadge(a.priority)}
                        {getTypeBadge(a.type)}
                        {!a.is_active && (
                          <Badge className="bg-red-100 text-red-700 border-0">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(a.created_at).toLocaleDateString()}</span>
                        </div>
                        {a.end_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(a.end_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {a.content.length > 200 ? `${a.content.substring(0, 200)}...` : a.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    {/* Toggle */}
                    <Button size="sm" variant="ghost"
                      onClick={() => handleToggleActive(a.id)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 border-0"
                      title={a.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {a.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    {/* Edit */}
                    <Button size="sm" variant="ghost"
                      onClick={() => handleEdit(a)}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {/* Delete */}
                    <Button size="sm" variant="ghost"
                      onClick={() => setDeleteConfirm(a.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' ? 'Create your first announcement to get started.' : `No ${filter} announcements found.`}
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => { setEditingItem(null); setFormData(DEFAULT_FORM); setShowAddDialog(true); }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create First Announcement
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) closeDialog(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {editingItem ? 'Edit Announcement' : 'Add New Announcement'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label>Title <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.title}
                  onChange={e => setField('title', e.target.value)}
                  placeholder="Enter announcement title"
                  required className="mt-1"
                />
              </div>

              {/* Content */}
              <div>
                <Label>Content <span className="text-red-500">*</span></Label>
                <Textarea
                  value={formData.content}
                  onChange={e => setField('content', e.target.value)}
                  placeholder="Enter announcement content"
                  rows={6} required className="mt-1"
                />
              </div>

              {/* Type + Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={v => setField('type', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ANNOUNCEMENT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={v => setField('priority', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Start + End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date (Optional)</Label>
                  <Input type="date" value={formData.start_date}
                    onChange={e => setField('start_date', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input type="date" value={formData.end_date}
                    onChange={e => setField('end_date', e.target.value)} className="mt-1" />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={v => setField('is_active', v)}
                />
                <Label htmlFor="is_active">Active (visible to public)</Label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="ghost" onClick={closeDialog}
                  className="bg-gray-100 hover:bg-gray-200">Cancel</Button>
                <Button type="submit" disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    : `${editingItem ? 'Update' : 'Create'} Announcement`}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
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
                  <p className="text-sm text-red-600">The announcement will be permanently deleted.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
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