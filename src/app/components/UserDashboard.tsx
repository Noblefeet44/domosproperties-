"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PropertyCard } from "./PropertyCard";

export const UserDashboard: React.FC = () => {
  const {
    activeView,
    bookings,
    cancelBooking,
    properties,
    wishlist,
    setActiveView,
    addReview,
  } = useApp();

  const [activeReviewBookingId, setActiveReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmittedBookingId, setReviewSubmittedBookingId] = useState<string | null>(null);

  const activeWishlistProperties = properties.filter((p) => wishlist.includes(p.id));

  const handleOpenReviewForm = (bookingId: string) => {
    setActiveReviewBookingId(bookingId);
    setReviewRating(5);
    setReviewComment("");
    setReviewSubmittedBookingId(null);
  };

  const handleReviewSubmit = (e: React.FormEvent, propertyId: string, bookingId: string) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    addReview(propertyId, {
      guestName: "Alhaji Ibrahim",
      avatar: "AI",
      rating: reviewRating,
      comment: reviewComment,
    });

    setReviewSubmittedBookingId(bookingId);
    setTimeout(() => {
      setActiveReviewBookingId(null);
      setReviewSubmittedBookingId(null);
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {activeView === "bookings" && (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Reservations
            </h1>
            <p className="text-sm text-stone-500 mt-1.5">
              Review and manage your bookings at Abuja&apos;s premier locations.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-20 bg-stone-100/30 dark:bg-zinc-900/10 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800">
              <span className="text-4xl">🗓️</span>
              <h3 className="text-base font-bold mt-4">No reservations yet</h3>
              <p className="text-xs text-stone-500 mt-1">
                Explore luxury apartments and secure your booking today.
              </p>
              <button
                onClick={() => setActiveView("explore")}
                className="mt-6 px-6 py-2.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold dark:hover:bg-gold dark:hover:text-white transition-all shadow-xs"
              >
                Find Apartments
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const isReviewOpen = activeReviewBookingId === booking.id;
                const isReviewSuccess = reviewSubmittedBookingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="glass rounded-3xl overflow-hidden shadow-sm flex flex-col border border-stone-200/60 dark:border-zinc-800/60 p-5 gap-5 transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-5">
                      {/* Photo */}
                      <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                        <img
                          src={booking.propertyImage}
                          alt={booking.propertyName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-semibold tracking-wider">
                                REFERENCE: {booking.id}
                              </span>
                              <h3 className="text-base font-extrabold text-stone-900 dark:text-zinc-100 mt-0.5">
                                {booking.propertyName}
                              </h3>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                booking.status === "confirmed"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-medium text-stone-500">
                            <div>
                              <span className="text-[10px] uppercase text-stone-400 block mb-0.5">Check-in</span>
                              <span className="text-stone-850 dark:text-zinc-200">{booking.checkIn}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-stone-400 block mb-0.5">Check-out</span>
                              <span className="text-stone-850 dark:text-zinc-200">{booking.checkOut}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-stone-400 block mb-0.5">Guests</span>
                              <span className="text-stone-850 dark:text-zinc-200">
                                {booking.guestsCount} {booking.guestsCount === 1 ? "guest" : "guests"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase text-stone-400 block mb-0.5">Booking Date</span>
                              <span className="text-stone-850 dark:text-zinc-200">{booking.bookingDate}</span>
                            </div>
                          </div>

                          {/* Selected Add-ons List */}
                          {booking.addons && booking.addons.length > 0 && (
                            <div className="mt-4 p-3 bg-stone-100/50 dark:bg-zinc-900/40 border border-stone-200/40 dark:border-zinc-850 rounded-xl max-w-xl">
                              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                                Included VIP Services
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {booking.addons.map((addon) => (
                                  <span
                                    key={addon.id}
                                    className="text-[10px] bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-semibold border border-gold/15"
                                  >
                                    ✦ {addon.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100 dark:border-zinc-800/80">
                          <div>
                            <span className="text-xs text-stone-400">Total Paid: </span>
                            <span className="text-base font-extrabold text-stone-900 dark:text-zinc-50">
                              ₦{booking.totalPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {booking.status === "confirmed" && !isReviewOpen && (
                              <button
                                onClick={() => handleOpenReviewForm(booking.id)}
                                className="text-xs font-bold text-gold border border-gold/30 hover:border-gold hover:bg-gold/5 px-4 py-2 rounded-xl transition-all"
                              >
                                Leave Review
                              </button>
                            )}

                            {booking.status === "confirmed" && (
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to cancel this reservation?")) {
                                    cancelBooking(booking.id);
                                  }
                                }}
                                className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline px-4 py-2"
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inline Review Form */}
                    {isReviewOpen && (
                      <div className="mt-4 border-t border-stone-200/45 dark:border-zinc-800/45 pt-4 max-w-xl animate-in slide-in-from-top-2 duration-200">
                        {isReviewSuccess ? (
                          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2">
                            <span>✓</span> Review submitted successfully! Thank you for your feedback.
                          </div>
                        ) : (
                          <form onSubmit={(e) => handleReviewSubmit(e, booking.propertyId, booking.id)} className="space-y-3">
                            <h4 className="text-xs font-bold text-stone-800 dark:text-zinc-200">Rate your stay at {booking.propertyName}</h4>
                            
                            {/* Star Selector */}
                            <div className="flex items-center gap-1.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const starValue = i + 1;
                                return (
                                  <button
                                    type="button"
                                    key={i}
                                    onClick={() => setReviewRating(starValue)}
                                    className="text-gold focus:outline-hidden hover:scale-110 transition-transform"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill={starValue <= reviewRating ? "currentColor" : "none"}
                                      stroke="currentColor"
                                      strokeWidth={1.5}
                                      className="w-5 h-5"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.174-.477.892-.477 1.066 0l2.4 4.887 5.392.784c.532.077.744.73.356 1.107l-3.9 3.801.921 5.37c.09.528-.47.935-.945.688l-4.82-2.535-4.82 2.535c-.475.247-1.035-.16-.945-.688l.921-5.37-3.9-3.801c-.388-.378-.176-1.03.356-1.107l5.392-.784 2.4-4.887Z" />
                                    </svg>
                                  </button>
                                );
                              })}
                              <span className="text-xs font-bold text-stone-500 ml-2">{reviewRating} / 5</span>
                            </div>

                            <textarea
                              placeholder="Share your stay experience, what you liked or how we can improve..."
                              rows={2.5}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/50 focus:outline-hidden focus:ring-1 focus:ring-gold"
                              required
                            />

                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-stone-900 text-stone-50 dark:bg-zinc-550 dark:text-zinc-50 hover:bg-gold dark:hover:bg-gold dark:hover:text-white text-xs font-bold rounded-xl transition-all"
                              >
                                Submit Review
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveReviewBookingId(null)}
                                className="px-4 py-2 border border-stone-200 dark:border-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-900 text-xs font-semibold rounded-xl transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeView === "wishlist" && (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Wishlist
            </h1>
            <p className="text-sm text-stone-500 mt-1.5">
              Saved listings you are considering for your next trip to Abuja.
            </p>
          </div>

          {activeWishlistProperties.length === 0 ? (
            <div className="text-center py-20 bg-stone-100/30 dark:bg-zinc-900/10 rounded-3xl border border-dashed border-stone-200 dark:border-zinc-800">
              <span className="text-4xl">❤️</span>
              <h3 className="text-base font-bold mt-4">Your wishlist is empty</h3>
              <p className="text-xs text-stone-500 mt-1">
                Save your favorite luxury properties for quick booking later.
              </p>
              <button
                onClick={() => setActiveView("explore")}
                className="mt-6 px-6 py-2.5 rounded-full text-xs font-semibold bg-stone-900 text-stone-50 dark:bg-zinc-50 dark:text-zinc-950 hover:bg-gold dark:hover:bg-gold dark:hover:text-white transition-all shadow-xs"
              >
                Explore Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeWishlistProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
