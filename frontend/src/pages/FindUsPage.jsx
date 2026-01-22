import React from 'react';
import { Phone, MessageCircle, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { branchInfo } from '../data/mock';

export default function FindUsPage() {
  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">Location</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Find Us
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl">
            Visit our New Cairo branch in the Fifth Settlement. We're ready to trap you!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden bg-[color:var(--bg-surface)] border border-white/10 aspect-square lg:aspect-auto lg:h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.2724865726847!2d31.4!3d30.03!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAxJzQ4LjAiTiAzMcKwMjQnMDAuMCJF!5e0!3m2!1sen!2seg!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Trapped Egypt Location"
              />
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {/* Address */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-2">Address</h3>
                    <p className="text-[color:var(--text-secondary)]">
                      Fifth Settlement, New Cairo, Egypt
                    </p>
                    <a 
                      href={branchInfo.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-[color:var(--brand-accent)] hover:underline"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[color:var(--brand-accent)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white mb-4">Opening Hours</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)]">Every Day</span>
                        <span className="text-[color:var(--text-secondary)]">{branchInfo.openingHours.weekdays}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-[color:var(--text-muted)]">
                      * Last booking slot at 1:30 AM
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <h3 className="font-display font-semibold text-white mb-4">Quick Contact</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${branchInfo.phone}`}>
                    <Button variant="outline" className="w-full bg-transparent border-white/15 text-white hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] h-12 rounded-xl">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </a>
                  <a href={`https://wa.me/${branchInfo.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full bg-transparent border-white/15 text-white hover:border-green-500 hover:text-green-400 h-12 rounded-xl">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <h3 className="font-display font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a 
                    href={branchInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a 
                    href={branchInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
