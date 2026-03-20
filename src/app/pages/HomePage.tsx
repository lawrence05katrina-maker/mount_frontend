import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '../components/ui/carousel';
import { Badge } from '../components/ui/badge';
import { LivestreamNotification } from '../components/LivestreamNotification';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Heart, Send, Users } from 'lucide-react';
import { MdPhoneInTalk } from "react-icons/md";
import { BASE_URL } from '../../config/apiConfig';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [titleAnimating, setTitleAnimating] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [managementMembers, setManagementMembers] = useState<any[]>([]);
  const [managementLoading, setManagementLoading] = useState(true);

  const heroTitles = [
    t('hero.title1'),
    t('hero.title2')
  ];

  const isTamil = language === 'தமிழ்';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Load announcements from API
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bind/announcements`);
        const data = await res.json();
        if (data.success) {
          setAnnouncements(data.data);
        }
      } catch (error) {
        console.error('Error loading announcements:', error);
      }
    };
    loadAnnouncements();
  }, []);



useEffect(() => {
  const loadManagementTeam = async () => {
    try {
      setManagementLoading(true);
      const res  = await fetch(`${BASE_URL}/bind/management`);
      const data = await res.json();
      if (data.success) {
        setManagementMembers(data.data || []);
      } else {
        setManagementMembers([]);
      }
    } catch (error) {
      console.error('Error loading management team:', error);
      setManagementMembers([]);
    } finally {
      setManagementLoading(false);
    }
  };

  const timer = setTimeout(() => { loadManagementTeam(); }, 500);
  return () => clearTimeout(timer);
}, []);

  // Title animation
  useEffect(() => {
    const titleInterval = setInterval(() => {
      setTitleAnimating(true);

      setTimeout(() => {
        setCurrentTitleIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % heroTitles.length;
          console.log('Title changing from', prevIndex, 'to', nextIndex);
          return nextIndex;
        });
        setTitleAnimating(false);
      }, 400);
    }, 4000);

    return () => clearInterval(titleInterval);
  }, [heroTitles.length]);

  const handleVideoError = () => {
    setVideoError(true);
    console.error('Video failed to load');
  };


const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/api')) return `${BASE_URL.replace('/api', '')}${imageUrl}`;
  if (imageUrl.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    return `${backendUrl}${imageUrl}`;
  }
  return imageUrl;
};

  return (
    <div className="min-h-screen">
      <style>{`
        /* Full-Screen Hero Video Styles */
        .hero-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 1;
        }

        .hero-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/church1.jpg');
          background-size: cover;
          background-position: center;
          z-index: 1;
          display: none;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          text-align: center;
          color: white;
          max-width: 800px;
          padding: 0 20px;
          animation: heroFadeInUp 1.5s ease-out forwards;
          opacity: 0;
        }

        .hero-title {
          font-size: clamp(2rem, 6vw, 3.5rem);
          font-weight: bold;
          margin-bottom: 1rem;
          line-height: 1.1;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
          transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .hero-title.tamil {
          font-size: clamp(1.3rem, 4vw, 2.2rem);
          line-height: 1.2;
        }

        .hero-title.fade-out {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }

        .hero-title.fade-in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.5rem);
          margin-bottom: 2rem;
          opacity: 0.95;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
          animation: heroFadeInUp 1.5s ease-out 0.3s forwards;
          opacity: 0;
        }

        .hero-subtitle.tamil {
          font-size: clamp(0.8rem, 2vw, 1rem);
        }

        .hero-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          animation: heroFadeInUp 1.5s ease-out 0.6s forwards;
          opacity: 0;
        }

        @keyframes heroFadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .hero-container {
            height: 100vh;
          }
          
          .hero-buttons {
            flex-direction: row;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            max-width: 100%;
            padding: 0 1rem;
          }
          
          .hero-buttons > * {
            flex: 1 1 auto;
            min-width: 100px;
            max-width: none;
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .hero-buttons > *.tamil {
            font-size: 0.7rem;
            padding: 0.75rem 0.5rem;
            min-width: 110px;
          }
          
          .hero-buttons > * .mr-2 {
            margin-right: 0.25rem;
            width: 0.875rem;
            height: 0.875rem;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .hero-buttons {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
            max-width: 280px;
            margin: 0 auto;
          }
          
          .hero-buttons > * {
            flex: none;
            width: 100%;
            max-width: none;
            min-width: auto;
            padding: 0.875rem 1rem;
            font-size: 0.875rem;
          }
          
          .hero-buttons > *.tamil {
            font-size: 0.8rem;
            padding: 0.875rem 1rem;
          }
        }

        /* Button Hover Effects */
        .hero-buttons button {
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-buttons button.tamil {
          font-size: 0.8rem;
          line-height: 1.2;
        }

        .hero-buttons button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        /* Tamil-specific text sizing */
        .tamil-text {
          font-size: 0.8em;
        }

        .tamil-heading {
          font-size: 0.75em;
        }

        .tamil-card-title {
          font-size: 0.8em;
        }

        /* Management Carousel Styles */
        .management-carousel {
          position: relative;
        }

        .management-carousel .carousel-navigation {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        }

        .management-carousel .carousel-navigation.prev {
          left: -3rem;
        }

        .management-carousel .carousel-navigation.next {
          right: -3rem;
        }

        /* Mobile carousel navigation - Always visible on mobile */
        @media (max-width: 640px) {
          .management-carousel .carousel-navigation {
            display: flex !important;
            width: 2rem;
            height: 2rem;
          }
          
          .management-carousel .carousel-navigation.prev {
            left: -2rem;
          }

          .management-carousel .carousel-navigation.next {
            right: -2rem;
          }
          
          /* Ensure mobile carousel has proper spacing for arrows */
          .management-carousel {
            margin: 0 2.5rem;
          }
        }

        /* Carousel item hover effects */
        .management-card {
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .management-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(34, 197, 94, 0.15);
        }

        /* Ensure consistent card heights in carousel */
        .management-carousel .carousel-item {
          height: auto;
          display: flex;
        }

        .management-carousel .management-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .management-carousel .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* Mobile-specific accommodation section styles */
        @media (max-width: 640px) {
          .accommodation-card {
            margin-bottom: 1rem;
          }
          
          .accommodation-card img {
            height: 12rem;
          }
          
          .accommodation-card .card-content {
            padding: 1rem;
          }
          
          .accommodation-title {
            font-size: 1.5rem;
            text-align: center;
            margin-bottom: 2rem;
          }
          
          .accommodation-contact {
            padding: 1rem;
            text-align: center;
          }
          
          .accommodation-contact .phone-number {
            font-size: 1rem;
            margin-top: 0.75rem;
          }
        }

        /* Card hover effects for other sections */
        .premium-card-hover {
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform-style: preserve-3d;
        }

        .premium-card-hover:hover {
          transform: translateY(-15px) rotateX(5deg) rotateY(5deg) scale(1.03);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15), 0 0 30px rgba(34, 197, 94, 0.2);
        }

        /* Animation classes for other sections */
        .premium-fadeInUp {
          animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .premium-slideInLeft {
          animation: slideInLeft 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .premium-slideInRight {
          animation: slideInRight 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .premium-scaleIn {
          animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .premium-slideUp {
          animation: slideUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .premium-float {
          animation: float 4s ease-in-out infinite;
        }

        .premium-stagger-1 { animation-delay: 0.1s; }
        .premium-stagger-2 { animation-delay: 0.3s; }
        .premium-stagger-3 { animation-delay: 0.5s; }
        .premium-stagger-4 { animation-delay: 0.7s; }
        .premium-stagger-5 { animation-delay: 0.9s; }
        .premium-stagger-6 { animation-delay: 1.1s; }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-80px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(80px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(100px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>

      <LivestreamNotification />

      {/* Full-Screen Hero Section with Background Video */}
      <div className="hero-container">
        {/* Background Video */}
        {!videoError && (
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={handleVideoError}
          >
            <source src="/hero.mp4" type="video/mp4" />
            <source src="https://res.cloudinary.com/decddzq7e/video/upload/v1770099308/lv_0_20260203114036_uwnlie.mp4" type="video/mp4" />
          </video>
        )}


        <div className="hero-fallback" style={{ display: videoError ? 'block' : 'none' }}></div>


        <div className="hero-overlay"></div>


        <div className="hero-content">
          <h1 className={`hero-title ${titleAnimating ? 'fade-out' : 'fade-in'} ${isTamil ? 'tamil' : ''}`}>
            {heroTitles[currentTitleIndex]}
          </h1>
          <p className={`hero-subtitle ${isTamil ? 'tamil' : ''}`}>
            {t('hero.subtitle')}
          </p>
          <div className="hero-buttons">
            <Button
              size="lg"
              asChild
              className={`bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg ${isTamil ? 'tamil' : ''}`}
            >
              <Link to="/mass-booking">
                <Calendar className="mr-2 w-5 h-5" />
                {t('button.bookMass')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className={`bg-white/90 text-green-700 border-white hover:bg-white px-6 py-3 rounded-lg ${isTamil ? 'tamil' : ''}`}
            >
              <Link to="/donations">
                <Heart className="mr-2 w-5 h-5" />
                {t('button.donate')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className={`bg-white/90 text-green-700 border-white hover:bg-white px-6 py-3 rounded-lg ${isTamil ? 'tamil' : ''}`}
            >
              <Link to="/prayer-request">
                <Send className="mr-2 w-5 h-5" />
                {t('button.prayerRequest')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`${isVisible ? 'premium-slideInLeft premium-stagger-1' : 'opacity-0'}`}>
              <h2 className={`text-3xl font-semibold text-green-800 mb-4 ${isTamil ? 'tamil-heading' : ''}`}>{t('about.title')}</h2>
              <p className={`text-gray-700 leading-relaxed mb-6 ${isTamil ? 'tamil-text' : ''}`}>
                {t('about.description')}
              </p>
              <Button
                variant="outline"
                asChild
                className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
              >
                <Link to="/about">{t('button.learnMore')}</Link>
              </Button>
            </div>
            <div className={`grid grid-cols-2 gap-4 ${isVisible ? 'premium-slideInRight premium-stagger-2' : 'opacity-0'}`}>
              <div className="rounded-lg overflow-hidden shadow-lg premium-card-hover">
                <img
                  src="/gallery5.jpg"
                  alt="Saint Devasahayam"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg premium-card-hover">
                <img
                  src="/mary.jpeg"
                  alt="St. Devasahayam Martyrdom place"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-semibold text-green-800 mb-10 ${isTamil ? 'tamil-heading' : ''} ${isVisible ? 'premium-fadeInUp premium-stagger-1' : 'opacity-0'}`}>{t('management.title')}</h2>

          {managementLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((index) => (
                <Card key={index} className="border-0 animate-pulse">
                  <div className="w-full h-56 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : managementMembers.length > 0 ? (
            <>
              {/* Mobile Carousel - Always show carousel with navigation arrows on mobile */}
              <div className="management-carousel relative block sm:hidden">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                    slidesToScroll: 1,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {managementMembers.map((member, index) => (
                      <CarouselItem key={member.id} className="carousel-item pl-2 basis-full">
                        <Card className={`management-card border-0 hover:shadow-lg premium-card-hover ${isVisible ? `premium-fadeInUp premium-stagger-${(index % 4) + 2}` : 'opacity-0'}`}>
                          {getImageUrl(member.image_url) ? (
                            <img
                              src={getImageUrl(member.image_url)!}
                              alt={member.name}
                              className="w-full h-56 object-cover rounded-t-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling as HTMLElement;
                                if (placeholder) placeholder.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center rounded-t-lg ${getImageUrl(member.image_url) ? 'hidden' : 'flex'}`}
                          >
                            <Users className="w-16 h-16 text-green-400" />
                          </div>
                          <CardContent className="card-content pt-4 text-center">
                            <h3 className="font-semibold text-lg mb-2">{member.name}</h3>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-3 text-xs">
                              {member.position}
                            </Badge>
                            <p className="text-sm text-gray-600 text-left mt-3">
                              {(member.description || `${member.name} serves as ${member.position}, contributing to the spiritual and administrative leadership of our parish community.`).replace(/\s*\[UPDATED\]/g, '')}
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {/* Mobile Navigation Arrows - Always visible on mobile */}
                  <CarouselPrevious className="carousel-navigation prev -left-8 bg-white border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 shadow-lg w-8 h-8" />
                  <CarouselNext className="carousel-navigation next -right-8 bg-white border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 shadow-lg w-8 h-8" />
                </Carousel>
              </div>

              {/* Desktop Layout - Grid or Carousel based on member count */}
              <div className="hidden sm:block">
                {managementMembers.length > 4 ? (
                  // Carousel for more than 4 members on desktop
                  <div className="management-carousel relative">
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                        slidesToScroll: 1,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-4">
                        {managementMembers.map((member, index) => (
                          <CarouselItem key={member.id} className="carousel-item pl-4 basis-1/2 lg:basis-1/4">
                            <Card className={`management-card border-0 hover:shadow-lg premium-card-hover ${isVisible ? `premium-fadeInUp premium-stagger-${(index % 4) + 2}` : 'opacity-0'}`}>
                              {getImageUrl(member.image_url) ? (
                                <img
                                  src={getImageUrl(member.image_url)!}
                                  alt={member.name}
                                  className="w-full h-56 object-cover rounded-t-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const placeholder = target.nextElementSibling as HTMLElement;
                                    if (placeholder) placeholder.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center rounded-t-lg ${getImageUrl(member.image_url) ? 'hidden' : 'flex'}`}
                              >
                                <Users className="w-16 h-16 text-green-400" />
                              </div>
                              <CardContent className="card-content pt-4">
                                <h3 className="font-semibold text-lg">{member.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{member.position}</p>
                                <p className="text-sm text-gray-600">
                                  {(member.description || `${member.name} serves as ${member.position}, contributing to the spiritual and administrative leadership of our parish community.`).replace(/\s*\[UPDATED\]/g, '')}
                                </p>
                              </CardContent>
                            </Card>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="carousel-navigation prev -left-12 bg-white border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 shadow-lg" />
                      <CarouselNext className="carousel-navigation next -right-12 bg-white border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 shadow-lg" />
                    </Carousel>
                  </div>
                ) : (
                  // Grid for 4 or fewer members on desktop
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {managementMembers.map((member, index) => (
                      <Card key={member.id} className={`border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 premium-card-hover ${isVisible ? `premium-fadeInUp premium-stagger-${index + 2}` : 'opacity-0'}`}>
                        {getImageUrl(member.image_url) ? (
                          <img
                            src={getImageUrl(member.image_url)!}
                            alt={member.name}
                            className="w-full h-56 object-cover rounded-t-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.nextElementSibling as HTMLElement;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center rounded-t-lg ${getImageUrl(member.image_url) ? 'hidden' : 'flex'}`}
                        >
                          <Users className="w-16 h-16 text-green-400" />
                        </div>
                        <CardContent className="pt-4">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-gray-500 mb-3">{member.position}</p>
                          <p className="text-sm text-gray-600">
                            {(member.description || `${member.name} serves as ${member.position}, contributing to the spiritual and administrative leadership of our parish community.`).replace(/\s*\[UPDATED\]/g, '')}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Management information will be available soon.</p>
            </div>
          )}

          <div className={`mt-10 ${isVisible ? 'premium-slideUp premium-stagger-6' : 'opacity-0'}`}>
            <Button
              variant="outline"
              className="border-green-700 text-green-700 hover:bg-green-700 hover:text-white"
              asChild
            >
              <Link to="/fathers">{t('button.viewMore')}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="bg-green-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center gap-2 mb-8 ${isVisible ? 'premium-slideInLeft premium-stagger-1' : 'opacity-0'}`}>
              <h2 className={`text-3xl font-semibold text-green-800 ${isTamil ? 'tamil-heading' : ''}`}>{t('announcements.title')}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {announcements.slice(0, 4).map((announcement, index) => (
                <Card key={announcement.id} className={`border-green-200 premium-card-hover ${isVisible ? `premium-scaleIn premium-stagger-${index + 2}` : 'opacity-0'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{t(announcement.title)}</span>
                      {(announcement.priority === 'Urgent' || announcement.priority === 'High') && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Important
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{t(announcement.content)}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rooms & Accommodation Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <h2 className={`accommodation-title text-2xl sm:text-3xl font-semibold text-green-800 mb-8 sm:mb-10 text-center sm:text-left ${isVisible ? 'premium-fadeInUp premium-stagger-1' : 'opacity-0'} ${isTamil ? 'tamil-heading' : ''}`}>
            {t('accommodation.title')}
          </h2>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Card 1 */}
            <Card className={`accommodation-card border-green-200 premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-2' : 'opacity-0'}`}>
              <img src="/room1.jpg" alt="Pilgrim Rooms" className="w-full h-48 sm:h-56 object-cover rounded-t-lg" />
              <CardContent className="card-content pt-4 px-4 sm:px-6">
                <h3 className={`font-semibold text-green-800 mb-2 text-base sm:text-lg ${isTamil ? 'tamil-card-title' : ''}`}>
                  {t('accommodation.pilgrim.rooms')}
                </h3>
                <p className={`text-sm text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {t('accommodation.pilgrim.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className={`accommodation-card border-green-200 premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-3' : 'opacity-0'}`}>
              <img src="/room2.jpg" alt="Family Rooms" className="w-full h-48 sm:h-56 object-cover rounded-t-lg" />
              <CardContent className="card-content pt-4 px-4 sm:px-6">
                <h3 className={`font-semibold text-green-800 mb-2 text-base sm:text-lg ${isTamil ? 'tamil-card-title' : ''}`}>
                  {t('accommodation.family.rooms')}
                </h3>
                <p className={`text-sm text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {t('accommodation.family.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className={`accommodation-card border-green-200 premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-4' : 'opacity-0'}`}>
              <img src="/room3.jpg" alt="Group Stay" className="w-full h-48 sm:h-56 object-cover rounded-t-lg" />
              <CardContent className="card-content pt-4 px-4 sm:px-6">
                <h3 className={`font-semibold text-green-800 mb-2 text-base sm:text-lg ${isTamil ? 'tamil-card-title' : ''}`}>
                  {t('accommodation.group.stay')}
                </h3>
                <p className={`text-sm text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {t('accommodation.group.desc')}
                </p>
              </CardContent>
            </Card>

            {/* Card 4 */}
            <Card className={`accommodation-card border-green-200 premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-5' : 'opacity-0'}`}>
              <img src="/room4.jpg" alt="Affordable Rooms" className="w-full h-48 sm:h-56 object-cover rounded-t-lg" />
              <CardContent className="card-content pt-4 px-4 sm:px-6">
                <h3 className={`font-semibold text-green-800 mb-2 text-base sm:text-lg ${isTamil ? 'tamil-card-title' : ''}`}>
                  {t('accommodation.affordable.rooms')}
                </h3>
                <p className={`text-sm text-gray-600 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                  {t('accommodation.affordable.desc')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div className={`accommodation-contact mt-8 sm:mt-12 bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isVisible ? 'premium-slideUp premium-stagger-6' : 'opacity-0'}`}>
            <div className="flex-1">
              <h4 className={`font-semibold text-green-800 mb-1 text-base sm:text-lg ${isTamil ? 'tamil-card-title' : ''}`}>
                {t('accommodation.enquiries')}
              </h4>
              <p className={`text-sm text-gray-700 leading-relaxed ${isTamil ? 'tamil-text' : ''}`}>
                {t('accommodation.contact.desc')}
              </p>
            </div>
            <div className="phone-number text-base sm:text-lg font-semibold text-green-700 whitespace-nowrap flex items-center gap-2">
              <MdPhoneInTalk className="w-5 h-5" />
              +91 89037 60869
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-green-50 py-16 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 pb-16">
            <Link to="/mass-booking">
              <Card className={`text-center border-blue-200 hover:shadow-lg transition-shadow cursor-pointer premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-1' : 'opacity-0'}`}>
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 premium-float">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className={`${isTamil ? 'tamil-card-title' : ''}`}>{t('cta.bookMass.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>
                    {t('cta.bookMass.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/donations">
              <Card className={`text-center border-blue-200 hover:shadow-lg transition-shadow cursor-pointer premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-2' : 'opacity-0'}`}>
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 premium-float" style={{ animationDelay: '0.5s' }}>
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className={`${isTamil ? 'tamil-card-title' : ''}`}>{t('cta.donation.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>
                    {t('cta.donation.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/prayer-request">
              <Card className={`text-center border-green-200 hover:shadow-lg transition-shadow cursor-pointer premium-card-hover ${isVisible ? 'premium-scaleIn premium-stagger-3' : 'opacity-0'}`}>
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 premium-float" style={{ animationDelay: '1s' }}>
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className={`${isTamil ? 'tamil-card-title' : ''}`}>{t('cta.prayer.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-700 ${isTamil ? 'tamil-text' : ''}`}>
                    {t('cta.prayer.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};