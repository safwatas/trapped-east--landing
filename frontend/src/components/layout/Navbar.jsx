import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <img
      src="https://customer-assets.emergentagent.com/job_e4dc0a10-5155-45bf-be9d-ca5350deb9d2/artifacts/x3eqytrr_TRAPPED-logo-Final-NEW-transparent-2-1-.jpg"
      alt="Trapped Egypt"
      className="h-10 w-auto"
    />
  </Link>
);

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Rooms', path: '/rooms' },
  { name: 'Find Us', path: '/find-us' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-[color:var(--brand-accent)] ${location.pathname === link.path
                  ? 'text-[color:var(--brand-accent)]'
                  : 'text-[color:var(--text-secondary)]'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="tel:+201028885599"
            className="flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>+20 10 288 855 99</span>
          </a>
          <Link to="/rooms">
            <Button className="bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold px-5 h-10 rounded-xl">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
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
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-6 py-3 text-lg font-medium transition-colors hover:bg-white/5 ${location.pathname === link.path
                        ? 'text-[color:var(--brand-accent)] border-l-2 border-[color:var(--brand-accent)]'
                        : 'text-[color:var(--text-secondary)]'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="p-6 border-t border-white/10 space-y-4">
                <a
                  href="tel:+201200004434"
                  className="flex items-center gap-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+20 120 000 4434</span>
                </a>
                <Link to="/rooms" onClick={() => setIsOpen(false)} className="block">
                  <Button className="w-full bg-[color:var(--brand-accent)] text-black hover:bg-[color:var(--brand-accent-2)] font-semibold h-12 rounded-xl">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
