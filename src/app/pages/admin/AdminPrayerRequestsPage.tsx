import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Heart, Trash2, Eye, Clock,
  CheckCircle, Search, Filter,
  Calendar, User, MessageSquare, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface PrayerRequest {
  id: number;
  name: string;
  email?: string;
  prayer_intention: string;
  status: 'pending' | 'read' | 'prayed';
  admin_note?: string;
  created_at: string;
  updated_at?: string;
}

interface Stats {
  total: string;
  pending: string;
  read: string;
  this_week: string;
}

// ── Component ──────────────────────────────────────
export const AdminPrayerRequestsPage: React.FC = () => {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [stats, setStats]                   = useState<Stats>({ total: '0', pending: '0', read: '0', this_week: '0' });
  const [loading, setLoading]               = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [deleteConfirm, setDeleteConfirm]   = useState<number | null>(null);
  const [filter, setFilter]                 = useState<string>('all');
  const [searchTerm, setSearchTerm]         = useState('');
  const [updatingId, setUpdatingId]         = useState<number | null>(null);

  useEffect(() => { fetchPrayerRequests(); }, []);

  // ── Fetch All (Admin) ────────────────────────────
  const fetchPrayerRequests = async (statusFilter?: string, search?: string) => {
    try {
      setLoading(true);

      let url = `${BASE_URL}/bind/prayer-requests`;
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res  = await fetch(url, { headers: getAuthHeader().headers });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        setPrayerRequests(data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      toast.error('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  };

  // ── View Single (auto marks as read) ────────────
  const handleView = async (request: PrayerRequest) => {
    setSelectedRequest(request);
    if (request.status === 'pending') {
      try {
        const res  = await fetch(
          `${BASE_URL}/bind/prayer-requests/${request.id}`,
          { headers: getAuthHeader().headers }
        );
        const data = await res.json();
        if (data.success) {
          // Update locally
          setPrayerRequests(prev =>
            prev.map(r => r.id === request.id ? { ...r, status: 'read' } : r)
          );
          setSelectedRequest(data.data);
          setStats(prev => ({
            ...prev,
            pending: String(Math.max(0, parseInt(prev.pending) - 1)),
            read:    String(parseInt(prev.read) + 1),
          }));
        }
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  // ── Update Status ────────────────────────────────
  const updateRequestStatus = async (id: number, status: 'pending' | 'read' | 'prayed', adminNote?: string) => {
    setUpdatingId(id);
    try {
      const res  = await fetch(`${BASE_URL}/bind/prayer-requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader().headers,
        },
        body: JSON.stringify({ status, admin_note: adminNote || null }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        setPrayerRequests(prev =>
          prev.map(r => r.id === id ? { ...r, status, updated_at: new Date().toISOString() } : r)
        );
        // Update selected if open
        if (selectedRequest?.id === id) {
          setSelectedRequest(prev => prev ? { ...prev, status } : null);
        }
        toast.success(`Prayer request marked as ${status}`);
        fetchPrayerRequests(); // refresh stats
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Delete ───────────────────────────────────────
  const deleteRequest = async (id: number) => {
    try {
      const res  = await fetch(`${BASE_URL}/bind/prayer-requests/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader().headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        setPrayerRequests(prev => prev.filter(r => r.id !== id));
        setDeleteConfirm(null);
        if (selectedRequest?.id === id) setSelectedRequest(null);
        toast.success('Prayer request deleted successfully');
        fetchPrayerRequests(); // refresh stats
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  // ── Search handler ───────────────────────────────
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchPrayerRequests(filter, value);
  };

  // ── Filter handler ───────────────────────────────
  const handleFilterChange = (value: string) => {
    setFilter(value);
    fetchPrayerRequests(value, searchTerm);
  };

  // ── Status helpers ───────────────────────────────
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'read':    return 'bg-green-100 text-green-800';
      case 'prayed':  return 'bg-blue-100 text-blue-800';
      default:        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'read':    return <CheckCircle className="w-4 h-4" />;
      case 'prayed':  return <Heart className="w-4 h-4" />;
      default:        return <Clock className="w-4 h-4" />;
    }
  };

  // ── Client-side filter (on top of server filter) ─
  const filteredRequests = prayerRequests.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.prayer_intention.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ── Loading ──────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-green-700">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-lg font-medium">Loading prayer requests...</span>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Prayer Requests Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and respond to prayer requests from visitors</p>
        </div>

        {/* Stats Cards — from backend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total Requests', value: stats.total,    icon: Heart,        color: 'text-green-700' },
            { label: 'Pending',        value: stats.pending,  icon: Clock,        color: 'text-yellow-600' },
            { label: 'Read',           value: stats.read,     icon: CheckCircle,  color: 'text-green-600' },
            { label: 'This Week',      value: stats.this_week,icon: Calendar,     color: 'text-blue-600' },
          ].map(s => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{s.label}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <s.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={e => handleSearch(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="prayed">Prayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Requests List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRequests.map(request => (
            <Card key={request.id} className="hover:shadow-md transition-shadow border-0 shadow-sm">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Name + Email + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{request.name}</span>
                      </div>
                      {request.email && (
                        <span className="text-xs sm:text-sm text-gray-500 truncate">({request.email})</span>
                      )}
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 text-xs w-fit`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </Badge>
                    </div>

                    {/* Prayer Text */}
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">
                      {request.prayer_intention.length > 150
                        ? `${request.prayer_intention.substring(0, 150)}...`
                        : request.prayer_intention}
                    </p>

                    {/* Admin Note */}
                    {request.admin_note && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-3">
                        <p className="text-xs text-blue-700 font-medium">Admin Note:</p>
                        <p className="text-xs text-blue-600">{request.admin_note}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.updated_at && (
                        <span>Updated: {new Date(request.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col xl:flex-row items-center gap-2 lg:ml-4 flex-shrink-0">
                    {/* View */}
                    <Button variant="ghost" size="sm"
                      className="bg-gray-100 hover:bg-gray-200 text-xs sm:text-sm"
                      onClick={() => handleView(request)}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>

                    {/* Mark Read */}
                    {request.status === 'pending' && (
                      <Button size="sm"
                        disabled={updatingId === request.id}
                        onClick={() => updateRequestStatus(request.id, 'read')}
                        className="bg-green-700 hover:bg-green-800 text-xs sm:text-sm"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Mark Read</span>
                        <span className="sm:hidden">Read</span>
                      </Button>
                    )}

                    {/* Mark Prayed */}
                    {request.status === 'read' && (
                      <Button variant="ghost" size="sm"
                        disabled={updatingId === request.id}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs sm:text-sm"
                        onClick={() => updateRequestStatus(request.id, 'prayed')}
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Mark Prayed</span>
                        <span className="sm:hidden">Prayed</span>
                      </Button>
                    )}

                    {/* Delete */}
                    <Button variant="ghost" size="sm"
                      className="bg-red-100 text-red-600 hover:bg-red-200 text-xs sm:text-sm"
                      onClick={() => setDeleteConfirm(request.id)}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-8 sm:py-12">
              <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-600 mb-2 text-sm sm:text-base">No Prayer Requests Found</h3>
              <p className="text-gray-500 text-xs sm:text-sm px-4">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Prayer requests will appear here when visitors submit them.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Prayer Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedRequest.name}</p>
                  </div>
                  {selectedRequest.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900 break-all">{selectedRequest.email}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedRequest.status)} flex items-center gap-1 w-fit text-xs`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Prayer Intention</label>
                  <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg leading-relaxed text-sm sm:text-base">
                    {selectedRequest.prayer_intention}
                  </p>
                </div>

                {selectedRequest.admin_note && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Note</label>
                    <p className="text-gray-700 mt-1 p-3 bg-blue-50 rounded-lg text-sm">
                      {selectedRequest.admin_note}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-500">
                  <div>
                    <label className="font-medium">Submitted</label>
                    <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                  {selectedRequest.updated_at && (
                    <div>
                      <label className="font-medium">Last Updated</label>
                      <p>{new Date(selectedRequest.updated_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  {selectedRequest.status === 'pending' && (
                    <Button
                      onClick={() => { updateRequestStatus(selectedRequest.id, 'read'); setSelectedRequest(null); }}
                      className="bg-green-700 hover:bg-green-800 text-sm w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Mark as Read
                    </Button>
                  )}
                  {selectedRequest.status === 'read' && (
                    <Button
                      onClick={() => { updateRequestStatus(selectedRequest.id, 'prayed'); setSelectedRequest(null); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm w-full sm:w-auto"
                    >
                      <Heart className="w-4 h-4 mr-2" /> Mark as Prayed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Delete Prayer Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700 text-sm sm:text-base">
                Are you sure you want to delete this prayer request? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-sm"
                  onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button
                  onClick={() => deleteConfirm && deleteRequest(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-sm"
                >Delete</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};