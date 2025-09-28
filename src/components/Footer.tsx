import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  const footerSections = [
    {
      title: 'Find A Store',
      links: [
        { href: '/store-locator', label: 'Store Locator' },
        { href: '/nike-app', label: 'Nike App' },
        { href: '/membership', label: 'Become a Member' },
        { href: '/feedback', label: 'Send Us Feedback' },
      ],
    },
    {
      title: 'Get Help',
      links: [
        { href: '/help', label: 'Order Status' },
        { href: '/shipping', label: 'Shipping and Delivery' },
        { href: '/returns', label: 'Returns' },
        { href: '/payment', label: 'Payment Options' },
        { href: '/contact', label: 'Contact Us' },
      ],
    },
    {
      title: 'About Nike',
      links: [
        { href: '/news', label: 'News' },
        { href: '/careers', label: 'Careers' },
        { href: '/investors', label: 'Investors' },
        { href: '/sustainability', label: 'Sustainability' },
      ],
    },
  ];

  const socialLinks = [
    {
      href: 'https://twitter.com/nike',
      label: 'Twitter',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      href: 'https://facebook.com/nike',
      label: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      href: 'https://youtube.com/nike',
      label: 'YouTube',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      href: 'https://instagram.com/nike',
      label: 'Instagram',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.807-2.026 1.218-3.323 1.218zm7.718-1.297c-.875.807-2.026 1.218-3.323 1.218s-2.448-.411-3.323-1.218c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323c.875-.926 2.026-1.416 3.323-1.416s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className={cn('bg-dark-900 text-light-100', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="text-light-100 font-bold text-2xl font-jost mb-4">
              NIKE
            </div>
            <p className="text-light-400 text-body mb-6">
              Just Do It. Bringing inspiration and innovation to every athlete in the world.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  className="text-light-400 hover:text-light-100 transition-colors duration-200"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-light-100 text-body-medium font-medium mb-4 uppercase tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-light-400 hover:text-light-100 text-body transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-dark-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-light-400 text-body">
              © {new Date().getFullYear()} Nike, Inc. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link
                href="/privacy"
                className="text-light-400 hover:text-light-100 text-body transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-light-400 hover:text-light-100 text-body transition-colors duration-200"
              >
                Terms of Use
              </Link>
              <Link
                href="/cookies"
                className="text-light-400 hover:text-light-100 text-body transition-colors duration-200"
              >
                Cookie Settings
              </Link>
            </div>
          </div>

          {/* Country/Region Selector */}
          <div className="mt-6 flex justify-center md:justify-start">
            <button className="flex items-center text-light-400 hover:text-light-100 text-body transition-colors duration-200">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              United States
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;