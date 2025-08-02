import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Menu, X, Home, Shield, FileText, Settings, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
}

export interface NavigationProps {
  items: NavigationItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  user,
  onLogout,
  className,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={clsx('bg-background border-b border-border', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">
                Homeowners Insurance AI
              </span>
            </div>
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center">
            {/* User Menu */}
            {user && (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="text-foreground font-medium">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  {onLogout && (
                    <Button variant="ghost" size="icon" onClick={onLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.label}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            
            {user && (
              <div className="pt-4 pb-3 border-t border-border">
                <div className="flex items-center px-3">
                  {user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-base font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <a
                    href="/settings"
                    className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </a>
                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        closeMobileMenu();
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export { Navigation }; 