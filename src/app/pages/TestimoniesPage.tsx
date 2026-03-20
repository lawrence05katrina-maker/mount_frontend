import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageCircle, Send, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import { BASE_URL } from '../../config/apiConfig';

interface Testimony {
  id: number;
  name: string;
  testimony: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
  created_at?: string;
}

export const TestimoniesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', testimony: '' });

  const getTamilClass = (baseClass: string = '') =>
    language === 'தமிழ்' ? `${baseClass} tamil-text` : baseClass;
  const getTamilHeadingClass = (baseClass: string = '') =>
    language === 'தமிழ்' ? `${baseClass} tamil-heading` : baseClass;
  const getTamilButtonClass = (baseClass: string = '') =>
    language === 'தமிழ்' ? `${baseClass} tamil-button` : baseClass;

  useEffect(() => { setIsVisible(true); }, []);

  // ── FETCH approved testimonies ─────────────────────
  const fetchApprovedTestimonies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/bind/testimonies`);
      if (res.data.success) {
        setTestimonies(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load testimonies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApprovedTestimonies(); }, []);

  // ── SUBMIT testimony ───────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.testimony) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${BASE_URL}/add/testimonies`, formData);
      if (res.data.success) {
        toast.success('Testimony submitted for review!');
        setSubmitted(true);
      } else {
        toast.error(res.data.message || 'Failed to submit');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── SUBMITTED success screen ───────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-green-50">
        <Card className="max-w-md w-full border-green-200 card-hover animate-scaleIn">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-float">
              <CheckCircle className="w-10 h-10 text-green-700" />
            </div>
            <h2 className="text-green-800 mb-4">Thank You!</h2>
            <p className="text-gray-700 mb-6">
              Your testimony has been submitted and is awaiting admin approval.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => { setSubmitted(false); setShowForm(false); setFormData({ name: '', testimony: '' }); fetchApprovedTestimonies(); }}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                View Testimonies
              </Button>
              <Button
                variant="outline"
                onClick={() => { setSubmitted(false); setFormData({ name: '', testimony: '' }); }}
                className="w-full border-green-700 text-green-700"
              >
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-16 px-3 sm:px-4 bg-gray-50">
      <style>{`
        .tamil-text { font-size: 0.85em; line-height: 1.4; }
        .tamil-heading { font-size: 0.85em; line-height: 1.3; }
        .tamil-button { font-size: 0.85em; line-height: 1.2; }
        @media (max-width: 768px) {
          .testimonies-title { font-size: 1.875rem !important; }
          .testimonies-subtitle { font-size: 0.875rem !important; line-height: 1.4 !important; padding: 0 0.5rem; }
          .testimonies-share-button { font-size: 0.875rem !important; padding: 0.75rem 1rem !important; height: auto !important; min-height: 2.75rem !important; white-space: normal !important; line-height: 1.2 !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .testimonies-form-input { height: 2.75rem !important; font-size: 0.875rem !important; }
          .testimonies-form-textarea { font-size: 0.875rem !important; min-height: 6rem !important; }
          .testimonies-form-label { font-size: 0.875rem !important; margin-bottom: 0.5rem !important; }
          .testimonies-submit-button { height: 2.75rem !important; font-size: 0.875rem !important; white-space: normal !important; line-height: 1.2 !important; }
        }
        @media (max-width: 480px) {
          .testimonies-title { font-size: 1.5rem !important; }
          .testimonies-subtitle { font-size: 0.8rem !important; }
          .testimonies-share-button { font-size: 0.8rem !important; padding: 0.625rem 0.75rem !important; min-height: 2.5rem !important; }
          .testimonies-form-input { height: 2.5rem !important; font-size: 0.8rem !important; }
          .testimonies-form-textarea { font-size: 0.8rem !important; min-height: 5rem !important; }
          .testimonies-submit-button { height: 2.5rem !important; font-size: 0.8rem !important; }
        }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-slideInUp { animation: slideInUp 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .stagger-1 { animation-delay: 0.1s; } .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; } .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; } .stagger-6 { animation-delay: 0.6s; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <div className={`inline-flex items-center gap-2 mb-4 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 animate-float" />
            <h1 className={getTamilHeadingClass("testimonies-title text-2xl sm:text-4xl text-green-800")}>
              {t('testimonies.title')}
            </h1>
          </div>
          <p className={getTamilClass(`testimonies-subtitle text-gray-700 mb-4 sm:mb-6 max-w-2xl mx-auto ${isVisible ? 'animate-fadeInUp stagger-2' : 'opacity-0'}`)}>
            {t('testimonies.subtitle')}
          </p>
          <div className={`flex justify-center ${isVisible ? 'animate-scaleIn stagger-3' : 'opacity-0'}`}>
            <Button
              onClick={() => setShowForm(true)}
              className={`testimonies-share-button ${getTamilButtonClass('')} bg-green-700 hover:bg-green-800`}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t('testimonies.share.title')}
            </Button>
          </div>
        </div>

        {/* SUBMISSION FORM */}
        {showForm && (
          <div className="mb-12">
            <Card className="max-w-2xl mx-auto border-green-200 animate-slideInUp">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {t('testimonies.share.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="testimonies-form-label">Your Name</Label>
                    <Input
                      id="name" name="name" type="text"
                      value={formData.name} onChange={handleChange}
                      placeholder="Enter your full name"
                      className="testimonies-form-input mt-1" required
                    />
                  </div>
                  <div>
                    <Label htmlFor="testimony" className="testimonies-form-label">Your Testimony</Label>
                    <Textarea
                      id="testimony" name="testimony"
                      value={formData.testimony} onChange={handleChange}
                      placeholder="Share your miracle, answered prayer, or spiritual experience..."
                      className="testimonies-form-textarea mt-1" required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit" disabled={isSubmitting}
                      className="testimonies-submit-button bg-green-700 hover:bg-green-800 flex-1"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Testimony'}
                    </Button>
                    <Button
                      type="button" variant="outline"
                      onClick={() => { setShowForm(false); setFormData({ name: '', testimony: '' }); }}
                      className="border-green-700 text-green-700 hover:bg-green-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TESTIMONIES LIST */}
        {loading ? (
          <div className={`text-center py-12 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4" />
            <p className={getTamilClass("text-gray-600")}>{t('testimonies.loading')}</p>
          </div>
        ) : testimonies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonies.map((testimony, index) => (
              <Card key={testimony.id} className={`border-green-200 card-hover ${isVisible ? `animate-scaleIn stagger-${(index % 6) + 1}` : 'opacity-0'}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                      <Star className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-gray-800">{testimony.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(testimony.date || testimony.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">"{testimony.testimony}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
            <Card className="max-w-md mx-auto border-green-200 card-hover">
              <CardContent className="pt-6">
                <MessageCircle className="w-12 h-12 text-green-700 mx-auto mb-4 animate-float" />
                <p className="text-gray-600 mb-3">No testimonies yet. Be the first to share!</p>
                <Button onClick={() => setShowForm(true)} className="bg-green-700 hover:bg-green-800">
                  {t('testimonies.share.button')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};