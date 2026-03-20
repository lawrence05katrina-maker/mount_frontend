import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useLanguage } from '../context/LanguageContext';
import {
  IndianRupee, CheckCircle, QrCode,
  Upload, AlertCircle, Loader2, X
} from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '../../config/apiConfig';

// ── Types ──────────────────────────────────────────
interface PaymentState {
  amount: number;
  purpose: string;
  name: string;
  email?: string;
  phone?: string;
  massDetails?: {
    startDate: string;
    preferredTime: string;
    intentionType: string;
    intentionDescription: string;
    numberOfDays: number;
    totalAmount: number;
  };
}

// ── Component ──────────────────────────────────────
export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { t, language } = useLanguage();
  const isTamil   = language === 'தமிழ்';
  const data       = location.state as PaymentState;

  const [loading, setLoading]                     = useState(false);
  const [success, setSuccess]                     = useState(false);
  const [paymentConfirmed, setPaymentConfirmed]   = useState(false);
  const [utrNumber, setUtrNumber]                 = useState('');
  const [screenshot, setScreenshot]               = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [errors, setErrors]                       = useState({ utrNumber: '', screenshot: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data?.amount) navigate('/');
  }, [data, navigate]);

  // ── File Select ────────────────────────────────
  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(p => ({ ...p, screenshot: 'Please upload a valid image file' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(p => ({ ...p, screenshot: 'File size must be less than 5MB' }));
      return;
    }

    setScreenshot(file);
    setErrors(p => ({ ...p, screenshot: '' }));
    const reader = new FileReader();
    reader.onload = e => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Validate ───────────────────────────────────
  const validate = () => {
    const errs = { utrNumber: '', screenshot: '' };
    if (!utrNumber.trim())          errs.utrNumber  = 'UTR number is required';
    else if (utrNumber.length < 12) errs.utrNumber  = 'UTR number must be at least 12 characters';
    if (!screenshot)                errs.screenshot = 'Payment screenshot is required';
    setErrors(errs);
    return !errs.utrNumber && !errs.screenshot;
  };

  // ── Submit Payment ─────────────────────────────
  const handlePaymentSubmission = async () => {
    if (!validate()) { toast.error('Please fill in all required fields'); return; }

    setLoading(true);
    try {
      const fd = new FormData();

      if (data.massDetails) {
        // ── Mass Booking fields ──────────────────
        // Backend expects: name, email, phone, preferred_date,
        // preferred_time, intention_type, intention_details,
        // number_of_days, utr_number, screenshot
        fd.append('name',              data.name);
        fd.append('email',             data.email || '');
        fd.append('phone',             data.phone || '');
        fd.append('preferred_date',    data.massDetails.startDate);
        fd.append('preferred_time',    data.massDetails.preferredTime);
        fd.append('intention_type',    data.massDetails.intentionType);
        fd.append('intention_details', data.massDetails.intentionDescription);
        fd.append('number_of_days',    String(data.massDetails.numberOfDays));
        fd.append('utr_number',        utrNumber);
        fd.append('screenshot',        screenshot!);
      } else {
        // ── Donation fields ──────────────────────
        // Backend expects: name, email, phone, amount,
        // purpose, utr_number, screenshot
        fd.append('name',        data.name);
        fd.append('email',       data.email || '');
        fd.append('phone',       data.phone || '');
        fd.append('amount',      data.amount.toString());
        fd.append('purpose',     data.purpose);
        fd.append('utr_number',  utrNumber);
        fd.append('screenshot',  screenshot!);
      }

      // ── Correct endpoint ──────────────────────
      // Mass booking: POST /api/add/mass-bookings
      // Donation:     POST /api/add/donations
      const endpoint = data.massDetails
        ? `${BASE_URL}/add/mass-bookings`
        : `${BASE_URL}/add/donations`;

      const res    = await fetch(endpoint, {
        method: 'POST',
        body:   fd,
        // NO Content-Type — browser sets multipart boundary automatically
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || `HTTP ${res.status}`);
      if (result.success) {
        setSuccess(true);
        toast.success('Payment details submitted successfully! 🙏');
      } else {
        throw new Error(result.message || 'Failed to submit payment details');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ─────────────────────────────
  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <Card className="max-w-md w-full border-green-200">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-700" />
          </div>
          <h2 className={`text-2xl font-semibold text-green-800 mb-3 ${isTamil ? 'text-xl' : ''}`}>
            {t('payment.success.title')}
          </h2>
          <p className="text-gray-700 mb-4">{t('payment.success.message')}</p>
          <div className="bg-green-50 p-4 rounded-lg mb-4 text-sm text-left border border-green-200 space-y-1">
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Amount:</strong> ₹{data.amount.toLocaleString()}</p>
            <p><strong>Purpose:</strong> {data.purpose}</p>
            {data.massDetails && (
              <>
                <p><strong>Date:</strong> {data.massDetails.startDate}</p>
                <p><strong>Time:</strong> {data.massDetails.preferredTime}</p>
                <p><strong>Days:</strong> {data.massDetails.numberOfDays}</p>
              </>
            )}
            <p><strong>UTR Number:</strong> {utrNumber}</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">{t('payment.success.confirmation')}</p>
          <Button onClick={() => navigate('/')}
            className="bg-green-700 hover:bg-green-800 text-white w-full">
            {t('payment.success.home')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // ── Main Render ────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

        {/* LEFT — Summary */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className={`text-green-800 flex items-center gap-2 ${isTamil ? 'text-lg' : ''}`}>
              <IndianRupee className="w-6 h-6" />
              {t('payment.summary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Basic Info */}
            <div className="bg-green-50 p-4 rounded-lg space-y-2 border border-green-200">
              <p className="text-sm"><strong>Name:</strong> {data?.name}</p>
              <p className="text-sm"><strong>Purpose:</strong> {data?.purpose}</p>
              <p className="text-xl font-semibold text-green-700">
                ₹{data?.amount?.toLocaleString()}
              </p>
            </div>

            {/* Mass Details */}
            {data?.massDetails && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm border border-blue-200">
                <h4 className="font-semibold text-blue-800">{t('payment.mass.details')}</h4>
                <p><strong>{t('payment.start.date')}:</strong> {data.massDetails.startDate}</p>
                <p><strong>{t('payment.time')}:</strong> {data.massDetails.preferredTime}</p>
                <p><strong>{t('payment.intention')}:</strong> {data.massDetails.intentionType}</p>
                <p><strong>{t('payment.days')}:</strong> {data.massDetails.numberOfDays}</p>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-1">
              <p>• {t('payment.security.secure')}</p>
              <p>• {t('payment.security.upi')}</p>
              <p>• {t('payment.security.verification')}</p>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — Payment */}
        <Card>
          <CardHeader>
            <CardTitle className={isTamil ? 'text-lg' : ''}>
              {t('payment.complete')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* QR Code */}
            <div className="border rounded-lg p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-6 h-6 text-green-700" />
                <span className="font-medium text-green-800">{t('payment.qr.scan')}</span>
              </div>
              <div className="flex justify-center mb-4">
                <img
                  src="/QR.jpg"
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 border-2 border-green-200 rounded-lg object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=Devasahayam@IOB@IOB&pn=Devasahayam%20Mount%20Shrine&am=${data?.amount}&cu=INR`;
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  UPI ID: <strong>Devasahayam@IOB@IOB</strong>
                </p>
                <p className="text-sm text-gray-500">{t('payment.qr.description')}</p>
                <p className="text-lg font-semibold text-green-700 mt-2">
                  {t('payment.amount')}: ₹{data?.amount?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Step 1: I've Made Payment */}
            {!paymentConfirmed ? (
              <Button onClick={() => setPaymentConfirmed(true)}
                className="w-full bg-green-700 hover:bg-green-800 text-white">
                {t('payment.made')}
              </Button>
            ) : (
              // Step 2: Confirmation Form
              <div className="space-y-4 border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 text-blue-800 font-medium">
                  <AlertCircle className="w-5 h-5" />
                  <span>{t('payment.confirmation.required')}</span>
                </div>

                {/* UTR Number */}
                <div>
                  <Label htmlFor="utrNumber" className="text-sm font-medium block mb-1">
                    {t('payment.utr.label')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="utrNumber"
                    value={utrNumber}
                    onChange={e => {
                      setUtrNumber(e.target.value);
                      if (errors.utrNumber) setErrors(p => ({ ...p, utrNumber: '' }));
                    }}
                    placeholder={t('payment.utr.placeholder')}
                    className={errors.utrNumber ? 'border-red-500' : ''}
                  />
                  {errors.utrNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.utrNumber}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{t('payment.utr.help')}</p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <Label htmlFor="screenshot" className="text-sm font-medium block mb-1">
                    {t('payment.screenshot.label')} <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      errors.screenshot
                        ? 'border-red-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}>
                    {screenshotPreview ? (
                      <div className="relative w-full h-full">
                        <img src={screenshotPreview} alt="Preview"
                          className="h-28 object-contain rounded mx-auto block mt-1" />
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setScreenshot(null);
                            setScreenshotPreview('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">{t('payment.screenshot.click')}</p>
                        <p className="text-xs text-gray-500">{t('payment.screenshot.formats')}</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} id="screenshot" type="file" accept="image/*"
                    className="hidden" onChange={handleScreenshotUpload} />
                  {errors.screenshot && (
                    <p className="text-red-500 text-xs mt-1">{errors.screenshot}</p>
                  )}
                </div>

                {/* Submit */}
                <Button onClick={handlePaymentSubmission} disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  {loading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('payment.submitting')}</>
                    : t('payment.submit.details')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};