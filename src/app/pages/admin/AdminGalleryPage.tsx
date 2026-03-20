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
  Upload, Image as ImageIcon, Video, Trash2,
  Eye, EyeOff, Star, StarOff, Plus, Loader2,
  X, Play, Search, Grid3X3, List,
  AlertCircle, CheckCircle2, FileImage, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  media_type: 'image' | 'video';
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  video_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: string;
  active: string;
  inactive: string;
  images: string;
  videos: string;
  featured: string;
}

const BACKEND_HOST = BASE_URL.replace('/api', '');

const CATEGORIES = [
  { value: 'General',   label: 'General'   },
  { value: 'Events',    label: 'Events'    },
  { value: 'Mass',      label: 'Mass'      },
  { value: 'Festivals', label: 'Festivals' },
  { value: 'Nature',    label: 'Nature'    },
  { value: 'Others',    label: 'Others'    },
];

const DEFAULT_FORM = {
  title: '', description: '', category: 'General',
  is_featured: false, is_active: true, display_order: 0,
  file: null as File | null,
  video_url: '', thumbnail_url: '',
  content_type: 'file' as 'file' | 'video_url',
};

// ── Helpers ────────────────────────────────────────
const getFullImageUrl = (item: GalleryItem): string => {
  if (item.media_type === 'image' && item.image_url) {
    if (item.image_url.startsWith('/api')) return `${BACKEND_HOST}${item.image_url}`;
    if (item.image_url.startsWith('http')) return item.image_url;
  }
  return 'https://via.placeholder.com/400x400?text=No+Image';
};

