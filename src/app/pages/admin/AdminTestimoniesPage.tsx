import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { MessageCircle, CheckCircle, XCircle, Trash2, Eye, Clock, AlertCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

interface Testimony {
  id: number;
  name: string;
  testimony: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const AdminTestimoniesPage: React.FC = () => {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimony, setSelectedTestimony] = useState<Testimony | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // ── LOAD all testimonies (admin) ───────────────────
  const loadTestimonies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bind/testimonies/admin`, getAuthHeader());
      if (res.data.success) {
        setTestimonies(res.data.data);
      } else {
        toast.error('Failed to load testimonies');
      }
    } catch (error) {
      console.error('Error loading testimonies:', error);
      toast.error('Failed to load testimonies');
    } finally {
      setLoading(false);
    }
  };

  // ── APPROVE or REJECT ──────────────────────────────
  const handleStatusUpdate = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const endpoint = status === 'approved'
        ? `${BASE_URL}/bind/testimonies/${id}/approve`
        : `${BASE_URL}/bind/testimonies/${id}/reject`;

      const res = await axios.patch(endpoint, {}, getAuthHeader());
      if (res.data.success) {
        toast.success(`Testimony ${status} successfully`);
        loadTestimonies();
      } else {
        toast.error('Failed to update testimony status');
      }
    } catch (error) {
      console.error('Error updating testimony:', error);
      toast.error('Failed to update testimony status');
    }
  };

  // ── DELETE ─────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      const res = await axios.delete(`${BASE_URL}/bind/testimonies/${id}`, getAuthHeader());
      if (res.data.success) {
        toast.success('Testimony deleted successfully');
        setDeleteConfirm(null);
        loadTestimonies();
      } else {
        toast.error('Failed to delete testimony');
      }
    } catch (error) {
      console.error('Error deleting testimony:', error);
      toast.error('Failed to delete testimony');
    }
  };

  useEffect(() => { loadTestimonies(); }, []);

  const filteredTestimonies = filter === 'all'
    ? testimonies
    : testimonies.filter(t => t.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':  return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:         return <Badge variant="outline">{status}</Badge>;
    }
  };

  const statusCounts = {
    all:      testimonies.length,
    pending:  testimonies.filter(t => t.status === 'pending').length,
    approved: testimonies.filter(t => t.status === 'approved').length,
    rejected: testimonies.filter(t => t.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 text-green-700">
          <MessageCircle className="w-8 h-8 animate-pulse" />
          <span className="text-lg font-medium">Loading testimonies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Testimonies Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Review and manage user testimonies</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            { label: 'Total',    count: statusCounts.all,      icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />,  border: 'border-green-200' },
            { label: 'Pending',  count: statusCounts.pending,  icon: <Clock         className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />, border: 'border-yellow-200' },
            { label: 'Approved', count: statusCounts.approved, icon: <CheckCircle   className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />,  border: 'border-green-200' },
            { label: 'Rejected', count: statusCounts.rejected, icon: <XCircle       className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />,    border: 'border-red-200' },
          ].map(({ label, count, icon, border }) => (
            <Card key={label} className={border}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-600">{label}</p>
                  {icon}
                </div>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { key: 'all',      label: 'All',      count: statusCounts.all },
            { key: 'pending',  label: 'Pending',  count: statusCounts.pending },
            { key: 'approved', label: 'Approved', count: statusCounts.approved },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
              size="sm"
              className={`text-xs sm:text-sm ${filter === key ? 'bg-green-700 hover:bg-green-800' : 'border-green-200 hover:border-green-700'}`}
            >
              <span className="hidden sm:inline">{label} ({count})</span>
              <span className="sm:hidden">{label.charAt(0)} ({count})</span>
            </Button>
          ))}
        </div>

        {/* List */}
        {filteredTestimonies.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {filteredTestimonies.map(testimony => (
              <Card key={testimony.id} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{testimony.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Submitted on {new Date(testimony.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(testimony.status)}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                    {testimony.testimony.length > 150
                      ? `${testimony.testimony.substring(0, 150)}...`
                      : testimony.testimony}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setSelectedTestimony(testimony)}
                      className="border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> View Full
                    </Button>

                    <div className="flex items-center gap-2 flex-wrap">
                      {testimony.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleStatusUpdate(testimony.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-1 sm:flex-none">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(testimony.id, 'rejected')}
                            className="border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm flex-1 sm:flex-none">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(testimony.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-green-200">
            <CardContent className="p-12 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No testimonies found</h3>
              <p className="text-gray-600">
                {filter === 'all' ? 'No testimonies submitted yet.' : `No ${filter} testimonies found.`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={!!selectedTestimony} onOpenChange={() => setSelectedTestimony(null)}>
          <DialogContent className="max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-green-800 text-lg sm:text-xl">Testimony Details</DialogTitle>
            </DialogHeader>
            {selectedTestimony && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedTestimony.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Submitted on {new Date(selectedTestimony.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(selectedTestimony.status)}
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    "{selectedTestimony.testimony}"
                  </p>
                </div>
                {selectedTestimony.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <Button onClick={() => { handleStatusUpdate(selectedTestimony.id, 'approved'); setSelectedTestimony(null); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button variant="outline" onClick={() => { handleStatusUpdate(selectedTestimony.id, 'rejected'); setSelectedTestimony(null); }}
                      className="flex-1 border-red-200 text-red-700 hover:bg-red-50 text-sm">
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle className="text-red-800 text-lg sm:text-xl">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 text-sm sm:text-base">This action cannot be undone</p>
                  <p className="text-xs sm:text-sm text-red-600">The testimony will be permanently deleted from the database.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="text-sm">Cancel</Button>
                <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-sm">
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