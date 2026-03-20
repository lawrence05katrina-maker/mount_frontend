import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Radio, Plus, Edit, Trash2, Play, Square, Users, Clock, Calendar, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

interface LivestreamData {
  id: number;
  title: string;
  description?: string;
  stream_url: string;
  thumbnail_url?: string;
  platform: string;
  status: 'active' | 'scheduled' | 'ended';
  scheduled_at?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

interface LivestreamFormData {
  title: string;
  description: string;
  stream_url: string;
  thumbnail_url: string;
  platform: string;
  status: string;
  scheduled_at: string;
}

export const AdminLivestreamPage: React.FC = () => {
  const [livestreams,    setLivestreams]    = useState<LivestreamData[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [showForm,       setShowForm]       = useState(false);
  const [editingStream,  setEditingStream]  = useState<LivestreamData | null>(null);
  const [formData,       setFormData]       = useState<LivestreamFormData>({
    title: '', description: '', stream_url: '',
    thumbnail_url: '', platform: 'YouTube',
    status: 'scheduled', scheduled_at: ''
  });

  // ── FETCH all livestreams (admin) ──────────────────
  const fetchLivestreams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bind/livestream/admin`, getAuthHeader());
      if (res.data.success) {
        setLivestreams(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching livestreams:', error);
      toast.error('Failed to load livestreams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLivestreams(); }, []);

  // ── CREATE or UPDATE ───────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.stream_url) {
      toast.error('Title and Stream URL are required');
      return;
    }
    try {
      if (editingStream) {
        const res = await axios.put(
          `${BASE_URL}/bind/livestream/${editingStream.id}`,
          formData,
          getAuthHeader()
        );
        if (res.data.success) {
          toast.success('Livestream updated successfully');
          fetchLivestreams();
          resetForm();
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/add/livestream`,
          formData,
          getAuthHeader()
        );
        if (res.data.success) {
          toast.success('Livestream created successfully');
          fetchLivestreams();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving livestream:', error);
      toast.error('Failed to save livestream');
    }
  };

  // ── EDIT ───────────────────────────────────────────
  const handleEdit = (stream: LivestreamData) => {
    setEditingStream(stream);
    setFormData({
      title:         stream.title,
      description:   stream.description || '',
      stream_url:    stream.stream_url,
      thumbnail_url: stream.thumbnail_url || '',
      platform:      stream.platform || 'YouTube',
      status:        stream.status,
      scheduled_at:  stream.scheduled_at
        ? new Date(stream.scheduled_at).toISOString().slice(0, 16)
        : ''
    });
    setShowForm(true);
  };

