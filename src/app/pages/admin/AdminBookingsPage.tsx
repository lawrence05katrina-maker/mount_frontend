import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  Calendar, Search, IndianRupee, Eye,
  CreditCard, User, Phone, Mail, Clock,
  Trash2, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface MassBooking {
  id: number;
  name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  intention_type: string;
  intention_details: string;
  number_of_days: number;
  amount: number;
  utr_number: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  screenshot_url: string | null;
  screenshot_name: string | null;
  admin_note: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total_count: string;
  total_amount: string;
  pending_count: string;
  confirmed_count: string;
  rejected_count: string;
  cancelled_count: string;
}

// ── Constants ──────────────────────────────────────
const BACKEND_HOST = BASE_URL.replace('/api', '');

// ── Helpers ────────────────────────────────────────
const getScreenshotUrl = (booking: MassBooking): string | null => {
  if (!booking.screenshot_url) return null;
  if (booking.screenshot_url.startsWith('/api'))
    return `${BACKEND_HOST}${booking.screenshot_url}`;
  return booking.screenshot_url;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const formatDateShort = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-orange-100 text-orange-700 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'confirmed':
      return <Badge className="bg-green-100 text-green-700 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-100 text-gray-700 text-xs">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700 text-xs">{status}</Badge>;
  }
};

