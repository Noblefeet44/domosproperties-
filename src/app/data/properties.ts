export interface Review {
  id: string;
  guestName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in Naira per night
  location: string;
  neighborhood: 'Maitama' | 'Asokoro' | 'Wuse II' | 'Jabi' | 'Garki';
  bedrooms: number;
  bathrooms: number;
  guests: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  amenities: string[];
  featured: boolean;
  reviews: Review[];
}

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "The Grand Maitama Villa",
    description: "Experience absolute luxury in the diplomatic core of Abuja. This stunning villa offers ultra-premium finishes, a private swimming pool, automated smart-home systems, and a personal chef upon request. Perfect for foreign dignitaries and high-profile guests looking for privacy and style.",
    price: 350000,
    location: "Maitama, Abuja",
    neighborhood: "Maitama",
    bedrooms: 4,
    bathrooms: 4.5,
    guests: 8,
    rating: 4.9,
    reviewsCount: 3,
    images: ["/images/maitama.png"],
    amenities: ["Private Pool", "24/7 Solar Backup", "Armed Security", "Personal Chef", "High-speed Fiber", "Smart Home", "Snooker Board"],
    featured: true,
    reviews: [
      {
        id: "r1",
        guestName: "Ambassador Davies",
        avatar: "AD",
        rating: 5,
        date: "June 12, 2026",
        comment: "Exceptional service and security. The solar backup was seamless, and the location is highly secure for international envoys."
      },
      {
        id: "r2",
        guestName: "Chioma Nze",
        avatar: "CN",
        rating: 5,
        date: "May 28, 2026",
        comment: "Absolutely breathtaking! The private pool and interior design are top-tier. Worth every single Naira."
      },
      {
        id: "r3",
        guestName: "Yusuf Danjuma",
        avatar: "YD",
        rating: 4.7,
        date: "April 15, 2026",
        comment: "Excellent experience. The chef cooked amazing local meals. Minor delay in check-in, but the staff was extremely helpful."
      }
    ]
  },
  {
    id: "2",
    title: "Jabi Lakefront Penthouse",
    description: "Wake up to panoramic views of Jabi Lake from this spectacular floor-to-ceiling glass penthouse. Styled with high-end Italian furniture, it features an infinity pool, fully equipped modern gym, and a beautiful sunset deck for hosting intimate dinners.",
    price: 220000,
    location: "Jabi, Abuja",
    neighborhood: "Jabi",
    bedrooms: 3,
    bathrooms: 3,
    guests: 6,
    rating: 4.85,
    reviewsCount: 2,
    images: ["/images/jabi.png"],
    amenities: ["Lake View", "Infinity Pool", "Fully Equipped Gym", "24/7 Power", "High-speed Wi-Fi", "Outdoor Lounge", "Elevator"],
    featured: true,
    reviews: [
      {
        id: "r4",
        guestName: "Sarah Jenkins",
        avatar: "SJ",
        rating: 5,
        date: "July 2, 2026",
        comment: "The views of the lake at sunset are unreal. The gym is better equipped than most commercial hotels. Will definitely return."
      },
      {
        id: "r5",
        guestName: "Femi Alao",
        avatar: "FA",
        rating: 4.7,
        date: "June 20, 2026",
        comment: "Stunning penthouse with excellent modern features. Uninterrupted power and fast internet made remote work a breeze."
      }
    ]
  },
  {
    id: "3",
    title: "Emerald Boutique Studio",
    description: "A chic, contemporary studio designed for the modern business traveler or couple visiting Wuse II. Featuring emerald accents, bespoke lighting, and premium velvet furniture. Steps away from Abuja's finest restaurants, lounges, and boutiques.",
    price: 85000,
    location: "Wuse II, Abuja",
    neighborhood: "Wuse II",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    rating: 4.78,
    reviewsCount: 2,
    images: ["/images/wuse.png"],
    amenities: ["Ultra-fast Fiber", "24/7 Power", "Smart TV", "Modern Kitchenette", "Concierge Service", "Free Parking"],
    featured: false,
    reviews: [
      {
        id: "r6",
        guestName: "Tariq Bello",
        avatar: "TB",
        rating: 5,
        date: "July 10, 2026",
        comment: "Perfect cozy studio in Wuse II. Walking distance to all the best cafes. Very neat and well decorated."
      },
      {
        id: "r7",
        guestName: "Emily Watson",
        avatar: "EW",
        rating: 4.5,
        date: "July 01, 2026",
        comment: "Very stylish and comfortable bed. Perfect for business trips. The internet was super fast!"
      }
    ]
  },
  {
    id: "4",
    title: "The Asokoro Presidential Suite",
    description: "Designed for premium VIPs, this suite in the heart of Asokoro offers maximum security with biometric entry, private elevator access, and a bulletproof security post. Complete with marble flooring, custom chandeliers, and a private spa room.",
    price: 450000,
    location: "Asokoro, Abuja",
    neighborhood: "Asokoro",
    bedrooms: 5,
    bathrooms: 5.5,
    guests: 10,
    rating: 4.95,
    reviewsCount: 2,
    images: ["/images/asokoro.png"],
    amenities: ["Biometric Access", "Private Elevator", "Private Spa Room", "24/7 Power", "Armed Escort (On-demand)", "Executive Lounge"],
    featured: true,
    reviews: [
      {
        id: "r8",
        guestName: "Chief Okon",
        avatar: "CO",
        rating: 5,
        date: "May 10, 2026",
        comment: "Unmatched safety protocols and premium grandeur. The private elevator and marble finish are absolutely imperial."
      },
      {
        id: "r9",
        guestName: "Alhaji Musa",
        avatar: "AM",
        rating: 4.9,
        date: "April 02, 2026",
        comment: "Spacious, highly secure, and extremely comfortable. Fits a large delegation perfectly."
      }
    ]
  },
  {
    id: "5",
    title: "Garki Executive Corporate Suite",
    description: "A modern, highly functional 2-bedroom suite optimized for business travelers. Equipped with ergonomic workstations, high-speed reliable Wi-Fi, and situated right in the business hub of Garki with easy access to corporate offices and banks.",
    price: 110000,
    location: "Garki, Abuja",
    neighborhood: "Garki",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 4.65,
    reviewsCount: 2,
    images: ["/images/wuse.png"],
    amenities: ["Ergonomic Workstation", "High-speed Wi-Fi", "24/7 Power", "Conference Room Access", "Daily Laundry", "Gym Access"],
    featured: false,
    reviews: [
      {
        id: "r10",
        guestName: "David Cole",
        avatar: "DC",
        rating: 4.8,
        date: "June 15, 2026",
        comment: "The workstation was great, complete with an ergonomic chair. Power was solid, which is vital for remote meetings."
      },
      {
        id: "r11",
        guestName: "Funke Adebayo",
        avatar: "FA",
        rating: 4.5,
        date: "June 05, 2026",
        comment: "Clean, professional, and centrally located in Garki. Commuting to corporate meetings was very easy."
      }
    ]
  },
  {
    id: "6",
    title: "Jabi Lake Breeze Suite",
    description: "Enjoy peaceful lakeside breezes from the spacious balcony of this modern 2-bedroom apartment. Features a fully loaded smart home system, premium gaming console, and a cozy aesthetic perfect for retreats.",
    price: 95000,
    location: "Jabi, Abuja",
    neighborhood: "Jabi",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    rating: 4.7,
    reviewsCount: 2,
    images: ["/images/jabi.png"],
    amenities: ["Balcony with Lake View", "PS5 Console", "Smart Home Voice Control", "24/7 Power", "Fully Fitted Kitchen"],
    featured: false,
    reviews: [
      {
        id: "r12",
        guestName: "Chinedu Okafor",
        avatar: "CO",
        rating: 4.9,
        date: "July 12, 2026",
        comment: "Spent the weekend playing PS5 on the huge TV and enjoying the lake breeze. Highly relaxing vibe."
      },
      {
        id: "r13",
        guestName: "Bisi Williams",
        avatar: "BW",
        rating: 4.5,
        date: "June 18, 2026",
        comment: "Excellent kitchen setup. Smart home automation worked perfectly for lighting and music."
      }
    ]
  },
  {
    id: "7",
    title: "Asokoro Royal Heights",
    description: "Perched high in Asokoro, this apartment offers jaw-dropping city-skyline views of Abuja. Highlights include a stunning roof terrace, shared pool, and curated art pieces throughout the apartment.",
    price: 280000,
    location: "Asokoro, Abuja",
    neighborhood: "Asokoro",
    bedrooms: 3,
    bathrooms: 3.5,
    guests: 6,
    rating: 4.8,
    reviewsCount: 2,
    images: ["/images/asokoro.png"],
    amenities: ["Roof Terrace", "Infinity Pool", "City Skyline Views", "24/7 Power", "Curated Art Gallery", "Wine Cellar"],
    featured: false,
    reviews: [
      {
        id: "r14",
        guestName: "Marcus Sterling",
        avatar: "MS",
        rating: 5,
        date: "June 25, 2026",
        comment: "The roof terrace has the absolute best views of Abuja. The art collection in the living room is super elegant."
      },
      {
        id: "r15",
        guestName: "Halima Sani",
        avatar: "HS",
        rating: 4.6,
        date: "June 08, 2026",
        comment: "Luxurious, peaceful, and beautifully designed. Great pool, very private."
      }
    ]
  },
  {
    id: "8",
    title: "Wuse Nightlife Penthouse Loft",
    description: "Located right in the center of the action in Wuse II, this ultra-modern industrial loft is perfect for entertainment enthusiasts. Comes with a private rooftop bar setup, DJ mixer, and premium sound systems.",
    price: 130000,
    location: "Wuse II, Abuja",
    neighborhood: "Wuse II",
    bedrooms: 2,
    bathrooms: 2.5,
    guests: 4,
    rating: 4.75,
    reviewsCount: 2,
    images: ["/images/maitama.png"],
    amenities: ["Private Rooftop Bar", "High-End Audio System", "24/7 Power", "Soundproofing", "Smart Lighting Controls"],
    featured: false,
    reviews: [
      {
        id: "r16",
        guestName: "DJ Xclusive (Mock)",
        avatar: "DX",
        rating: 5,
        date: "July 05, 2026",
        comment: "Soundproofing was so good we could blast music without bothering neighbors. The bar and sound system are pro quality."
      },
      {
        id: "r17",
        guestName: "Kelechi Ugo",
        avatar: "KU",
        rating: 4.5,
        date: "June 29, 2026",
        comment: "Best spot in Wuse II for a small gathering. Beautiful industrial loft design. Extremely fun stayed."
      }
    ]
  }
];
