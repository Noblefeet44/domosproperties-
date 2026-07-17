"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Property, INITIAL_PROPERTIES, Review } from "../data/properties";

export interface ConciergeAddon {
  id: string;
  name: string;
  price: number;
  type: 'daily' | 'flat';
}

export interface Reservation {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyLocation: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookingDate: string;
  addons?: ConciergeAddon[];
  guestName?: string;
  guestPhone?: string;
}

interface AppContextType {
  properties: Property[];
  bookings: Reservation[];
  wishlist: string[];
  searchQuery: string;
  selectedNeighborhood: string;
  priceRange: [number, number];
  guestCount: number;
  activeView: 'explore' | 'wishlist' | 'bookings' | 'host';
  selectedProperty: Property | null;
  darkMode: boolean;
  addProperty: (property: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => void;
  deleteProperty: (propertyId: string) => void;
  updateProperty: (propertyId: string, property: Partial<Property> & { images?: string[] }) => Promise<void>;
  addBooking: (booking: Omit<Reservation, "id" | "bookingDate" | "status">) => void;
  cancelBooking: (bookingId: string) => void;
  toggleWishlist: (propertyId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedNeighborhood: (neighborhood: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setGuestCount: (count: number) => void;
  setActiveView: (view: 'explore' | 'wishlist' | 'bookings' | 'host') => void;
  setSelectedProperty: (property: Property | null) => void;
  toggleDarkMode: () => void;
  resetFilters: () => void;
  addReview: (propertyId: string, review: Omit<Review, "id" | "date">) => void;
  refreshProperties: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600000]);
  const [guestCount, setGuestCount] = useState(1);
  const [activeView, setActiveView] = useState<'explore' | 'wishlist' | 'bookings' | 'host'>('explore');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load properties from Airtable (with local fallback)
  const refreshProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
          localStorage.setItem("abuja_properties", JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Failed to load properties from Airtable, using local fallback:", error);
    }
  };

  // Initialize values on client side
  useEffect(() => {
    const savedWishlist = localStorage.getItem("abuja_wishlist");
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

    const savedBookings = localStorage.getItem("abuja_bookings");
    if (savedBookings) setBookings(JSON.parse(savedBookings));

    const savedProperties = localStorage.getItem("abuja_properties");
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    } else {
      setProperties(INITIAL_PROPERTIES);
    }

    refreshProperties();

    const savedTheme = localStorage.getItem("abuja_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("abuja_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("abuja_theme", "light");
    }
  };

