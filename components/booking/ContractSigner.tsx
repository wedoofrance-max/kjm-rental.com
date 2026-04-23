'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface ContractSignerProps {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  vehicleModel: string;
  pickupDate: string;
  returnDate: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function ContractSigner({
  bookingReference,
  customerName,
  customerEmail,
  vehicleModel,
  pickupDate,
  returnDate,
  onComplete,
  onBack,
}: ContractSignerProps) {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(customerEmail);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [idFileName, setIdFileName] = useState('');
  const [passportFileName, setPassportFileName] = useState('');
  const [signaturePath, setSignaturePath] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Fetch booking details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/bookings/details?reference=${bookingReference}`);
        const data = await res.json();
        if (data.success) {
          setBookingDetails(data.booking);
          setConfirmEmail(data.booking.customerEmail);
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [bookingReference]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'passport') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or PDF.');
      return;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 5MB.');
      return;
    }

    if (type === 'id') {
      setIdFile(file);
      setIdFileName(file.name);
    } else {
      setPassportFile(file);
      setPassportFileName(file.name);
    }

    setError('');
  };

  const startSignature = () => {
    setShowSignaturePad(true);
    // Initialize canvas after a brief delay to ensure it's mounted
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 2;
        }
      }
    }, 0);
  };

  const handleSignatureStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSignatureMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSignatureEnd = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL('image/png');
      setSignaturePath(signatureData);
      setShowSignaturePad(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    if (!confirmEmail) {
      setError('Email confirmation is required');
      return;
    }

    if (!idFile) {
      setError('Please upload a valid ID or Passport');
      return;
    }

    if (!passportFile) {
      setError('Please upload your Passport copy');
      return;
    }

    if (!signaturePath) {
      setError('Digital signature is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('bookingReference', bookingReference);
      formData.append('customerName', customerName);
      formData.append('confirmEmail', confirmEmail);
      formData.append('idDocument', idFile);
      formData.append('passportDocument', passportFile);
      formData.append('signature', signaturePath);
      formData.append('agreedAt', new Date().toISOString());

      const res = await fetch('/api/contracts/sign', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        onComplete();
      } else {
        setError(data.error || 'Failed to sign contract');
      }
    } catch (err) {
      console.error('Error signing contract:', err);
      setError('An error occurred while signing the contract');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">Rental Agreement</h2>
        <p className="text-sm text-neutral-500">
          Please review and accept the contract below to complete your booking
        </p>
      </div>

      {/* Contract Content */}
      {loadingDetails ? (
        <div className="flex items-center justify-center py-8">
          <Icon icon="ph:spinner-gap-bold" width={24} height={24} className="animate-spin text-primary-500" />
          <p className="ml-3 text-neutral-600">Loading contract details...</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 max-h-96 overflow-y-auto">
          <div className="text-sm space-y-4 text-neutral-800">
            <div>
              <h3 className="font-bold text-base mb-2">MOTORCYCLE RENTAL AGREEMENT</h3>
              <p className="text-xs text-neutral-500">KJM MOTORCYCLE RENTAL</p>
              <p className="text-xs text-neutral-500">Lo-Oc, Lapu-Lapu City, Cebu, Philippines</p>
            </div>

            <div>
              <p className="font-semibold mb-1">1. RENTER INFORMATION</p>
              <p>Full Name: <span className="font-medium">{bookingDetails?.customerName}</span></p>
              <p>Contact Number: <span className="font-medium">{bookingDetails?.customerPhone}</span></p>
              <p>Nationality: <span className="font-medium">{bookingDetails?.customerNationality || 'N/A'}</span></p>
            </div>

            <div>
              <p className="font-semibold mb-1">2. VEHICLE INFORMATION</p>
              <p>Brand & Model: <span className="font-medium">{bookingDetails?.vehicleBrand} {bookingDetails?.vehicleModel}</span></p>
              <p>Engine Displacement: <span className="font-medium">{bookingDetails?.vehicleEngine}</span></p>
              <p>Plate Number: <span className="font-medium">{bookingDetails?.vehiclePlateNumber}</span></p>
              <p>Year: <span className="font-medium">{bookingDetails?.vehicleYear}</span></p>
            </div>

            <div>
              <p className="font-semibold mb-1">3. RENTAL PERIOD</p>
              <p>Date of Reservation: <span className="font-medium">{new Date().toISOString().split('T')[0]}</span></p>
              <p>Start Date & Time: <span className="font-medium">{bookingDetails?.pickupDate} (Pickup at 9:00 AM)</span></p>
              <p>End Date & Time: <span className="font-medium">{bookingDetails?.returnDate} (Return by 5:00 PM)</span></p>
              <p>Duration: <span className="font-medium">{bookingDetails?.days} day(s)</span></p>
            </div>

            <div>
              <p className="font-semibold mb-2">4. RENTAL REQUIREMENTS & SECURITY DEPOSIT</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Passport, Driver's License, and One (1) valid ID required</li>
                <li>₱{bookingDetails?.deposit || 2500} refundable security deposit</li>
                <li>Valid Non-Professional Driver's License required (no student permits)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">5. PRICING</p>
              <p>Total Price: <span className="font-medium">₱{bookingDetails?.finalPrice?.toLocaleString('en-US')}</span></p>
              <p>Security Deposit: <span className="font-medium">₱{bookingDetails?.deposit?.toLocaleString('en-US')}</span></p>
            </div>

            <div>
              <p className="font-semibold mb-2">6. INSURANCE & TRAVEL POLICY</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>CTPL insurance covers third-party liability only</li>
                <li>Vehicle damages are renter's responsibility</li>
                <li>Inter-island travel allowed with prior notification</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">7. TERMS AND CONDITIONS</p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Only the authorized driver may operate the motorcycle</li>
                <li>Return with same fuel level</li>
                <li>Late return: 15-min grace period, then 1-hour extension fees apply</li>
                <li>No refund policy for early returns</li>
                <li>Unlimited kilometers allowed within Cebu Province</li>
                <li>Renter liable for all damages, theft, or loss</li>
                <li>Must comply with all traffic laws</li>
                <li>NO use for ride-hailing/delivery services (Angkas, Move It, etc.)</li>
                <li>No driving under influence of alcohol or drugs</li>
                <li>Violations result in immediate termination and penalties</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <p className="font-semibold">I have read, understood, and agreed to the terms and conditions outlined above.</p>
            </div>
          </div>
        </div>
      )}

      {/* Agreement Checkbox */}
      <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <input
          type="checkbox"
          id="agree"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="w-5 h-5 rounded border-neutral-300 mt-1"
        />
        <label htmlFor="agree" className="text-sm text-neutral-700">
          I have read and understood all terms and conditions. I agree to the rental agreement and accept responsibility for any damages, fines, or violations.
        </label>
      </div>

      {/* Email Confirmation */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Confirm Email Address for Contract Copy
        </label>
        <input
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white"
        />
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ID/Valid ID Upload */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Valid ID or Driver's License *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, 'id')}
              className="hidden"
              id="id-upload"
            />
            <label
              htmlFor="id-upload"
              className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                idFile
                  ? 'border-success-300 bg-success-50'
                  : 'border-neutral-300 bg-neutral-50 hover:border-primary-300'
              }`}
            >
              <Icon icon="ph:upload-simple-bold" width={24} height={24} style={{ color: idFile ? '#22C55E' : '#999' }} />
              {idFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-success-700">✓ File uploaded</p>
                  <p className="text-xs text-success-600">{idFileName}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-700">Upload ID</p>
                  <p className="text-xs text-neutral-500">JPG, PNG, or PDF (max 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Passport Upload */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Passport Copy *
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, 'passport')}
              className="hidden"
              id="passport-upload"
            />
            <label
              htmlFor="passport-upload"
              className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                passportFile
                  ? 'border-success-300 bg-success-50'
                  : 'border-neutral-300 bg-neutral-50 hover:border-primary-300'
              }`}
            >
              <Icon icon="ph:upload-simple-bold" width={24} height={24} style={{ color: passportFile ? '#22C55E' : '#999' }} />
              {passportFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-success-700">✓ File uploaded</p>
                  <p className="text-xs text-success-600">{passportFileName}</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-700">Upload Passport</p>
                  <p className="text-xs text-neutral-500">JPG, PNG, or PDF (max 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Digital Signature */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Digital Signature *
        </label>

        {!showSignaturePad ? (
          <button
            onClick={startSignature}
            className={`w-full px-4 py-6 rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 ${
              signaturePath
                ? 'border-success-300 bg-success-50'
                : 'border-neutral-300 bg-neutral-50 hover:border-primary-300'
            }`}
          >
            {signaturePath ? (
              <>
                <Icon icon="ph:check-circle-bold" width={24} height={24} style={{ color: '#22C55E' }} />
                <div className="text-center">
                  <p className="text-sm font-medium text-success-700">✓ Signature added</p>
                  <p className="text-xs text-success-600">Click to redraw</p>
                </div>
              </>
            ) : (
              <>
                <Icon icon="ph:pen-nib-bold" width={24} height={24} style={{ color: '#999' }} />
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-700">Add Your Signature</p>
                  <p className="text-xs text-neutral-500">Click to sign on the canvas</p>
                </div>
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="border-2 border-neutral-300 rounded-xl overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                onMouseDown={handleSignatureStart}
                onMouseMove={handleSignatureMove}
                onMouseUp={handleSignatureEnd}
                onMouseLeave={handleSignatureEnd}
                className="w-full cursor-crosshair bg-white block"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearSignature}
                className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 px-4 py-2 bg-success-500 hover:bg-success-600 text-white font-medium rounded-lg transition-colors"
              >
                Confirm Signature
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <Icon icon="ph:warning-fill" width={20} height={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 border-2 border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !agreedToTerms}
          className="flex-[2] py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Icon icon="ph:spinner-gap-bold" width={16} height={16} className="animate-spin" />
              Signing...
            </>
          ) : (
            <>
              Sign & Complete Booking
              <Icon icon="ph:check-bold" width={16} height={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
