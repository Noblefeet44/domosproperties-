"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Property, INITIAL_PROPERTIES, Review } from "../data/properties";
import { Hotel, INITIAL_HOTELS } from "../data/hotels";
import { Car, INITIAL_CARS } from "../data/cars";
import { LandProperty, INITIAL_LANDS } from "../data/lands";
import { AgentProfile, INITIAL_AGENTS } from "../data/agents";

export interface ConciergeAddon {
  id: string;
  name: string;
  price: number;
  type: 'daily' | 'flat';
}

export interface Reservation {
  id: string;
  agentId?: string;
  category?: 'property' | 'hotel' | 'car' | 'land';
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

export type ActiveDirectoryView = 'explore' | 'hotels' | 'cars' | 'land' | 'bookings' | 'about' | 'faq';

interface AppContextType {
  // Agent Auth & Management
  currentAgent: AgentProfile | null;
  allAgents: AgentProfile[];
  registerAgent: (data: Omit<AgentProfile, "id" | "status" | "role">) => Promise<{ success: boolean; message?: string }>;
  loginAgent: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAgent: () => void;
  updateAgentStatus: (agentId: string, status: 'approved' | 'banned' | 'pending') => Promise<void>;
  updateAgentInfo: (agentId: string, fields: Partial<AgentProfile>) => Promise<void>;
  refreshAgents: () => Promise<void>;

  // Datasets
  properties: Property[];
  hotels: Hotel[];
  cars: Car[];
  lands: LandProperty[];
  bookings: Reservation[];
  
  // Search & Filter state
  searchQuery: string;
  selectedNeighborhood: string;
  priceRange: [number, number];
  guestCount: number;
  activeView: ActiveDirectoryView;
  darkMode: boolean;

  // Selected item modal states
  selectedProperty: Property | null;
  selectedHotel: Hotel | null;
  selectedCar: Car | null;
  selectedLand: LandProperty | null;