// ── Component ──────────────────────────────────────
export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings]           = useState<MassBooking[]>([]);
  const [stats, setStats]                 = useState<Stats | null>(null);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [selectedBooking, setSelectedBooking] = useState<MassBooking | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [processingId, setProcessingId]   = useState<number | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  // ── Fetch All Bookings ─────────────────────────
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/bind/mass-bookings`, {
        headers: getAuthHeader().headers
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setBookings(Array.isArray(data.data) ? data.data : []);
        setStats(data.stats || null);
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm Booking ────────────────────────────
  const handleConfirm = async (id: number) => {
    try {
      setProcessingId(id);
      const res  = await fetch(`${BASE_URL}/bind/mass-bookings/${id}/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader().headers },
        body: JSON.stringify({ admin_note: 'Confirmed by admin' }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        setBookings(p => p.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
        toast.success('Booking confirmed successfully! ✅');
        setShowModal(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject Booking ─────────────────────────────
  const handleReject = async (id: number) => {
    try {
      setProcessingId(id);
      const res  = await fetch(`${BASE_URL}/bind/mass-bookings/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader().headers },
        body: JSON.stringify({ admin_note: 'Rejected by admin' }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        setBookings(p => p.map(b => b.id === id ? { ...b, status: 'rejected' } : b));
        toast.success('Booking rejected');
        setShowModal(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Delete Booking ─────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      setProcessingId(id);
      const res  = await fetch(`${BASE_URL}/bind/mass-bookings/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader().headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        setBookings(p => p.filter(b => b.id !== id));
        toast.success('Booking deleted successfully');
        setShowModal(false);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filter ─────────────────────────────────────
  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.utr_number?.toLowerCase() || '').includes(q) ||
      b.intention_type.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Counts ─────────────────────────────────────
  const pendingCount   = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalAmount    = bookings.reduce((s, b) => s + (b.amount || 0), 0);

  // ── Loading ────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen py-8 px-4 bg-green-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-green-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading mass bookings...</span>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen py-2 sm:py-4 lg:py-8 px-2 sm:px-4 bg-green-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800 mb-1">
            Mass Bookings Management
          </h1>
          <p className="text-gray-600 text-sm">Manage mass booking requests and payment details</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
          {[
            { label: 'Total Bookings', val: bookings.length,   Icon: Calendar,      color: 'border-green-200' },
            { label: 'Pending',        val: pendingCount,      Icon: Clock,         color: 'bg-orange-50 border-orange-200', valColor: 'text-orange-600' },
            { label: 'Confirmed',      val: confirmedCount,    Icon: CheckCircle,   color: 'bg-green-50 border-green-200',  valColor: 'text-green-600' },
            { label: 'Total Amount',   val: `₹${totalAmount.toLocaleString()}`, Icon: IndianRupee, color: 'bg-green-50 border-green-200', valColor: 'text-gray-600', small: true },
          ].map(s => (
            <Card key={s.label} className={`shadow-sm ${s.color}`}>
              <CardContent className="pt-4 px-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs sm:text-sm text-gray-600">{s.label}</p>
                  <s.Icon className="w-4 h-4 text-green-700 opacity-70" />
                </div>
                <p className={`${s.small ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'} font-bold ${s.valColor || 'text-gray-800'}`}>
                  {s.val}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings List */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 text-base sm:text-lg">
              Mass Bookings with Payment Details
            </CardTitle>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name, email, UTR..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm border-green-200" />
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'all',       label: `All (${bookings.length})`,   cls: 'bg-green-700 text-white' },
                  { key: 'pending',   label: `Pending (${pendingCount})`,  cls: 'bg-orange-600 text-white' },
                  { key: 'confirmed', label: `Confirmed (${confirmedCount})`, cls: 'bg-green-700 text-white' },
                  { key: 'rejected',  label: 'Rejected',                   cls: 'bg-red-600 text-white' },
                ] as const).map(f => (
                  <Button key={f.key} size="sm"
                    onClick={() => setFilterStatus(f.key)}
                    className={`text-xs ${filterStatus === f.key
                      ? f.cls
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredBookings.map(booking => (
                  <div key={booking.id}
                    className="p-3 sm:p-4 bg-white rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all">

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-800">{booking.name}</p>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span className="truncate">{booking.email}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><span>{booking.phone}</span></div>
                            <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{formatDateShort(booking.preferred_date)}</span></div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{booking.preferred_time}</span></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline"
                            onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                            className="border-green-200 text-green-700 hover:bg-green-50">
                            <Eye className="w-4 h-4 mr-1" /> View Details
                          </Button>
                          {booking.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" disabled={processingId === booking.id}
                                onClick={() => handleConfirm(booking.id)}
                                className="bg-green-600 hover:bg-green-700 text-white">
                                {processingId === booking.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : 'Confirm'}
                              </Button>
                              <Button size="sm" disabled={processingId === booking.id}
                                onClick={() => handleReject(booking.id)}
                                className="bg-orange-600 hover:bg-orange-700 text-white">
                                Reject
                              </Button>
                              <Button size="sm" disabled={processingId === booking.id}
                                onClick={() => handleDelete(booking.id)}
                                className="bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {(booking.status === 'confirmed' || booking.status === 'rejected') && (
                            <Button size="sm" disabled={processingId === booking.id}
                              onClick={() => handleDelete(booking.id)}
                              className="bg-red-600 hover:bg-red-700 text-white">
                              <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Intention:</strong> {booking.intention_type}</p>
                        <p><strong>Description:</strong> {booking.intention_details}</p>
                        <div className="flex gap-6">
                          <p><strong>Days:</strong> {booking.number_of_days}</p>
                          <p><strong>Amount:</strong> <span className="text-green-700 font-medium">₹{booking.amount}</span></p>
                          <p><strong>Submitted:</strong> {formatDate(booking.created_at)}</p>
                        </div>
                        {booking.utr_number ? (
                          <div className="p-2 bg-blue-50 rounded text-xs mt-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              <span className="text-blue-800 font-medium">Payment Submitted</span>
                            </div>
                            <p className="text-blue-700 mt-1">
                              UTR: <span className="font-mono">{booking.utr_number}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 bg-yellow-50 rounded text-xs mt-2">
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-3 h-3 text-yellow-600" />
                              <span className="text-yellow-800 font-medium">Payment Pending</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-gray-500" />
                            <p className="font-medium text-sm">{booking.name}</p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm font-bold text-green-700">₹{booking.amount}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 mb-2">
                        <p><strong>Date:</strong> {formatDateShort(booking.preferred_date)} {booking.preferred_time}</p>
                        <p><strong>Intention:</strong> {booking.intention_type}</p>
                        <p><strong>Days:</strong> {booking.number_of_days}</p>
                        {booking.utr_number && <p><strong>UTR:</strong> {booking.utr_number}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedBooking(booking); setShowModal(true); }}
                          className="text-xs border-green-200 text-green-700">
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button size="sm" disabled={processingId === booking.id}
                              onClick={() => handleConfirm(booking.id)}
                              className="text-xs bg-green-600 text-white">
                              Confirm
                            </Button>
                            <Button size="sm" disabled={processingId === booking.id}
                              onClick={() => handleReject(booking.id)}
                              className="text-xs bg-orange-600 text-white">
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" disabled={processingId === booking.id}
                          onClick={() => handleDelete(booking.id)}
                          className="text-xs bg-red-600 text-white">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-green-600">
                <Calendar className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-sm">No bookings found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-green-800">
                Booking Details — {selectedBooking?.name}
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Info */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-3 text-green-800">Booking Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p><strong>Name:</strong> {selectedBooking.name}</p>
                    <p><strong>Email:</strong> {selectedBooking.email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.phone}</p>
                    <p><strong>Amount:</strong> ₹{selectedBooking.amount.toLocaleString()}</p>
                    <p><strong>Date:</strong> {formatDateShort(selectedBooking.preferred_date)}</p>
                    <p><strong>Time:</strong> {selectedBooking.preferred_time}</p>
                    <p><strong>Days:</strong> {selectedBooking.number_of_days}</p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong> {getStatusBadge(selectedBooking.status)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm"><strong>Intention Type:</strong> {selectedBooking.intention_type}</p>
                    <p className="text-sm mt-1"><strong>Description:</strong></p>
                    <p className="text-sm text-gray-600 mt-1">{selectedBooking.intention_details}</p>
                  </div>
                </div>

                {/* UTR + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-800">UTR Number:</p>
                    <p className="font-mono bg-white px-3 py-2 rounded text-sm border border-green-200">
                      {selectedBooking.utr_number || 'Not submitted yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-800">Submission Date:</p>
                    <p className="text-sm">{formatDate(selectedBooking.created_at)}</p>
                    {selectedBooking.confirmed_at && (
                      <>
                        <p className="text-sm font-medium mt-2 mb-1 text-green-800">Confirmed At:</p>
                        <p className="text-sm text-green-600">{formatDate(selectedBooking.confirmed_at)}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <p className="text-sm font-medium mb-2 text-green-800">Payment Screenshot:</p>
                  {getScreenshotUrl(selectedBooking) ? (
                    <img
                      src={getScreenshotUrl(selectedBooking)!}
                      alt="Payment Screenshot"
                      className="max-w-full h-auto border border-green-200 rounded-lg max-h-72 mx-auto block shadow-sm"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center text-yellow-700">
                      No payment screenshot submitted yet
                    </div>
                  )}
                </div>

                {/* Admin Note */}
                {selectedBooking.admin_note && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Admin Note:</p>
                    <p className="text-sm text-blue-700">{selectedBooking.admin_note}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedBooking.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
                    <Button onClick={() => handleConfirm(selectedBooking.id)}
                      disabled={processingId === selectedBooking.id}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      {processingId === selectedBooking.id
                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Confirming...</>
                        : <><CheckCircle className="w-4 h-4 mr-2" /> Confirm Booking</>}
                    </Button>
                    <Button onClick={() => handleReject(selectedBooking.id)}
                      disabled={processingId === selectedBooking.id}
                      className="bg-orange-600 hover:bg-orange-700 text-white">
                      {processingId === selectedBooking.id
                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rejecting...</>
                        : <><XCircle className="w-4 h-4 mr-2" /> Reject Booking</>}
                    </Button>
                    <Button onClick={() => handleDelete(selectedBooking.id)}
                      disabled={processingId === selectedBooking.id}
                      className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
                {(selectedBooking.status === 'confirmed' || selectedBooking.status === 'rejected') && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => handleDelete(selectedBooking.id)}
                      disabled={processingId === selectedBooking.id}
                      className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Booking
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};