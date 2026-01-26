import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Puzzle, Skull, Star, Percent } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function RoomCard({ room, hasOffer = false, offerText = null }) {
  const difficultyColors = {
    'Easy': 'text-green-400',
    'Medium': 'text-[color:var(--brand-accent)]',
    'Hard': 'text-orange-400',
    'Very Hard': 'text-red-400',
    'Expert': 'text-red-500'
  };

  return (
    <div className="group rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-[color:var(--brand-accent)]/30 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          {room.isHorror && (
            <Badge className="bg-red-500/20 border-red-500/30 text-red-400">
              <Skull className="w-3 h-3 mr-1" />
              Horror
            </Badge>
          )}
          {/* Offer Badge */}
          {hasOffer && (
            <Badge className="bg-green-500/20 border-green-500/30 text-green-400 animate-pulse">
              <Percent className="w-3 h-3 mr-1" />
              {offerText || 'Offer'}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          {[...Array(room.rating || 0)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-[color:var(--brand-accent)] text-[color:var(--brand-accent)]" />
          ))}
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1">
            {room.tagline}
          </p>
          <h3 className="font-display text-2xl font-bold text-white">
            {room.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Specs Row */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[color:var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {room.minPlayers}-{room.maxPlayers} Players
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {room.duration} Min
          </span>
          <span className={`flex items-center gap-1.5 ${difficultyColors[room.difficulty] || ''}`}>
            <Puzzle className="w-4 h-4" />
            {room.difficulty}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-[color:var(--text-secondary)] line-clamp-2">
          {room.description}
        </p>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <Link to={`/rooms/${room.slug}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full bg-transparent text-[color:var(--text-primary)] border-white/15 hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] h-11 rounded-xl"
            >
              View Details
            </Button>
          </Link>
          <Link to={`/book/${room.slug}`}>
            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-11 px-6 rounded-xl">
              Book
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