  const toggleWishlist = (propertyId: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem("abuja_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const addProperty = async (newProp: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => {
    // 1. Optimistic UI update
    const tempId = "temp-" + Math.random().toString(36).substring(2, 9);
    const tempProp: Property = {
      ...newProp,
      id: tempId,
      rating: 5.0,
      reviewsCount: 0,
      featured: false,
      reviews: [],
    };
    setProperties((prev) => [tempProp, ...prev]);

    // 2. Persist to Airtable
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProp),
      });
      if (response.ok) {
        await refreshProperties();
      }
    } catch (err) {
      console.error("Failed to add property to Airtable, saved locally:", err);
      setProperties((prev) => {
        const filtered = prev.filter(p => p.id !== tempId);
        const propertyToAdd = { ...tempProp, id: Math.random().toString(36).substring(2, 9) };
        const updated = [propertyToAdd, ...filtered];
        localStorage.setItem("abuja_properties", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    // 1. Optimistic UI update
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));

    // 2. Persist to Airtable
    try {
      const response = await fetch(`/api/properties?id=${propertyId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await refreshProperties();
      }
    } catch (err) {
      console.error("Failed to delete property from Airtable, deleted locally:", err);
      setProperties((prev) => {
        const updated = prev.filter((p) => p.id !== propertyId);
        localStorage.setItem("abuja_properties", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateProperty = async (propertyId: string, updatedFields: Partial<Property> & { images?: string[] }) => {
    // 1. Optimistic UI update
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? ({ ...p, ...updatedFields } as Property) : p))
    );

    // 2. Persist to Airtable
    try {
      const response = await fetch("/api/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId, ...updatedFields }),
      });
      if (response.ok) {
        await refreshProperties();
      }
    } catch (err) {
      console.error("Failed to update property in Airtable, kept locally:", err);
    }
  };

  const addBooking = async (newBooking: Omit<Reservation, "id" | "bookingDate" | "status">) => {
    const generatedBkId = "BK-" + Math.floor(100000 + Math.random() * 900000);
    const bookingDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const bookingToAdd: Reservation = {
      ...newBooking,
      id: generatedBkId,
      bookingDate,
      status: 'confirmed',
    };

    // 1. Save locally for client display
    setBookings((prev) => {
      const updated = [bookingToAdd, ...prev];
      localStorage.setItem("abuja_bookings", JSON.stringify(updated));
      return updated;
    });

    // 2. Push to Airtable Bookings table
    try {
      const addonsSummary = newBooking.addons && newBooking.addons.length > 0
        ? newBooking.addons.map(a => a.name).join(", ")
        : "None";

      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedBkId,
          propertyId: newBooking.propertyId,
          guestName: newBooking.guestName || "Alhaji Ibrahim",
          guestWhatsApp: newBooking.guestPhone || "07045636039",
          checkIn: newBooking.checkIn,
          checkOut: newBooking.checkOut,
          guestsCount: newBooking.guestsCount,
          totalPrice: newBooking.totalPrice,
          addons: addonsSummary,
          status: "confirmed"
        }),
      });
    } catch (err) {
      console.error("Failed to push booking to Airtable Bookings:", err);
    }
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => {
      const updated = prev.map((bk) =>
        bk.id === bookingId ? { ...bk, status: 'cancelled' as const } : bk
      );
      localStorage.setItem("abuja_bookings", JSON.stringify(updated));
      return updated;
    });
    // Cancel logic on Airtable can be added here if needed
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhood("All");
    setPriceRange([0, 600000]);
    setGuestCount(1);
  };

  const addReview = async (propertyId: string, review: Omit<Review, "id" | "date">) => {
    // 1. Optimistic UI update
    const tempId = "rev-temp-" + Math.random().toString(36).substring(2, 9);
    const tempReview: Review = {
      ...review,
      id: tempId,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    setProperties((prev) => {
      return prev.map((prop) => {
        if (prop.id === propertyId) {
          const newReviews = [tempReview, ...(prop.reviews || [])];
          const sumRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = parseFloat((sumRating / newReviews.length).toFixed(2));
          return {
            ...prop,
            reviews: newReviews,
            reviewsCount: newReviews.length,
            rating: avgRating,
          };
        }
        return prop;
      });
    });

    // 2. Persist to Airtable
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          guestName: review.guestName,
          avatar: review.avatar,
          rating: review.rating,
          comment: review.comment,
        }),
      });
      if (response.ok) {
        await refreshProperties();
      }
    } catch (err) {
      console.error("Failed to push review to Airtable:", err);
      // Persist fallback locally
      setProperties((prev) => {
        const updated = prev.map((prop) => {
          if (prop.id === propertyId) {
            const filtered = (prop.reviews || []).filter(r => r.id !== tempId);
            const reviewToAdd = {
              ...tempReview,
              id: "rev-" + Math.random().toString(36).substring(2, 9)
            };
            const newReviews = [reviewToAdd, ...filtered];
            const sumRating = newReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = parseFloat((sumRating / newReviews.length).toFixed(2));
            return {
              ...prop,
              reviews: newReviews,
              reviewsCount: newReviews.length,
              rating: avgRating,
            };
          }
          return prop;
        });
        localStorage.setItem("abuja_properties", JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        bookings,
        wishlist,
        searchQuery,
        selectedNeighborhood,
        priceRange,
        guestCount,
        activeView,
        selectedProperty,
        darkMode,
        addProperty,
        deleteProperty,
        updateProperty,
        addBooking,
        cancelBooking,
        toggleWishlist,
        setSearchQuery,
        setSelectedNeighborhood,
        setPriceRange,
        setGuestCount,
        setActiveView,
        setSelectedProperty,
        toggleDarkMode,
        resetFilters,
        addReview,
        refreshProperties,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
