import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { siteConfig, getPhoneLink, getWhatsAppLink, getEmailLink } from '../../config/site';

export default function Footer() {
  return (
    <footer className="bg-[color:var(--bg-surface)] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src={siteConfig.logo}
                alt={siteConfig.logoAlt}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-[color:var(--text-primary)] mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/rooms" className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors">
                  Our Rooms
                </Link>
              </li>
              <li>
                <Link to="/find-us" className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors">
                  Find Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-semibold text-[color:var(--text-primary)] mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={getPhoneLink()}
                  className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={getEmailLink()}
                  className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2 text-sm text-[color:var(--text-muted)]">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {siteConfig.address}
                </span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-display font-semibold text-[color:var(--text-primary)] mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-sm text-[color:var(--text-muted)]">
              <li className="flex justify-between">
                <span>Every Day</span>
                <span className="text-[color:var(--text-secondary)]">{siteConfig.openingHours.everyday}</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--brand-accent)] hover:border-[color:var(--brand-accent)]/40 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-sm text-[color:var(--text-muted)]">
            {siteConfig.addressShort}
          </p>
        </div>
      </div>
    </footer>
  );
}
