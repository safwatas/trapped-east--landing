import React from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MessageCircle, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { siteConfig, getPhoneLink, getWhatsAppLink } from '../config/site';

export default function FindUsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)]">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--brand-accent)] mb-3">{t('findUs.tagline')}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {t('findUs.pageTitle')}
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] max-w-2xl">
            {t('findUs.pageSubtitle')}
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
                src={siteConfig.googleMapsEmbed}
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
                <div className="flex items-start gap-4 ltr-flex">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[color:var(--brand-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white mb-2">{t('findUs.address')}</h3>
                    <p className="text-[color:var(--text-secondary)]">
                      {siteConfig.address}
                    </p>
                    <a
                      href={siteConfig.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-sm text-[color:var(--brand-accent)] hover:underline ltr-flex items-center gap-1"
                    >
                      {t('findUs.directions')} <span className="rtl:rotate-180">→</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <div className="flex items-start gap-4 ltr-flex">
                  <div className="w-12 h-12 rounded-xl bg-[color:var(--brand-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[color:var(--brand-accent)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white mb-4">{t('findUs.openingHours')}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[color:var(--text-muted)]">{t('findUs.everyday')}</span>
                        <span className="text-[color:var(--text-secondary)]">{siteConfig.openingHours.everyday}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-[color:var(--text-muted)]">
                      * {t('findUs.lastBooking')} {siteConfig.openingHours.lastSlot}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <h3 className="font-display font-semibold text-white mb-4">{t('findUs.quickContact')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href={getPhoneLink()}>
                    <Button variant="outline" className="w-full bg-transparent border-white/15 text-white hover:border-[color:var(--brand-accent)] hover:text-[color:var(--brand-accent)] h-12 rounded-xl ltr-flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      {t('contact.callUs')}
                    </Button>
                  </a>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full bg-transparent border-white/15 text-white hover:border-green-500 hover:text-green-400 h-12 rounded-xl ltr-flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {t('contact.whatsapp')}
                    </Button>
                  </a>
                </div>
              </div>

              {/* Social */}
              <div className="p-6 rounded-2xl bg-[color:var(--bg-surface)] border border-white/10">
                <h3 className="font-display font-semibold text-white mb-4">{t('findUs.followUs')}</h3>
                <div className="flex gap-3 ltr-flex">
                  <a
                    href={siteConfig.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={siteConfig.instagram}
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
