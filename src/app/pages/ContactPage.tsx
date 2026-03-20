import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Phone, Mail, Clock, Navigation, Bus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../context/LanguageContext';

interface ContactInfo {
  id: number;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  map_lat: number;
  map_lng: number;
  office_hours: any;
  mass_timings: any;
  social_media: any;
  transportation_info: any;
}


const DEFAULT_CONTACT_INFO: ContactInfo = {
  id: 1,
  contact_phone: '+91 89037 60869',
  contact_email: 'devasahayammountshrine@gmail.com',
  contact_address: 'Devasahayam Mount Church, Devasahayam Mount, Aralvaimozhi, Kanyakumari District, Tamil Nadu 629302, India',
  map_lat: 8.3185,
  map_lng: 77.5508,
  office_hours: {
    weekdays: {
      monday_to_saturday: '5:00 AM - 9:00 PM',
      sunday: '5:00 AM - 10:00 PM'
    },
    phone_availability: '8:00 AM - 8:00 PM'
  },
  mass_timings: {
    daily_masses: ['6:00 AM', '9:00 AM', '6:00 PM'],
    special_occasions: {
      feast_day: 'Special masses throughout the day',
      sundays: 'Additional evening mass at 7:30 PM'
    }
  },
  social_media: {
    website: 'https://www.devasahayammountshrine.com',
    facebook: 'https://www.facebook.com/saintdevasahayam',
    youtube: 'https://youtube.com/@st.devasahayamshrine',
    instagram: 'https://www.instagram.com/st.devasahayamshrine/'
  },
  transportation_info: {
    by_air: {
      nearest_airport: 'Trivandrum International Airport',
      distance: 'approximately 50 km',
      transport: 'Taxis and buses available from airport'
    },
    by_train: {
      nearest_station: 'Nagercoil Junction',
      distance: 'approximately 15 km',
      transport: 'Local transportation readily available'
    },
    by_road: {
      connectivity: 'Well-connected by state and private buses from major cities. ',
      private_transport: 'Private vehicles and taxis can easily reach the shrine.'
    }
  }
};

