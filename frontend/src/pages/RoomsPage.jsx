import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoomCard from '../components/rooms/RoomCard';
import { bookingService } from '../lib/bookingService';
import { roomAdapter } from '../lib/adapters';
import { getAllActiveOffers } from '../lib/pricingEngine';
import { Loader2 } from 'lucide-react';

export default function RoomsPage() {
  const { t, i18n } = useTranslation();
  const [rooms, setRooms] = useState([]);
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, offersData] = await Promise.all([
          bookingService.getRooms(),
          getAllActiveOffers()
        ]);
        // Pass current language to adapter for localized content
        setRooms(roomsData.map(r => roomAdapter(r, i18n.language)));
        setOffers(offersData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [i18n.language]);

  // Check if a room has an active offer
  const getRoomOffer = (roomId) => {
    const roomOffers = offers.filter(offer => {
      if (!offer.room_ids || offer.room_ids.length === 0) {
        return true; // Applies to all rooms
      }
      return offer.room_ids.includes(roomId);
    });

    if (roomOffers.length === 0) return null;

    // Return first/best offer
    const offer = roomOffers[0];
    return {
      hasOffer: true,
      text: offer.discount_type === 'percentage'
        ? `${offer.discount_value}% Off`
        : `${offer.discount_value} EGP Off`
    };
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">New Cairo Branch</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('rooms.pageTitle')}
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl">
            {t('rooms.pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children min-h-[400px]">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[color:var(--brand-accent)] animate-spin" />
              </div>
            ) : (
              rooms.map((room) => {
                const offerInfo = getRoomOffer(room.id);
                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    hasOffer={offerInfo?.hasOffer || false}
                    offerText={offerInfo?.text}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
