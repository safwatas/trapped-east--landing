import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RoomCard from '../components/rooms/RoomCard';
import { rooms } from '../data/mock';

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">New Cairo Branch</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Room
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl">
            We offer several themed rooms, each one masterfully designed to be filled with elaborate 
            logic puzzles you need to solve in order to escape.
          </p>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