export const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [contactInfo] = useState<ContactInfo>(DEFAULT_CONTACT_INFO);
  const [isVisible, setIsVisible] = useState(false);

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
    // Trigger animations on mount
    setIsVisible(true);
  }, []);

  const MAP_EMBED_URL =
    "https://www.google.com/maps?q=8.240166189309809,77.52512889748944&z=16&output=embed";

  return (
    <div className="min-h-screen py-8 sm:py-16 px-4 bg-gray-50 pb-4 sm:pb-8">

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className={getTamilHeadingClass(`text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mb-4 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`)}>{t('contact.title')}</h1>
          <p className={getTamilClass(`text-sm sm:text-base text-gray-700 max-w-2xl mx-auto px-2 ${isVisible ? 'animate-fadeInUp stagger-2' : 'opacity-0'}`)}>
            {t('contact.subtitle')}
          </p>
          {/* {loading && !dataLoaded && (
            <div className={`mt-2 text-sm text-green-600 ${isVisible ? 'animate-fadeInUp stagger-3' : 'opacity-0'}`}>Updating contact information...</div>
          )} */}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Contact Information */}
          <div className={`space-y-4 sm:space-y-6 ${isVisible ? 'animate-slideInLeft stagger-1' : 'opacity-0'}`}>
            {/* Address */}
            <Card className="border-green-200 card-hover">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 animate-float">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={getTamilHeadingClass("text-base sm:text-lg font-semibold text-green-800 mb-2")}>{t('contact.address')}</h3>
                    <p className={getTamilClass("text-sm sm:text-base text-gray-700 leading-relaxed")}>{t('contact.address.full')}</p>
                    <Button
                      variant="link"
                      className={getTamilButtonClass("text-green-700 p-0 h-auto mt-2 text-sm sm:text-base animate-pulse-custom")}
                      onClick={() => {
                        window.open(
                          "https://www.google.com/maps/dir/?api=1&destination=8.240166189309809,77.52512889748944",
                          "_blank"
                        );
                      }}
                    >
                      <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {t('contact.get.directions')}
                    </Button>

                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card className="border-green-200 card-hover">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 animate-float" style={{ animationDelay: '0.5s' }}>
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={getTamilHeadingClass("text-base sm:text-lg font-semibold text-green-800 mb-2")}>{t('contact.phone')}</h3>
                    <p className={getTamilClass("text-sm sm:text-base text-gray-700")}>{t('contact.phone.number')}</p>
                    <p className={getTamilClass("text-xs sm:text-sm text-gray-600 mt-1")}>
                      {t('contact.phone.available')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="border-green-200 card-hover">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 animate-float" style={{ animationDelay: '1s' }}>
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={getTamilHeadingClass("text-base sm:text-lg font-semibold text-green-800 mb-2")}>{t('contact.email')}</h3>
                    <p className={getTamilClass("text-sm sm:text-base text-gray-700 break-all")}>{t('contact.email.address')}</p>
                    <p className={getTamilClass("text-xs sm:text-sm text-gray-600 mt-1")}>{t('contact.email.response')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border-green-200 bg-green-50 card-hover">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-custom">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={getTamilHeadingClass("text-base sm:text-lg font-semibold text-green-800 mb-3")}>{t('contact.office.timings')}</h3>
                    <div className="space-y-2 text-gray-700 text-xs sm:text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className={getTamilClass("flex-shrink-0")}>{t('contact.monday.saturday')}</span>
                        <span className="text-right">{t('contact.monday.saturday.time')}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={getTamilClass("flex-shrink-0")}>{t('contact.sunday')}</span>
                        <span className="text-right">{t('contact.sunday.time')}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2 mt-3">
                        <p className={getTamilClass("font-medium mb-1")}>{t('contact.mass.timings')}</p>
                        <p className={getTamilClass("leading-relaxed")}>{t('contact.daily.masses')}</p>
                        <p className={getTamilClass("text-xs mt-1 leading-relaxed")}>{t('contact.additional.evening')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className={`border-green-200 card-hover ${isVisible ? 'animate-slideInRight stagger-2' : 'opacity-0'}`}>
            <CardContent className="p-0">
              <div className="h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
                <iframe
                  src={MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Our Lady Of Sorrows Shrine Location"
                />

              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Reach */}
        <Card className={`border-green-200 mb-6 lg:mb-8 card-hover ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
          <CardContent className="pt-4 sm:pt-6">
            <h3 className={getTamilHeadingClass("text-lg sm:text-xl font-semibold text-green-800 mb-4 sm:mb-6")}>{t('contact.how.to.reach')}</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className={`${isVisible ? 'animate-scaleIn stagger-2' : 'opacity-0'}`}>
                <h4 className={getTamilHeadingClass("text-sm sm:text-base font-medium text-green-700 mb-2")}>{t('contact.by.air')}</h4>
                <p className={getTamilClass("text-xs sm:text-sm text-gray-700 leading-relaxed")}>
                  {t('contact.by.air.info')}
                </p>
              </div>
              <div className={`${isVisible ? 'animate-scaleIn stagger-3' : 'opacity-0'}`}>
                <h4 className={getTamilHeadingClass("text-sm sm:text-base font-medium text-green-700 mb-2")}>{t('contact.by.train')}</h4>
                <p className={getTamilClass("text-xs sm:text-sm text-gray-700 leading-relaxed")}>
                  {t('contact.by.train.info')}
                </p>
              </div>
              <div className={`sm:col-span-2 md:col-span-1 ${isVisible ? 'animate-scaleIn stagger-4' : 'opacity-0'}`}>
                <h4 className={getTamilHeadingClass("text-sm sm:text-base font-medium text-green-700 mb-2")}>{t('contact.by.road')}</h4>
                <p className={getTamilClass("text-xs sm:text-sm text-gray-700 leading-relaxed mb-3")}>
                  {t('contact.by.road.info')}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={getTamilButtonClass("text-green-700 border-green-300 hover:bg-green-50 text-xs")}
                  onClick={() => window.location.href = '/bus-details'}
                >
                  <Bus className="w-3 h-3 mr-1" />
                  {language === 'தமிழ்' ? 'பேருந்து நேரங்கள்' : 'Bus Timings'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className={`border-green-200 card-hover ${isVisible ? 'animate-scaleIn stagger-2' : 'opacity-0'}`}>
          <CardContent className="pt-4 sm:pt-6 pb-1 sm:pb-6">
            <h3 className={getTamilHeadingClass("text-lg sm:text-xl font-semibold text-green-800 mb-3 sm:mb-4 text-center")}>{t('contact.connect.with.us')}</h3>
            <div className="flex flex-row justify-center items-center gap-6 sm:gap-8">
              <a
                href={contactInfo.social_media?.facebook || 'https://www.facebook.com/saintdevasahayam'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 sm:gap-2 p-1 sm:p-3 rounded-lg hover:bg-green-50 transition-colors group animate-float"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className={getTamilClass("hidden sm:block text-sm text-gray-700")}>{t('contact.facebook')}</span>
              </a>
              <a
                href={contactInfo.social_media?.youtube || 'https://youtube.com/@st.devasahayamshrine'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 sm:gap-2 p-1 sm:p-3 rounded-lg hover:bg-green-50 transition-colors group animate-float"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <span className={getTamilClass("hidden sm:block text-sm text-gray-700")}>{t('contact.youtube')}</span>
              </a>
              <a
                href={contactInfo.social_media?.instagram || 'https://www.instagram.com/st.devasahayamshrine/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 sm:gap-2 p-1 sm:p-3 rounded-lg hover:bg-green-50 transition-colors group animate-float"
                style={{ animationDelay: '1s' }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <span className={getTamilClass("hidden sm:block text-sm text-gray-700")}>{t('contact.instagram')}</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};