  // ── DELETE ─────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this livestream?')) return;
    try {
      const res = await axios.delete(`${BASE_URL}/bind/livestream/${id}`, getAuthHeader());
      if (res.data.success) {
        toast.success('Livestream deleted successfully');
        fetchLivestreams();
      }
    } catch (error) {
      toast.error('Failed to delete livestream');
    }
  };

  // ── SET ACTIVE (Go Live) ───────────────────────────
  const handleStart = async (id: number) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/bind/livestream/${id}/status`,
        { status: 'active' },
        getAuthHeader()
      );
      if (res.data.success) {
        toast.success('Livestream is now LIVE!');
        fetchLivestreams();
      }
    } catch (error) {
      toast.error('Failed to start livestream');
    }
  };

  // ── SET ENDED ──────────────────────────────────────
  const handleEnd = async (id: number) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/bind/livestream/${id}/status`,
        { status: 'ended' },
        getAuthHeader()
      );
      if (res.data.success) {
        toast.success('Livestream ended');
        fetchLivestreams();
      }
    } catch (error) {
      toast.error('Failed to end livestream');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', stream_url: '',
      thumbnail_url: '', platform: 'YouTube',
      status: 'scheduled', scheduled_at: ''
    });
    setEditingStream(null);
    setShowForm(false);
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':    return <Badge className="bg-red-600 text-white border-0 animate-pulse">🔴 Live</Badge>;
      case 'scheduled': return <Badge className="bg-blue-600 text-white border-0">📅 Scheduled</Badge>;
      case 'ended':     return <Badge className="bg-gray-200 text-gray-600 border-0">✅ Ended</Badge>;
      default:          return <Badge className="bg-gray-200 text-gray-600 border-0">Draft</Badge>;
    }
  };

  // ── Stats ──────────────────────────────────────────
  const stats = {
    total:     livestreams.length,
    active:    livestreams.filter(s => s.status === 'active').length,
    scheduled: livestreams.filter(s => s.status === 'scheduled').length,
    totalViews: livestreams.reduce((sum, s) => sum + (s.views || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-green-700">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading livestreams...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            Livestream Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage live streams and scheduled broadcasts</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Livestream
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {[
          { label: 'Total Streams', value: stats.total,      icon: <Radio   className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" /> },
          { label: 'Active Now',    value: stats.active,     icon: <Play    className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />,   color: 'text-red-600' },
          { label: 'Scheduled',     value: stats.scheduled,  icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />, color: 'text-blue-600' },
          { label: 'Total Views',   value: stats.totalViews, icon: <Eye     className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" /> },
        ].map(({ label, value, icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{label}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
                </div>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <span>{editingStream ? 'Edit Livestream' : 'Create New Livestream'}</span>
                <Button variant="ghost" size="sm" onClick={resetForm} className="text-xl">×</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter livestream title" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3} placeholder="Enter description" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stream URL *</label>
                  <input type="text" value={formData.stream_url}
                    onChange={e => setFormData({ ...formData, stream_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://youtube.com/watch?v=VIDEO_ID or https://youtube.com/embed/VIDEO_ID"
                    required />
                  <p className="text-xs text-gray-500 mt-1">For YouTube: Use watch URL (youtube.com/watch?v=ID) or embed URL (youtube.com/embed/ID)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input type="text" value={formData.thumbnail_url}
                    onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="https://example.com/thumbnail.jpg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active (Go Live Now)</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
                    <input type="datetime-local" value={formData.scheduled_at}
                      onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm">
                    {editingStream ? 'Update Livestream' : 'Create Livestream'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} className="text-sm">Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Livestreams</h2>

        {livestreams.length === 0 ? (
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Radio className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No livestreams yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Create your first livestream to get started</p>
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 text-sm">
                <Plus className="w-4 h-4 mr-2" /> Create Livestream
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {livestreams.map(stream => (
              <Card key={stream.id} className="border-0 shadow-sm border-l-4 border-l-green-500">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{stream.title}</h3>
                        {getStatusBadge(stream.status)}
                      </div>
                      {stream.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{stream.description}</p>
                      )}
                      <div className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                        {stream.scheduled_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Scheduled: {formatDateTime(stream.scheduled_at)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Views: {stream.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Created: {formatDateTime(stream.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                      <Button size="sm" variant="ghost"
                        className="bg-gray-100 hover:bg-gray-200 p-2"
                        onClick={() => window.open(stream.stream_url, '_blank')} title="Open stream">
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>

                      <Button size="sm" variant="ghost"
                        className="bg-gray-100 hover:bg-gray-200 p-2"
                        onClick={() => handleEdit(stream)} title="Edit">
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>

                      {stream.status === 'active' ? (
                        <Button size="sm" variant="ghost"
                          className="bg-red-100 text-red-700 hover:bg-red-200 p-2"
                          onClick={() => handleEnd(stream.id)} title="End stream">
                          <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      ) : stream.status === 'scheduled' ? (
                        <Button size="sm" variant="ghost"
                          className="bg-green-100 text-green-700 hover:bg-green-200 p-2"
                          onClick={() => handleStart(stream.id)} title="Go Live">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      ) : null}

                      <Button size="sm" variant="ghost"
                        className="bg-red-100 text-red-700 hover:bg-red-200 p-2"
                        onClick={() => handleDelete(stream.id)} title="Delete">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};