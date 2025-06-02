import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../auth/AuthProvider';
import { Menu, X, LogOut, User, Settings, BrainCircuit, Book, Info, CreditCard, HelpCircle, MessageSquare, Scale, Building2, FileText } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  auth?: boolean;
  icon?: React.ReactNode;
}

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { usr, signOut } = useAuthContext();
  const loc = useLocation();
  
  const nav: NavItem[] = [
    // Public Routes
    { name: 'Platform', href: '/platform', icon: <Book className="h-4 w-4" /> },
    { name: 'About', href: '/about', icon: <Info className="h-4 w-4" /> },
    { name: 'Features', href: '/features', icon: <Settings className="h-4 w-4" /> },
    { name: 'Pricing', href: '/pricing', icon: <CreditCard className="h-4 w-4" /> },
    { name: 'FAQ', href: '/faq', icon: <HelpCircle className="h-4 w-4" /> },
    { name: 'Contact', href: '/contact', icon: <MessageSquare className="h-4 w-4" /> },
    
    // Legal Routes
    { name: 'Legal', href: '/legal', icon: <Scale className="h-4 w-4" /> },
    { name: 'Privacy', href: '/privacy', icon: <Scale className="h-4 w-4" /> },
    { name: 'Terms', href: '/terms', icon: <FileText className="h-4 w-4" /> },
    
    // Company Routes
    { name: 'Company', href: '/company', icon: <Building2 className="h-4 w-4" /> },
    { name: 'Careers', href: '/careers', icon: <Briefcase className="h-4 w-4" /> },
    { name: 'Blog', href: '/blog', icon: <FileText className="h-4 w-4" /> },
    
    // Auth Routes
    { name: 'Sign In', href: '/signin', auth: false },
    { name: 'Sign Up', href: '/signup', auth: false },
    
    // Protected Routes
    { name: 'Dashboard', href: '/dashboard', auth: true, icon: <Home className="h-4 w-4" /> },
    { name: 'Profile', href: '/profile', auth: true, icon: <User className="h-4 w-4" /> },
    { name: 'Settings', href: '/settings', auth: true, icon: <Settings className="h-4 w-4" /> }
  ];

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  // Filter navigation items based on auth status
  const filteredNav = nav.filter(item => {
    if (usr && item.auth) return true;
    if (!usr && item.auth === false) return true;
    if (item.auth === undefined) return true;
    return false;
  });

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link to="/" className="flex items-center text-blue-600">
                <BrainCircuit className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">SkillSwapX</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="ml-6 hidden space-x-8 sm:flex">
              {filteredNav.map((item) => (
                <div key={item.name} className="relative">
                  <Link
                    to={item.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      loc.pathname === item.href
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    aria-current={loc.pathname === item.href ? 'page' : undefined}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>
          
          {/* User menu (desktop) */}
          {usr && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="user-menu-button"
                    aria-expanded={open}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                  </button>
                </div>
                
                {open && (
                  <div
                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Your Profile
                      </div>
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <div className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </div>
                    </Link>
                    <button
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={open}
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              {open ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 pb-3 pt-2">
            {filteredNav.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  loc.pathname === item.href
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
                aria-current={loc.pathname === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {usr && (
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{usr.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => setOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>
                <button
                  className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}