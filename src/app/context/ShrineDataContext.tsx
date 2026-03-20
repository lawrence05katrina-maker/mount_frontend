import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Donation {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  date: string;
  email?: string;
  phone?: string;
}

export interface MassBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  intention: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  prayer: string;
  created_at: string;
}

export interface Testimony {
  id: string;
  name: string;
  testimony: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  category: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DonationPurpose {
  id: string;
  name: string;
  description: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutShort: string;
  aboutHistory: string;
  vision: string;
  mission: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  mapLat: number;
  mapLng: number;
  youtubeStreamUrl: string;
  massBookingAmount: number;
  websiteUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
}

interface ShrineDataContextType {
  // Data
  donations: Donation[];
  massBookings: MassBooking[];
  prayerRequests: PrayerRequest[];
  testimonies: Testimony[];
  gallery: GalleryItem[];
  announcements: Announcement[];
  donationPurposes: DonationPurpose[];
  siteContent: SiteContent;
  
  // Actions
  addDonation: (donation: Omit<Donation, 'id' | 'date'>) => void;
  addMassBooking: (booking: Omit<MassBooking, 'id' | 'status' | 'submittedAt'>) => void;
  updateMassBookingStatus: (id: string, status: 'approved' | 'rejected') => void;
  addPrayerRequest: (request: Omit<PrayerRequest, 'id' | 'created_at'>) => void;
  addTestimony: (testimony: Omit<Testimony, 'id' | 'date' | 'status'>) => void;
  updateTestimonyStatus: (id: string, status: 'approved' | 'rejected') => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'date'>) => void;
  deleteGalleryItem: (id: string) => void;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  addDonationPurpose: (purpose: Omit<DonationPurpose, 'id'>) => void;
  deleteDonationPurpose: (id: string) => void;
  updateSiteContent: (content: Partial<SiteContent>) => void;
}

const ShrineDataContext = createContext<ShrineDataContextType | undefined>(undefined);

// Initial data
const initialSiteContent: SiteContent = {
  heroTitle: 'Martyr St.Devashayam Shrine',
  heroSubtitle: 'A Sacred Place of Prayer and Pilgrimage',
  aboutShort: 'Welcome to Martyr St.Devashayam Shrine, a blessed sanctuary dedicated to Saint Devasahayam , the first Indian layman to be canonized by the Catholic Church.',
  aboutHistory: 'The Martyr St.Devashayam Shrine stands as a testament to faith and devotion. Saint Devasahayam , martyred in 1752 for his unwavering faith, was canonized by Pope Francis in 2022. This shrine honors his legacy and welcomes pilgrims from around the world seeking spiritual solace and divine blessings.',
  vision: 'To be a beacon of faith, hope, and love, inspiring believers to follow the path of Saint Devasahayam through devotion, service, and sacrifice.',
  mission: 'Our mission is to provide a sacred space for worship, prayer, and spiritual growth while serving the community through charitable works and spreading the message of Christ.',
  contactAddress: 'Mount Devasahayam, Pilgrimage Road, Tamil Nadu, India',
  contactPhone: '+91 89037 60869',
  contactEmail: 'info@devasahayammountshrine.com',
  mapLat: 8.4855,
  mapLng: 77.5145,
  youtubeStreamUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
  massBookingAmount: 500,
  websiteUrl: 'https://www.devasahayammountshrine.com',
  facebookUrl: 'https://www.facebook.com/saintdevasahayam',
  youtubeUrl: 'https://youtube.com/@st.devasahayamshrine',
  instagramUrl: 'https://www.instagram.com/st.devasahayamshrine/',
};

const initialDonationPurposes: DonationPurpose[] = [
  { id: '1', name: 'donations.purpose.general', description: 'donations.help.general' },
  { id: '2', name: 'donations.purpose.festival', description: 'donations.help.festival' },
  { id: '3', name: 'donations.purpose.renovation', description: 'donations.help.renovation' },
  { id: '4', name: 'donations.purpose.charity', description: 'donations.help.charity' },
  { id: '5', name: 'donations.purpose.education', description: 'donations.help.education' },
];

const initialAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'announcements.feast.title',
    content: 'announcements.feast.content',
    date: new Date().toISOString(),
    priority: 'high',
  },
  {
    id: '2',
    title: 'Daily Mass Timings',
    content: 'Daily masses are held at 6:00 AM, 9:00 AM, and 6:00 PM. All are welcome to participate.',
    date: new Date().toISOString(),
    priority: 'medium',
  },
];

