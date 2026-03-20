import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, IndianRupee, Calendar, Radio, Image, MapPin, MessageCircle, FileText, LogOut, Heart, Megaphone, Home, Users, UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import { useShrineAuth } from '../context/ShrineAuthContext';

export const AdminNavigation: React.FC = () => {
  const { logout } = useShrineAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // All navigation items in a single array
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/donations', label: 'Donations', shortLabel: 'Donations', icon: IndianRupee },
    { path: '/admin/bookings', label: 'Mass Bookings', shortLabel: 'Bookings', icon: Calendar },
    { path: '/admin/prayer-requests', label: 'Prayer Requests', shortLabel: 'Prayers', icon: Heart },
    { path: '/admin/testimonies', label: 'Testimonies', shortLabel: 'Testimonies', icon: MessageCircle },
    { path: '/admin/gallery', label: 'Gallery', shortLabel: 'Gallery', icon: Image },
    { path: '/admin/livestream', label: 'Livestream', shortLabel: 'Stream', icon: Radio },
    { path: '/admin/fathers', label: 'Fathers', shortLabel: 'Fathers', icon: UserCheck },
    { path: '/admin/announcements', label: 'Announcements', shortLabel: 'Announcements', icon: Megaphone },
    { path: '/admin/management', label: 'Management Team', shortLabel: 'Management', icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

 const handleLogout = async () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  window.location.href = '/admin/login';
};

  return (
    <>
      <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section - Better spacing */}
            <Link to="/admin/dashboard" className="flex items-center gap-3 flex-shrink-0 mr-6">
              <div className="bg-green-700 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg">Admin Panel</span>
                <p className="text-green-200 text-xs">Our Lady Of Sorrows Shrine</p>
              </div>
            </Link>

            {/* Desktop Navigation - Better spacing and alignment */}
            <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide px-4">
              <div className="flex items-center gap-1 min-w-max">
                {navItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap min-w-fit ${
                        isActive(item.path)
                          ? 'bg-green-900 text-white shadow-md border border-green-600'
                          : 'text-green-100 hover:bg-green-700 hover:text-white hover:shadow-sm'
                      }`}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden xl:block text-sm">{item.shortLabel}</span>
                      <span className="hidden lg:block xl:hidden text-sm">{item.shortLabel.slice(0, 5)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Section - Logout Button with better spacing */}
            <div className="hidden md:flex items-center flex-shrink-0 ml-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-green-100 hover:bg-green-600 hover:text-white text-sm px-4 py-2 h-auto rounded-lg transition-all border border-transparent hover:border-green-500"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:block ml-2 text-sm">Logout</span>
              </Button>
            </div>

            {/* Mobile menu button - Better styling */}
            <button
              className="md:hidden p-3 rounded-lg hover:bg-green-700 transition-colors border border-transparent hover:border-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Improved spacing */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-green-700 bg-green-800 shadow-lg">
            <div className="px-4 py-3 space-y-1 max-h-96 overflow-y-auto">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-green-900 text-white font-medium shadow-sm border border-green-600'
                        : 'text-green-100 hover:bg-green-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="pt-3 mt-3 border-t border-green-700">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg text-green-200 hover:bg-green-600 hover:text-white transition-colors text-sm w-full font-medium"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};