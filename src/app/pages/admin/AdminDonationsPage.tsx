import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  IndianRupee, Search, TrendingUp, CreditCard,
  User, Phone, Mail, Eye, CheckCircle,
  Trash2, Clock, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL, getAuthHeader } from '../../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface Payment {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  amount: number;
  purpose: string | null;
  utr_number: string | null;
  screenshot_url: string | null;
  screenshot_name: string | null;
  status: 'pending' | 'verified' | 'rejected';
  admin_note: string | null;
  verified_at: string | null;
  created_at: string;
}

interface Stats {
  total_count: string;
  total_amount: string;
  pending_count: string;
  pending_amount: string;
  verified_count: string;
  verified_amount: string;
  rejected_count: string;
}

// ── Constants ──────────────────────────────────────
const BACKEND_HOST = BASE_URL.replace('/api', '');

// ── Helpers ────────────────────────────────────────
const getScreenshotUrl = (payment: Payment): string | null => {
  if (!payment.screenshot_url) return null;
  if (payment.screenshot_url.startsWith('/api'))
    return `${BACKEND_HOST}${payment.screenshot_url}`;
  return payment.screenshot_url;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 'verified':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" /> Verified
        </Badge>
      );
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
          <Trash2 className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    default:
      return <Badge className="bg-gray-100 text-gray-800 text-xs">{status}</Badge>;
  }
};

