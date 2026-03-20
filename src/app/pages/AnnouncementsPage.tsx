import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Megaphone, AlertTriangle,
  Info, Calendar, Clock, Loader2
} from 'lucide-react';
import { BASE_URL } from '../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

// ── Component ──────────────────────────────────────
export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  useEffect(() => { loadAnnouncements(); }, []);

  // ── Fetch Active Announcements (Public) ──────────
  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const res  = await fetch(`${BASE_URL}/bind/announcements`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) setAnnouncements(data.data);
      else throw new Error(data.message || 'Failed to load');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  // ── Badge Helpers ────────────────────────────────
  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      Urgent: 'bg-red-100 text-red-800',
      High:   'bg-orange-100 text-orange-800',
      Normal: 'bg-blue-100 text-blue-800',
      Low:    'bg-gray-100 text-gray-800',
    };
    return <Badge className={map[priority] || 'bg-gray-100 text-gray-800'}>{priority}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Urgent' || priority === 'High')
      return <AlertTriangle className={`w-5 h-5 ${priority === 'Urgent' ? 'text-red-600' : 'text-orange-600'}`} />;
    return <Info className="w-5 h-5 text-blue-600" />;
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      General:   'bg-green-100 text-green-800',
      Mass:      'bg-purple-100 text-purple-800',
      Event:     'bg-blue-100 text-blue-800',
      Holiday:   'bg-yellow-100 text-yellow-800',
      Emergency: 'bg-red-100 text-red-800',
    };
    return <Badge className={map[type] || 'bg-gray-100 text-gray-800'}>{type}</Badge>;
  };

  // ── Loading ──────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen py-16 px-4 bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-green-700">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading announcements...</span>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen py-16 px-4 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadAnnouncements}
          className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800">
          Try Again
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────
  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Megaphone className="w-8 h-8 text-green-700" />
            <h1 className="text-4xl font-bold text-green-800">Important Announcements</h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Stay updated with the latest news, events, and important information from our shrine
          </p>
        </div>

        {/* Announcements */}
        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map(a => (
              <Card key={a.id} className={`border-l-4 hover:shadow-lg transition-shadow ${
                a.priority === 'Urgent' ? 'border-l-red-500 border-red-200'
                : a.priority === 'High' ? 'border-l-orange-500 border-orange-200'
                : 'border-l-green-500 border-green-200'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(a.priority)}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{a.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Posted on {new Date(a.created_at).toLocaleDateString()}</span>
                          </div>
                          {a.end_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Valid until {new Date(a.end_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(a.priority)}
                      {getTypeBadge(a.type)}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{a.content}</p>

                  {a.priority === 'Urgent' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          This is an urgent announcement. Please read carefully.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-green-200">
            <CardContent className="p-12 text-center">
              <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-600">
                There are currently no active announcements. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <div className="mt-12">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-green-800 font-semibold mb-2">Stay Informed</h4>
                  <p className="text-gray-700 mb-2">We regularly post important announcements about:</p>
                  <ul className="text-gray-700 text-sm space-y-1 ml-4">
                    <li>• Special mass schedules and religious events</li>
                    <li>• Shrine maintenance and facility updates</li>
                    <li>• Festival celebrations and community gatherings</li>
                    <li>• Emergency notices and safety information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};