export const ShrineDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial data from localStorage or use defaults
  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('shrine_donations');
    return saved ? JSON.parse(saved) : [];
  });

  const [massBookings, setMassBookings] = useState<MassBooking[]>(() => {
    const saved = localStorage.getItem('shrine_mass_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('shrine_prayer_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [testimonies, setTestimonies] = useState<Testimony[]>(() => {
    const saved = localStorage.getItem('shrine_testimonies');
    return saved ? JSON.parse(saved) : [];
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('shrine_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('shrine_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [donationPurposes, setDonationPurposes] = useState<DonationPurpose[]>(initialDonationPurposes);

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem('shrine_site_content');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Always override social URLs from defaults to prevent stale cached values
      parsed.facebookUrl = initialSiteContent.facebookUrl;
      parsed.youtubeUrl = initialSiteContent.youtubeUrl;
      parsed.instagramUrl = initialSiteContent.instagramUrl;
      parsed.websiteUrl = initialSiteContent.websiteUrl;
      localStorage.setItem('shrine_site_content', JSON.stringify(parsed));
      return parsed;
    }
    return initialSiteContent;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('shrine_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('shrine_mass_bookings', JSON.stringify(massBookings));
  }, [massBookings]);

  useEffect(() => {
    localStorage.setItem('shrine_prayer_requests', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    localStorage.setItem('shrine_testimonies', JSON.stringify(testimonies));
  }, [testimonies]);

  useEffect(() => {
    localStorage.setItem('shrine_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('shrine_announcements', JSON.stringify(announcements));
  }, [announcements]);

  // Note: donationPurposes are fetched from API, not saved to localStorage

  useEffect(() => {
    localStorage.setItem('shrine_site_content', JSON.stringify(siteContent));
  }, [siteContent]);

  // Actions
  const addDonation = (donation: Omit<Donation, 'id' | 'date'>) => {
    const newDonation: Donation = {
      ...donation,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setDonations(prev => [newDonation, ...prev]);
  };

  const addMassBooking = (booking: Omit<MassBooking, 'id' | 'status' | 'submittedAt'>) => {
    const newBooking: MassBooking = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setMassBookings(prev => [newBooking, ...prev]);
  };

  const updateMassBookingStatus = (id: string, status: 'approved' | 'rejected') => {
    setMassBookings(prev =>
      prev.map(booking =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  const addPrayerRequest = (request: Omit<PrayerRequest, 'id' | 'created_at'>) => {
    const newRequest: PrayerRequest = {
      ...request,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setPrayerRequests(prev => [newRequest, ...prev]);
  };

  const addTestimony = (testimony: Omit<Testimony, 'id' | 'date' | 'status'>) => {
    const newTestimony: Testimony = {
      ...testimony,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'pending',
    };
    setTestimonies(prev => [newTestimony, ...prev]);
  };

  const updateTestimonyStatus = (id: string, status: 'approved' | 'rejected') => {
    setTestimonies(prev =>
      prev.map(testimony =>
        testimony.id === id ? { ...testimony, status } : testimony
      )
    );
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'date'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setGallery(prev => [newItem, ...prev]);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
  };

  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const deleteAnnouncementHandler = async (id: string) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  const updateAnnouncementHandler = async (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const addDonationPurpose = (purpose: Omit<DonationPurpose, 'id'>) => {
    const newPurpose: DonationPurpose = {
      ...purpose,
      id: Date.now().toString(),
    };
    setDonationPurposes(prev => [...prev, newPurpose]);
  };

  const deleteDonationPurpose = (id: string) => {
    setDonationPurposes(prev => prev.filter(item => item.id !== id));
  };

  const updateSiteContent = (content: Partial<SiteContent>) => {
    setSiteContent(prev => ({ ...prev, ...content }));
  };

  return (
    <ShrineDataContext.Provider
      value={{
        donations,
        massBookings,
        prayerRequests,
        testimonies,
        gallery,
        announcements,
        donationPurposes,
        siteContent,
        addDonation,
        addMassBooking,
        updateMassBookingStatus,
        addPrayerRequest,
        addTestimony,
        updateTestimonyStatus,
        addGalleryItem,
        deleteGalleryItem,
        addAnnouncement,
        deleteAnnouncement: deleteAnnouncementHandler,
        updateAnnouncement: updateAnnouncementHandler,
        addDonationPurpose,
        deleteDonationPurpose,
        updateSiteContent,
      }}
    >
      {children}
    </ShrineDataContext.Provider>
  );
};

export const useShrineData = () => {
  const context = useContext(ShrineDataContext);
  if (context === undefined) {
    throw new Error('useShrineData must be used within a ShrineDataProvider');
  }
  return context;
};
