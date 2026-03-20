import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Send, CheckCircle, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '../../config/apiConfig';

export const PrayerRequestPage: React.FC = () => {

  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prayer_intention: '',   // ← changed from 'prayer' to match backend
  });

  // Tamil font size classes
  const getTamilClass = (baseClass: string = '') => {
    return language === 'தமிழ்' ? `${baseClass} tamil-text` : baseClass;
  };

  const getTamilHeadingClass = (baseClass: string = '') => {
    return language === 'தமிழ்' ? `${baseClass} tamil-heading` : baseClass;
  };

  const getTamilButtonClass = (baseClass: string = '') => {
    return language === 'தமிழ்' ? `${baseClass} tamil-button` : baseClass;
  };

  useEffect(() => {
    // Trigger animations on mount with staggered delays
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.prayer_intention) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/add/prayer-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          prayer_intention: formData.prayer_intention,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      if (data.success) {
        toast.success("Prayer request submitted successfully!");
        setSubmitted(true);
        setFormData({ name: '', email: '', prayer_intention: '' });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Prayer submission error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit prayer. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Card className="max-w-md w-full border-green-200 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-700" />
              <Sparkles className="w-6 h-6 text-green-500 absolute animate-ping" />
            </div>
            <div className="success-text">
              <h2 className={getTamilHeadingClass("text-2xl font-bold text-green-800 mb-4")}>{t('prayer.request.received.title')}</h2>
              <p className={getTamilClass("text-gray-700 mb-6")}>
                {t('prayer.request.received.message')}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl mb-6 success-details border border-green-100">
              <p className={getTamilClass("text-sm text-gray-700 italic mb-2")}>
                {t('prayer.request.received.scripture')}
              </p>
              <p className={getTamilClass("text-xs text-gray-500 mt-3")}>
                {t('prayer.request.received.note')}
              </p>
            </div>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', prayer_intention: '' });
              }}
              className={getTamilButtonClass("bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 success-button transform hover:scale-105 transition-all duration-200")}
            >
              <Heart className="mr-2 w-5 h-5" />
              {t('prayer.request.submit.another')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 px-3 sm:px-4 bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <style>{`
        /* Tamil text sizing */
        .tamil-text {
          font-size: 0.85em;
          line-height: 1.4;
        }
        
        .tamil-heading {
          font-size: 0.9em;
          line-height: 1.3;
        }
        
        .tamil-button {
          font-size: 0.8em;
          line-height: 1.2;
        }

        /* Mobile responsive improvements */
        @media (max-width: 768px) {
          .prayer-title {
            font-size: 1.875rem !important;
          }
          
          .prayer-subtitle {
            font-size: 0.875rem !important;
            line-height: 1.4 !important;
            padding: 0 0.5rem;
          }
          
          .prayer-form-header {
            padding: 0.75rem 1rem !important;
          }
          
          .prayer-form-content {
            padding: 1rem !important;
          }
          
          .prayer-form-input {
            height: 2.75rem !important;
            font-size: 0.875rem !important;
          }
          
          .prayer-form-textarea {
            font-size: 0.875rem !important;
            min-height: 6rem !important;
          }
          
          .prayer-form-label {
            font-size: 0.875rem !important;
            margin-bottom: 0.5rem !important;
            display: block;
          }
          
          .prayer-form-label.tamil {
            font-size: 0.8rem !important;
          }
          
          .prayer-submit-button {
            height: 3rem !important;
            font-size: 0.875rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .prayer-submit-button.tamil {
            font-size: 0.75rem !important;
            white-space: normal !important;
            line-height: 1.2 !important;
            padding: 0.75rem 1rem !important;
            height: auto !important;
            min-height: 3rem !important;
          }
          
          .prayer-sidebar-card {
            margin-top: 1rem;
          }
          
          .prayer-sidebar-title {
            font-size: 1rem !important;
          }
          
          .prayer-sidebar-title.tamil {
            font-size: 0.9rem !important;
          }
          
          .prayer-sidebar-text {
            font-size: 0.8rem !important;
          }
          
          .prayer-sidebar-text.tamil {
            font-size: 0.75rem !important;
          }
        }

        /* Extra small screens */
        @media (max-width: 480px) {
          .prayer-title {
            font-size: 1.5rem !important;
          }
          
          .prayer-subtitle {
            font-size: 0.8rem !important;
          }
          
          .prayer-form-input {
            height: 2.5rem !important;
            font-size: 0.8rem !important;
          }
          
          .prayer-form-textarea {
            font-size: 0.8rem !important;
            min-height: 5rem !important;
          }
          
          .prayer-form-label {
            font-size: 0.8rem !important;
          }
          
          .prayer-form-label.tamil {
            font-size: 0.75rem !important;
          }
          
          .prayer-submit-button {
            height: 2.75rem !important;
            font-size: 0.8rem !important;
            margin-top: 1rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
          
          .prayer-submit-button.tamil {
            font-size: 0.7rem !important;
            white-space: normal !important;
            line-height: 1.1 !important;
            padding: 0.5rem 0.75rem !important;
            height: auto !important;
            min-height: 2.75rem !important;
            text-align: center !important;
          }
          
          .prayer-sidebar-title {
            font-size: 0.9rem !important;
          }
          
          .prayer-sidebar-title.tamil {
            font-size: 0.85rem !important;
          }
          
          .prayer-sidebar-text {
            font-size: 0.75rem !important;
          }
          
          .prayer-sidebar-text.tamil {
            font-size: 0.7rem !important;
          }
        }

        /* Animation classes */
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-heartBeat {
          animation: heartBeat 2s ease-in-out infinite;
        }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
        .stagger-6 { animation-delay: 0.6s; }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes heartBeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Animated Header */}
        <div className={`text-center mb-8 sm:mb-12 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="relative">
              <Heart className={`w-8 h-8 sm:w-10 sm:h-10 text-green-700 ${isVisible ? 'animate-heartBeat' : ''}`} />
              <div className="floating-hearts">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 floating-heart" style={{ animationDelay: '0s' }} />
                <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-green-500 floating-heart" style={{ animationDelay: '1s' }} />
                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 floating-heart" style={{ animationDelay: '2s' }} />
              </div>
            </div>
            <h1 className={getTamilHeadingClass("prayer-title text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent")}>
              {t('prayer.request.title')}
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 animate-pulse" />
          </div>
          <p className={getTamilClass("prayer-subtitle text-gray-700 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-2")}>
            {t('prayer.request.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Animated Form */}
          <div className="lg:col-span-2">
            <Card className={`border-green-200 card-hover bg-white/80 backdrop-blur-sm ${isVisible ? 'animate-slideInLeft stagger-2' : 'opacity-0'}`}>
              <CardHeader className="prayer-form-header bg-gradient-to-r from-green-50 to-emerald-50 py-3 sm:py-6">
                <CardTitle className={getTamilHeadingClass("text-green-800 flex items-center gap-2 text-lg sm:text-xl")}>
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t('prayer.request.submit.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="prayer-form-content p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Animated Form Fields */}
                  <div className={`form-field ${isVisible ? 'animate-fadeInUp stagger-3' : 'opacity-0'}`}>
                    <Label htmlFor="name" className={getTamilClass("prayer-form-label text-green-800 font-medium")}>
                      {t('prayer.request.name')} <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('prayer.request.name')}
                      required
                      className="prayer-form-input border-green-200 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div className={`form-field ${isVisible ? 'animate-fadeInUp stagger-4' : 'opacity-0'}`}>
                    <Label htmlFor="email" className={getTamilClass("prayer-form-label text-green-800 font-medium")}>{t('prayer.request.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('prayer.request.email.placeholder')}
                      className="prayer-form-input border-green-200 focus:border-green-500 transition-colors"
                    />
                    <p className={getTamilClass("prayer-sidebar-text text-xs text-gray-500 mt-1")}>
                      {t('prayer.request.email.note')}
                    </p>
                  </div>

                  <div className={`form-field ${isVisible ? 'animate-fadeInUp stagger-5' : 'opacity-0'}`}>
                    <Label htmlFor="prayer" className={getTamilClass("prayer-form-label text-green-800 font-medium")}>
                      {t('prayer.request.intention')} <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      id="prayer_intention"
                      name="prayer_intention"
                      value={formData.prayer_intention}
                      onChange={handleChange}
                      placeholder={t('prayer.request.intention.placeholder')}
                      rows={6}
                      required
                      className="prayer-form-textarea border-green-200 focus:border-green-500 transition-colors"
                    />
                    <p className={getTamilClass("prayer-sidebar-text text-xs text-gray-500 mt-1")}>
                      {t('prayer.request.intention.note')}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className={`prayer-submit-button ${getTamilButtonClass('')} w-full font-semibold bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 transform hover:scale-105 transition-all duration-200 animate-fadeInUp`}
                  >
                    <Send className="mr-2 w-5 h-5 animate-heartBeat" />
                    {t('prayer.request.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Animated Info Sidebar */}
          <div className="prayer-sidebar-card space-y-4 sm:space-y-6">
            {/* Prayer Times */}
            <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 card-hover ${isVisible ? 'animate-slideInRight stagger-3' : 'opacity-0'}`}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                  <h4 className={getTamilHeadingClass("prayer-sidebar-title text-green-800 font-semibold")}>{t('prayer.request.daily.times')}</h4>
                </div>
                <p className={getTamilClass("prayer-sidebar-text text-gray-700 mb-3")}>
                  {t('prayer.request.daily.times.subtitle')}
                </p>
                <div className="space-y-2">
                  <div className={`flex justify-between border-l-4 border-green-300 pl-3 sm:pl-4 py-2 rounded-r-lg bg-green-50/50 hover:bg-green-50 transition-colors ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                    <span className={getTamilClass("prayer-sidebar-text")}>{t('prayer.request.morning.mass')}</span>
                    <span className="prayer-sidebar-text">{t('prayer.request.morning.6am')}</span>
                  </div>
                  <div className={`flex justify-between border-l-4 border-green-300 pl-3 sm:pl-4 py-2 rounded-r-lg bg-green-50/50 hover:bg-green-50 transition-colors ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.9s' }}>
                    <span className={getTamilClass("prayer-sidebar-text")}>{t('prayer.request.morning.mass')}</span>
                    <span className="prayer-sidebar-text">{t('prayer.request.morning.9am')}</span>
                  </div>
                  <div className={`flex justify-between border-l-4 border-green-300 pl-3 sm:pl-4 py-2 rounded-r-lg bg-green-50/50 hover:bg-green-50 transition-colors ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '1.0s' }}>
                    <span className={getTamilClass("prayer-sidebar-text")}>{t('prayer.request.evening.mass')}</span>
                    <span className="prayer-sidebar-text">{t('prayer.request.evening.6pm')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prayer to Saint Devasahayam */}
            <Card className={`border-green-200 card-hover bg-white/80 backdrop-blur-sm ${isVisible ? 'animate-slideInRight stagger-4' : 'opacity-0'}`}>
              <CardContent className="pt-4 sm:pt-6">
                <h4 className={getTamilHeadingClass("prayer-sidebar-title text-green-800 mb-3 font-semibold flex items-center gap-2")}>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('prayer.request.saint.prayer.title')}
                </h4>
                <div className="space-y-3">
                  <p className={getTamilClass("prayer-sidebar-text text-gray-700 italic")}>
                    {t('prayer.request.saint.prayer.1')}
                  </p>
                  <p className={getTamilClass("prayer-sidebar-text text-gray-700 italic")}>
                    {t('prayer.request.saint.prayer.2')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scripture */}
            <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 card-hover ${isVisible ? 'animate-slideInRight stagger-5' : 'opacity-0'}`}>
              <CardContent className="pt-4 sm:pt-6">
                <h4 className={getTamilHeadingClass("prayer-sidebar-title text-green-800 mb-3 font-semibold flex items-center gap-2")}>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('prayer.request.gods.promise')}
                </h4>
                <p className={getTamilClass("prayer-sidebar-text text-gray-700 italic leading-relaxed")}>
                  {t('prayer.request.scripture')}
                </p>
                <p className={getTamilClass("prayer-sidebar-text text-xs text-gray-600 mt-2 text-right")}>{t('prayer.request.scripture.reference')}</p>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className={`border-green-200 card-hover bg-white/80 backdrop-blur-sm ${isVisible ? 'animate-slideInRight stagger-6' : 'opacity-0'}`}>
              <CardContent className="pt-4 sm:pt-6">
                <h4 className={getTamilHeadingClass("prayer-sidebar-title text-green-800 mb-3 font-semibold")}>{t('prayer.request.need.talk')}</h4>
                <p className={getTamilClass("prayer-sidebar-text text-gray-700 mb-3 leading-relaxed")}>
                  {t('prayer.request.contact.text')}
                </p>
                <p className="text-base sm:text-lg font-semibold text-green-700 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  {t('prayer.request.phone')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
