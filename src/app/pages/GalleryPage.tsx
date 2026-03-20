import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../../config/apiConfig'; 
import {
  Calendar, Eye, Download, Share2,
  AlertCircle, RefreshCw, Play, Clock,
  Image as ImageIcon, Video as VideoIcon
} from 'lucide-react';


// ── Types ──────────────────────────────────────────
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  media_type: 'image' | 'video';
  file_name?: string;
  file_size?: number;
  video_url?: string;
  thumbnail_url?: string;
  image_url?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const BACKEND_HOST = BASE_URL.replace('/api', '');

// ── Helpers ────────────────────────────────────────
const getFullImageUrl = (item: GalleryItem): string => {
  if (item.media_type === 'image' && item.image_url) {
    if (item.image_url.startsWith('/api'))  return `${BACKEND_HOST}${item.image_url}`;
    if (item.image_url.startsWith('http')) return item.image_url;
  }
  return 'https://via.placeholder.com/400x300?text=Image';
};

const getVideoThumbnail = (videoUrl?: string, thumbnail?: string): string => {
  if (thumbnail) return thumbnail;
  if (!videoUrl)  return 'https://via.placeholder.com/400x300?text=Video';
  let id = '';
  if (videoUrl.includes('/embed/'))        id = videoUrl.split('/embed/')[1]?.split('?')[0];
  else if (videoUrl.includes('watch?v='))  id = videoUrl.split('v=')[1]?.split('&')[0];
  else if (videoUrl.includes('youtu.be/')) id = videoUrl.split('youtu.be/')[1]?.split('?')[0];
  return id
    ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    : 'https://via.placeholder.com/400x300?text=Video';
};

const convertToEmbedUrl = (url?: string): string => {
  if (!url) return '';
  if (url.includes('/embed/'))        return url;
  if (url.includes('watch?v=')) {
    const id = url.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
};

const isVideoItem = (item: GalleryItem) => item.media_type === 'video';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });

// ── Loading Skeleton ───────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="break-inside-avoid mb-6">
        <Card className="overflow-hidden rounded-lg">
          <Skeleton className={`w-full ${
            i % 4 === 0 ? 'h-80' : i % 4 === 1 ? 'h-64' : i % 4 === 2 ? 'h-72' : 'h-60'
          }`} />
          <div className="p-4">
            <Skeleton className="h-5 w-3/4 mb-3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      </div>
    ))}
  </div>
);

