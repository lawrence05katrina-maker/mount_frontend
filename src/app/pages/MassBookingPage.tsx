import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '../../config/apiConfig';

// ── Component ──────────────────────────────────────
export const MassBookingPage: React.FC = () => {
  const navigate    = useNavigate();
  const { t, language } = useLanguage();
  const isTamil     = language === 'தமிழ்';
  const [isVisible, setIsVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    date: '', time: '06:00',
    intentionType: 'Thanksgiving',
    intentionDescription: '',
    numberOfDays: 1,
  });

  const [errors, setErrors] = useState({
    name: '', email: '', phone: '', date: '',
    time: '', intentionDescription: '', numberOfDays: '',
  });

  const [totalAmount, setTotalAmount] = useState(150);

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    setTotalAmount(150 * formData.numberOfDays);
  }, [formData.numberOfDays]);

  // ── Helpers ────────────────────────────────────
  const getPlaceholderText = () => {
    switch (formData.intentionType) {
      case 'Thanksgiving': return t('mass.booking.placeholder.thanksgiving');
      case 'Petition':     return t('mass.booking.placeholder.petition');
      case 'Memorial':     return t('mass.booking.placeholder.memorial');
      default:             return t('mass.booking.placeholder.default');
    }
  };

  const isSundaySevenAM = () => {
    if (!formData.date || !formData.time) return false;
    return new Date(formData.date).getDay() === 0 && formData.time === '07:00';
  };

  // ── Validate ───────────────────────────────────
  const validate = () => {
    const errs = {
      name: '', email: '', phone: '', date: '',
      time: '', intentionDescription: '', numberOfDays: '',
    };

    if (!formData.name.trim())
      errs.name = 'Full name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim())
      errs.email = 'Email address is required';
    else if (!emailRegex.test(formData.email))
      errs.email = 'Please enter a valid email address';

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim())
      errs.phone = 'Phone number is required';
    else if (phoneDigits.length !== 10)
      errs.phone = 'Please enter a valid 10-digit phone number';

    if (!formData.date)
      errs.date = 'Preferred date is required';

    if (!formData.time)
      errs.time = 'Preferred time is required';

    if (!formData.intentionDescription.trim())
      errs.intentionDescription = 'Mass intention description is required';

    if (formData.numberOfDays < 1)
      errs.numberOfDays = 'Number of days must be at least 1';

    if (isSundaySevenAM()) {
      errs.date = 'Mass booking is not allowed for Sunday 7:00 AM';
      errs.time = 'Mass booking is not allowed for Sunday 7:00 AM';
    }

    setErrors(errs);
    return Object.values(errs).every(e => e === '');
  };

  // ── Submit → navigate to /payment ─────────────
  // NOTE: We do NOT call the backend here.
  // The actual API call happens in PaymentPage.tsx
  // after the user scans QR and submits UTR + screenshot.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    // Navigate to payment page with mass booking state
    navigate('/payment', {
      state: {
        amount:  totalAmount,
        purpose: 'Mass Booking',
        name:    formData.name,
        email:   formData.email,
        phone:   formData.phone,
        massDetails: {
          startDate:            formData.date,
          preferredTime:        formData.time,
          intentionType:        formData.intentionType,
          intentionDescription: formData.intentionDescription,
          numberOfDays:         formData.numberOfDays,
          totalAmount:          totalAmount,
        }
      }
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: name === 'numberOfDays' ? parseInt(value) || 1 : value }));
    if (errors[name as keyof typeof errors])
      setErrors(p => ({ ...p, [name]: '' }));
  };

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <style>{`
        .tamil-text    { font-size: 0.8em; }
        .tamil-heading { font-size: 0.75em; }
        .tamil-label   { font-size: 0.8em; }
        .tamil-button  { font-size: 0.8em; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-50px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(50px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(0.3)} 50%{opacity:1;transform:scale(1.05)} 70%{transform:scale(0.9)} 100%{opacity:1;transform:scale(1)} }
        .animate-fadeInUp    { animation: fadeInUp    0.8s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slideInRight{ animation: slideInRight 0.8s ease-out forwards; }
        .animate-scaleIn     { animation: scaleIn     0.6s ease-out forwards; }
        .animate-bounceIn    { animation: bounceIn    1s ease-out forwards; }
        .stagger-1 { animation-delay:0.1s; animation-fill-mode:both; }
        .stagger-2 { animation-delay:0.2s; animation-fill-mode:both; }
        .stagger-3 { animation-delay:0.3s; animation-fill-mode:both; }
        .stagger-4 { animation-delay:0.4s; animation-fill-mode:both; }
        .stagger-5 { animation-delay:0.5s; animation-fill-mode:both; }
        .stagger-6 { animation-delay:0.6s; animation-fill-mode:both; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .mass-timings-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:1.75rem; margin-bottom:2rem; }
        .mass-timing-card { background:#fff; border-radius:14px; padding:1.5rem; box-shadow:0 10px 30px rgba(0,0,0,0.08); border-top:4px solid #2f6b3f; }
        .mass-timing-card h3 { margin-bottom:1rem; font-size:1.15rem; color:#2f6b3f; font-weight:600; }
        .mass-timing-card ul { list-style:none; padding:0; margin:0; }
        .mass-timing-card li { display:flex; justify-content:space-between; align-items:center; padding:0.55rem 0; border-bottom:1px dashed #e2e8e2; font-size:0.9rem; }
        .mass-timing-card li:last-child { border-bottom:none; }
        .mass-timing-card li span { font-weight:500; color:#1f2937; }
        .special-days-card { grid-column:span 2; min-width:500px; }
        .special-days-description { font-size:0.9rem; color:#6b7280; margin-bottom:1rem; line-height:1.5; }
        .special-days-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:2rem; }
        @media (max-width:640px) {
          .special-days-card { grid-column:span 1; min-width:auto; }
          .special-days-grid { grid-template-columns:1fr; gap:1rem; }
          .mass-timing-card li { flex-direction:column; align-items:flex-start; gap:0.25rem; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 ${isVisible ? 'animate-fadeInUp stagger-1' : 'opacity-0'}`}>
          <h1 className={`text-4xl font-bold text-green-800 mb-4 ${isTamil ? 'tamil-heading' : ''}`}>
            {t('mass.booking.title')}
          </h1>
          <p className={`text-gray-700 max-w-2xl mx-auto ${isTamil ? 'tamil-text' : ''}`}>
            {t('mass.booking.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className={`md:col-span-2 ${isVisible ? 'animate-slideInLeft stagger-2' : 'opacity-0'}`}>
            <Card className="border-green-200 card-hover">
              <CardHeader>
                <CardTitle className={`text-green-800 ${isTamil ? 'tamil-heading' : ''}`}>
                  {t('mass.booking.details')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.fullName')} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange}
                      placeholder={isTamil ? 'முழு பெயரை உள்ளிடவும்' : 'Enter your full name'}
                      className={`mt-1 ${errors.name ? 'border-red-500' : ''}`} required />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.email')} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="email" name="email" type="email" value={formData.email}
                      onChange={handleChange} placeholder="your.email@example.com"
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`} required />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.phone')} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone}
                      onChange={handleChange} placeholder="+91 12345 67890"
                      className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`} required />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {/* Date & Time */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className={isTamil ? 'tamil-label' : ''}>
                        {t('mass.booking.date')} <span className="text-red-500">*</span>
                      </Label>
                      <Input id="date" name="date" type="date" value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`mt-1 ${errors.date ? 'border-red-500' : ''}`} required />
                      {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <Label htmlFor="time" className={isTamil ? 'tamil-label' : ''}>
                        {t('mass.booking.time')} <span className="text-red-500">*</span>
                      </Label>
                      <select id="time" name="time" value={formData.time} onChange={handleChange}
                        className={`mt-1 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          errors.time ? 'border-red-500' : 'border-input'}`} required>
                        <option value="06:00">{isTamil ? 'காலை 6:00 மணி' : '6:00 AM'}</option>
                        <option value="07:00">{isTamil ? 'காலை 7:00 மணி' : '7:00 AM'}</option>
                        <option value="09:00">{isTamil ? 'காலை 9:00 மணி' : '9:00 AM'}</option>
                        <option value="18:00">{isTamil ? 'மாலை 6:00 மணி' : '6:00 PM'}</option>
                      </select>
                      {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                    </div>
                  </div>

                  {/* Intention Type */}
                  <div>
                    <Label htmlFor="intentionType" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.intentionType')} <span className="text-red-500">*</span>
                    </Label>
                    <select id="intentionType" name="intentionType"
                      value={formData.intentionType} onChange={handleChange}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                      <option value="Thanksgiving">{t('mass.booking.thanksgiving')}</option>
                      <option value="Petition">{t('mass.booking.petition')}</option>
                      <option value="Memorial">{t('mass.booking.memorial')}</option>
                    </select>
                  </div>

                  {/* Intention Description */}
                  <div>
                    <Label htmlFor="intentionDescription" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.intentionDetails')} <span className="text-red-500">*</span>
                    </Label>
                    <Textarea id="intentionDescription" name="intentionDescription"
                      value={formData.intentionDescription} onChange={handleChange}
                      placeholder={getPlaceholderText()} rows={4}
                      className={`mt-1 ${errors.intentionDescription ? 'border-red-500' : ''}`} required />
                    {errors.intentionDescription && (
                      <p className="text-red-500 text-sm mt-1">{errors.intentionDescription}</p>
                    )}
                  </div>

                  {/* Number of Days */}
                  <div>
                    <Label htmlFor="numberOfDays" className={isTamil ? 'tamil-label' : ''}>
                      {t('mass.booking.numberOfDays')} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="numberOfDays" name="numberOfDays" type="number" min="1"
                      value={formData.numberOfDays} onChange={handleChange}
                      className={`mt-1 ${errors.numberOfDays ? 'border-red-500' : ''}`} required />
                    {errors.numberOfDays && (
                      <p className="text-red-500 text-sm mt-1">{errors.numberOfDays}</p>
                    )}
                    <p className={`text-sm text-gray-600 mt-1 ${isTamil ? 'tamil-text' : ''}`}>
                      {t('mass.booking.numberOfDaysDesc')}
                    </p>
                  </div>

                  <Button type="submit" disabled={submitting}
                    className={`w-full bg-green-700 hover:bg-green-800 text-white ${isTamil ? 'tamil-button' : ''}`}>
                    {t('mass.booking.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={`space-y-6 ${isVisible ? 'animate-slideInRight stagger-3' : 'opacity-0'}`}>
            {/* Amount Card */}
            <Card className={`border-green-200 bg-green-50 card-hover ${isVisible ? 'animate-bounceIn stagger-4' : 'opacity-0'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <IndianRupee className="w-5 h-5 text-green-700" />
                  <h4 className={`text-green-800 font-semibold ${isTamil ? 'tamil-heading' : ''}`}>
                    {t('mass.booking.amount')}
                  </h4>
                </div>
                <div className="space-y-2">
                  <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                    {t('mass.booking.pricePerMass')}
                  </p>
                  <p className={`text-sm text-gray-600 ${isTamil ? 'tamil-text' : ''}`}>
                    {isTamil ? `நாட்களின் எண்ணிக்கை: ${formData.numberOfDays}` : `Number of days: ${formData.numberOfDays}`}
                  </p>
                  <div className="border-t pt-2">
                    <p className="text-2xl text-green-700 font-bold">
                      ₹{totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className={`text-sm text-gray-600 mt-3 ${isTamil ? 'tamil-text' : ''}`}>
                  {t('mass.booking.paymentInstructions')}
                </p>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className={`border-green-200 card-hover ${isVisible ? 'animate-scaleIn stagger-5' : 'opacity-0'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-green-700" />
                  <h4 className={`text-green-800 font-semibold ${isTamil ? 'tamil-heading' : ''}`}>
                    {t('mass.booking.importantNotes')}
                  </h4>
                </div>
                <ul className={`text-sm text-gray-700 space-y-2 ${isTamil ? 'tamil-text' : ''}`}>
                  <li>• {t('mass.booking.note1')}</li>
                  <li>• {t('mass.booking.note2')}</li>
                  <li>• {t('mass.booking.note3')}</li>
                  <li>• {t('mass.booking.note4')}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mass Timings Section */}
        <div className={`mt-16 ${isVisible ? 'animate-fadeInUp stagger-6' : 'opacity-0'}`}>
          <h2 className={`text-2xl font-semibold text-gray-800 mb-8 border-l-4 border-green-600 pl-4 ${isTamil ? 'tamil-heading' : ''}`}>
            {t('mass.timings.title')}
          </h2>
          <div className="mass-timings-grid">
            <div className="mass-timing-card">
              <h3 className={isTamil ? 'tamil-heading' : ''}>{t('mass.timings.daily')}</h3>
              <ul>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.monday.thursday')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.morning')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.evening')}</span></li>
              </ul>
            </div>
            <div className="mass-timing-card">
              <h3 className={isTamil ? 'tamil-heading' : ''}>{t('mass.timings.friday')}</h3>
              <ul>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.friday.morning1')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.friday.morning2')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.friday.morning3')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.friday.evening')}</span></li>
              </ul>
            </div>
            <div className="mass-timing-card">
              <h3 className={isTamil ? 'tamil-heading' : ''}>{t('mass.timings.saturday')}</h3>
              <ul>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.saturday.morning1')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.saturday.morning2')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.saturday.morning3')}</span></li>
              </ul>
            </div>
            <div className="mass-timing-card">
              <h3 className={isTamil ? 'tamil-heading' : ''}>{t('mass.timings.sunday')}</h3>
              <ul>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.sunday.morning1')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.sunday.morning2')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.sunday.afternoon')}</span></li>
                <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.sunday.evening')}</span></li>
              </ul>
            </div>
            <div className="mass-timing-card special-days-card">
              <h3 className={isTamil ? 'tamil-heading' : ''}>{t('mass.timings.special')}</h3>
              <p className={`special-days-description ${isTamil ? 'tamil-text' : ''}`}>
                {t('mass.timings.special.desc')}
              </p>
              <div className="special-days-grid">
                <ul>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.13th')}</span></li>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.14th')}</span></li>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.15th')}</span></li>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.tuesday')}</span></li>
                </ul>
                <ul>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.wednesday')}</span></li>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.friday')}</span></li>
                  <li><span className={isTamil ? 'tamil-text' : ''}>{t('mass.timings.special.saturday')}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};