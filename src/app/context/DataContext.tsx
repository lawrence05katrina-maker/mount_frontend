import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
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

export interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  purpose: string;
  date: string;
  paymentId?: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  prayer: string;
  status: 'pending' | 'approved';
  submittedAt: string;
}

export interface Testimony {
  id: string;
  name: string;
  email: string;
  testimony: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  category: string;
  date: string;
}

export interface SiteSettings {
  massBookingAmount: number;
  donationAmounts: number[];
  donationPurposes: string[];
  liveStreamUrl: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    mapLat: number;
    mapLng: number;
  };
  aboutContent: {
    history: string;
    vision: string;
    mission: string;
  };
  homeContent: {
    heroTitle: string;
    heroSubtitle: string;
    saintIntro: string;
  };
  socialMedia: {
    website: string;
    facebook: string;
    youtube: string;
    instagram: string;
  };
}

interface DataContextType {
  // State
  announcements: Announcement[];
  massBookings: MassBooking[];
  donations: Donation[];
  prayerRequests: PrayerRequest[];
  testimonies: Testimony[];
  gallery: GalleryItem[];
  settings: SiteSettings;
  
  // Actions
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  
  addMassBooking: (booking: Omit<MassBooking, 'id' | 'status' | 'submittedAt'>) => void;
  updateMassBooking: (id: string, booking: Partial<MassBooking>) => void;
  
  addDonation: (donation: Omit<Donation, 'id'>) => void;
  
  addPrayerRequest: (request: Omit<PrayerRequest, 'id' | 'status' | 'submittedAt'>) => void;
  updatePrayerRequest: (id: string, request: Partial<PrayerRequest>) => void;
  
  addTestimony: (testimony: Omit<Testimony, 'id' | 'status' | 'submittedAt'>) => void;
  updateTestimony: (id: string, testimony: Partial<Testimony>) => void;
  
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  deleteGalleryItem: (id: string) => void;
  
