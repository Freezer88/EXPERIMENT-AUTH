import React from 'react';
import { clsx } from 'clsx';
import { Shield, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  className?: string;
}

const Footer: React.FC<FooterProps> = ({
  sections = [],
  socialLinks = {},
  className,
}) => {
  const currentYear = new Date().getFullYear();

  const defaultSections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Security', href: '/security' },
        { label: 'API', href: '/api' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact', href: '/contact' },
        { label: 'Status', href: '/status' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
      ],
    },
  ];

  const displaySections = sections.length > 0 ? sections : defaultSections;

  return (
    <footer className={clsx('bg-background border-t border-border', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-foreground">
                  Homeowners Insurance AI
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground max-w-md">
                AI-powered inventory management and insurance analysis platform that empowers 
                households to protect their assets with comprehensive documentation.
              </p>
              
              {/* Social Links */}
              <div className="mt-6 flex space-x-4">
                {socialLinks.github && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.twitter && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.linkedin && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {socialLinks.email && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`mailto:${socialLinks.email}`} aria-label="Email">
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Footer Sections */}
            {displaySections.map((section) => (
              <div key={section.title}>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Homeowners Insurance AI. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer }; 