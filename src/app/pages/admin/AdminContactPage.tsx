import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  History,
  BarChart3,
  Facebook,
  Youtube,
  Instagram,
  Plane,
  Train,
  Car
} from 'lucide-react';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export const AdminContactPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [formData, setFormData] = useState({
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    map_lat: 8.3185,
    map_lng: 77.5508,
    office_hours: {
      weekdays: {
        monday_to_saturday: '',
        sunday: ''
      },
      phone_availability: ''
    },
    mass_timings: {
      daily_masses: ['', '', ''],
      special_occasions: {
        feast_day: '',
        sundays: ''
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
        nearest_airport: '',
        distance: '',
        transport: ''
      },
      by_train: {
        nearest_station: '',
        distance: '',
        transport: ''
      },
      by_road: {
        connectivity: '',
        private_transport: ''
      }
    }
  });

  useEffect(() => {
    loadContactInfo();
    loadStats();
  }, []);
  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const response = await ContactApi.getContactInfo();
      
      if (response.success && response.data) {
        setContactInfo(response.data);
        setFormData({
          contact_phone: response.data.contact_phone || '',
          contact_email: response.data.contact_email || '',
          contact_address: response.data.contact_address || '',
          map_lat: response.data.map_lat || 0,
          map_lng: response.data.map_lng || 0,
          office_hours: response.data.office_hours || {
            weekdays: { monday_to_saturday: '', sunday: '' },
            phone_availability: ''
          },
          mass_timings: response.data.mass_timings || {
            daily_masses: ['', '', ''],
            special_occasions: { feast_day: '', sundays: '' }
          },
          social_media: response.data.social_media || {
            website: 'https://www.devasahayammountshrine.com',
            facebook: 'https://www.facebook.com/saintdevasahayam', 
            youtube: 'https://youtube.com/@st.devasahayamshrine', 
            instagram: 'https://www.instagram.com/st.devasahayamshrine/'
          },
          transportation_info: response.data.transportation_info || {
            by_air: { nearest_airport: '', distance: '', transport: '' },
            by_train: { nearest_station: '', distance: '', transport: '' },
            by_road: { connectivity: '', private_transport: '' }
          }
        });
      } else {
        toast.error('Failed to load contact information');
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
      toast.error('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ContactApi.getContactStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await ContactApi.updateContactInfo(formData);
      
      if (response.success) {
        toast.success('Contact information updated successfully');
        loadContactInfo();
        loadStats();
      } else {
        toast.error(response.message || 'Failed to update contact information');
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center gap-3 text-green-700">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg font-medium">Loading contact information...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-green-800 mb-2">Contact Management</h1>
            <p className="text-gray-600">Manage shrine contact information and details</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <History className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-lg text-gray-800">
                  {stats.last_updated ? new Date(stats.last_updated).toLocaleDateString() : 'Never'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Contact information</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Completeness</p>
                  <BarChart3 className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-lg text-gray-800">
                  {Math.round(Object.values(stats).filter(v => v === true).length / 8 * 100)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Information filled</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Contact Methods</p>
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-lg text-gray-800">
                  {[stats.has_phone, stats.has_email].filter(Boolean).length}/2
                </p>
                <p className="text-xs text-gray-500 mt-1">Available methods</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Social Media</p>
                  <AlertCircle className="w-5 h-5 text-green-700" />
                </div>
                <p className="text-lg text-gray-800">
                  {stats.has_social_media ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Social presence</p>
              </CardContent>
            </Card>
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Contact Information */}
          <div className="space-y-6">
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-green-800">Basic Contact Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+91 89037 60869"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="devasahayammountshrine@gmail.com"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.contact_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_address: e.target.value }))}
                      placeholder="Devasahayam Mount Church, Devasahayam Mount, Aralvaimozhi, Kanyakumari District, Tamil Nadu 629302, India"
                      rows={3}
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="0.000001"
                        value={formData.map_lat}
                        onChange={(e) => setFormData(prev => ({ ...prev, map_lat: parseFloat(e.target.value) || 0 }))}
                        placeholder="8.3185"
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="0.000001"
                        value={formData.map_lng}
                        onChange={(e) => setFormData(prev => ({ ...prev, map_lng: parseFloat(e.target.value) || 0 }))}
                        placeholder="77.5508"
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Office Hours */}
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-green-800">Office & Shrine Hours</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Monday to Saturday</Label>
                    <Input
                      value={formData.office_hours.weekdays.monday_to_saturday}
                      onChange={(e) => updateFormData('office_hours.weekdays.monday_to_saturday', e.target.value)}
                      placeholder="5:00 AM - 9:00 PM"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Sunday</Label>
                    <Input
                      value={formData.office_hours.weekdays.sunday}
                      onChange={(e) => updateFormData('office_hours.weekdays.sunday', e.target.value)}
                      placeholder="5:00 AM - 10:00 PM"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Phone Availability</Label>
                    <Input
                      value={formData.office_hours.phone_availability}
                      onChange={(e) => updateFormData('office_hours.phone_availability', e.target.value)}
                      placeholder="8:00 AM - 8:00 PM"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Social Media */}
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-green-800">Social Media</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Website URL</Label>
                    <Input
                      value={formData.social_media.website}
                      onChange={(e) => updateFormData('social_media.website', e.target.value)}
                      placeholder="https://www.devasahayammountshrine.com"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Facebook URL</Label>
                    <Input
                      value={formData.social_media.facebook}
                      onChange={(e) => updateFormData('social_media.facebook', e.target.value)}
                      placeholder="https://www.facebook.com/saintdevasahayam"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>YouTube URL</Label>
                    <Input
                      value={formData.social_media.youtube}
                      onChange={(e) => updateFormData('social_media.youtube', e.target.value)}
                      placeholder="https://youtube.com/@st.devasahayamshrine"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      value={formData.social_media.instagram}
                      onChange={(e) => updateFormData('social_media.instagram', e.target.value)}
                      placeholder="https://www.instagram.com/st.devasahayamshrine/"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Mass Timings & Transportation */}
          <div className="space-y-6">
            {/* Mass Timings */}
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-green-800">Mass Timings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Daily Mass Times (separate with commas)</Label>
                    <Input
                      value={formData.mass_timings.daily_masses.join(', ')}
                      onChange={(e) => updateFormData('mass_timings.daily_masses', e.target.value.split(', '))}
                      placeholder="6:00 AM, 9:00 AM, 6:00 PM"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Feast Day Special</Label>
                    <Input
                      value={formData.mass_timings.special_occasions.feast_day}
                      onChange={(e) => updateFormData('mass_timings.special_occasions.feast_day', e.target.value)}
                      placeholder="Special masses throughout the day"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>

                  <div>
                    <Label>Sunday Special</Label>
                    <Input
                      value={formData.mass_timings.special_occasions.sundays}
                      onChange={(e) => updateFormData('mass_timings.special_occasions.sundays', e.target.value)}
                      placeholder="Additional evening mass at 7:30 PM"
                      className="border-green-200 focus:border-green-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Transportation */}
            <Card className="border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-green-800">Transportation Information</h3>
                </div>

                <div className="space-y-6">
                  {/* By Air */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-green-600" />
                      <Label className="text-green-700 font-medium">By Air</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pl-6">
                      <Input
                        value={formData.transportation_info.by_air.nearest_airport}
                        onChange={(e) => updateFormData('transportation_info.by_air.nearest_airport', e.target.value)}
                        placeholder="Trivandrum International Airport"
                        className="border-green-200 focus:border-green-400"
                      />
                      <Input
                        value={formData.transportation_info.by_air.distance}
                        onChange={(e) => updateFormData('transportation_info.by_air.distance', e.target.value)}
                        placeholder="approximately 50 km"
                        className="border-green-200 focus:border-green-400"
                      />
                      <Input
                        value={formData.transportation_info.by_air.transport}
                        onChange={(e) => updateFormData('transportation_info.by_air.transport', e.target.value)}
                        placeholder="Taxis and buses available from airport"
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                  {/* By Train */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4 text-green-600" />
                      <Label className="text-green-700 font-medium">By Train</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pl-6">
                      <Input
                        value={formData.transportation_info.by_train.nearest_station}
                        onChange={(e) => updateFormData('transportation_info.by_train.nearest_station', e.target.value)}
                        placeholder="Nagercoil Junction"
                        className="border-green-200 focus:border-green-400"
                      />
                      <Input
                        value={formData.transportation_info.by_train.distance}
                        onChange={(e) => updateFormData('transportation_info.by_train.distance', e.target.value)}
                        placeholder="approximately 15 km"
                        className="border-green-200 focus:border-green-400"
                      />
                      <Input
                        value={formData.transportation_info.by_train.transport}
                        onChange={(e) => updateFormData('transportation_info.by_train.transport', e.target.value)}
                        placeholder="Local transportation readily available"
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>

                  {/* By Road */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-green-600" />
                      <Label className="text-green-700 font-medium">By Road</Label>
                    </div>
                    <div className="grid grid-cols-1 gap-3 pl-6">
                      <Input
                        value={formData.transportation_info.by_road.connectivity}
                        onChange={(e) => updateFormData('transportation_info.by_road.connectivity', e.target.value)}
                        placeholder="Well-connected by state and private buses"
                        className="border-green-200 focus:border-green-400"
                      />
                      <Input
                        value={formData.transportation_info.by_road.private_transport}
                        onChange={(e) => updateFormData('transportation_info.by_road.private_transport', e.target.value)}
                        placeholder="Private vehicles and taxis can easily reach the shrine"
                        className="border-green-200 focus:border-green-400"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
