import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { siteConfig, getPhoneLink } from '../../config/site';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <img
      src={siteConfig.logo}
      alt={siteConfig.logoAlt}
      className="h-14 w-auto rounded-lg"
      style={{ backgroundColor: 'transparent' }}
    />
  </Link>
);


export default function Navbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Navigation links with translation keys
  const navLinks = [
    { nameKey: 'nav.home', path: '/' },
    { nameKey: 'nav.rooms', path: '/rooms' },
    { nameKey: 'nav.specialEvents', path: '/events' },
    { nameKey: 'nav.findUs', path: '/find-us' },
    { nameKey: 'nav.contact', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'h-14 bg-black/80 backdrop-blur-lg border-b border-white/10'
        : 'h-16 bg-transparent'
        }`}
    >
      <nav className="max-w-6xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            // Check if link is active - for /events, also match child routes
            const isActive = link.path === '/events'
              ? location.pathname.startsWith('/events')
              : location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[color:var(--brand-accent)] ${isActive
                  ? 'text-[color:var(--brand-accent)]'
                  : 'text-[color:var(--text-secondary)]'
                  }`}
              >
                {t(link.nameKey)}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher variant="minimal" />
          <a
            href={getPhoneLink()}
            className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors ltr-flex"
          >
            <Phone className="w-4 h-4" />
            <span>{siteConfig.phoneDisplay}</span>
          </a>
          <Link to="/rooms">
            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold px-5 h-10 rounded-xl">
              {t('nav.bookNow')}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitcher variant="minimal" />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-[color:var(--bg-elevated)] border-l border-white/10 p-0"
            >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/10">
                  <Logo />
                </div>

                <div className="flex-1 py-6">
                  {navLinks.map((link) => {
                    const isActive = link.path === '/events'
                      ? location.pathname.startsWith('/events')
                      : location.pathname === link.path;

                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-6 py-3 text-lg font-medium transition-colors hover:bg-white/5 ${isActive
                          ? 'text-[color:var(--brand-accent)] border-l-2 border-[color:var(--brand-accent)]'
                          : 'text-[color:var(--text-secondary)]'
                          }`}
                      >
                        {t(link.nameKey)}
                      </Link>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-white/10 space-y-4">
                  <a
                    href={getPhoneLink()}
                    className="flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors ltr-flex"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{siteConfig.phoneDisplay}</span>
                  </a>
                  <Link to="/rooms" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 rounded-xl">
                      {t('nav.bookNow')}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
