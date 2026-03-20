import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useShrineData } from '../context/ShrineDataContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Radio, Clock, Calendar, Users, Play, 
  Maximize, Bell, MessageCircle, Eye, ExternalLink, X
} from 'lucide-react';
import { QuickNotifyButton } from '../components/StreamEmailNotification';
import axios from 'axios';
import { BASE_URL } from '../../config/apiConfig';

interface LivestreamData {
  id: number;
  title: string;
  description?: string;
  stream_url: string;
  thumbnail_url?: string;
  platform: string;
  status: 'active' | 'scheduled' | 'ended';
  scheduled_at?: string;
  created_at: string;
  views: number;
}

const DEFAULT_MASS_TIMINGS = [
  { name: 'livestream.morning.mass', time: 'livestream.morning.time', type: 'daily' },
  { name: 'livestream.evening.mass', time: 'livestream.evening.time', type: 'daily' },
  { name: 'livestream.sunday.mass',  time: 'livestream.sunday.time',  type: 'sunday' }
];

const DEFAULT_SPECIAL_EVENTS = [
  { name: 'livestream.feast.day',        date: 'livestream.feast.coverage'    },
  { name: 'livestream.friday.adoration', date: 'livestream.friday.time'       },
  { name: 'livestream.holy.week',        date: 'livestream.extended.coverage' }
];

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) return url;
  let videoId = '';
  if (url.includes('youtube.com/watch?v='))
    videoId = url.split('v=')[1]?.split('&')[0];
  else if (url.includes('youtu.be/'))
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  else if (url.includes('youtube.com/live/'))
    videoId = url.split('live/')[1]?.split('?')[0];
  if (videoId)
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&fs=1&playsinline=1&origin=${window.location.origin}`;
  return url;
};

const getYouTubeVideoId = (url: string): string => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v='))  return url.split('v=')[1]?.split('&')[0];
  if (url.includes('youtu.be/'))             return url.split('youtu.be/')[1]?.split('?')[0];
  if (url.includes('youtube.com/live/'))     return url.split('live/')[1]?.split('?')[0];
  if (url.includes('youtube.com/embed/'))    return url.split('embed/')[1]?.split('?')[0];
  return '';
};

export const LiveStreamPage: React.FC = () => {
  const { siteContent } = useShrineData();
  const { language, t } = useLanguage();
  const [activeStream,    setActiveStream]    = useState<LivestreamData | null>(null);
  const [upcomingStreams, setUpcomingStreams]  = useState<LivestreamData[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [isVisible,       setIsVisible]       = useState(false);
  const [videoContainerRef, setVideoContainerRef] = useState<HTMLDivElement | null>(null);

  const getTamilClass        = (b = '') => language === 'தமிழ்' ? `${b} tamil-text`    : b;
  const getTamilHeadingClass = (b = '') => language === 'தமிழ்' ? `${b} tamil-heading` : b;
  const getTamilButtonClass  = (b = '') => language === 'தமிழ்' ? `${b} tamil-button`  : b;

  useEffect(() => { setIsVisible(true); }, []);

  // ── FETCH public livestreams ───────────────────────
  const fetchLivestreamData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bind/livestream`);
      if (res.data.success) {
        const all: LivestreamData[] = res.data.data;
        const active    = all.find(s => s.status === 'active') || null;
        const upcoming  = all.filter(s => s.status === 'scheduled');
        setActiveStream(active);
        setUpcomingStreams(upcoming);
      }
    } catch (error) {
      console.error('Error fetching livestreams:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh active stream every 30 seconds
  const refreshActiveStream = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/bind/livestream/active`);
      if (res.data.success) {
        setActiveStream(res.data.data);
      }
    } catch (error) {
      console.error('Error refreshing active stream:', error);
    }
  }, []);

  useEffect(() => {
    fetchLivestreamData();
    const interval = setInterval(refreshActiveStream, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Fullscreen ─────────────────────────────────────
  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef) return;
    try {
      if (!document.fullscreenElement) {
        await videoContainerRef.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      setIsFullscreen(!isFullscreen);
    }
  }, [videoContainerRef, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const openInYouTube = useCallback((stream: LivestreamData) => {
    const videoId = getYouTubeVideoId(stream.stream_url);
    window.open(videoId ? `https://www.youtube.com/watch?v=${videoId}` : stream.stream_url, '_blank');
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  }, []);

  const getTimeUntilStream = useCallback((scheduledAt: string) => {
    const diff = new Date(scheduledAt).getTime() - Date.now();
    if (diff <= 0) return 'Starting now';
    const hours   = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `Starts in ${hours}h ${minutes}m` : `Starts in ${minutes}m`;
  }, []);

  const youtubeUrl = useMemo(() =>
    siteContent?.youtubeUrl || 'https://youtube.com/@st.devasahayamshrine',
  [siteContent?.youtubeUrl]);

  return (
    <div className="min-h-screen py-8 sm:py-16 px-4 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className={`flex flex-col items-center justify-center gap-3 mb-4 sm:mb-6 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
            <h1 className={getTamilHeadingClass("text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-800 to-blue-800 bg-clip-text text-transparent text-center")}>
              {t('livestream.title')}
            </h1>
          </div>
          <p className={getTamilClass(`text-gray-700 max-w-2xl mx-auto text-base sm:text-lg px-4 ${isVisible ? 'animate-fadeInUp stagger-2' : 'opacity-0'}`)}>
            {t('livestream.subtitle')}
          </p>
          {loading && (
            <div className="mt-2 text-sm text-green-600">Loading stream information...</div>
          )}
        </div>

        {/* Active Stream */}
        {activeStream ? (
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-scaleIn stagger-1' : 'opacity-0'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Badge className="bg-red-600 text-white px-2 py-0.5 text-xs font-medium w-fit">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1.5"></div>
                {t('livestream.live.now')}
              </Badge>
            </div>

            <Card className="border-2 border-red-200 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div
                  ref={setVideoContainerRef}
                  className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'} touch-manipulation`}
                >
                  <iframe
                    src={getYouTubeEmbedUrl(activeStream.stream_url)}
                    title={activeStream.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                    style={{ border: 'none' }}
                  />
                  <div className="absolute bottom-1 sm:bottom-4 left-1 sm:left-4 right-1 sm:right-4 flex items-center justify-between bg-black bg-opacity-70 rounded-md p-1.5 sm:p-3">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-6 w-6"
                        onClick={() => openInYouTube(activeStream)}>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-6 w-6"
                        onClick={toggleFullscreen}>
                        <Maximize className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {isFullscreen && (
                    <button onClick={toggleFullscreen}
                      className="absolute top-4 right-4 z-60 bg-black bg-opacity-50 text-white p-2 rounded-full sm:hidden">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="p-3 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4 mb-3">
                    <div className="flex-1">
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2">{activeStream.title}</h2>
                      {activeStream.description && (
                        <p className="text-gray-700 mb-2 text-sm sm:text-base">{activeStream.description}</p>
                      )}
                    </div>
                    <div className="hidden sm:flex gap-2">
                      <Button variant="outline" size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                        onClick={() => openInYouTube(activeStream)}>
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {t('livestream.chat.youtube')}
                      </Button>
                      <Button variant="outline" size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                        onClick={() => openInYouTube(activeStream)}>
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {t('livestream.full.features')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-fadeInUp stagger-2' : 'opacity-0'}`}>
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Live Stream Currently</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">Check back during mass times or special events</p>
                <QuickNotifyButton
                  streamTitle="Live Mass Streams"
                  streamTime="Get notified when we go live"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div className={`mb-8 sm:mb-12 ${isVisible ? 'animate-slideInLeft stagger-1' : 'opacity-0'}`}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              Upcoming Streams
            </h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {upcomingStreams.map((stream, index) => (
                <Card key={stream.id} className="border-green-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{stream.title}</h3>
                        {stream.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">{stream.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="border-green-200 text-green-700 text-xs w-fit">
                        {stream.scheduled_at ? getTimeUntilStream(stream.scheduled_at) : 'Soon'}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{stream.scheduled_at ? formatDateTime(stream.scheduled_at) : 'Time TBA'}</span>
                      </div>
                      <QuickNotifyButton
                        streamTitle={stream.title}
                        streamTime={stream.scheduled_at ? formatDateTime(stream.scheduled_at) : 'Time TBA'}
                        className="text-xs h-8 px-3 border-green-200 text-green-700 hover:bg-green-50 bg-transparent border w-fit"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mass Timings */}
        <div className={`grid gap-4 sm:gap-6 lg:grid-cols-2 mb-8 sm:mb-12 ${isVisible ? 'animate-slideInRight stagger-1' : 'opacity-0'}`}>
          <Card className="border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className={getTamilHeadingClass("flex items-center gap-2 text-green-800 text-lg sm:text-xl")}>
                <Clock className="w-5 h-5" />
                {t('livestream.daily.timings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {DEFAULT_MASS_TIMINGS.map((mass, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${mass.type === 'sunday' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <span className={getTamilClass("text-gray-700 font-medium text-sm sm:text-base")}>{t(mass.name)}</span>
                    <Badge variant="outline" className={`text-xs sm:text-sm ${mass.type === 'sunday' ? 'border-blue-200 text-blue-700' : 'border-green-200 text-green-700'}`}>
                      {t(mass.time)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className={getTamilHeadingClass("flex items-center gap-2 text-green-800 text-lg sm:text-xl")}>
                <Calendar className="w-5 h-5" />
                {t('livestream.special.events')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {DEFAULT_SPECIAL_EVENTS.map((event, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <p className={getTamilClass("font-medium text-gray-900 mb-1 text-sm sm:text-base")}>{t(event.name)}</p>
                    <p className={getTamilClass("text-xs sm:text-sm text-gray-600")}>{t(event.date)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* YouTube Channel */}
        <Card className={`border-green-200 bg-gradient-to-r from-green-50 to-blue-50 ${isVisible ? 'animate-scaleIn stagger-1' : 'opacity-0'}`}>
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className={getTamilHeadingClass("text-lg sm:text-xl font-semibold text-gray-900 mb-4")}>
              {t('livestream.youtube.channel')}
            </h3>
            <p className={getTamilClass("text-gray-600 mb-6 text-sm sm:text-base")}>
              {t('livestream.youtube.subscribe')}
            </p>
            <Button className={getTamilButtonClass("bg-red-600 hover:bg-red-700 text-white")}
              onClick={() => window.open(youtubeUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('livestream.visit.channel')}
            </Button>
          </CardContent>
        </Card>

        {/* Important Info */}
        <Card className={`border-green-200 mt-8 ${isVisible ? 'animate-fadeInUp stagger-2' : 'opacity-0'}`}>
          <CardHeader>
            <CardTitle className={getTamilHeadingClass("text-green-800 text-lg sm:text-xl")}>
              {t('livestream.important.info')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className={getTamilClass("space-y-2 text-gray-700 text-sm sm:text-base")}>
              {[1,2,3,4,5,6,7].map(i => (
                <li key={i}>• {t(`livestream.info.${i}`)}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <style>{`
        .tamil-text { font-size: 0.85em; }
        .tamil-heading { font-size: 0.8em; }
        .tamil-button { font-size: 0.8em; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out forwards; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; } .stagger-4 { animation-delay: 0.4s; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
};