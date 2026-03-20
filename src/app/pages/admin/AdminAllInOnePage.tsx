import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useShrineData } from '../../context/ShrineDataContext';
import { Video, Image as ImageIcon, MessageCircle, FileText, Check, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminAllInOnePage: React.FC = () => {
  const {
    siteContent,
    updateSiteContent,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
    testimonies,
    announcements,
    addAnnouncement,
    deleteAnnouncement,
  } = useShrineData();

  // YouTube Stream State
  const [streamUrl, setStreamUrl] = useState(siteContent.youtubeStreamUrl);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);


  // Gallery State
  const [galleryForm, setGalleryForm] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    title: '',
    category: '',
  });

  // Announcement State
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  // Handlers
  const handleUpdateStream = () => {
    if (!streamUrl.includes('youtube.com') && !streamUrl.includes('youtu.be')) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    updateSiteContent({ youtubeStreamUrl: streamUrl });
    toast.success('Live stream URL updated successfully!');
  };

  const handleAddGalleryItem = () => {
    if (!galleryForm.url || !galleryForm.title || !galleryForm.category) {
      toast.error('Please fill in all fields');
      return;
    }
    addGalleryItem(galleryForm);
    setGalleryForm({ type: 'image', url: '', title: '', category: '' });
    toast.success('Gallery item added successfully!');
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      deleteGalleryItem(id);
      toast.success('Gallery item deleted successfully!');
    }
  };

  const handleAddAnnouncement = () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Please fill in all fields');
      return;
    }
    addAnnouncement(announcementForm);
    setAnnouncementForm({ title: '', content: '', priority: 'medium' });
    toast.success('Announcement added successfully!');
  };

  const pendingTestimonies = testimonies.filter(t => t.status === 'pending');

  // Prayer Request - API removed, using mock data
  useEffect(() => {
    // fetchPrayers(); // API call removed
  }, []);

  const fetchPrayers = async () => {
    // API integration removed
    console.log("Prayer API not integrated");
  };

  const handleDeletePrayer = async (id: number) => {
    // API integration removed
    toast.info("Prayer API not integrated");
  };

  // Testimonies - API removed, using context data
  useEffect(() => {
    // fetchPendingTestimonies(); // API call removed
  }, []);

  const fetchPendingTestimonies = async () => {
    // API integration removed
    console.log("Testimony API not integrated");
  };

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    // API integration removed - using context instead
    toast.info("Testimony API not integrated");
  };



  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-green-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all aspects of the shrine website</p>
        </div>

        <Tabs defaultValue="stream" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="stream">
              <Video className="w-4 h-4 mr-2" />
              Stream
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="requests">
              <MessageCircle className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileText className="w-4 h-4 mr-2" />
              Content
            </TabsTrigger>
          </TabsList>

          {/* Live Stream Management */}
          <TabsContent value="stream">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">YouTube Live Stream</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="streamUrl">YouTube Embed URL</Label>
                  <Input
                    id="streamUrl"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the YouTube embed URL format
                  </p>
                </div>
                <Button onClick={handleUpdateStream} className="bg-green-700 hover:bg-green-800">
                  Update Stream URL
                </Button>
                {siteContent.youtubeStreamUrl && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-600 mb-2">Current Stream:</p>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        src={siteContent.youtubeStreamUrl}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Management */}
          <TabsContent value="gallery">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Gallery Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gallery.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {gallery.map(item => (
                          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-video bg-gray-200">
                              {item.type === 'image' ? (
                                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                  <Video className="w-12 h-12 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-sm text-gray-800">{item.title}</p>
                                  <p className="text-xs text-gray-600">{item.category}</p>
                                </div>
                                <button
                                  onClick={() => handleDeleteGalleryItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No gallery items yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Add Item</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Type</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          size="sm"
                          variant={galleryForm.type === 'image' ? 'default' : 'outline'}
                          onClick={() => setGalleryForm(prev => ({ ...prev, type: 'image' }))}
                          className={galleryForm.type === 'image' ? 'bg-green-700 hover:bg-green-800' : ''}
                        >
                          Image
                        </Button>
                        <Button
                          size="sm"
                          variant={galleryForm.type === 'video' ? 'default' : 'outline'}
                          onClick={() => setGalleryForm(prev => ({ ...prev, type: 'video' }))}
                          className={galleryForm.type === 'video' ? 'bg-green-700 hover:bg-green-800' : ''}
                        >
                          Video
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="galleryUrl">URL</Label>
                      <Input
                        id="galleryUrl"
                        value={galleryForm.url}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder={galleryForm.type === 'image' ? 'Image URL' : 'YouTube Embed URL'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="galleryTitle">Title</Label>
                      <Input
                        id="galleryTitle"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Item title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="galleryCategory">Category</Label>
                      <Input
                        id="galleryCategory"
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Events, Mass, Shrine"
                      />
                    </div>
                    <Button onClick={handleAddGalleryItem} className="w-full bg-green-700 hover:bg-green-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Gallery
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Prayer Requests & Testimonies */}
          <TabsContent value="requests">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">Prayer Requests ({prayerRequests.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {prayerRequests.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {prayerRequests.map(request => (
                        <div
                          key={request.id}
                          className="p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <p className="text-sm text-gray-800 mb-1">{request.name}</p>

                          {request.email && (
                            <p className="text-xs text-gray-600 mb-2">{request.email}</p>
                          )}

                          <p className="text-sm text-gray-700">{request.prayer_intention}</p>

                          <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-gray-500">
                              {new Date(request.created_at).toLocaleString()}
                            </p>

                            <Button
                              size="sm"
                              onClick={() => handleDeletePrayer(request.id)}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}

                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No prayer requests yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Pending Testimonies ({pendingTestimonies.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingTestimonies.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {pendingTestimonies.map(testimony => (
                        <div key={testimony.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p className="text-sm text-gray-800 mb-2">{testimony.name}</p>
                          <p className="text-sm text-gray-700 mb-3">"{testimony.testimony}"</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(testimony.id, "approved")}
                              className="bg-green-700 hover:bg-green-800"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(testimony.id, "rejected")}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>

                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No pending testimonies</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Management */}
          <TabsContent value="content">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Announcements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcements.length > 0 ? (
                      <div className="space-y-3">
                        {announcements.map(announcement => (
                          <div key={announcement.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-gray-800">{announcement.title}</p>
                                <span className={`text-xs px-2 py-1 rounded ${announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                  {announcement.priority}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this announcement?')) {
                                    deleteAnnouncement(announcement.id);
                                    toast.success('Announcement deleted');
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-sm text-gray-700">{announcement.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No announcements yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Add Announcement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="announcementTitle">Title</Label>
                      <Input
                        id="announcementTitle"
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="announcementContent">Content</Label>
                      <Textarea
                        id="announcementContent"
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Announcement content"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <div className="flex gap-2 mt-1">
                        {(['high', 'medium', 'low'] as const).map(priority => (
                          <Button
                            key={priority}
                            size="sm"
                            variant={announcementForm.priority === priority ? 'default' : 'outline'}
                            onClick={() => setAnnouncementForm(prev => ({ ...prev, priority }))}
                            className={announcementForm.priority === priority ? 'bg-green-700 hover:bg-green-800' : ''}
                          >
                            {priority}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddAnnouncement} className="w-full bg-green-700 hover:bg-green-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Announcement
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
