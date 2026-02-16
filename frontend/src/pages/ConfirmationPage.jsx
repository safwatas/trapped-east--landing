import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Users, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { siteConfig, getPhoneLink, getWhatsAppLink } from '../config/site';

export default function ConfirmationPage() {
  const location = useLocation();
  const booking = location.state || {};

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Booking Submitted!
          </h1>
          <p className="text-[color:var(--text-secondary)] mb-8">
            Thank you for your booking request. Our team will contact you shortly to confirm your reservation.
          </p>

          {/* Booking Details Card */}
          {booking.room && (
            <div className="rounded-2xl bg-[color:var(--bg-surface)] border border-white/10 p-6 text-left mb-8">
              <h3 className="font-display font-semibold text-white mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--text-muted)]">Room</p>
                    <p className="text-white font-medium">{booking.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--text-muted)]">Date</p>
                    <p className="text-white font-medium">{booking.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--text-muted)]">Time</p>
                    <p className="text-white font-medium">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[color:var(--brand-accent)]/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[color:var(--text-muted)]">Players</p>
                    <p className="text-white font-medium">{booking.players} people</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[color:var(--text-muted)]">Total</span>
                    <span className="font-display text-xl font-bold text-[color:var(--brand-accent)]">
                      {booking.totalPrice} EGP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Options */}
          <div className="space-y-4 mb-8">
            <p className="text-sm text-[color:var(--text-muted)]">
              Questions? Contact us directly:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href={getPhoneLink()}>
                <Button variant="outline" className="w-full sm:w-auto bg-transparent border-white/15 text-white hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] h-11 rounded-xl">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </a>
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent border-white/15 text-white hover:border-green-500 hover:text-green-400 h-11 rounded-xl">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Back to Home */}
          <Link to="/">
            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 px-8 rounded-xl">
              Back to Home
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
