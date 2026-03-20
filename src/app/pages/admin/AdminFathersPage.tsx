import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  Crown,
  Heart,
  Star,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface Father {
  id: number;
  name: string;
  period?: string;
  category: 'Parish Priest' | 'Associate Priest' | 'Son of Soil' | 'Deacon';
  display_order: number;
  is_active: boolean;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface FatherFormData {
  name: string;
  period: string;
  category: 'Parish Priest' | 'Associate Priest' | 'Son of Soil' | 'Deacon';
  display_order: number;
  is_active: boolean;
}

// ── Constants ──────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  'Parish Priest':    'Parish Priest',
  'Associate Priest': 'Associate Priest',
  'Son of Soil':      'Son of Soil',
  'Deacon':           'Deacon',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Parish Priest':    Crown,
  'Associate Priest': UserCheck,
  'Son of Soil':      Heart,
  'Deacon':           Star,
};

const DEFAULT_FORM: FatherFormData = {
  name: '',
  period: '',
  category: 'Parish Priest',
  display_order: 0,
  is_active: true,
};

// ── Component ──────────────────────────────────────
const AdminFathersPage: React.FC = () => {
  const [fathers, setFathers]               = useState<Father[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [showForm, setShowForm]             = useState(false);
  const [editingFather, setEditingFather]   = useState<Father | null>(null);
  const [formData, setFormData]             = useState<FatherFormData>(DEFAULT_FORM);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [submitting, setSubmitting]         = useState(false);

  // Stats derived from data
  const stats = {
    total:            fathers.length,
    parish_priests:   fathers.filter(f => f.category === 'Parish Priest').length,
    associate_priests:fathers.filter(f => f.category === 'Associate Priest').length,
    sons_of_soil:     fathers.filter(f => f.category === 'Son of Soil').length,
    deacons:          fathers.filter(f => f.category === 'Deacon').length,
  };

  useEffect(() => {
    fetchFathers();
  }, []);

  // ── Fetch All Fathers (Admin) ────────────────────
  const fetchFathers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${BASE_URL}/bind/fathers/admin/all`,
        { headers: getAuthHeader().headers }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setFathers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch fathers');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch fathers';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Create / Update Father ───────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url    = editingFather
        ? `${BASE_URL}/bind/fathers/${editingFather.id}`
        : `${BASE_URL}/add/fathers`;
      const method = editingFather ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader().headers,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        await fetchFathers();
        closeForm();
        toast.success(`Father ${editingFather ? 'updated' : 'added'} successfully!`);
      } else {
        throw new Error(data.message || 'Operation failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Father ────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this father?')) return;

    try {
      const res = await fetch(`${BASE_URL}/bind/fathers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader().headers,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        await fetchFathers();
        toast.success('Father deleted successfully!');
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete father';
      setError(msg);
      toast.error(msg);
    }
  };

  // ── Helpers ──────────────────────────────────────
  const handleEdit = (father: Father) => {
    setEditingFather(father);
    setFormData({
      name:          father.name,
      period:        father.period || '',
      category:      father.category,
      display_order: father.display_order,
      is_active:     father.is_active,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFather(null);
    setFormData(DEFAULT_FORM);
  };

  const filteredFathers = selectedCategory === 'all'
    ? fathers
    : fathers.filter(f => f.category === selectedCategory);

  // ── Loading ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-green-700">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading fathers...</span>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-2">Manage Fathers</h1>
            <p className="text-gray-600">Manage priests, deacons, and sons of soil</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Father
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Fathers',     value: stats.total,             icon: Users,     color: 'text-green-700' },
            { label: 'Parish Priests',    value: stats.parish_priests,    icon: Crown,     color: 'text-purple-600' },
            { label: 'Associate Priests', value: stats.associate_priests, icon: UserCheck, color: 'text-blue-600' },
            { label: 'Sons of Soil & Deacons', value: stats.sons_of_soil + stats.deacons, icon: Heart, color: 'text-red-600' },
          ].map((s) => (
            <Card key={s.label} className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">{s.label}</p>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <Card className="mb-6 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium text-gray-700">Filter by Category:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Parish Priest">Parish Priest</SelectItem>
                  <SelectItem value="Associate Priest">Associate Priest</SelectItem>
                  <SelectItem value="Son of Soil">Son of Soil</SelectItem>
                  <SelectItem value="Deacon">Deacon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add / Edit Dialog */}
        <Dialog open={showForm} onOpenChange={(open) => { if (!open) closeForm(); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                {editingFather ? 'Edit Father' : 'Add New Father'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter father's name"
                  required
                  className="mt-1"
                />
              </div>

              {/* Period */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Period</Label>
                <Input
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="e.g., 19.05.1961 – 06.12.1971"
                  className="mt-1"
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: any) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parish Priest">Parish Priest</SelectItem>
                    <SelectItem value="Associate Priest">Associate Priest</SelectItem>
                    <SelectItem value="Son of Soil">Son of Soil</SelectItem>
                    <SelectItem value="Deacon">Deacon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display Order */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="mt-1"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1 bg-green-700 hover:bg-green-800 text-white">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    : editingFather ? 'Update Father' : 'Add Father'
                  }
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Fathers Table */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="w-5 h-5" />
              Fathers List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFathers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Order</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFathers.map((father) => {
                      const Icon = CATEGORY_ICONS[father.category] || Users;
                      return (
                        <tr key={father.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{father.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{father.period || '-'}</td>
                          <td className="py-3 px-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <Icon className="w-3 h-3" />
                              {CATEGORY_LABELS[father.category]}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{father.display_order}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              father.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {father.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(father)}
                                className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(father.id)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center justify-center"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No fathers found</p>
                <p className="text-gray-400 text-sm">
                  {selectedCategory === 'all'
                    ? 'Click "Add New Father" to get started.'
                    : 'No fathers in this category yet.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminFathersPage;