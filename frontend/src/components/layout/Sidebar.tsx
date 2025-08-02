import React, { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Home, Shield, FileText, Settings, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: SidebarItem[];
  isActive?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  items,
  user,
  onLogout,
  className,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = item.isActive;

    return (
      <div key={item.id}>
        <a
          href={item.href}
          className={clsx(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            {
              'bg-primary text-primary-foreground': isActive,
              'text-muted-foreground hover:text-foreground hover:bg-accent': !isActive,
            },
            level > 0 && 'ml-4'
          )}
        >
          {item.icon && (
            <span className={clsx('flex-shrink-0', collapsed ? 'mr-0' : 'mr-3')}>
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-4 w-4"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }}
                >
                  {isExpanded ? (
                    <ChevronLeft className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
            </>
          )}
        </a>
        
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'flex flex-col bg-background border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-semibold text-foreground">
              Homeowners AI
            </span>
          </div>
        )}
        
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => renderSidebarItem(item))}
      </nav>

      {/* User Section */}
      {user && !collapsed && (
        <div className="p-4 border-t border-border">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="flex-1">
              <Settings className="h-4 w-4" />
            </Button>
            {onLogout && (
              <Button variant="ghost" size="icon" onClick={onLogout} className="flex-1">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {user && collapsed && (
        <div className="p-4 border-t border-border">
          {user.avatar ? (
            <img
              className="h-8 w-8 rounded-full mx-auto"
              src={user.avatar}
              alt={user.name}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mx-auto">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { Sidebar }; 