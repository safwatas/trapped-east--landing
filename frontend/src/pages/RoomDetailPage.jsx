import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Users, Clock, Puzzle, Skull, Star, AlertTriangle, Loader2, Percent } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { bookingService } from '../lib/bookingService';
import { roomAdapter } from '../lib/adapters';
import { analytics } from '../lib/analytics';
import { getAllActiveOffers } from '../lib/pricingEngine';
import { toast } from 'sonner';

export default function RoomDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeOffer, setActiveOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Difficulty translation map
  const getDifficultyLabel = (difficulty) => {
    const difficultyMap = {
      'Easy': t('rooms.easy'),
      'Medium': t('rooms.medium'),
      'Hard': t('rooms.hard'),
      'Very Hard': t('rooms.hard'),
      'Expert': t('rooms.expert')
    };
    return difficultyMap[difficulty] || difficulty;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dbRoom, dbRooms, offers] = await Promise.all([
          bookingService.getRoomBySlug(slug),
          bookingService.getRooms(),
          getAllActiveOffers()
        ]);
        // Pass current language to adapter for localized content
        const adaptedRoom = roomAdapter(dbRoom, i18n.language);
        setRoom(adaptedRoom);
        setRooms(dbRooms.map(r => roomAdapter(r, i18n.language)));

        // Check for offers applicable to this room
        const roomOffers = offers.filter(offer => {
          if (!offer.room_ids || offer.room_ids.length === 0) {
            return true; // Applies to all rooms
          }
          return offer.room_ids.includes(adaptedRoom.id);
        });
        if (roomOffers.length > 0) {
          setActiveOffer(roomOffers[0]);
        }

        // Track ViewContent/ViewRoom
        analytics.track('ViewRoom', {
          room_id: dbRoom.id,
          room_name: dbRoom.name,
          language: i18n.language
        });
      } catch (err) {
        console.error(err);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [slug, i18n.language, t]);

  const currentIndex = rooms.findIndex(r => r.slug === slug);
  const prevRoom = currentIndex > 0 ? rooms[currentIndex - 1] : null;
  const nextRoom = currentIndex < rooms.length - 1 ? rooms[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[color:var(--brand-accent)] animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('roomDetail.notFound')}</h1>
          <Link to="/rooms">
            <Button className="bg-[color:var(--brand-accent)] text-black">{t('roomDetail.backToRooms')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    'Easy': 'text-green-400 bg-green-400/10 border-green-400/30',
    'Medium': 'text-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10 border-[color:var(--brand-accent)]/30',
    'Hard': 'text-orange-400 bg-orange-400/10 border-orange-400/30',
    'Very Hard': 'text-red-400 bg-red-400/10 border-red-400/30',
    'Expert': 'text-red-500 bg-red-500/10 border-red-500/30'
  };

  const minPrice = room.pricing?.[room.maxPlayers] || 420;
  const maxPrice = room.pricing?.[room.minPlayers] || 470;

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6">
        <Link to="/rooms" className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors ltr-flex">
          <ArrowLeft className="w-4 h-4" />
          {t('roomDetail.backToRooms')}
        </Link>
      </div>

      {/* Room Detail */}
      <section className="py-8 md:py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Rating */}
              <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                {[...Array(room.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[color:var(--brand-accent)] text-[color:var(--brand-accent)]" />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
                  {room.tagline}
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                  {room.name}
                </h1>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3 ltr-flex">
                <Badge className={difficultyColors[room.difficulty]}>
                  <Puzzle className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                  {getDifficultyLabel(room.difficulty)}
                </Badge>
                {room.isHorror && (
                  <Badge className="bg-red-500/10 border-red-500/30 text-red-400">
                    <Skull className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                    {t('roomDetail.horror')}
                  </Badge>
                )}
                {activeOffer && (
                  <Badge className="bg-green-500/10 border-green-500/30 text-green-400 animate-pulse">
                    <Percent className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
                    {activeOffer.discount_type === 'percentage'
                      ? `${activeOffer.discount_value}% ${t('roomDetail.off')}`
                      : `${activeOffer.discount_value} ${t('common.egp')} ${t('roomDetail.off')}`}
                  </Badge>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[color:var(--bg-surface)] border border-white/10">
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)] mb-1 ltr-flex">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{t('rooms.players')}</span>
                  </div>
                  <p className="font-display text-xl font-semibold text-white">
                    {room.minPlayers} - {room.maxPlayers}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[color:var(--bg-surface)] border border-white/10">
                  <div className="flex items-center gap-2 text-[color:var(--text-muted)] mb-1 ltr-flex">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{t('rooms.duration')}</span>
                  </div>
                  <p className="font-display text-xl font-semibold text-white">
                    {room.duration} {t('rooms.minutes')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-display font-semibold text-white mb-3">{t('roomDetail.theStory')}</h3>
                <p className="text-[color:var(--text-secondary)] leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* Horror Toggle Notice */}
              {room.horrorToggleable && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 ltr-flex">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-400">{t('roomDetail.horrorCanBeDisabled')}</p>
                    <p className="text-xs text-orange-400/70 mt-1">
                      {t('roomDetail.horrorDisableDesc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="p-5 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <div className="flex items-baseline gap-2 mb-1 ltr-flex">
                  <span className="font-display text-3xl font-bold text-[color:var(--brand-accent)]">
                    {minPrice} - {maxPrice} {t('common.egp')}
                  </span>
                  <span className="text-sm text-[color:var(--text-muted)]">{t('rooms.perPerson')}</span>
                </div>
                <p className="text-xs text-[color:var(--text-muted)]">
                  {t('roomDetail.priceVaries')}
                </p>
              </div>

              {/* CTA */}
              <Button
                onClick={() => navigate(`/book/${room.slug}`)}
                className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-14 rounded-xl text-lg ltr-flex items-center justify-center gap-2"
              >
                {t('roomDetail.bookThisRoom')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 px-4 md:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            {prevRoom ? (
              <Link
                to={`/rooms/${prevRoom.slug}`}
                className="flex items-center gap-3 text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors ltr-flex"
              >
                <ArrowLeft className="w-5 h-5" />
                <div className="ltr:text-left rtl:text-right">
                  <p className="text-xs uppercase tracking-wider">{t('roomDetail.previous')}</p>
                  <p className="font-display font-semibold text-white">{prevRoom.name}</p>
                </div>
              </Link>
            ) : <div />}

            {nextRoom ? (
              <Link
                to={`/rooms/${nextRoom.slug}`}
                className="flex items-center gap-3 text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors ltr-flex"
              >
                <div className="ltr:text-right rtl:text-left">
                  <p className="text-xs uppercase tracking-wider">{t('roomDetail.next')}</p>
                  <p className="font-display font-semibold text-white">{nextRoom.name}</p>
                </div>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : <div />}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
