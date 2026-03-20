import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useShrineData } from '../../context/ShrineDataContext';
import { IndianRupee, Calendar, MessageCircle, Star, TrendingUp } from 'lucide-react';

interface DonationStats {
  total_donations: number;
  total_amount: number;
  pending_count: number;
  verified_count: number;
}

export const AdminDashboard: React.FC = () => {
  const { massBookings, prayerRequests, testimonies } = useShrineData();
  const [donationStats, setDonationStats] = useState<DonationStats>({
    total_donations: 0,
    total_amount: 0,
    pending_count: 0,
    verified_count: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch donation statistics from API
  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        const response = await getDonationStats();
        if (response.data.success) {
          setDonationStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching donation statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationStats();
  }, []);

  // Calculate other statistics
  const pendingBookings = massBookings.filter(b => b.status === 'pending').length;
  const pendingTestimonies = testimonies.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-green-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Our Lady Of Sorrows Shrine Admin Panel</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Donations</p>
                <IndianRupee className="w-5 h-5 text-green-700" />
              </div>
              <p className="text-2xl text-gray-800">
                {loading ? '...' : `₹${donationStats.total_amount.toLocaleString()}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {loading ? '...' : `${donationStats.total_donations} total`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-2xl text-gray-800">{pendingBookings}</p>
              <p className="text-xs text-gray-500 mt-1">{massBookings.length} total bookings</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Prayer Requests</p>
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl text-gray-800">{prayerRequests.length}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending Testimonies</p>
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl text-gray-800">{pendingTestimonies}</p>
              <p className="text-xs text-gray-500 mt-1">{testimonies.length} total testimonies</p>
            </CardContent>
          </Card>
        </div>

        {/* Donation Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Pending Donations</p>
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-2xl text-gray-800">
                {loading ? '...' : donationStats.pending_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Verified Donations</p>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-2xl text-gray-800">
                {loading ? '...' : donationStats.verified_count}
              </p>
              <p className="text-xs text-gray-500 mt-1">Successfully verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card className="border-green-200 mb-8 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              This Month's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Mass Bookings</p>
                <p className="text-xl text-gray-800">
                  {massBookings.filter(b => {
                    const date = new Date(b.submittedAt);
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                  }).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Prayer Requests</p>
                <p className="text-xl text-gray-800">
                  {prayerRequests.filter(p => {
                    const date = new Date(p.date);
                    const currentMonth = new Date().getMonth();
                    const currentYear = new Date().getFullYear();
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-1 gap-8">
          {/* Recent Mass Bookings */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calendar className="w-5 h-5" />
                Recent Mass Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {massBookings.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {massBookings.slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm text-gray-800">{booking.name}</p>
                        <p className="text-xs text-gray-600">{booking.date} at {booking.time}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded ${
                          booking.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                          booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