const getVideoThumbnail = (videoUrl?: string, thumbnail?: string): string => {
  if (thumbnail) return thumbnail;
  if (!videoUrl)  return '';
  let id = '';
  if (videoUrl.includes('/embed/'))        id = videoUrl.split('/embed/')[1]?.split('?')[0];
  else if (videoUrl.includes('watch?v='))  id = videoUrl.split('v=')[1]?.split('&')[0];
  else if (videoUrl.includes('youtu.be/')) id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const k = 1024, sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

// ── VideoThumbnail ─────────────────────────────────
const VideoThumbnailComp: React.FC<{ item: GalleryItem; className?: string }> = ({
  item, className = 'w-full h-full'
}) => {
  const [err, setErr] = useState(false);
  const thumb = getVideoThumbnail(item.video_url, item.thumbnail_url);
  if (!thumb || err) return (
    <div className={`${className} bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex flex-col items-center justify-center text-white p-4`}>
      <Video className="w-10 h-10 mx-auto mb-2 opacity-80" />
      <p className="font-medium text-sm text-center line-clamp-2">{item.title}</p>
    </div>
  );
  return (
    <img src={thumb} alt={item.title}
      className={`${className} object-cover`}
      onError={() => setErr(true)} />
  );
};

// ── Component ──────────────────────────────────────
export const AdminGalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems]         = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems]       = useState<GalleryItem[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [uploading, setUploading]               = useState(false);
  const [showAddDialog, setShowAddDialog]       = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState<number | null>(null);
  const [dragOver, setDragOver]                 = useState(false);
  const [stats, setStats]                       = useState<Stats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm]             = useState('');
  const [viewMode, setViewMode]                 = useState<'grid' | 'list'>('grid');
  const [formData, setFormData]                 = useState({ ...DEFAULT_FORM });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Filter effect ──────────────────────────────
  useEffect(() => {
    let f = galleryItems;
    if (selectedCategory !== 'all')
      f = f.filter(i => i.category === selectedCategory);
    if (searchTerm)
      f = f.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    setFilteredItems(f);
  }, [galleryItems, selectedCategory, searchTerm]);

  useEffect(() => { loadGalleryItems(); }, []);

  // ── Load Admin Gallery ─────────────────────────
  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/bind/gallery/admin/all`, {
        headers: getAuthHeader().headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setGalleryItems(data.data);
        setStats(data.stats);
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload ─────────────────────────────────────
  const handleUpload = async () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (formData.content_type === 'file' && !formData.file) { toast.error('Please select a file'); return; }
    if (formData.content_type === 'video_url' && !formData.video_url.trim()) { toast.error('Please provide a video URL'); return; }

    setUploading(true);
    try {
      let res;
      if (formData.content_type === 'video_url') {
        res = await fetch(`${BASE_URL}/add/gallery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeader().headers },
          body: JSON.stringify({
            title:         formData.title,
            description:   formData.description || null,
            category:      formData.category,
            video_url:     formData.video_url,
            thumbnail_url: formData.thumbnail_url || null,
            display_order: formData.display_order,
            is_featured:   formData.is_featured,
            is_active:     formData.is_active,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append('file',          formData.file!);
        fd.append('title',         formData.title);
        fd.append('description',   formData.description);
        fd.append('category',      formData.category);
        fd.append('display_order', String(formData.display_order));
        fd.append('is_featured',   String(formData.is_featured));
        fd.append('is_active',     String(formData.is_active));
        res = await fetch(`${BASE_URL}/add/gallery`, {
          method: 'POST',
          headers: getAuthHeader().headers,
          body: fd,
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        toast.success(data.message);
        setShowAddDialog(false);
        resetForm();
        loadGalleryItems();
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ─────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/gallery/${id}`, {
        method: 'DELETE', headers: getAuthHeader().headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        toast.success('Item deleted successfully');
        setDeleteConfirm(null);
        loadGalleryItems();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // ── Toggle Active ──────────────────────────────
  const handleToggleActive = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/gallery/${id}/toggle`, {
        method: 'PATCH', headers: getAuthHeader().headers,
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); loadGalleryItems(); }
      else throw new Error(data.message);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // ── Toggle Featured ────────────────────────────
  const handleToggleFeatured = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/gallery/${id}/featured`, {
        method: 'PATCH', headers: getAuthHeader().headers,
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); loadGalleryItems(); }
      else throw new Error(data.message);
    } catch (err) {
      toast.error('Failed to update featured status');
    }
  };

  // ── File helpers ───────────────────────────────
  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','video/ogg'];
    if (!allowed.includes(file.type)) { toast.error('Invalid file type'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    setFormData(p => ({ ...p, file }));
  };

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setField = (key: string, value: any) =>
    setFormData(p => ({ ...p, [key]: value }));

  // ── Loading ────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex items-center gap-3 text-green-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg font-medium">Loading gallery...</span>
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
            <h1 className="text-2xl font-bold text-green-800 mb-2">Gallery Management</h1>
            <p className="text-gray-600">Manage your shrine's photo and video gallery</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm"
              onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
              className="bg-green-100 text-green-700 hover:bg-green-200">
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </Button>
            <Button onClick={() => setShowAddDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Media
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label:'Total',    val: stats.total,    bg:'bg-green-50',  text:'text-green-800',  Icon: ImageIcon    },
              { label:'Active',   val: stats.active,   bg:'bg-blue-50',   text:'text-blue-800',   Icon: CheckCircle2 },
              { label:'Inactive', val: stats.inactive, bg:'bg-gray-50',   text:'text-gray-800',   Icon: EyeOff       },
              { label:'Images',   val: stats.images,   bg:'bg-purple-50', text:'text-purple-800', Icon: FileImage    },
              { label:'Videos',   val: stats.videos,   bg:'bg-pink-50',   text:'text-pink-800',   Icon: Video        },
              { label:'Featured', val: stats.featured, bg:'bg-yellow-50', text:'text-yellow-800', Icon: Star         },
            ].map(s => (
              <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
                    <s.Icon className={`w-4 h-4 ${s.text} opacity-60`} />
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
                <Input placeholder="Search gallery items..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-white" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48 border-0 bg-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow bg-white">
                <div className="relative aspect-square bg-gray-100">

                  {/* Image or Video */}
                  {item.media_type === 'video' ? (
                    <>
                      <VideoThumbnailComp item={item} className="w-full h-full" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-purple-600 text-white border-0">
                        <Video className="w-3 h-3 mr-1" /> Video
                      </Badge>
                    </>
                  ) : (
                    <>
                      <img src={getFullImageUrl(item)} alt={item.title}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Image'; }} />
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white border-0">
                        <FileImage className="w-3 h-3 mr-1" /> Image
                      </Badge>
                    </>
                  )}

                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.is_featured && (
                      <Badge className="bg-yellow-500 text-white border-0"><Star className="w-3 h-3" /></Badge>
                    )}
                    {!item.is_active && (
                      <Badge className="bg-gray-500 text-white border-0"><EyeOff className="w-3 h-3" /></Badge>
                    )}
                  </div>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleActive(item.id)}
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-green-700 hover:bg-green-50">
                        {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleToggleFeatured(item.id)}
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-yellow-600 hover:bg-yellow-50">
                        {item.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setDeleteConfirm(item.id)}
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Badge className="bg-green-100 text-green-700 border-0">{item.category}</Badge>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-lg transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.media_type === 'video' ? (
                        <>
                          <VideoThumbnailComp item={item} className="w-full h-full" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img src={getFullImageUrl(item)} alt={item.title}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Img'; }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            <Badge className="bg-green-100 text-green-700 border-0">{item.category}</Badge>
                            <span>{formatDate(item.created_at)}</span>
                            {item.file_size && <span>{formatFileSize(item.file_size)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.is_featured && (
                            <Badge className="bg-yellow-500 text-white border-0">
                              <Star className="w-3 h-3 mr-1" /> Featured
                            </Badge>
                          )}
                          {!item.is_active && (
                            <Badge className="bg-gray-500 text-white border-0">
                              <EyeOff className="w-3 h-3 mr-1" /> Hidden
                            </Badge>
                          )}
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleToggleActive(item.id)}
                              className="bg-green-100 text-green-700 hover:bg-green-200">
                              {item.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleToggleFeatured(item.id)}
                              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                              {item.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(item.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-200">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
        {filteredItems.length === 0 && !loading && (
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Upload your first image or video to get started'}
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add Media Dialog */}
        <Dialog open={showAddDialog} onOpenChange={open => { if (!open) { setShowAddDialog(false); resetForm(); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-green-800">Add New Media</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">

              {/* Content Type Radio */}
              <div className="flex gap-6 p-4 bg-gray-50 rounded-lg">
                {(['file', 'video_url'] as const).map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="content_type" value={type}
                      checked={formData.content_type === type}
                      onChange={() => setField('content_type', type)} />
                    <span className="text-sm font-medium">
                      {type === 'file' ? 'Upload File' : 'Video URL (YouTube, etc.)'}
                    </span>
                  </label>
                ))}
              </div>

              {/* Video URL fields */}
              {formData.content_type === 'video_url' ? (
                <div className="space-y-4">
                  <div>
                    <Label>Video URL <span className="text-red-500">*</span></Label>
                    <Input value={formData.video_url}
                      onChange={e => setField('video_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                      className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      Supports YouTube URLs. The video will be embedded in the gallery.
                    </p>
                  </div>
                  <div>
                    <Label>Thumbnail URL (Optional)</Label>
                    <Input value={formData.thumbnail_url}
                      onChange={e => setField('thumbnail_url', e.target.value)}
                      placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                      className="mt-1" />
                  </div>
                </div>
              ) : (
                // File Upload Drop Zone
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files); }}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-green-400 bg-green-50' : 'border-green-300 hover:border-green-400'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.file ? (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        {formData.file.type.startsWith('video/')
                          ? <Video className="w-8 h-8 text-green-600" />
                          : <FileImage className="w-8 h-8 text-green-600" />}
                      </div>
                      <p className="font-medium text-gray-900">{formData.file.name}</p>
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
                      <p className="text-lg font-medium text-gray-900">Drop files here or click to browse</p>
                      <p className="text-sm text-gray-500">
                        Supports images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG)
                      </p>
                      <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                      <Button variant="ghost"
                        onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="bg-green-100 text-green-700 hover:bg-green-200">
                        <Upload className="w-4 h-4 mr-2" /> Choose File
                      </Button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
                    onChange={e => handleFileSelect(e.target.files)} />
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input value={formData.title} onChange={e => setField('title', e.target.value)}
                    placeholder="Enter media title" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description}
                    onChange={e => setField('description', e.target.value)}
                    placeholder="Enter media description" rows={3} className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={v => setField('category', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={formData.display_order}
                    onChange={e => setField('display_order', parseInt(e.target.value) || 0)}
                    className="mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_featured}
                    onCheckedChange={v => setField('is_featured', v)} />
                  <Label>Featured Item</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.is_active}
                    onCheckedChange={v => setField('is_active', v)} />
                  <Label>Active/Visible</Label>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t bg-white">
              <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200"
                onClick={() => { setShowAddDialog(false); resetForm(); }}
                disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white">
                {uploading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  : <><Upload className="w-4 h-4 mr-2" />
                      {formData.content_type === 'video_url' ? 'Add Video' : 'Upload Media'}</>}
              </Button>
            </div>
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
                  <p className="text-sm text-red-600">The media file will be permanently deleted.</p>
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