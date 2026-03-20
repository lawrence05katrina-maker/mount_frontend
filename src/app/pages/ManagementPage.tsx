import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  Users, Phone, Mail, Eye, Share2,
  AlertCircle, RefreshCw, Calendar
} from 'lucide-react';
import { BASE_URL } from '../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface ManagementMember {
  id: number;
  name: string;
  position: string;
  description?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Constants ──────────────────────────────────────
const BACKEND_HOST = BASE_URL.replace('/api', '');

// ── Helpers ────────────────────────────────────────
const getFullImageUrl = (member: ManagementMember): string => {
  if (member.image_url) {
    if (member.image_url.startsWith('/api'))  return `${BACKEND_HOST}${member.image_url}`;
    if (member.image_url.startsWith('http')) return member.image_url;
  }
  return '';
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    day: 'numeric', month: 'numeric', year: 'numeric'
  });

// ── Loading Skeleton ───────────────────────────────
const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-64 w-full" />
        <div className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </Card>
    ))}
  </div>
);

// ── Component ──────────────────────────────────────
export const ManagementPage: React.FC = () => {
  const [members, setMembers]           = useState<ManagementMember[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'all' | 'leadership' | 'administration'>('all');
  const [selectedMember, setSelectedMember] = useState<ManagementMember | null>(null);
  const [retryCount, setRetryCount]     = useState(0);
  const [isVisible, setIsVisible]       = useState(false);

  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);

  // ── Load Public Members ────────────────────────
  const loadManagementData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const res  = await fetch(`${BASE_URL}/bind/management`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      if (data.success) {
        setMembers(data.data);
        setRetryCount(0);
      } else throw new Error(data.message || 'Failed to load');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load management team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadManagementData(); }, [loadManagementData]);

  const handleRetry = useCallback(() => {
    setRetryCount(p => p + 1);
    loadManagementData();
  }, [loadManagementData]);

  // ── Filter by tab ──────────────────────────────
  const filteredMembers = useMemo(() => {
    switch (activeTab) {
      case 'leadership':
        return members.filter(m =>
          m.position.toLowerCase().includes('priest') ||
          m.position.toLowerCase().includes('president') ||
          m.position.toLowerCase().includes('director')
        );
      case 'administration':
        return members.filter(m =>
          m.position.toLowerCase().includes('secretary') ||
          m.position.toLowerCase().includes('treasurer') ||
          m.position.toLowerCase().includes('coordinator')
        );
      default: return members;
    }
  }, [members, activeTab]);

  const handleShare = async (member: ManagementMember) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${member.name} - ${member.position}`,
          url: window.location.href
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ── Error ──────────────────────────────────────
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
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatIn  { from { opacity:0; transform:translateY(50px) scale(0.8); } to { opacity:1; transform:translateY(0) scale(1); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-floatIn  { animation: floatIn  0.8s ease-out forwards; }
        .gallery-card { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-card:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 25px 50px rgba(0,0,0,0.12), 0 0 20px rgba(34,197,94,0.15); }
      `}</style>

      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className={`text-center mb-8 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold text-green-700 mb-4">Management Team</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the dedicated leaders who guide our shrine community with wisdom and faith
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-green-50 rounded-lg p-1 gap-1 shadow-sm border border-green-100">
            {([
              { key: 'all',            label: 'All Members'    },
              { key: 'leadership',     label: 'Leadership'     },
              { key: 'administration', label: 'Administration' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-white shadow-md'
                    : 'text-green-700 hover:bg-green-100'
                }`}
                style={activeTab === tab.key ? { backgroundColor: '#16a34a' } : {}}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? <LoadingSkeleton /> : filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">No team members are currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, index) => (
              <Card
                key={member.id}
                className={`overflow-hidden gallery-card cursor-pointer group bg-white hover:shadow-2xl border-0 shadow-lg ${
                  isVisible ? 'animate-floatIn' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => setSelectedMember(member)}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  {getFullImageUrl(member) ? (
                    <img
                      src={getFullImageUrl(member)}
                      alt={member.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const next = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                        if (next) next.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Placeholder */}
                  <div className={`w-full h-64 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center ${getFullImageUrl(member) ? 'hidden' : 'flex'}`}>
                    <Users className="w-16 h-16 text-green-400" />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-full p-3 shadow-xl">
                      <Eye className="h-6 w-6 text-gray-800" />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 text-white border-0 font-semibold">
                      <Users className="h-3 w-3 mr-1" /> Team
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                    {member.name}
                  </h3>
                  <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 font-medium mb-3">
                    {member.position}
                  </Badge>
                  {member.description && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
                      {member.description}
                    </p>
                  )}
                  {(member.phone || member.email) && (
                    <div className="space-y-1 pt-3 border-t border-gray-100">
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="h-3 w-3" /> {member.phone}
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(member.created_at)}
                    </div>
                    <Button variant="ghost" size="sm"
                      onClick={e => { e.stopPropagation(); setSelectedMember(member); }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl">
            {selectedMember && (
              <>
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center justify-between flex-wrap gap-3 text-2xl font-bold text-gray-900">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span>{selectedMember.name}</span>
                      <Badge className="bg-green-600 text-white">
                        <Users className="h-3 w-3 mr-1" /> {selectedMember.position}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm"
                      onClick={() => handleShare(selectedMember)}
                      className="border-green-200 text-green-700 hover:bg-green-50">
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Photo */}
                  <div className="rounded-xl overflow-hidden shadow-xl">
                    {getFullImageUrl(selectedMember) ? (
                      <img src={getFullImageUrl(selectedMember)} alt={selectedMember.name}
                        className="w-full max-h-[50vh] object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                        <Users className="w-20 h-20 text-green-400" />
                      </div>
                    )}
                  </div>

                  {selectedMember.description && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                      <p className="text-gray-700 leading-relaxed">{selectedMember.description}</p>
                    </div>
                  )}

                  {(selectedMember.phone || selectedMember.email) && (
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                      <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        {selectedMember.phone && (
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Phone className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Phone</p>
                              <p className="font-medium text-gray-900">{selectedMember.phone}</p>
                            </div>
                          </div>
                        )}
                        {selectedMember.email && (
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{selectedMember.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 bg-white rounded-lg p-4 border">
                    <Badge className="bg-green-600 text-white">Management Team</Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(selectedMember.created_at)}</span>
                    </div>
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