// ── Component ──────────────────────────────────────
export const GalleryPage: React.FC = () => {
  const { language, t } = useLanguage();
  const isTamil = language === 'தமிழ்';

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [retryCount, setRetryCount]     = useState(0);

  // ── Load Gallery ───────────────────────────────
  const loadGalleryData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res  = await fetch(`${BASE_URL}/bind/gallery`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setGalleryItems(data.data);
        setRetryCount(0);
      } else throw new Error(data.message || 'Failed to load gallery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGalleryData(); }, [loadGalleryData]);

  const handleRetry = useCallback(() => {
    setRetryCount(p => p + 1);
    loadGalleryData();
  }, [loadGalleryData]);

  // ── Filter by tab ──────────────────────────────
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'photos': return galleryItems.filter(i => i.media_type === 'image');
      case 'videos': return galleryItems.filter(i => i.media_type === 'video');
      default:       return galleryItems;
    }
  }, [galleryItems, activeTab]);

  // ── Download ───────────────────────────────────
  const handleDownload = async (item: GalleryItem) => {
    if (item.media_type !== 'image') return;
    try {
      const res  = await fetch(getFullImageUrl(item));
      const blob = await res.blob();
      const a    = document.createElement('a');
      a.href     = window.URL.createObjectURL(blob);
      a.download = item.file_name || `${item.title}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    } catch {}
  };

  const handleShare = async (item: GalleryItem) => {
    if (navigator.share) {
      try { await navigator.share({ title: item.title, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ── Error state ────────────────────────────────
  if (error && retryCount < 3) return (
    <div className="container mx-auto px-4 py-8">
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold text-green-700 mb-4 ${isTamil ? 'text-2xl' : ''}`}>
            {t('gallery.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('gallery.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
            {([
              { key: 'all',    label: t('gallery.all') || 'All' },
              { key: 'photos', label: t('gallery.photos') || 'Photos', Icon: ImageIcon },
              { key: 'videos', label: t('gallery.videos') || 'Videos', Icon: VideoIcon },
            ] as const).map(tab => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-green-700 hover:bg-green-50'
                }`}>
                {'Icon' in tab && tab.Icon && <tab.Icon className="w-4 h-4" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? <LoadingSkeleton /> : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="h-16 w-16 mx-auto opacity-30 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab === 'all' ? 'items' : activeTab} found
            </h3>
            <p className="text-gray-600">
              No sacred moments have been shared yet. Check back soon.
            </p>
          </div>
        ) : (
          // Masonry Grid
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredItems.map((item, index) => (
              <div key={`${item.media_type}-${item.id}`} className="break-inside-avoid mb-6">
                <Card
                  className="overflow-hidden cursor-pointer group bg-white hover:shadow-lg border-0 shadow-sm hover:-translate-y-1 transition-all duration-200 rounded-lg"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative">
                    {isVideoItem(item) ? (
                      // Video card
                      <div className="relative overflow-hidden">
                        <img
                          src={getVideoThumbnail(item.video_url, item.thumbnail_url)}
                          alt={item.title}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            index % 3 === 0 ? 'h-80' : index % 3 === 1 ? 'h-64' : 'h-72'
                          }`}
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Video';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-all shadow-lg">
                            <Play className="h-6 w-6 text-gray-800 ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3">
                          <div className="bg-green-600 text-white rounded-full p-2 shadow-lg">
                            <VideoIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Photo card
                      <div className="relative overflow-hidden">
                        <img
                          src={getFullImageUrl(item)}
                          alt={item.title}
                          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            index % 4 === 0 ? 'h-80' : index % 4 === 1 ? 'h-64'
                            : index % 4 === 2 ? 'h-72' : 'h-60'
                          }`}
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-green-600 text-white rounded-full p-2 shadow-lg">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        </div>
                        {/* Hover title */}
                        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                            {item.title}
                          </h4>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg leading-tight text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      {item.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white border-0 shadow-2xl rounded-lg">
            {selectedItem && (
              <>
                <DialogHeader className="pb-4 border-b border-gray-100">
                  <DialogTitle className="flex items-center justify-between text-xl font-semibold text-gray-900 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <span className="line-clamp-1">{selectedItem.title}</span>
                      <Badge className={`${isVideoItem(selectedItem) ? 'bg-green-600' : 'bg-blue-600'} text-white border-0`}>
                        {isVideoItem(selectedItem)
                          ? <><VideoIcon className="h-3 w-3 mr-1" />Video</>
                          : <><ImageIcon className="h-3 w-3 mr-1" />Photo</>}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {!isVideoItem(selectedItem) && (
                        <Button variant="outline" size="sm"
                          onClick={() => handleDownload(selectedItem)}
                          className="border-green-200 text-green-700 hover:bg-green-50">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      )}
                      <Button variant="outline" size="sm"
                        onClick={() => handleShare(selectedItem)}
                        className="border-green-200 text-green-700 hover:bg-green-50">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2 overflow-y-auto max-h-[75vh]">
                  {isVideoItem(selectedItem) ? (
                    // Video player
                    <div className="aspect-video rounded-lg overflow-hidden shadow-xl bg-black">
                      <iframe
                        src={convertToEmbedUrl(selectedItem.video_url)}
                        title={selectedItem.title}
                        className="w-full h-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    // Photo display
                    <div className="rounded-lg overflow-hidden shadow-xl bg-gray-50">
                      <img
                        src={getFullImageUrl(selectedItem)}
                        alt={selectedItem.title}
                        className="w-full max-h-[65vh] object-contain"
                        onError={e => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  )}

                  {selectedItem.description && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-1 h-5 bg-green-600 rounded-full"></div>
                        Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed">{selectedItem.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <Badge className="bg-green-600 text-white border-0">Sacred Gallery</Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Published {formatDate(selectedItem.created_at)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">ID: {selectedItem.id}</span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};