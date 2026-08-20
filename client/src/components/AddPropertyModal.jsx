import React, { useState, useRef } from 'react';
import { X, Sparkles, Building2, MapPin, DollarSign, Bed, Bath, Car, Maximize2, Tag, CheckCircle2, AlertCircle, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { createProperty, generateAIDescription } from '../services/api';

const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
  const fileInputRef = useRef(null);
  const [listingType, setListingType] = useState('Sale');
  const [propertyType, setPropertyType] = useState('Residential');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [pricePeriod, setPricePeriod] = useState('total');
  const [description, setDescription] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [suburb, setSuburb] = useState('');
  const [city, setCity] = useState('Sydney');
  const [state, setState] = useState('NSW');
  const [postcode, setPostcode] = useState('2000');

  // Features & Specifications
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [parkingSpaces, setParkingSpaces] = useState(1);
  const [landArea, setLandArea] = useState(450);
  const [floorArea, setFloorArea] = useState(180);

  // Amenities & Images
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState(['Air Conditioning', 'Swimming Pool', 'Balcony', 'Built-in Robes']);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'
  ]);

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (indexToRemove) => {
    setAmenities(amenities.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        if (base64Url) {
          setImages((prev) => [...prev, base64Url]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    if (images.length === 1) return;
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleGenerateAI = async () => {
    if (!title || !suburb) {
      setError('Please provide at least a property Title and Suburb before generating AI copy.');
      return;
    }
    setError('');
    setAiGenerating(true);
    try {
      const res = await generateAIDescription({
        title,
        propertyType,
        listingType,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        suburb
      });
      if (res.data && res.data.success) {
        setDescription(res.data.description);
      }
    } catch (err) {
      console.error('AI Description generation error:', err);
      setDescription(
        `Exquisite ${propertyType} listing located in the highly desirable precinct of ${suburb}. Featuring ${bedrooms} spacious bedrooms, ${bathrooms} modern bathrooms, and premium finishes throughout. Ideal for discerning buyers seeking luxury, convenience, and modern coastal living.`
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!title || !price || !street || !suburb || !city || !description) {
      setError('Please complete all required fields (Title, Price, Street, Suburb, City, and Description).');
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description,
      propertyType,
      listingType,
      price: Number(price),
      pricePeriod,
      address: {
        street,
        suburb,
        city,
        state,
        postcode,
        country: 'Australia'
      },
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parkingSpaces: Number(parkingSpaces),
      landArea: Number(landArea),
      floorArea: Number(floorArea),
      amenities,
      features: amenities,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200'],
      status: 'Published'
    };

    try {
      const res = await createProperty(payload);
      if (res.data && res.data.success) {
        setSuccessMsg('Property successfully listed and saved to database!');
        setTimeout(() => {
          if (onPropertyAdded) onPropertyAdded(res.data.property);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list property. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 my-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl brand-gradient-bg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Building2 className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Add Real Estate Property</h2>
              <p className="text-xs text-slate-500">List a property to buy or rent with instant database publishing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Listing Type & Property Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-600">Listing Purpose</label>
              <div className="grid grid-cols-2 gap-2">
                {['Sale', 'Rent'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setListingType(type)}
                    className={`py-2 rounded-xl font-bold border transition-all text-xs ${
                      listingType === type
                        ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-md'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {type === 'Sale' ? 'Buy' : 'Rent'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-600">Property Category</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              >
                {['Residential', 'Apartment', 'Villa', 'Townhouse', 'Commercial', 'Land', 'Office', 'Warehouse', 'Farm'].map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5 text-xs">
              <label className="font-bold text-slate-600">Property Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Ocean View Villa"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                required
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-600">Price (AUD $) *</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="1250000"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location / Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-500" />
              <span>Property Address Details</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street Address (e.g. 42 George St)"
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                required
              />
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Suburb (e.g. Bondi Beach)"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                required
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Sydney)"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
                required
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (e.g. NSW)"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              />
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Postcode (e.g. 2026)"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Key Property Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-600 flex items-center space-x-1">
                <Bed className="w-3.5 h-3.5 text-slate-500" />
                <span>Beds</span>
              </label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 flex items-center space-x-1">
                <Bath className="w-3.5 h-3.5 text-slate-500" />
                <span>Baths</span>
              </label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span>Parking</span>
              </label>
              <input
                type="number"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600 flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Land (m²)</span>
              </label>
              <input
                type="number"
                value={landArea}
                onChange={(e) => setLandArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="font-bold text-slate-600 flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Floor (m²)</span>
              </label>
              <input
                type="number"
                value={floorArea}
                onChange={(e) => setFloorArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900"
              />
            </div>
          </div>

          {/* Description & AI Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600">Property Description *</label>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={aiGenerating}
                className="px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center space-x-1.5 hover:bg-cyan-900/60 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{aiGenerating ? 'AI Generating...' : 'Auto-Generate AI Copy'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe property highlight features, interior design, backyard, location proximity, view, etc..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-sky-500"
              required
            />
          </div>

          {/* Amenities Tags */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-600">Amenities & Key Features</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Add amenity (e.g. Solar Panels, Garage, Garden)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs hover:bg-slate-200"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-medium flex items-center space-x-1.5"
                >
                  <span>{item}</span>
                  <button type="button" onClick={() => handleRemoveAmenity(idx)} className="text-slate-500 hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Property Photos & Image Upload */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-600 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span>Property Photos & Images</span>
              </label>
              <span className="text-[11px] text-slate-500">({images.length} images added)</span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              {/* PC Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/40 text-sky-500 font-bold text-xs hover:bg-sky-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Choose Image File from PC</span>
              </button>

              {/* URL Input */}
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste web image URL (https://...)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs hover:bg-slate-200 whitespace-nowrap"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Images Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-white shadow-md">
                  <img
                    src={img}
                    alt={`Property preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-600/90 text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-slate-50/80 backdrop-blur-md text-[10px] font-bold text-sky-500 border border-sky-500/30">
                      Main Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-slate-950 font-extrabold text-sm hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
          >
            {loading ? 'Publishing to Database...' : 'Save & Publish Property Listing'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
