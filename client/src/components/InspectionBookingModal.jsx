import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';
import { createBooking } from '../services/api';

const InspectionBookingModal = ({ property, isOpen, onClose }) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [inspectionType, setInspectionType] = useState('In-Person');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !property) return null;

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await createBooking({
        propertyId: property._id,
        date: selectedDate || getTodayString(),
        timeSlot: selectedTime,
        type: inspectionType,
        notes
      });

      if (res.data && res.data.success) {
        if (res.data.emailError) {
          // If the booking succeeded but the email failed, show the error
          setError(`Booking successful, but email failed: ${res.data.emailError}`);
          setSuccess(false); // Don't show the green checkmark
        } else {
          setSuccess(true);
          // Automatically close modal after 2.5 seconds
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2500);
        }
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || err.response?.data?.emailError || 'Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900">Inspection Confirmed!</h3>
            <p className="text-xs text-slate-600">
              Your appointment for <span className="text-sky-500 font-bold">{property.title}</span> has been confirmed for {selectedDate} at {selectedTime}.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Schedule Private Inspection</h3>
              <p className="text-xs text-slate-500 truncate">{property.title}</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Type selector */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Inspection Format</label>
              <div className="grid grid-cols-2 gap-2">
                {['In-Person', 'Video Tour'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setInspectionType(t)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      inspectionType === t
                        ? 'bg-sky-500 text-slate-950 border-sky-500'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Preferred Date</label>
              <input
                type="date"
                min={getTodayString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
                required
              />
            </div>

            {/* Time Slot */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Time Slot</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
              >
                <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                <option value="11:00 AM">11:00 AM - 11:30 AM</option>
                <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                <option value="04:00 PM">04:00 PM - 04:30 PM</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-600">Special Notes / Questions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Interested in parking space measurements..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-sky-500 text-slate-950 font-bold text-sm hover:bg-sky-400 transition-colors"
            >
              {loading ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default InspectionBookingModal;
