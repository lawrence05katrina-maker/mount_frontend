import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Heart, CheckCircle, IndianRupee, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// ── Static Donation Purposes ───────────────────────
const donationPurposes = [
  { id: 1, name: 'General Donation',     description: 'General support for shrine maintenance and all activities' },
  { id: 2, name: 'Festival Celebration', description: 'Support for special festival events and worship' },
  { id: 3, name: 'Shrine Renovation',    description: 'Help maintain and improve shrine facilities' },
  { id: 4, name: 'Charitable Works',     description: 'Support for charitable activities and community services' },
  { id: 5, name: 'Education Fund',       description: 'Support for education and youth programs' },
  { id: 6, name: 'Charity Work',         description: 'Community charity and outreach programs' },
];

// ── Component ──────────────────────────────────────
export const DonationsPage: React.FC = () => {
  const navigate     = useNavigate();
  const { language, t } = useLanguage();
  const isTamil      = language === 'தமிழ்';
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData]   = useState({
    donorName: '', email: '', phone: '',
    amount: '', customAmount: '', purpose: '',
  });

  const predefinedAmounts = [100, 500, 1000, 2000, 5000, 10000];

  // Tamil helpers
  const getTamilClass       = (b = '') => isTamil ? `${b} tamil-text`    : b;
  const getTamilHeadingClass = (b = '') => isTamil ? `${b} tamil-heading` : b;
  const getTamilButtonClass  = (b = '') => isTamil ? `${b} tamil-button`  : b;
  const getTamilLabelClass   = (b = '') => isTamil ? `${b} tamil-label`   : b;

  useEffect(() => { setTimeout(() => setIsVisible(true), 100); }, []);

  // ── Submit → navigate to /payment ─────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = formData.amount === 'custom'
      ? parseFloat(formData.customAmount)
      : parseFloat(formData.amount);

    if (!formData.donorName.trim()) { toast.error('Please enter your name'); return; }
    if (!formData.purpose)          { toast.error('Please select a donation purpose'); return; }
    if (!finalAmount || finalAmount <= 0) { toast.error('Please select or enter a valid amount'); return; }

    navigate('/payment', {
      state: {
        name:    formData.donorName,
        email:   formData.email,
        phone:   formData.phone,
        amount:  finalAmount,
        purpose: formData.purpose,
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAmountSelect = (amount: number | 'custom') => {
    setFormData(p => ({
      ...p,
      amount:       amount.toString(),
      customAmount: amount === 'custom' ? p.customAmount : '',
    }));
  };

  // ── Render ─────────────────────────────────────
  return (
    <div className="min-h-screen py-8 sm:py-16 px-3 sm:px-4 pb-4 bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <style>{`
        .tamil-text    { font-size: 0.85em; line-height: 1.4; }
        .tamil-heading { font-size: 0.9em;  line-height: 1.3; }
        .tamil-button  { font-size: 0.8em;  line-height: 1.2; }
        .tamil-label   { font-size: 0.85em; line-height: 1.3; }
        @media (max-width: 768px) {
          .donation-title    { font-size: 1.875rem !important; }
          .donation-subtitle { font-size: 0.875rem !important; }
          .amount-grid       { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
          .amount-button-mobile { padding: 0.75rem 0.5rem !important; font-size: 0.75rem !important; min-height: 2.75rem !important; }
          .form-input-mobile    { height: 2.75rem !important; font-size: 0.875rem !important; }
          .form-label-mobile    { font-size: 0.875rem !important; margin-bottom: 0.5rem !important; }
          .submit-button-mobile { height: 3rem !important; font-size: 0.875rem !important; }
        }
        @media (max-width: 480px) {
          .donation-title { font-size: 1.5rem !important; }
          .amount-button-mobile { padding: 0.625rem 0.375rem !important; font-size: 0.7rem !important; }
          .form-input-mobile    { height: 2.5rem !important; font-size: 0.8rem !important; }
        }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-50px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(50px);  } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        .animate-fadeInUp    { animation: fadeInUp    0.8s ease-out forwards; }
        .animate-slideInLeft { animation: slideInLeft 0.8s ease-out forwards; }
        .animate-slideInRight{ animation: slideInRight 0.8s ease-out forwards; }
        .animate-scaleIn     { animation: scaleIn     0.6s ease-out forwards; }
        .stagger-2 { animation-delay: 0.2s; animation-fill-mode: both; }
        .stagger-3 { animation-delay: 0.3s; animation-fill-mode: both; }
        .stagger-4 { animation-delay: 0.4s; animation-fill-mode: both; }
        .stagger-5 { animation-delay: 0.5s; animation-fill-mode: both; }
        .stagger-6 { animation-delay: 0.6s; animation-fill-mode: both; }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-10 h-10 text-green-700" />
            <h1 className={getTamilHeadingClass('donation-title text-2xl sm:text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent')}>
              {t('donations.title')}
            </h1>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 animate-pulse" />
          </div>
          <p className={getTamilClass('donation-subtitle text-gray-700 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-2')}>
            {t('donations.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className={`border-green-200 bg-white/80 backdrop-blur-sm ${isVisible ? 'animate-slideInLeft stagger-2' : 'opacity-0'}`}>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 py-3 sm:py-6">
                <CardTitle className={getTamilHeadingClass('text-green-800 flex items-center gap-2 text-lg sm:text-xl')}>
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                  {t('donations.details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Name */}
                  <div className={isVisible ? 'animate-fadeInUp stagger-3' : 'opacity-0'}>
                    <Label htmlFor="donorName" className={getTamilLabelClass('form-label-mobile text-green-800 font-medium block mb-2')}>
                      {t('donations.fullName')} <span className="text-red-500">*</span>
                    </Label>
                    <Input id="donorName" name="donorName" value={formData.donorName}
                      onChange={handleChange} placeholder="Enter your name" required
                      className="form-input-mobile border-green-200 focus:border-green-500" />
                  </div>

                  {/* Email */}
                  <div className={isVisible ? 'animate-fadeInUp stagger-4' : 'opacity-0'}>
                    <Label htmlFor="email" className={getTamilLabelClass('form-label-mobile text-green-800 font-medium block mb-2')}>
                      {t('donations.email')}
                    </Label>
                    <Input id="email" name="email" type="email" value={formData.email}
                      onChange={handleChange} placeholder="your.email@example.com"
                      className="form-input-mobile border-green-200 focus:border-green-500" />
                  </div>

                  {/* Phone */}
                  <div className={isVisible ? 'animate-fadeInUp stagger-5' : 'opacity-0'}>
                    <Label htmlFor="phone" className={getTamilLabelClass('form-label-mobile text-green-800 font-medium block mb-2')}>
                      {t('donations.phone')}
                    </Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone}
                      onChange={handleChange} placeholder="+91 89037 60869"
                      className="form-input-mobile border-green-200 focus:border-green-500" />
                  </div>

                  {/* Purpose */}
                  <div className={isVisible ? 'animate-fadeInUp stagger-6' : 'opacity-0'}>
                    <Label htmlFor="purpose" className={getTamilLabelClass('form-label-mobile text-green-800 font-medium block mb-2')}>
                      Donation Purpose <span className="text-red-500">*</span>
                    </Label>
                    <select id="purpose" name="purpose" value={formData.purpose}
                      onChange={handleChange} required
                      className={getTamilClass('form-input-mobile flex w-full rounded-md border border-green-200 bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:border-green-500')}>
                      <option value="">{t('donations.purpose')}</option>
                      {donationPurposes.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount Selection */}
                  <div className={isVisible ? 'animate-scaleIn stagger-6' : 'opacity-0'}>
                    <Label className={getTamilLabelClass('text-green-800 font-medium text-lg mb-4 block')}>
                      {t('donations.amount')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="amount-grid grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                      {predefinedAmounts.map(amount => (
                        <Button key={amount} type="button"
                          variant={formData.amount === amount.toString() ? 'default' : 'outline'}
                          onClick={() => handleAmountSelect(amount)}
                          className={`amount-button-mobile ${getTamilButtonClass('')} font-semibold relative ${
                            formData.amount === amount.toString()
                              ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white border-green-700'
                              : 'border-green-200 hover:border-green-500 hover:bg-green-50'
                          }`}>
                          <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="truncate">{amount.toLocaleString()}</span>
                        </Button>
                      ))}
                    </div>
                    <Button type="button"
                      variant={formData.amount === 'custom' ? 'default' : 'outline'}
                      onClick={() => handleAmountSelect('custom')}
                      className={`amount-button-mobile ${getTamilButtonClass('')} w-full mt-3 sm:mt-4 font-semibold relative ${
                        formData.amount === 'custom'
                          ? 'bg-gradient-to-r from-green-700 to-emerald-700 text-white border-green-700'
                          : 'border-green-200 hover:border-green-500 hover:bg-green-50'
                      }`}>
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {t('donations.custom')}
                    </Button>
                  </div>

                  {/* Custom Amount */}
                  {formData.amount === 'custom' && (
                    <div className="animate-fadeInUp">
                      <Label htmlFor="customAmount" className={getTamilLabelClass('form-label-mobile text-green-800 font-medium block mb-2')}>
                        Enter Custom Amount (₹) <span className="text-red-500">*</span>
                      </Label>
                      <Input id="customAmount" name="customAmount" type="number" min="1"
                        value={formData.customAmount} onChange={handleChange}
                        placeholder="Enter amount" required
                        className="form-input-mobile border-green-200 focus:border-green-500" />
                    </div>
                  )}

                  {/* Submit */}
                  <Button type="submit"
                    className={`submit-button-mobile ${getTamilButtonClass('')} w-full font-semibold bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 transform hover:scale-105 transition-all duration-200`}>
                    <Heart className="mr-2 w-5 h-5" />
                    {t('donations.proceed')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How Donation Helps */}
            <Card className={`border-green-200 bg-white/80 ${isVisible ? 'animate-slideInRight stagger-3' : 'opacity-0'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="w-6 h-6 text-green-700" />
                  <h4 className={getTamilHeadingClass('text-green-800 font-semibold text-lg')}>{t('donations.help.title')}</h4>
                </div>
                <div className="space-y-4">
                  {donationPurposes.slice(0, 4).map((purpose, index) => (
                    <div key={purpose.id}
                      className={`border-l-4 border-green-300 pl-4 py-2 rounded-r-lg bg-green-50/50 hover:bg-green-50 transition-colors ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}>
                      <p className={getTamilClass('text-sm text-gray-800 font-medium')}>{purpose.name}</p>
                      <p className={getTamilClass('text-xs text-gray-600 mt-1')}>{purpose.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tax Benefits */}
            <Card className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 ${isVisible ? 'animate-slideInRight stagger-4' : 'opacity-0'}`}>
              <CardContent className="pt-6">
                <h4 className={getTamilHeadingClass('text-green-800 mb-3 font-semibold flex items-center gap-2')}>
                  <Sparkles className="w-5 h-5" /> {t('donations.tax.title')}
                </h4>
                <p className={getTamilClass('text-sm text-gray-700 leading-relaxed')}>
                  {t('donations.tax.description')}
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className={`border-green-200 bg-white/80 ${isVisible ? 'animate-slideInRight stagger-5' : 'opacity-0'}`}>
              <CardContent className="pt-6">
                <h4 className={getTamilHeadingClass('text-green-800 mb-3 font-semibold')}>{t('donations.need.help')}</h4>
                <p className={getTamilClass('text-sm text-gray-700 mb-3')}>{t('donations.contact')}</p>
                <p className={getTamilClass('text-lg font-semibold text-green-700 flex items-center gap-2')}>
                  <Heart className="w-4 h-4" /> +91 89037 60869
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};