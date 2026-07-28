"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { Property } from "../data/properties";
import { Hotel, HotelRoomType } from "../data/hotels";
import { Car } from "../data/cars";
import { LandProperty } from "../data/lands";
import { AgentProfile } from "../data/agents";

// Client-side canvas image optimizer & downscaler
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default function AdminPage() {
  const {
    currentAgent,
    allAgents,
    registerAgent,
    loginAgent,
    logoutAgent,
    updateAgentStatus,
    properties,
    addProperty,
    deleteProperty,
    updateProperty,
    hotels,
    addHotel,
    deleteHotel,
    updateHotel,
    cars,
    addCar,
    deleteCar,
    updateCar,
    lands,
    addLand,
    deleteLand,
    updateLand,
    bookings,
  } = useApp();

  // Auth Modes
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [shake, setShake] = useState(false);

  // Sign Up Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regWhatsapp, setRegWhatsapp] = useState("");
  const [regOfficeAddress, setRegOfficeAddress] = useState("");
  const [regCacNumber, setRegCacNumber] = useState("RC: ");
  const [regProfileImage, setRegProfileImage] = useState("");

  // Active Admin Section
  const [activeSection, setActiveSection] = useState<"properties" | "hotels" | "cars" | "lands" | "bookings" | "agents">("agents");
  const [selectedAgentFilterId, setSelectedAgentFilterId] = useState<string | null>(null);
  const [viewingAgentListings, setViewingAgentListings] = useState<AgentProfile | null>(null);
  const [formMode, setFormMode] = useState<"list" | "add" | "edit">("list");
  const [notification, setNotification] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentAgent?.role === "super_admin") {
      setActiveSection("agents");
    } else {
      setActiveSection("properties");
    }
  }, [currentAgent?.id]);

  // Images state for active form
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  // 1. PROPERTY FORM STATES
  const [editingPropId, setEditingPropId] = useState<string | null>(null);
  const [propTitle, setPropTitle] = useState("");
  const [propDesc, setPropDesc] = useState("");
  const [propPrice, setPropPrice] = useState("");
  const [propCautionFee, setPropCautionFee] = useState("");
  const [propReservationFee, setPropReservationFee] = useState("");
  const [propAgencyFee, setPropAgencyFee] = useState("");
  const [propInspectionFee, setPropInspectionFee] = useState("");
  const [propLegalFee, setPropLegalFee] = useState("");
  const [propLocation, setPropLocation] = useState("");
  const [propNeighborhood, setPropNeighborhood] = useState("AAU Main Gate");
  const [propBedrooms, setPropBedrooms] = useState(1);
  const [propBathrooms, setPropBathrooms] = useState(1);
  const [propGuests, setPropGuests] = useState(2);
  const [propAmenities, setPropAmenities] = useState<string[]>([]);
  const [propAgentPhone, setPropAgentPhone] = useState("07073537007");

  // 2. HOTEL FORM STATES
  const [editingHotelId, setEditingHotelId] = useState<string | null>(null);
  const [hotelTitle, setHotelTitle] = useState("");
  const [hotelDesc, setHotelDesc] = useState("");
  const [hotelPricePerNight, setHotelPricePerNight] = useState("");
  const [hotelStarRating, setHotelStarRating] = useState("4.8");
  const [hotelLocation, setHotelLocation] = useState("");
  const [hotelNeighborhood, setHotelNeighborhood] = useState("University Road");
  const [hotelCheckInTime, setHotelCheckInTime] = useState("2:00 PM");
  const [hotelCheckOutTime, setHotelCheckOutTime] = useState("12:00 PM");
  const [hotelCancellationPolicy, setHotelCancellationPolicy] = useState("Free cancellation up to 24 hrs prior");
  const [hotelAmenities, setHotelAmenities] = useState<string[]>([]);
  const [hotelRooms, setHotelRooms] = useState<HotelRoomType[]>([]);

  // 3. CAR FORM STATES
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carTitle, setCarTitle] = useState("");
  const [carDesc, setCarDesc] = useState("");
  const [carListingType, setCarListingType] = useState<"rent" | "sale">("rent");
  const [carPrice, setCarPrice] = useState("");
  const [carMake, setCarMake] = useState("Toyota");
  const [carModel, setCarModel] = useState("Camry");
  const [carYear, setCarYear] = useState(2022);
  const [carTransmission, setCarTransmission] = useState<"automatic" | "manual">("automatic");
  const [carFuelType, setCarFuelType] = useState("Petrol");
  const [carSeats, setCarSeats] = useState(5);
  const [carMileage, setCarMileage] = useState("Low Mileage");
  const [carCondition, setCarCondition] = useState<"foreign_used" | "brand_new" | "local_used">("foreign_used");
  const [carLocation, setCarLocation] = useState("Ekpoma, Edo State");
  const [carFeatures, setCarFeatures] = useState<string[]>([]);

  // 4. LAND FORM STATES
  const [editingLandId, setEditingLandId] = useState<string | null>(null);
  const [landTitle, setLandTitle] = useState("");
  const [landDesc, setLandDesc] = useState("");
  const [landPrice, setLandPrice] = useState("");
  const [landSize, setLandSize] = useState("1 Plot (600 sqm)");
  const [landTitleDocument, setLandTitleDocument] = useState("C of O");
  const [landZoning, setLandZoning] = useState<"Residential" | "Commercial" | "Industrial" | "Agricultural">("Residential");
  const [landStatus, setLandStatus] = useState<"dry_land" | "fenced" | "corner_piece" | "under_development">("dry_land");
  const [landLocation, setLandLocation] = useState("AAU Main Gate Area, Ekpoma");
  const [landNeighborhood, setLandNeighborhood] = useState("AAU Main Gate");
  const [landFeatures, setLandFeatures] = useState<string[]>([]);

  const isSuperAdmin = currentAgent?.role === "super_admin";

  // Helper to determine if a listing belongs to the currently logged in agent
  const isAgentItem = (item: { agentId?: string; agentPhone?: string }) => {
    if (!currentAgent) return false;
    if (currentAgent.role === "super_admin") return true;
    if (item.agentId && item.agentId === currentAgent.id) return true;
    if (item.agentPhone && currentAgent.whatsapp && item.agentPhone === currentAgent.whatsapp) return true;
    return false;
  };

  const displayedProperties = isSuperAdmin ? properties : properties.filter(isAgentItem);
  const displayedHotels = isSuperAdmin ? hotels : hotels.filter(isAgentItem);
  const displayedCars = isSuperAdmin ? cars : cars.filter(isAgentItem);
  const displayedLands = isSuperAdmin ? lands : lands.filter(isAgentItem);

  const displayedPropIds = new Set(displayedProperties.map((p) => p.id));
  const displayedBookings = isSuperAdmin
    ? bookings
    : bookings.filter(
        (b) =>
          b.agentId === currentAgent?.id ||
          displayedPropIds.has(b.propertyId) ||
          (b.guestPhone && currentAgent?.whatsapp && b.guestPhone === currentAgent.whatsapp)
      );

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await loginAgent(loginEmail, loginPassword);
    if (!res.success) {
      setAuthError(res.error || "Authentication failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const res = await registerAgent({
      name: regName,
      email: regEmail,
      password: regPassword,
      whatsapp: regWhatsapp,
      officeAddress: regOfficeAddress,
      cacNumber: regCacNumber,
      profileImage: regProfileImage || "/images/ehis_hostel.png",
    });

    if (res.success) {
      showNotify("🎉 Agent account registered and logged in successfully!");
    } else {
      setAuthError(res.message || "Registration failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      try {
        const compressed = await compressImageFile(e.target.files[0]);
        setRegProfileImage(compressed);
      } catch (err) {
        console.error("Profile image upload error:", err);
      }
    }
  };

  // Multiple File Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressedBase64 = await compressImageFile(files[i]);
        newUrls.push(compressedBase64);
      } catch (err) {
        console.error("Image compression error:", err);
      }
    }

    setUploadedImageUrls((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHotelRoom = () => {
    setHotelRooms((prev) => [
      ...prev,
      { name: "Deluxe Suite", price: 40000, status: "available" },
    ]);
  };

  const handleRemoveHotelRoom = (index: number) => {
    setHotelRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateHotelRoom = (index: number, field: keyof HotelRoomType, value: any) => {
    setHotelRooms((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleRoomImageUpload = async (index: number, file: File) => {
    try {
      const compressed = await compressImageFile(file);
      handleUpdateHotelRoom(index, "image", compressed);
    } catch (e) {
      console.error("Room image compression error:", e);
    }
  };

  const resetAllForms = () => {
    setUploadedImageUrls([]);
    setEditingPropId(null);
    setPropTitle("");
    setPropDesc("");
    setPropPrice("");
    setPropCautionFee("");
    setPropReservationFee("");
    setPropAgencyFee("");
    setPropInspectionFee("");
    setPropLegalFee("");
    setPropLocation("");
    setPropNeighborhood("AAU Main Gate");
    setEditingHotelId(null);
    setHotelTitle("");
    setHotelDesc("");
    setHotelPricePerNight("");
    setHotelStarRating("4.8");
    setHotelLocation("");
    setHotelNeighborhood("University Road");
    setHotelCheckInTime("2:00 PM");
    setHotelCheckOutTime("12:00 PM");
    setHotelCancellationPolicy("");
    setHotelAmenities([]);
    setHotelRooms([]);
    setEditingCarId(null);
    setEditingLandId(null);
    setFormMode("list");
  };

  // SUBMIT HANDLERS
  const handlePropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/images/ehis_hostel.png"];
    const agentPhone = currentAgent?.whatsapp || "07073537007";

    if (editingPropId) {
      await updateProperty(editingPropId, {
        title: propTitle,
        description: propDesc,
        price: Number(propPrice),
        cautionFee: Number(propCautionFee) || 0,
        reservationFee: Number(propReservationFee) || 0,
        agencyFee: Number(propAgencyFee) || 0,
        inspectionFee: Number(propInspectionFee) || 0,
        legalFee: Number(propLegalFee) || 0,
        location: propLocation,
        neighborhood: propNeighborhood,
        bedrooms: propBedrooms,
        bathrooms: propBathrooms,
        guests: propGuests,
        amenities: propAmenities,
        agentPhone,
        images: finalImages,
      });
      showNotify("Apartment updated successfully!");
    } else {
      await addProperty({
        title: propTitle,
        description: propDesc,
        price: Number(propPrice),
        cautionFee: Number(propCautionFee) || 0,
        reservationFee: Number(propReservationFee) || 0,
        agencyFee: Number(propAgencyFee) || 0,
        inspectionFee: Number(propInspectionFee) || 0,
        legalFee: Number(propLegalFee) || 0,
        location: propLocation,
        neighborhood: propNeighborhood,
        bedrooms: propBedrooms,
        bathrooms: propBathrooms,
        guests: propGuests,
        amenities: propAmenities,
        agentPhone,
        images: finalImages,
      });
      showNotify("New apartment listing created successfully!");
    }
    resetAllForms();
  };

  const handleHotelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/images/ehis_hostel.png"];
    const agentPhone = currentAgent?.whatsapp || "07073537007";

    if (editingHotelId) {
      await updateHotel(editingHotelId, {
        title: hotelTitle,
        description: hotelDesc,
        pricePerNight: Number(hotelPricePerNight),
        starRating: Number(hotelStarRating),
        location: hotelLocation,
        neighborhood: hotelNeighborhood,
        checkInTime: hotelCheckInTime,
        checkOutTime: hotelCheckOutTime,
        cancellationPolicy: hotelCancellationPolicy,
        amenities: hotelAmenities,
        rooms: hotelRooms,
        agentPhone,
        images: finalImages,
      });
      showNotify("Hotel updated successfully!");
    } else {
      await addHotel({
        title: hotelTitle,
        description: hotelDesc,
        pricePerNight: Number(hotelPricePerNight),
        location: hotelLocation,
        neighborhood: hotelNeighborhood,
        checkInTime: hotelCheckInTime,
        checkOutTime: hotelCheckOutTime,
        cancellationPolicy: hotelCancellationPolicy,
        amenities: hotelAmenities,
        rooms: hotelRooms,
        agentPhone,
        images: finalImages,
      });
      showNotify("New hotel listed successfully!");
    }
    resetAllForms();
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/images/royal_villa.png"];
    const agentPhone = currentAgent?.whatsapp || "07073537007";

    if (editingCarId) {
      await updateCar(editingCarId, {
        title: carTitle,
        description: carDesc,
        listingType: carListingType,
        price: Number(carPrice),
        make: carMake,
        model: carModel,
        year: carYear,
        transmission: carTransmission,
        fuelType: carFuelType,
        seats: carSeats,
        mileage: carMileage,
        condition: carCondition,
        location: carLocation,
        features: carFeatures,
        agentPhone,
        images: finalImages,
      });
      showNotify("Vehicle updated successfully!");
    } else {
      await addCar({
        title: carTitle,
        description: carDesc,
        listingType: carListingType,
        price: Number(carPrice),
        make: carMake,
        model: carModel,
        year: carYear,
        transmission: carTransmission,
        fuelType: carFuelType,
        seats: carSeats,
        mileage: carMileage,
        condition: carCondition,
        location: carLocation,
        features: carFeatures,
        agentPhone,
        images: finalImages,
      });
      showNotify("New vehicle listed successfully!");
    }
    resetAllForms();
  };

  const handleLandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/images/treasure_hostel.png"];
    const agentPhone = currentAgent?.whatsapp || "07073537007";

    if (editingLandId) {
      await updateLand(editingLandId, {
        title: landTitle,
        description: landDesc,
        price: Number(landPrice),
        size: landSize,
        titleDocument: landTitleDocument,
        zoning: landZoning,
        status: landStatus,
        location: landLocation,
        neighborhood: landNeighborhood,
        features: landFeatures,
        agentPhone,
        images: finalImages,
      });
      showNotify("Land listing updated successfully!");
    } else {
      await addLand({
        title: landTitle,
        description: landDesc,
        price: Number(landPrice),
        size: landSize,
        titleDocument: landTitleDocument,
        zoning: landZoning,
        status: landStatus,
        location: landLocation,
        neighborhood: landNeighborhood,
        features: landFeatures,
        agentPhone,
        images: finalImages,
      });
      showNotify("New land plot listed successfully!");
    }
    resetAllForms();
  };

  // Render Login & Registration Lock Screen if not authenticated
  if (!currentAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white">
        <div className={`w-full max-w-xl p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 ${shake ? "animate-shake" : ""}`}>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl gold-bg-gradient mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl">
              DP
            </div>
            <h1 className="text-2xl font-black tracking-tight">DOMOS MULTI-AGENT PORTAL</h1>
            <p className="text-xs text-slate-400">Sign in to your agent account or register your agency to list properties</p>
          </div>

          {/* Auth Tab Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-800 border border-slate-700">
            <button
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                authMode === "signin" ? "gold-bg-gradient text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              🔒 Agent / Admin Sign In
            </button>
            <button
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                authMode === "signup" ? "gold-bg-gradient text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              📝 Register New Agency / Agent
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-400 text-xs font-bold text-center">
              {authError}
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {authMode === "signin" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Agent Email / Master Admin</label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. domospropertygloballimited@gmail.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl gold-bg-gradient font-bold text-sm text-white shadow-lg hover:opacity-95 cursor-pointer"
              >
                Sign In to Portal
              </button>
            </form>
          ) : (
            /* TAB 2: SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full / Agency Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ehis Real Estate Consult"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="agent@agency.com"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create Password"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">WhatsApp Number * (For Direct Inquiries)</label>
                  <input
                    type="tel"
                    required
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-slate-800 border border-amber-500/70 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">CAC Registration No *</label>
                  <input
                    type="text"
                    required
                    value={regCacNumber}
                    onChange={(e) => setRegCacNumber(e.target.value)}
                    placeholder="RC: 7482910"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Office / Physical Address *</label>
                  <input
                    type="text"
                    required
                    value={regOfficeAddress}
                    onChange={(e) => setRegOfficeAddress(e.target.value)}
                    placeholder="No. 12 University Road, Ekpoma"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Agent Logo / Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="text-xs text-slate-400"
                />
                {regProfileImage && (
                  <div className="mt-2 w-12 h-12 rounded-xl overflow-hidden border border-amber-500">
                    <img src={regProfileImage} alt="Profile preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl gold-bg-gradient font-bold text-sm text-white shadow-lg hover:opacity-95 cursor-pointer mt-2"
              >
                Complete Registration & Access Portal
              </button>
            </form>
          )}

          <div className="text-center">
            <Link href="/" className="text-xs text-slate-400 hover:text-white underline">
              ← Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-8 space-y-8">
      {/* Top Header with Agent Profile Card */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <img
            src={currentAgent.profileImage || "/images/ehis_hostel.png"}
            alt={currentAgent.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white ${
                isSuperAdmin ? "bg-purple-600" : "bg-emerald-600"
              }`}>
                {isSuperAdmin ? "👑 Super-Admin Master Portal" : "💼 Verified Listing Agent"}
              </span>
              <span className="text-xs font-bold text-amber-500">{currentAgent.cacNumber}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">{currentAgent.name}</h1>
            <p className="text-xs text-slate-500">📍 {currentAgent.officeAddress} • 💬 {currentAgent.whatsapp}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            👁️ View Public Site
          </Link>
          <button
            onClick={logoutAgent}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            🔒 Logout ({currentAgent.name.split(" ")[0]})
          </button>
        </div>
      </div>

      {notification && (
        <div className="max-w-7xl mx-auto p-4 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs shadow-xl text-center animate-in fade-in">
          {notification}
        </div>
      )}

      {/* Main Section Navigation Bar (Shown ONLY for Regular Agents) */}
      {!isSuperAdmin && (
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => { setActiveSection("properties"); setFormMode("list"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "properties"
                ? "gold-bg-gradient text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🏢 Apartments ({displayedProperties.length})
          </button>

          <button
            onClick={() => { setActiveSection("hotels"); setFormMode("list"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "hotels"
                ? "gold-bg-gradient text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🏨 Hotels ({displayedHotels.length})
          </button>

          <button
            onClick={() => { setActiveSection("cars"); setFormMode("list"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "cars"
                ? "gold-bg-gradient text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🚗 Cars ({displayedCars.length})
          </button>

          <button
            onClick={() => { setActiveSection("lands"); setFormMode("list"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "lands"
                ? "gold-bg-gradient text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            📐 Land Plots ({displayedLands.length})
          </button>

          <button
            onClick={() => { setActiveSection("bookings"); setFormMode("list"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "bookings"
                ? "gold-bg-gradient text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            📋 Inquiries ({displayedBookings.length})
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {activeSection !== "bookings" && activeSection !== "agents" && (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold capitalize text-slate-900 dark:text-white">
              {formMode === "list" ? `${activeSection === "properties" ? "Apartments" : activeSection} Listings` : formMode === "add" ? `Create New ${activeSection === "properties" ? "Apartment" : activeSection.slice(0, -1)}` : `Edit ${activeSection === "properties" ? "Apartment" : activeSection.slice(0, -1)}`}
            </h2>

            {!isSuperAdmin && (
              formMode === "list" ? (
                <button
                  onClick={() => { resetAllForms(); setFormMode("add"); }}
                  className="px-4 py-2 rounded-xl gold-bg-gradient text-white font-bold text-xs shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  + Add New Listing
                </button>
              ) : (
                <button
                  onClick={resetAllForms}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  ← Back to List View
                </button>
              )
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* SUPER-ADMIN AGENT GOVERNANCE TAB */}
        {/* ---------------------------------------------------- */}
        {activeSection === "agents" && isSuperAdmin && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  👑 Super-Admin Agent Directory & Governance ({allAgents.length})
                </h3>
                <p className="text-xs text-slate-500">Oversee all registered agents, view full details & manage account statuses</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-600">
                Master Governance Mode
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allAgents.map((agent) => {
                const agentPropsCount = properties.filter((p) => p.agentId === agent.id || p.agentPhone === agent.whatsapp).length;
                const agentHotelsCount = hotels.filter((h) => h.agentId === agent.id || h.agentPhone === agent.whatsapp).length;
                const agentCarsCount = cars.filter((c) => c.agentId === agent.id || c.agentPhone === agent.whatsapp).length;
                const agentLandsCount = lands.filter((l) => l.agentId === agent.id || l.agentPhone === agent.whatsapp).length;
                const totalListings = agentPropsCount + agentHotelsCount + agentCarsCount + agentLandsCount;

                return (
                  <div key={agent.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={agent.profileImage || "/images/ehis_hostel.png"} alt={agent.name} className="w-12 h-12 rounded-xl object-cover border border-amber-400" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{agent.name}</h4>
                            {agent.role === "super_admin" && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-600 text-white">
                                Super-Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-amber-500">{agent.cacNumber}</p>
                          <p className="text-[10px] text-slate-400">{agent.email}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        agent.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : agent.status === "banned" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-amber-100 text-amber-700"
                      }`}>
                        {agent.status}
                      </span>
                    </div>

                    {/* Agent Full Contact Details */}
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p>📍 <strong>Office Address:</strong> {agent.officeAddress}</p>
                      <p>💬 <strong>WhatsApp Number:</strong> {agent.whatsapp}</p>
                      <p>📧 <strong>Email Address:</strong> {agent.email}</p>
                    </div>

                    {/* Agent Listing Breakdown */}
                    <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-900/60 border border-amber-200/80 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-extrabold text-amber-800 dark:text-amber-400 border-b border-amber-200/60 dark:border-slate-800 pb-1">
                        <span>📊 Uploaded Listings Summary</span>
                        <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black">{totalListings} Total</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 pt-0.5">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-center">🏢 {agentPropsCount} Apts</div>
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-center">🏨 {agentHotelsCount} Hotels</div>
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-center">🚗 {agentCarsCount} Cars</div>
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-center">📐 {agentLandsCount} Lands</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={() => setViewingAgentListings(agent)}
                        className="w-full sm:w-auto flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>👁️</span> Inspect Uploaded Listings ({totalListings})
                      </button>

                      {agent.role !== "super_admin" && (
                        <>
                          {agent.status !== "approved" && (
                            <button
                              onClick={() => updateAgentStatus(agent.id, "approved")}
                              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {agent.status !== "banned" && (
                            <button
                              onClick={() => updateAgentStatus(agent.id, "banned")}
                              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs transition-colors cursor-pointer"
                            >
                              🚫 Ban
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* READ-ONLY AGENT LISTINGS INSPECTOR MODAL FOR SUPER-ADMIN */}
        {viewingAgentListings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20">
                <div className="flex items-center gap-3">
                  <img src={viewingAgentListings.profileImage || "/images/ehis_hostel.png"} alt={viewingAgentListings.name} className="w-10 h-10 rounded-xl object-cover border border-amber-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                        Read-Only Inspector View
                      </span>
                      <span className="text-xs font-bold text-amber-500">{viewingAgentListings.cacNumber}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {viewingAgentListings.name}&apos;s Uploaded Listings
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setViewingAgentListings(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Listings List */}
              <div className="p-5 overflow-y-auto space-y-6 flex-1">
                {(() => {
                  const agentProps = properties.filter((p) => p.agentId === viewingAgentListings.id || p.agentPhone === viewingAgentListings.whatsapp);
                  const agentHotels = hotels.filter((h) => h.agentId === viewingAgentListings.id || h.agentPhone === viewingAgentListings.whatsapp);
                  const agentCars = cars.filter((c) => c.agentId === viewingAgentListings.id || c.agentPhone === viewingAgentListings.whatsapp);
                  const agentLands = lands.filter((l) => l.agentId === viewingAgentListings.id || l.agentPhone === viewingAgentListings.whatsapp);
                  const grandTotal = agentProps.length + agentHotels.length + agentCars.length + agentLands.length;

                  if (grandTotal === 0) {
                    return (
                      <div className="text-center py-12 space-y-2">
                        <span className="text-4xl block">📦</span>
                        <p className="text-sm font-bold text-slate-500">This agent has not uploaded any listings yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {/* Apartments */}
                      {agentProps.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                            🏢 Apartments ({agentProps.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {agentProps.map((p) => (
                              <div key={p.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                                <img src={p.images[0] || "/images/ehis_hostel.png"} alt={p.title} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="space-y-0.5 flex-1">
                                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{p.title}</h5>
                                  <p className="text-xs font-bold text-amber-500">₦{p.price.toLocaleString()} / yr</p>
                                  <p className="text-[10px] text-slate-400">📍 {p.location}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hotels */}
                      {agentHotels.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                            🏨 Hotels ({agentHotels.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {agentHotels.map((h) => (
                              <div key={h.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                                <img src={h.images[0] || "/images/ehis_hostel.png"} alt={h.title} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="space-y-0.5 flex-1">
                                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{h.title}</h5>
                                  <p className="text-xs font-bold text-amber-500">₦{h.pricePerNight.toLocaleString()} / night</p>
                                  <p className="text-[10px] text-slate-400">📍 {h.location}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cars */}
                      {agentCars.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                            🚗 Vehicles ({agentCars.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {agentCars.map((c) => (
                              <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                                <img src={c.images[0] || "/images/royal_villa.png"} alt={c.title} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="space-y-0.5 flex-1">
                                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{c.title}</h5>
                                  <p className="text-xs font-bold text-amber-500">₦{c.price.toLocaleString()} {c.listingType === 'rent' && '/ day'}</p>
                                  <p className="text-[10px] text-slate-400">📍 {c.location} • {c.year}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lands */}
                      {agentLands.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                            📐 Land Plots ({agentLands.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {agentLands.map((l) => (
                              <div key={l.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex gap-3">
                                <img src={l.images[0] || "/images/treasure_hostel.png"} alt={l.title} className="w-20 h-20 rounded-xl object-cover" />
                                <div className="space-y-0.5 flex-1">
                                  <h5 className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">{l.title}</h5>
                                  <p className="text-xs font-bold text-amber-500">₦{l.price.toLocaleString()}</p>
                                  <p className="text-[10px] text-slate-400">📍 {l.location} • {l.size}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1: APARTMENTS */}
        {activeSection === "properties" && (
          formMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedProperties.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={p.images?.[0] || "/images/ehis_hostel.png"} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{p.title}</h3>
                  {(() => {
                    const totalFees = (p.cautionFee || 0) + (p.reservationFee || 0) + (p.agencyFee || 0) + (p.inspectionFee || 0) + (p.legalFee || 0);
                    const totalPkg = p.price + totalFees;
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                            Total: ₦{totalPkg.toLocaleString()}
                          </span>
                          <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                            Full Package
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold">Annual Rent: ₦{p.price.toLocaleString()}/yr</p>
                      </div>
                    );
                  })()}

                  {/* Fee Breakdown Pills */}
                  <div className="flex flex-wrap gap-1 text-[9px] font-bold">
                    {p.legalFee !== undefined && p.legalFee > 0 && <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">📜 Legal: ₦{p.legalFee.toLocaleString()}</span>}
                    {p.inspectionFee !== undefined && p.inspectionFee > 0 && <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">🔎 Inspection: ₦{p.inspectionFee.toLocaleString()}</span>}
                    {p.agencyFee !== undefined && p.agencyFee > 0 && <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">🤝 Agency: ₦{p.agencyFee.toLocaleString()}</span>}
                    {p.cautionFee !== undefined && p.cautionFee > 0 && <span className="bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded">🛡️ Caution: ₦{p.cautionFee.toLocaleString()}</span>}
                    {p.reservationFee !== undefined && p.reservationFee > 0 && <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded">📌 Deposit: ₦{p.reservationFee.toLocaleString()}</span>}
                  </div>

                  <p className="text-[11px] text-slate-400">📍 {p.location}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingPropId(p.id);
                        setPropTitle(p.title);
                        setPropDesc(p.description);
                        setPropPrice(p.price.toString());
                        setPropCautionFee(p.cautionFee?.toString() || "");
                        setPropReservationFee(p.reservationFee?.toString() || "");
                        setPropAgencyFee(p.agencyFee?.toString() || "");
                        setPropInspectionFee(p.inspectionFee?.toString() || "");
                        setPropLegalFee(p.legalFee?.toString() || "");
                        setPropLocation(p.location);
                        setPropNeighborhood(p.neighborhood);
                        setPropBedrooms(p.bedrooms);
                        setPropBathrooms(p.bathrooms);
                        setPropGuests(p.guests);
                        setPropAmenities(p.amenities || []);
                        setPropAgentPhone(p.agentPhone || currentAgent.whatsapp);
                        setUploadedImageUrls(p.images || []);
                        setFormMode("edit");
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProperty(p.id)}
                      className="py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handlePropSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Apartment / Property Details Form
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Apartment Title *</label>
                  <input type="text" required value={propTitle} onChange={(e) => setPropTitle(e.target.value)} placeholder="e.g. Ehis Executive Student Apartments" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>

                {/* Financial Fees Section */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      💰 Financial & Fee Structure
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50">
                      * Annual Rent is the only compulsory fee
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 block mb-1">
                        Annual Rent Price (₦ / yr) * (Compulsory)
                      </label>
                      <input type="number" required value={propPrice} onChange={(e) => setPropPrice(e.target.value)} placeholder="e.g. 350000" className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-amber-400/80 focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Caution Fee (₦) (Optional)
                      </label>
                      <input type="number" value={propCautionFee} onChange={(e) => setPropCautionFee(e.target.value)} placeholder="e.g. 30000" className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Agency Fee (₦) (Optional)
                      </label>
                      <input type="number" value={propAgencyFee} onChange={(e) => setPropAgencyFee(e.target.value)} placeholder="e.g. 20000" className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Legal Fee (₦) (Optional)
                      </label>
                      <input type="number" value={propLegalFee} onChange={(e) => setPropLegalFee(e.target.value)} placeholder="e.g. 15000" className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Inspection Fee (₦) (Optional)
                      </label>
                      <input type="number" value={propInspectionFee} onChange={(e) => setPropInspectionFee(e.target.value)} placeholder="e.g. 5000" className="w-full p-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Location Address *</label>
                  <input type="text" required value={propLocation} onChange={(e) => setPropLocation(e.target.value)} placeholder="AAU Main Gate, Ekpoma" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Neighborhood Area *</label>
                  <input type="text" required value={propNeighborhood} onChange={(e) => setPropNeighborhood(e.target.value)} placeholder="AAU Main Gate" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
              </div>

              {/* APARTMENT AMENITIES CHECKLIST */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-slate-700 pb-2">
                  ✨ Select Apartment Amenities ({propAmenities.length} Selected)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "24/7 Industrial Borehole Water",
                    "Prepaid Electricity Meter (PHCN)",
                    "24/7 Gated Security Guard",
                    "Solar Power & Inverter Backup",
                    "Standby Generator Backup",
                    "Tiled Flooring & POP Ceilings",
                    "Fenced Compound & Security Gate",
                    "Reading Study Desk & Chair",
                    "Daily Waste Management",
                    "Ample Car & Bike Parking",
                    "Kitchenette with Sink & Cabinets",
                    "En-Suite Bathroom & Water Heater",
                    "Burglar Proofed Windows",
                    "Close to Campus Shuttle Bus Stop"
                  ].map((amenity) => {
                    const isSelected = propAmenities.includes(amenity);
                    return (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setPropAmenities((prev) => prev.filter((a) => a !== amenity));
                            } else {
                              setPropAmenities((prev) => [...prev, amenity]);
                            }
                          }}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Images</label>
                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="text-xs text-slate-500" />
                {uploading && <p className="text-xs text-amber-500 font-bold mt-1">Compressing images...</p>}
                <div className="flex gap-2 flex-wrap mt-2">
                  {uploadedImageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUploadedImage(idx)} className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-bl flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl gold-bg-gradient text-white font-bold text-xs cursor-pointer">
                {editingPropId ? "Save Apartment Changes" : "Submit Apartment Listing"}
              </button>
            </form>
          )
        )}

        {/* SECTION 2: HOTELS */}
        {activeSection === "hotels" && (
          formMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedHotels.map((h) => (
                <div key={h.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={h.images?.[0] || "/images/ehis_hostel.png"} alt={h.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{h.title}</h3>
                  <p className="text-xs font-bold text-amber-500">₦{h.pricePerNight.toLocaleString()} / night</p>
                  <p className="text-[11px] text-slate-400">📍 {h.location} • ⭐ {h.starRating}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingHotelId(h.id);
                        setHotelTitle(h.title);
                        setHotelDesc(h.description);
                        setHotelPricePerNight(h.pricePerNight.toString());
                        setHotelStarRating(h.starRating.toString());
                        setHotelLocation(h.location);
                        setHotelNeighborhood(h.neighborhood);
                        setHotelCheckInTime(h.checkInTime || "2:00 PM");
                        setHotelCheckOutTime(h.checkOutTime || "12:00 PM");
                        setHotelCancellationPolicy(h.cancellationPolicy || "");
                        setHotelAmenities(h.amenities || []);
                        setHotelRooms(h.rooms || []);
                        setUploadedImageUrls(h.images || []);
                        setFormMode("edit");
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteHotel(h.id)}
                      className="py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleHotelSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Hotel & Short Stay Form
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Hotel Name *</label>
                  <input type="text" required value={hotelTitle} onChange={(e) => setHotelTitle(e.target.value)} placeholder="e.g. DOMOS Grand Palace Hotel" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Rate per Night (₦) *</label>
                  <input type="number" required value={hotelPricePerNight} onChange={(e) => setHotelPricePerNight(e.target.value)} placeholder="45000" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Star Rating (1 - 5) *</label>
                  <input type="number" step="0.1" required value={hotelStarRating} onChange={(e) => setHotelStarRating(e.target.value)} placeholder="4.8" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Location Address *</label>
                  <input type="text" required value={hotelLocation} onChange={(e) => setHotelLocation(e.target.value)} placeholder="University Road, Ekpoma" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea rows={3} value={hotelDesc} onChange={(e) => setHotelDesc(e.target.value)} placeholder="Hotel features, pool access, breakfast details..." className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              {/* DYNAMIC HOTEL ROOM CATEGORIES MANAGER */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-2">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      🛏️ Hotel Room Categories & Custom Rates
                    </span>
                    <p className="text-[10px] text-slate-500">Add room types (e.g., Deluxe King, Executive Suite), set prices & upload room photos</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddHotelRoom}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    + Add Room Category
                  </button>
                </div>

                {hotelRooms.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No custom room categories added yet. Click above to add rooms.</p>
                ) : (
                  <div className="space-y-3">
                    {hotelRooms.map((room, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                            Room Category #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHotelRoom(idx)}
                            className="text-rose-500 text-xs font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Category Name *</label>
                            <input
                              type="text"
                              required
                              value={room.name}
                              onChange={(e) => handleUpdateHotelRoom(idx, "name", e.target.value)}
                              placeholder="e.g. Presidential Suite"
                              className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Nightly Price (₦) *</label>
                            <input
                              type="number"
                              required
                              value={room.price}
                              onChange={(e) => handleUpdateHotelRoom(idx, "price", Number(e.target.value))}
                              placeholder="45000"
                              className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Status</label>
                            <select
                              value={room.status}
                              onChange={(e) => handleUpdateHotelRoom(idx, "status", e.target.value as any)}
                              className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked / Occupied</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          {room.image ? (
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-amber-400">
                              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleUpdateHotelRoom(idx, "image", undefined)}
                                className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] w-4 h-4 flex items-center justify-center"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <label className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold cursor-pointer hover:bg-slate-200">
                                📷 Upload Room Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleRoomImageUpload(idx, e.target.files[0]);
                                  }}
                                />
                              </label>
                              <span className="text-[10px] text-slate-400">Optional room image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HOTEL AMENITIES CHECKLIST */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700 space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block border-b border-amber-200/60 dark:border-slate-700 pb-2">
                  ✨ Select Hotel Amenities ({hotelAmenities.length} Selected)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "24/7 Air Conditioning",
                    "Free High-Speed Fiber Wi-Fi",
                    "Swimming Pool & Pool Bar",
                    "Complimentary Hot Breakfast",
                    "Fitness Gym Center",
                    "24/7 Standby Generator Backup",
                    "Solar Power Backup",
                    "Smart TV with Premium DSTV",
                    "Cocktail Lounge & Restaurant",
                    "24/7 Gated Security Guard",
                    "Free Ample Parking",
                    "Airport / Campus Shuttle Service",
                    "24-Hour Room Service"
                  ].map((amenity) => {
                    const isSelected = hotelAmenities.includes(amenity);
                    return (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-amber-100/50 dark:hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setHotelAmenities((prev) => prev.filter((a) => a !== amenity));
                            } else {
                              setHotelAmenities((prev) => [...prev, amenity]);
                            }
                          }}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Hotel Images</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-500" />
                <div className="flex gap-2 flex-wrap mt-2">
                  {uploadedImageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUploadedImage(idx)} className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-bl flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl gold-bg-gradient text-white font-bold text-xs cursor-pointer">
                {editingHotelId ? "Save Hotel Changes" : "Submit Hotel Listing"}
              </button>
            </form>
          )
        )}

        {/* SECTION 3: CARS */}
        {activeSection === "cars" && (
          formMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCars.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={c.images?.[0] || "/images/royal_villa.png"} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white ${c.listingType === 'rent' ? 'bg-sky-600' : 'bg-emerald-600'}`}>
                      {c.listingType === 'rent' ? 'Rent / Hire' : 'For Sale'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{c.year} • {c.make}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{c.title}</h3>
                  <p className="text-xs font-bold text-amber-500">₦{c.price.toLocaleString()} {c.listingType === 'rent' && '/ day'}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingCarId(c.id);
                        setCarTitle(c.title);
                        setCarDesc(c.description);
                        setCarListingType(c.listingType);
                        setCarPrice(c.price.toString());
                        setCarMake(c.make);
                        setCarModel(c.model);
                        setCarYear(c.year);
                        setCarTransmission(c.transmission);
                        setCarFuelType(c.fuelType);
                        setCarSeats(c.seats);
                        setCarMileage(c.mileage);
                        setCarCondition(c.condition);
                        setCarLocation(c.location);
                        setCarFeatures(c.features || []);
                        setUploadedImageUrls(c.images || []);
                        setFormMode("edit");
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCar(c.id)}
                      className="py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCarSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Car Sale & Hire Entry Form
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Listing Type *</label>
                  <select value={carListingType} onChange={(e) => setCarListingType(e.target.value as "rent" | "sale")} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <option value="rent">Daily Rental / Hire</option>
                    <option value="sale">Outright Vehicle Sale</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Price (₦) *</label>
                  <input type="number" required value={carPrice} onChange={(e) => setCarPrice(e.target.value)} placeholder={carListingType === 'rent' ? "65000 (Daily)" : "45000000 (Total)"} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Condition *</label>
                  <select value={carCondition} onChange={(e) => setCarCondition(e.target.value as any)} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <option value="foreign_used">Foreign Used (Tokunbo)</option>
                    <option value="brand_new">Brand New</option>
                    <option value="local_used">Nigerian Used</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Make *</label>
                  <input type="text" required value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder="Lexus" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Model *</label>
                  <input type="text" required value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="RX 350" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Year *</label>
                  <input type="number" required value={carYear} onChange={(e) => setCarYear(parseInt(e.target.value) || 2022)} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Transmission *</label>
                  <select value={carTransmission} onChange={(e) => setCarTransmission(e.target.value as any)} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Listing Title *</label>
                <input type="text" required value={carTitle} onChange={(e) => setCarTitle(e.target.value)} placeholder="2022 Lexus RX 350 F-Sport SUV" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Description</label>
                <textarea rows={3} value={carDesc} onChange={(e) => setCarDesc(e.target.value)} placeholder="Sunroof, leather interior, custom duty paid..." className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Car Images</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-500" />
                <div className="flex gap-2 flex-wrap mt-2">
                  {uploadedImageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUploadedImage(idx)} className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-bl flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl gold-bg-gradient text-white font-bold text-xs cursor-pointer">
                {editingCarId ? "Save Vehicle Changes" : "Submit Vehicle Listing"}
              </button>
            </form>
          )
        )}

        {/* SECTION 4: LAND */}
        {activeSection === "lands" && (
          formMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedLands.map((l) => (
                <div key={l.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={l.images?.[0] || "/images/treasure_hostel.png"} alt={l.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-black">{l.titleDocument}</span>
                    <span className="text-xs font-bold text-slate-400">{l.size}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{l.title}</h3>
                  <p className="text-xs font-bold text-amber-500">₦{l.price.toLocaleString()}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setEditingLandId(l.id);
                        setLandTitle(l.title);
                        setLandDesc(l.description);
                        setLandPrice(l.price.toString());
                        setLandSize(l.size);
                        setLandTitleDocument(l.titleDocument);
                        setLandZoning(l.zoning);
                        setLandStatus(l.status);
                        setLandLocation(l.location);
                        setLandNeighborhood(l.neighborhood);
                        setLandFeatures(l.features || []);
                        setUploadedImageUrls(l.images || []);
                        setFormMode("edit");
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs hover:bg-sky-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteLand(l.id)}
                      className="py-1.5 px-3 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleLandSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Land Properties Directory Form
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Land Size *</label>
                  <input type="text" required value={landSize} onChange={(e) => setLandSize(e.target.value)} placeholder="1 Plot (600 sqm)" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Title Document *</label>
                  <input type="text" required value={landTitleDocument} onChange={(e) => setLandTitleDocument(e.target.value)} placeholder="C of O / Deed of Assignment" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Asking Price (₦) *</label>
                  <input type="number" required value={landPrice} onChange={(e) => setLandPrice(e.target.value)} placeholder="6500000" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Zoning *</label>
                  <select value={landZoning} onChange={(e) => setLandZoning(e.target.value as any)} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Agricultural">Agricultural</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Land Status *</label>
                  <select value={landStatus} onChange={(e) => setLandStatus(e.target.value as any)} className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <option value="dry_land">Dry Table Land</option>
                    <option value="fenced">Perimeter Fenced</option>
                    <option value="corner_piece">Corner Piece Plot</option>
                    <option value="under_development">Under Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Land Listing Title *</label>
                <input type="text" required value={landTitle} onChange={(e) => setLandTitle(e.target.value)} placeholder="1 Plot Prime Residential Land near AAU Campus" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Location Address *</label>
                <input type="text" required value={landLocation} onChange={(e) => setLandLocation(e.target.value)} placeholder="AAU Main Gate Area, Ekpoma, Edo State" className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Land Description</label>
                <textarea rows={3} value={landDesc} onChange={(e) => setLandDesc(e.target.value)} placeholder="Boundary, topography, road access details..." className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Upload Land Images / Survey</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-xs text-slate-500" />
                <div className="flex gap-2 flex-wrap mt-2">
                  {uploadedImageUrls.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUploadedImage(idx)} className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-bl flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl gold-bg-gradient text-white font-bold text-xs cursor-pointer">
                {editingLandId ? "Save Land Changes" : "Submit Land Listing"}
              </button>
            </form>
          )
        )}

        {/* SECTION 5: BOOKINGS */}
        {activeSection === "bookings" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              All Customer Reservations & Site Inspections ({displayedBookings.length})
            </h3>
            {displayedBookings.length === 0 ? (
              <p className="text-xs text-slate-500">No bookings or inquiries submitted yet for your properties.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedBookings.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-sky-100 dark:bg-sky-950 text-sky-600 mr-2">
                        {b.category || "property"}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{b.propertyName}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800 dark:text-slate-200">{b.guestName || "N/A"}</strong> ({b.guestPhone || "N/A"}) • Dates: {b.checkIn} to {b.checkOut}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-500 text-sm">₦{b.totalPrice?.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400">Booked: {b.bookingDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
