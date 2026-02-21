import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Calendar,
  CalendarDays,
  Users,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Loader2,
  PartyPopper,
  Database,
  BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../../components/ui/sheet';
import { supabase } from '../../lib/supabase';
import { siteConfig } from '../../config/site';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', path: '/admin/calendar', icon: CalendarDays },
  { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
  { name: 'Events', path: '/admin/events', icon: PartyPopper },
  { name: 'Rooms', path: '/admin/rooms', icon: DoorOpen },
  { name: 'Pricing', path: '/admin/pricing', icon: Tag },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Customer Explorer', path: '/admin/external-customers', icon: Database },
  { name: 'Live Analytics', path: '/admin/analytics', icon: BarChart3 },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          localStorage.removeItem('adminAuth');
          setIsAuthenticated(false);
          navigate('/admin/login');
          return;
        }
        // Set adminAuth for backward compatibility
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        navigate('/admin/login');
      } else if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[color:var(--bg-base)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[color:var(--brand-accent)] animate-spin" />
      </div>
    );
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64 border-r border-white/10'}`}>
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={siteConfig.logo}
            alt={siteConfig.logoAlt}
            className="h-8 w-auto"
          />
        </Link>
        <p className="text-xs text-[color:var(--text-muted)] mt-2">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => mobile && setIsMobileOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                ? 'text-[color:var(--brand-accent)] bg-[color:var(--brand-accent)]/10 border-r-2 border-[color:var(--brand-accent)]'
                : 'text-[color:var(--text-muted)] hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-[color:var(--text-muted)] hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block bg-[color:var(--bg-surface)]">
        <Sidebar />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-[color:var(--bg-surface)] border-b border-white/10 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={siteConfig.logo}
              alt={siteConfig.logoAlt}
              className="h-8 w-auto"
            />
          </Link>

          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-[color:var(--bg-surface)] border-r border-white/10 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