  updateSettings: (settings: Partial<SiteSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: SiteSettings = {
  massBookingAmount: 500,
  donationAmounts: [500, 1000, 2000, 5000],
  donationPurposes: ['donations.purpose.general', 'donations.purpose.festival', 'donations.purpose.renovation', 'donations.purpose.charity', 'donations.purpose.poor'],
  liveStreamUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
  contactInfo: {
    address: 'Mount Devasahayam,Pilgrimage Road, Aralvaimozhi, Kanyakumari District, Tamil Nadu, India',
    phone: '+91 89037 60869',
    email: 'info@devasahayammountshrine.com',
    mapLat: 8.2424,
    mapLng: 77.5199,
  },
  aboutContent: {
    history: 'St. Devasahayam was born on April 23, 1712, in Nattalam, Kanyakumari District, India. Born into a Hindu family , he was named Neelakanta. He served as a court official in the palace of the Maharaja of Travancore. Through his friendship with a Dutch naval commander, he came to know about Christianity and was baptized on May 14, 1745, taking the name Lazarus, meaning "God is my help" (Devasahayam in Tamil).',
    vision: 'To be a beacon of faith, hope, and charity, inspiring pilgrims from around the world to deepen their relationship with God through the intercession of St. Devasahayam.',
    mission: 'Our mission is to preserve and promote the spiritual legacy of St. Devasahayam, to provide a sacred space for prayer and pilgrimage, and to serve the community through charitable works and spiritual guidance.',
  },
  homeContent: {
    heroTitle: 'Our Lady Of Sorrows Shrine',
    heroSubtitle: 'A Sacred Place of Prayer and Pilgrimage',
    saintIntro: 'St. Devasahayam was a Hindu convert to Catholicism who was martyred for his faith in 1752. He was canonized by Pope Francis on May 15, 2022, becoming the first Indian layman to be declared a saint.',
  },
  socialMedia: {
    website: 'https://www.devasahayammountshrine.com',
    facebook: 'https://www.facebook.com/saintdevasahayam',
    youtube: 'https://youtube.com/@st.devasahayamshrine',
    instagram: 'https://www.instagram.com/st.devasahayamshrine/',
  },
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [massBookings, setMassBookings] = useState<MassBooking[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedAnnouncements = localStorage.getItem('shrine_announcements');
        const storedBookings = localStorage.getItem('shrine_massBookings');
        const storedDonations = localStorage.getItem('shrine_donations');
        const storedPrayers = localStorage.getItem('shrine_prayerRequests');
        const storedTestimonies = localStorage.getItem('shrine_testimonies');
        const storedGallery = localStorage.getItem('shrine_gallery');
        const storedSettings = localStorage.getItem('shrine_settings');

        if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
        if (storedBookings) setMassBookings(JSON.parse(storedBookings));
        if (storedDonations) setDonations(JSON.parse(storedDonations));
        if (storedPrayers) setPrayerRequests(JSON.parse(storedPrayers));
        if (storedTestimonies) setTestimonies(JSON.parse(storedTestimonies));
        if (storedGallery) setGallery(JSON.parse(storedGallery));
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          // Always override social URLs from defaults to prevent stale cached values
          parsedSettings.socialMedia = { ...parsedSettings.socialMedia, ...defaultSettings.socialMedia };
          localStorage.setItem('shrine_settings', JSON.stringify(parsedSettings));
          setSettings(parsedSettings);
        }
        else {
          // Initialize with sample data
          const sampleAnnouncements: Announcement[] = [
            {
              id: '1',
              title: 'announcements.feast.title',
              content: 'announcements.feast.content',
              date: '2025-01-14',
              active: true,
            },
            {
              id: '2',
              title: 'Shrine Renovation Update',
              content: 'We are pleased to announce that the shrine renovation project is progressing well. Thank you for your continued support and prayers.',
              date: '2024-12-15',
              active: true,
            },
          ];

          const sampleGallery: GalleryItem[] = [
            {
              id: '1',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1649724541460-a93093bbd61e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRob2xpYyUyMGNodXJjaCUyMHNocmluZXxlbnwxfHx8fDE3NjYzNzg1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
              title: 'Shrine Exterior',
              category: 'Shrine',
              date: '2024-12-01',
            },
            {
              id: '2',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1685040771784-d199441f6cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWludCUyMHN0YXR1ZSUyMHByYXllcnxlbnwxfHx8fDE3NjYzNzg1ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
              title: 'St. Devasahayam Statue',
              category: 'Saint',
              date: '2024-12-01',
            },
            {
              id: '3',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1559536454-5a69386e8075?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjBpbnRlcmlvciUyMGNhbmRsZXN8ZW58MXx8fHwxNzY2Mzc4NTgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
              title: 'Prayer Candles',
              category: 'Interior',
              date: '2024-12-01',
            },
            {
              id: '4',
              type: 'image',
              url: 'https://images.unsplash.com/photo-1572008229252-6f35ba007c37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaWxncmltYWdlJTIwcmVsaWdpb3VzfGVufDF8fHx8MTc2NjM3ODU4MXww&ixlib=rb-4.1.0&q=80&w=1080',
              title: 'Pilgrimage Path',
              category: 'Pilgrimage',
              date: '2024-12-01',
            },
          ];

          const sampleTestimonies: Testimony[] = [
            {
              id: '1',
              name: 'Maria Joseph',
              email: 'maria@example.com',
              testimony: 'Through the intercession of St. Devasahayam, my son was healed from a serious illness. We are forever grateful for this miracle.',
              location: 'Chennai, India',
              status: 'approved',
              submittedAt: '2024-11-15T10:00:00Z',
            },
            {
              id: '2',
              name: 'Thomas Xavier',
              email: 'thomas@example.com',
              testimony: 'My faith has been strengthened through my pilgrimage to this holy shrine. St. Devasahayam has shown me the path to deeper prayer.',
              location: 'Mumbai, India',
              status: 'approved',
              submittedAt: '2024-10-20T14:30:00Z',
            },
          ];

          setAnnouncements(sampleAnnouncements);
          setGallery(sampleGallery);
          setTestimonies(sampleTestimonies);
          localStorage.setItem('shrine_announcements', JSON.stringify(sampleAnnouncements));
          localStorage.setItem('shrine_gallery', JSON.stringify(sampleGallery));
          localStorage.setItem('shrine_testimonies', JSON.stringify(sampleTestimonies));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shrine_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('shrine_massBookings', JSON.stringify(massBookings));
  }, [massBookings]);

  useEffect(() => {
    localStorage.setItem('shrine_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('shrine_prayerRequests', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    localStorage.setItem('shrine_testimonies', JSON.stringify(testimonies));
  }, [testimonies]);

  useEffect(() => {
    localStorage.setItem('shrine_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('shrine_settings', JSON.stringify(settings));
  }, [settings]);

  // Actions
  const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    const newAnnouncement = { ...announcement, id: Date.now().toString() };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
  };

  const updateAnnouncement = (id: string, announcement: Partial<Announcement>) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...announcement } : item))
    );
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  const addMassBooking = (booking: Omit<MassBooking, 'id' | 'status' | 'submittedAt'>) => {
    const newBooking: MassBooking = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setMassBookings((prev) => [newBooking, ...prev]);
  };

  const updateMassBooking = (id: string, booking: Partial<MassBooking>) => {
    setMassBookings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...booking } : item))
    );
  };

  const addDonation = (donation: Omit<Donation, 'id'>) => {
    const newDonation = { ...donation, id: Date.now().toString() };
    setDonations((prev) => [newDonation, ...prev]);
  };

  const addPrayerRequest = (request: Omit<PrayerRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newRequest: PrayerRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setPrayerRequests((prev) => [newRequest, ...prev]);
  };

  const updatePrayerRequest = (id: string, request: Partial<PrayerRequest>) => {
    setPrayerRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...request } : item))
    );
  };

  const addTestimony = (testimony: Omit<Testimony, 'id' | 'status' | 'submittedAt'>) => {
    const newTestimony: Testimony = {
      ...testimony,
      id: Date.now().toString(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setTestimonies((prev) => [newTestimony, ...prev]);
  };

  const updateTestimony = (id: string, testimony: Partial<Testimony>) => {
    setTestimonies((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...testimony } : item))
    );
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setGallery((prev) => [newItem, ...prev]);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <DataContext.Provider
      value={{
        announcements,
        massBookings,
        donations,
        prayerRequests,
        testimonies,
        gallery,
        settings,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addMassBooking,
        updateMassBooking,
        addDonation,
        addPrayerRequest,
        updatePrayerRequest,
        addTestimony,
        updateTestimony,
        addGalleryItem,
        deleteGalleryItem,
        updateSettings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
