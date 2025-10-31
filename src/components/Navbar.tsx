import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FileText, Coins, ShieldCheck, User, Settings, LogOut, Menu, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useServiceStatus } from '@/hooks/useServiceStatus';
import logoUrl from '@/assets/agritrust-logo.svg';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSuccess, isError, isLoading } = useServiceStatus();

  // Déterminer la couleur et le texte du tooltip
  let statusColor = 'bg-gray-400';
  let statusTooltip = 'Connecting to services...';
  if (isSuccess) {
    statusColor = 'bg-green-500';
    statusTooltip = 'All systems operational.';
  } else if (isError) {
    statusColor = 'bg-red-500';
    statusTooltip = 'Service disruption detected.';
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/register', label: 'Register', icon: FileText },
    { to: '/tokenize', label: 'Tokenize', icon: Coins },
    { to: '/verify', label: 'Verify', icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={logoUrl}
              alt="AgriTrust"
              className="h-10 w-auto"
            />
            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              <div 
                className={`w-3 h-3 rounded-full ${statusColor} transition-colors duration-300`}
                title={statusTooltip}
              />
              <span className="hidden sm:block text-xl font-heading font-bold text-gray-900">
                AgriTrust
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant="ghost"
                  className={
                    isActive(to)
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-full px-4 py-2'
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full px-4 py-2'
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-body text-gray-700 max-w-[150px] truncate">
                {user?.email || 'Wallet User'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/session-settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-6 mt-8">
                {/* User Info */}
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-body text-gray-700 truncate">
                    {user?.email || 'Wallet User'}
                  </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start rounded-full ${
                          isActive(to)
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {label}
                      </Button>
                    </Link>
                  ))}
                </nav>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* User Actions */}
                <div className="flex flex-col gap-2">
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Link to="/session-settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