// ── Component ──────────────────────────────────────
export const AdminDonationsPage: React.FC = () => {
  const [payments, setPayments]             = useState<Payment[]>([]);
  const [stats, setStats]                   = useState<Stats | null>(null);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState('');
  const [filterStatus, setFilterStatus]     = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal]           = useState(false);
  const [processingId, setProcessingId]     = useState<number | null>(null);

  useEffect(() => { fetchPayments(); }, []);

  // ── Fetch All Donations ────────────────────────
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${BASE_URL}/bind/donations`, {
        headers: getAuthHeader().headers
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setPayments(Array.isArray(data.data) ? data.data : []);
        setStats(data.stats || null);
      } else throw new Error(data.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load donations');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify Donation ────────────────────────────
  const handleVerify = async (id: number) => {
    try {
      setProcessingId(id);
      const res  = await fetch(`${BASE_URL}/bind/donations/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader().headers },
        body: JSON.stringify({ admin_note: 'Verified by admin' }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        setPayments(prev =>
          prev.map(p => p.id === id ? { ...p, status: 'verified' } : p)
        );
        toast.success('Payment verified successfully! ✅');
        setShowModal(false);
        fetchPayments(); // Refresh stats
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Delete Donation ────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      setProcessingId(id);
      const res  = await fetch(`${BASE_URL}/bind/donations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader().headers,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      if (data.success) {
        setPayments(prev => prev.filter(p => p.id !== id));
        toast.success('Donation deleted successfully');
        setShowModal(false);
        fetchPayments(); // Refresh stats
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filter ─────────────────────────────────────
  const filteredPayments = payments.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      (p.name?.toLowerCase() || '').includes(q) ||
      (p.purpose?.toLowerCase() || '').includes(q) ||
      (p.utr_number?.toLowerCase() || '').includes(q) ||
      (p.email?.toLowerCase() || '').includes(q);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Derived Counts ─────────────────────────────
  const pendingCount  = payments.filter(p => p.status === 'pending').length;
  const verifiedCount = payments.filter(p => p.status === 'verified').length;
  const totalAmount   = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const verifiedAmount= payments.filter(p => p.status === 'verified').reduce((s, p) => s + p.amount, 0);

  // ── Loading ────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-green-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading donation payments...</span>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Donation Payments</h1>
          <p className="text-gray-600 text-sm">View and verify donation payment submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Donations</p>
                <IndianRupee className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{payments.length} payments</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending</p>
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              <p className="text-xs text-gray-500 mt-1">₹{pendingAmount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Verified</p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{verifiedCount}</p>
              <p className="text-xs text-gray-500 mt-1">₹{verifiedAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card className="border-green-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 text-lg sm:text-xl">Payment Submissions</CardTitle>
            <div className="space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search by name, purpose, or UTR..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm border-green-200" />
              </div>
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {([
                  { key: 'all',      label: `All (${payments.length})`,    active: 'bg-green-700 text-white',  inactive: 'border-green-200 text-green-700' },
                  { key: 'pending',  label: `Pending (${pendingCount})`,   active: 'bg-orange-600 text-white', inactive: 'border-orange-200 text-orange-700' },
                  { key: 'verified', label: `Verified (${verifiedCount})`, active: 'bg-green-700 text-white',  inactive: 'border-green-200 text-green-700' },
                ] as const).map(f => (
                  <Button key={f.key} size="sm"
                    onClick={() => setFilterStatus(f.key)}
                    className={`text-xs sm:text-sm ${filterStatus === f.key ? f.active : `border bg-white hover:bg-gray-50 ${f.inactive}`}`}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredPayments.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredPayments.map(payment => (
                  <div key={payment.id}
                    className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-all">

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-gray-800">{payment.name || 'N/A'}</p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-green-600" />
                              <span className="truncate">{payment.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-600" />
                              <span>{payment.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-700">₹{payment.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span>{formatDate(payment.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline"
                            onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                            className="border-green-200 text-green-700 hover:bg-green-50">
                            <Eye className="w-4 h-4 mr-1" /> View Details
                          </Button>
                          {payment.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" disabled={processingId === payment.id}
                                onClick={() => handleVerify(payment.id)}
                                className="bg-green-600 hover:bg-green-700 text-white">
                                {processingId === payment.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : 'Verify'}
                              </Button>
                              <Button size="sm" disabled={processingId === payment.id}
                                onClick={() => handleDelete(payment.id)}
                                className="bg-red-600 hover:bg-red-700 text-white">
                                {processingId === payment.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : 'Delete'}
                              </Button>
                            </div>
                          )}
                          {payment.status === 'verified' && (
                            <Button size="sm" disabled={processingId === payment.id}
                              onClick={() => handleDelete(payment.id)}
                              className="bg-red-600 hover:bg-red-700 text-white">
                              {processingId === payment.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <><Trash2 className="w-4 h-4 mr-1" /> Delete</>}
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Purpose:</strong> {payment.purpose || 'N/A'}</p>
                        <p><strong>UTR Number:</strong>
                          <span className="font-mono bg-white px-2 py-0.5 rounded ml-2 border border-green-200">
                            {payment.utr_number || 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-sm">{payment.name || 'N/A'}</p>
                          </div>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-lg font-bold text-green-700">₹{payment.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <p><strong>Purpose:</strong> {payment.purpose || 'N/A'}</p>
                        <p><strong>UTR:</strong> {payment.utr_number || 'N/A'}</p>
                        <p>{formatDate(payment.created_at)}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline"
                          onClick={() => { setSelectedPayment(payment); setShowModal(true); }}
                          className="w-full border-green-200 text-green-700 hover:bg-green-50 text-xs">
                          <Eye className="w-3 h-3 mr-1" /> View Details
                        </Button>
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" disabled={processingId === payment.id}
                              onClick={() => handleVerify(payment.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs">
                              {processingId === payment.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><CheckCircle className="w-3 h-3 mr-1" /> Verify</>}
                            </Button>
                            <Button size="sm" disabled={processingId === payment.id}
                              onClick={() => handleDelete(payment.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs">
                              {processingId === payment.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <><Trash2 className="w-3 h-3 mr-1" /> Delete</>}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm">No donation payments found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-green-800">Donation Payment Details</DialogTitle>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4">
                {/* Donor Info */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-3 text-green-800">Donor Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p><strong>Name:</strong> {selectedPayment.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedPayment.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedPayment.phone || 'N/A'}</p>
                    <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}</p>
                    <p><strong>Purpose:</strong> {selectedPayment.purpose || 'N/A'}</p>
                    <div className="flex items-center gap-2">
                      <strong>Status:</strong> {getStatusBadge(selectedPayment.status)}
                    </div>
                  </div>
                </div>

                {/* UTR + Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-800">UTR Number:</p>
                    <p className="font-mono bg-white px-3 py-2 rounded text-sm break-all border border-green-200">
                      {selectedPayment.utr_number || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-green-800">Submission Date:</p>
                    <p className="text-sm">{formatDate(selectedPayment.created_at)}</p>
                    {selectedPayment.verified_at && (
                      <>
                        <p className="text-sm font-medium mt-2 mb-1 text-green-800">Verified At:</p>
                        <p className="text-sm text-green-600">{formatDate(selectedPayment.verified_at)}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <p className="text-sm font-medium mb-2 text-green-800">Payment Screenshot:</p>
                  {getScreenshotUrl(selectedPayment) ? (
                    <img
                      src={getScreenshotUrl(selectedPayment)!}
                      alt="Payment Screenshot"
                      className="max-w-full h-auto border border-green-200 rounded-lg max-h-72 mx-auto shadow-sm block"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center text-green-600">
                      No screenshot available
                    </div>
                  )}
                </div>

                {/* Admin Note */}
                {selectedPayment.admin_note && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Admin Note:</p>
                    <p className="text-sm text-blue-700">{selectedPayment.admin_note}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedPayment.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4">
                    <Button
                      onClick={() => handleVerify(selectedPayment.id)}
                      disabled={processingId === selectedPayment.id}
                      className="bg-green-600 hover:bg-green-700 text-white">
                      {processingId === selectedPayment.id
                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
                        : <><CheckCircle className="w-4 h-4 mr-2" /> Verify Payment</>}
                    </Button>
                    <Button
                      onClick={() => handleDelete(selectedPayment.id)}
                      disabled={processingId === selectedPayment.id}
                      className="bg-red-600 hover:bg-red-700 text-white">
                      {processingId === selectedPayment.id
                        ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Deleting...</>
                        : <><Trash2 className="w-4 h-4 mr-2" /> Delete Payment</>}
                    </Button>
                  </div>
                )}
                {selectedPayment.status === 'verified' && (
                  <div className="flex justify-center pt-4">
                    <Button onClick={() => handleDelete(selectedPayment.id)}
                      disabled={processingId === selectedPayment.id}
                      className="bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Payment
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