  // Property CRUD
  addProperty: (property: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  updateProperty: (propertyId: string, property: Partial<Property> & { images?: string[] }) => Promise<void>;
  refreshProperties: () => Promise<void>;

  // Hotel CRUD
  addHotel: (hotel: Omit<Hotel, "id" | "starRating" | "reviewsCount" | "featured"> & { images: string[] }) => Promise<void>;
  deleteHotel: (hotelId: string) => Promise<void>;
  updateHotel: (hotelId: string, hotel: Partial<Hotel> & { images?: string[] }) => Promise<void>;
  refreshHotels: () => Promise<void>;

  // Car CRUD
  addCar: (car: Omit<Car, "id" | "featured"> & { images: string[] }) => Promise<void>;
  deleteCar: (carId: string) => Promise<void>;
  updateCar: (carId: string, car: Partial<Car> & { images?: string[] }) => Promise<void>;
  refreshCars: () => Promise<void>;

  // Land CRUD
  addLand: (land: Omit<LandProperty, "id" | "featured"> & { images: string[] }) => Promise<void>;
  deleteLand: (landId: string) => Promise<void>;
  updateLand: (landId: string, land: Partial<LandProperty> & { images?: string[] }) => Promise<void>;
  refreshLands: () => Promise<void>;

  // Booking & Review
  addBooking: (booking: Omit<Reservation, "id" | "bookingDate" | "status">) => void;
  cancelBooking: (bookingId: string) => void;
  addReview: (propertyId: string, review: Omit<Review, "id" | "date">) => void;

  // State Setters
  setSearchQuery: (query: string) => void;
  setSelectedNeighborhood: (neighborhood: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setGuestCount: (count: number) => void;
  setActiveView: (view: ActiveDirectoryView) => void;
  setSelectedProperty: (property: Property | null) => void;
  setSelectedHotel: (hotel: Hotel | null) => void;
  setSelectedCar: (car: Car | null) => void;
  setSelectedLand: (land: LandProperty | null) => void;
  toggleDarkMode: () => void;
  resetFilters: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAgent, setCurrentAgent] = useState<AgentProfile | null>(null);
  const [allAgents, setAllAgents] = useState<AgentProfile[]>(INITIAL_AGENTS);

  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [lands, setLands] = useState<LandProperty[]>(INITIAL_LANDS);
  const [bookings, setBookings] = useState<Reservation[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [guestCount, setGuestCount] = useState(1);
  const [activeView, setActiveView] = useState<ActiveDirectoryView>('explore');
  const [darkMode, setDarkMode] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedLand, setSelectedLand] = useState<LandProperty | null>(null);

  // LocalStorage Helper
  const safeSetLocalStorage = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage:`, e);
    }
  };

  // Live Refresh Agents
  const refreshAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllAgents(data);
          safeSetLocalStorage("domos_agents", data);
        }
      }
    } catch (error) {
      console.error("Failed to load live agents:", error);
    }
  };

  const registerAgent = async (agentData: Omit<AgentProfile, "id" | "status" | "role">) => {
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...agentData, status: "approved", role: "agent" }),
      });
      const data = await res.json();
      if (data.success && data.agent) {
        setCurrentAgent(data.agent);
        safeSetLocalStorage("domos_current_agent", data.agent);
        await refreshAgents();
        return { success: true };
      }
      return { success: false, message: data.error || "Sign up failed" };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const loginAgent = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.agent) {
        setCurrentAgent(data.agent);
        safeSetLocalStorage("domos_current_agent", data.agent);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logoutAgent = () => {
    setCurrentAgent(null);
    try {
      localStorage.removeItem("domos_current_agent");
    } catch {}
  };

  const updateAgentStatus = async (agentId: string, status: 'approved' | 'banned' | 'pending') => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status } : a))
    );
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, status }),
      });
      await refreshAgents();
    } catch (e) {
      console.warn("API updateAgentStatus error:", e);
    }
  };

  const updateAgentInfo = async (agentId: string, fields: Partial<AgentProfile>) => {
    setAllAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, ...fields } : a))
    );
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: agentId, ...fields }),
      });
      await refreshAgents();
    } catch (e) {
      console.warn("API updateAgentInfo error:", e);
    }
  };

  // Live Refresh functions
  const refreshProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProperties(data);
          safeSetLocalStorage("domos_properties", data);
        }
      }
    } catch (error) {
      console.error("Failed to load live properties:", error);
    }
  };

  const refreshHotels = async () => {
    try {
      const res = await fetch("/api/hotels");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setHotels(data);
          safeSetLocalStorage("domos_hotels", data);
        }
      }
    } catch (error) {
      console.error("Failed to load live hotels:", error);
    }
  };

  const refreshCars = async () => {
    try {
      const res = await fetch("/api/cars");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCars(data);
          safeSetLocalStorage("domos_cars", data);
        }
      }
    } catch (error) {
      console.error("Failed to load live cars:", error);
    }
  };

  const refreshLands = async () => {
    try {
      const res = await fetch("/api/lands");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setLands(data);
          safeSetLocalStorage("domos_lands", data);
        }
      }
    } catch (error) {
      console.error("Failed to load live lands:", error);
    }
  };

  // Mount logic
  useEffect(() => {
    try {
      const savedCurrentAgent = localStorage.getItem("domos_current_agent");
      if (savedCurrentAgent) setCurrentAgent(JSON.parse(savedCurrentAgent));

      const savedBk = localStorage.getItem("domos_bookings");
      if (savedBk) setBookings(JSON.parse(savedBk));

      const savedProps = localStorage.getItem("domos_properties");
      if (savedProps) setProperties(JSON.parse(savedProps));

      const savedHotels = localStorage.getItem("domos_hotels");
      if (savedHotels) setHotels(JSON.parse(savedHotels));

      const savedCars = localStorage.getItem("domos_cars");
      if (savedCars) setCars(JSON.parse(savedCars));

      const savedLands = localStorage.getItem("domos_lands");
      if (savedLands) setLands(JSON.parse(savedLands));
    } catch {}

    refreshAgents();
    refreshProperties();
    refreshHotels();
    refreshCars();
    refreshLands();

    // Theme initialization
    try {
      const savedTheme = localStorage.getItem("domos_theme");
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

  // Properties CRUD
  const addProperty = async (newProp: Omit<Property, "id" | "rating" | "reviewsCount" | "featured" | "reviews"> & { images: string[] }) => {
    const generatedId = "prop-" + Math.random().toString(36).substring(2, 9);
    const propertyToAdd: Property = {
      ...newProp,
      id: generatedId,
      agentId: currentAgent?.id,
      agentPhone: newProp.agentPhone || currentAgent?.whatsapp || "07073537007",
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
        body: JSON.stringify({ ...propertyToAdd, agent_id: currentAgent?.id, agentId: currentAgent?.id }),
      });
      await refreshProperties();
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
      await fetch(`/api/properties?id=${propertyId}`, { method: "DELETE" });
      await refreshProperties();
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
      await refreshProperties();
    } catch (e) {
      console.warn("API updateProperty sync error:", e);
    }
  };

  // Hotel CRUD
  const addHotel = async (newHotel: Omit<Hotel, "id" | "starRating" | "reviewsCount" | "featured"> & { images: string[] }) => {
    const generatedId = "hotel-" + Math.random().toString(36).substring(2, 9);
    const hotelToAdd: Hotel = {
      ...newHotel,
      id: generatedId,
      agentId: currentAgent?.id,
      agentPhone: newHotel.agentPhone || currentAgent?.whatsapp || "07073537007",
      starRating: 4.8,
      reviewsCount: 0,
      featured: false,
    };
    setHotels((prev) => {
      const updated = [hotelToAdd, ...prev];
      safeSetLocalStorage("domos_hotels", updated);
      return updated;
    });

    try {
      await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...hotelToAdd, agent_id: currentAgent?.id, agentId: currentAgent?.id }),
      });
      await refreshHotels();
    } catch (e) {
      console.warn("API addHotel sync error:", e);
    }
  };

  const deleteHotel = async (hotelId: string) => {
    setHotels((prev) => {
      const updated = prev.filter((h) => h.id !== hotelId);
      safeSetLocalStorage("domos_hotels", updated);
      return updated;
    });
    try {
      await fetch(`/api/hotels?id=${hotelId}`, { method: "DELETE" });
      await refreshHotels();
    } catch (e) {
      console.warn("API deleteHotel sync error:", e);
    }
  };

  const updateHotel = async (hotelId: string, updatedFields: Partial<Hotel> & { images?: string[] }) => {
    setHotels((prev) => {
      const updated = prev.map((h) => (h.id === hotelId ? ({ ...h, ...updatedFields } as Hotel) : h));
      safeSetLocalStorage("domos_hotels", updated);
      return updated;
    });
    try {
      await fetch("/api/hotels", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: hotelId, ...updatedFields }),
      });
      await refreshHotels();
    } catch (e) {
      console.warn("API updateHotel sync error:", e);
    }
  };

  // Car CRUD
  const addCar = async (newCar: Omit<Car, "id" | "featured"> & { images: string[] }) => {
    const generatedId = "car-" + Math.random().toString(36).substring(2, 9);
    const carToAdd: Car = {
      ...newCar,
      id: generatedId,
      agentId: currentAgent?.id,
      agentPhone: newCar.agentPhone || currentAgent?.whatsapp || "07073537007",
      featured: false,
    };
    setCars((prev) => {
      const updated = [carToAdd, ...prev];
      safeSetLocalStorage("domos_cars", updated);
      return updated;
    });

    try {
      await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...carToAdd, agent_id: currentAgent?.id, agentId: currentAgent?.id }),
      });
      await refreshCars();
    } catch (e) {
      console.warn("API addCar sync error:", e);
    }
  };

  const deleteCar = async (carId: string) => {
    setCars((prev) => {
      const updated = prev.filter((c) => c.id !== carId);
      safeSetLocalStorage("domos_cars", updated);
      return updated;
    });
    try {
      await fetch(`/api/cars?id=${carId}`, { method: "DELETE" });
      await refreshCars();
    } catch (e) {
      console.warn("API deleteCar sync error:", e);
    }
  };

  const updateCar = async (carId: string, updatedFields: Partial<Car> & { images?: string[] }) => {
    setCars((prev) => {
      const updated = prev.map((c) => (c.id === carId ? ({ ...c, ...updatedFields } as Car) : c));
      safeSetLocalStorage("domos_cars", updated);
      return updated;
    });
    try {
      await fetch("/api/cars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: carId, ...updatedFields }),
      });
      await refreshCars();
    } catch (e) {
      console.warn("API updateCar sync error:", e);
    }
  };

  // Land CRUD
  const addLand = async (newLand: Omit<LandProperty, "id" | "featured"> & { images: string[] }) => {
    const generatedId = "land-" + Math.random().toString(36).substring(2, 9);
    const landToAdd: LandProperty = {
      ...newLand,
      id: generatedId,
      agentId: currentAgent?.id,
      agentPhone: newLand.agentPhone || currentAgent?.whatsapp || "07073537007",
      featured: false,
    };
    setLands((prev) => {
      const updated = [landToAdd, ...prev];
      safeSetLocalStorage("domos_lands", updated);
      return updated;
    });

    try {
      await fetch("/api/lands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...landToAdd, agent_id: currentAgent?.id, agentId: currentAgent?.id }),
      });
      await refreshLands();
    } catch (e) {
      console.warn("API addLand sync error:", e);
    }
  };

  const deleteLand = async (landId: string) => {
    setLands((prev) => {
      const updated = prev.filter((l) => l.id !== landId);
      safeSetLocalStorage("domos_lands", updated);
      return updated;
    });
    try {
      await fetch(`/api/lands?id=${landId}`, { method: "DELETE" });
      await refreshLands();
    } catch (e) {
      console.warn("API deleteLand sync error:", e);
    }
  };

  const updateLand = async (landId: string, updatedFields: Partial<LandProperty> & { images?: string[] }) => {
    setLands((prev) => {
      const updated = prev.map((l) => (l.id === landId ? ({ ...l, ...updatedFields } as LandProperty) : l));
      safeSetLocalStorage("domos_lands", updated);
      return updated;
    });
    try {
      await fetch("/api/lands", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: landId, ...updatedFields }),
      });
      await refreshLands();
    } catch (e) {
      console.warn("API updateLand sync error:", e);
    }
  };

  // Booking & Reviews
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedNeighborhood("All");
    setPriceRange([0, 50000000]);
    setGuestCount(1);
  };

  return (
    <AppContext.Provider
      value={{
        currentAgent,
        allAgents,
        registerAgent,
        loginAgent,
        logoutAgent,
        updateAgentStatus,
        updateAgentInfo,
        refreshAgents,
        properties,
        hotels,
        cars,
        lands,
        bookings,
        searchQuery,
        selectedNeighborhood,
        priceRange,
        guestCount,
        activeView,
        darkMode,
        selectedProperty,
        selectedHotel,
        selectedCar,
        selectedLand,
        addProperty,
        deleteProperty,
        updateProperty,
        refreshProperties,
        addHotel,
        deleteHotel,
        updateHotel,
        refreshHotels,
        addCar,
        deleteCar,
        updateCar,
        refreshCars,
        addLand,
        deleteLand,
        updateLand,
        refreshLands,
        addBooking,
        cancelBooking,
        addReview,
        setSearchQuery,
        setSelectedNeighborhood,
        setPriceRange,
        setGuestCount,
        setActiveView,
        setSelectedProperty,
        setSelectedHotel,
        setSelectedCar,
        setSelectedLand,
        toggleDarkMode,
        resetFilters,
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
