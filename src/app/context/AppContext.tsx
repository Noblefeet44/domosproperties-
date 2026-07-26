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
  searchQuery: string;
  selectedNeighborhood: string;
  priceRange: [number, number];
  guestCount: number;
  activeView: 'explore' | 'bookings' | 'host' | 'about' | 'faq';
  selectedProperty: Property | null;
  darkMode: boolean;
  addProperty: (property: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => void;
  deleteProperty: (propertyId: string) => void;
  updateProperty: (propertyId: string, property: Partial<Property> & { images?: string[] }) => Promise<void>;
  addBooking: (booking: Omit<Reservation, "id" | "bookingDate" | "status">) => void;
  cancelBooking: (bookingId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedNeighborhood: (neighborhood: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setGuestCount: (count: number) => void;
  setActiveView: (view: 'explore' | 'bookings' | 'host' | 'about' | 'faq') => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600000]);
  const [guestCount, setGuestCount] = useState(1);
  const [activeView, setActiveView] = useState<'explore' | 'bookings' | 'host' | 'about' | 'faq'>('explore');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load properties (with local fallback)
  const refreshProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
        }
      }
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  // Safe localStorage helper
  const safeSetLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage:`, e);
    }
  };

  // Initialize values on client side
  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem("domos_bookings") || localStorage.getItem("abuja_bookings");
      if (savedBookings) setBookings(JSON.parse(savedBookings));
    } catch {}

    try {
      const savedProperties = localStorage.getItem("domos_properties") || localStorage.getItem("abuja_properties");
      if (savedProperties) {
        const parsed = JSON.parse(savedProperties);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProperties(parsed);
        } else {
          setProperties(INITIAL_PROPERTIES);
        }
      } else {
        setProperties(INITIAL_PROPERTIES);
      }
    } catch {
      setProperties(INITIAL_PROPERTIES);
    }

    try {
      const savedTheme = localStorage.getItem("domos_theme") || localStorage.getItem("abuja_theme");
      if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      safeSetLocalStorage("domos_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      safeSetLocalStorage("domos_theme", "light");
    }
  };

  const addProperty = async (newProp: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => {
    const generatedId = "prop-" + Math.random().toString(36).substring(2, 9);
    const propertyToAdd: Property = {
      ...newProp,
      id: generatedId,
      rating: 5.0,
      reviewsCount: 0,
      featured: false,
      reviews: [],
    };
    setProperties((prev) => {
      const updated = [propertyToAdd, ...prev];
      safeSetLocalStorage("domos_properties", updated);
      return updated;
    });

    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyToAdd),
      });
    } catch (e) {
      console.warn("API addProperty sync error:", e);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      safeSetLocalStorage("domos_properties", updated);
      return updated;
    });

    try {
      await fetch(`/api/properties?id=${propertyId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("API deleteProperty sync error:", e);
    }
  };

  const updateProperty = async (propertyId: string, updatedFields: Partial<Property> & { images?: string[] }) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === propertyId ? ({ ...p, ...updatedFields } as Property) : p));
      safeSetLocalStorage("domos_properties", updated);
      return updated;
    });

    try {
      await fetch("/api/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId, ...updatedFields }),
      });
    } catch (e) {
      console.warn("API updateProperty sync error:", e);
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

    setBookings((prev) => {
      const updated = [bookingToAdd, ...prev];
      safeSetLocalStorage("domos_bookings", updated);
      return updated;
    });

    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingToAdd),
      });
    } catch (e) {
      console.warn("API addBooking sync error:", e);
    }
  };

  const cancelBooking = (bookingId: string) => {
    setBookings((prev) => {
      const updated = prev.map((bk) =>
        bk.id === bookingId ? { ...bk, status: 'cancelled' as const } : bk
      );
      safeSetLocalStorage("domos_bookings", updated);
      return updated;
    });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhood("All");
    setPriceRange([0, 600000]);
    setGuestCount(1);
  };

  const addReview = async (propertyId: string, review: Omit<Review, "id" | "date">) => {
    const reviewToAdd: Review = {
      ...review,
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    setProperties((prev) => {
      const updated = prev.map((prop) => {
        if (prop.id === propertyId) {
          const newReviews = [reviewToAdd, ...(prop.reviews || [])];
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
      safeSetLocalStorage("domos_properties", updated);
      return updated;
    });

    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, ...reviewToAdd }),
      });
    } catch (e) {
      console.warn("API addReview sync error:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        properties,
        bookings,
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
