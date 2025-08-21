// components/homepage/public-footer.tsx

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import Image from "next/image";

// Define the shapes of the data this component expects to receive
interface BusinessUnitForFooter {
  displayName: string;
  description: string | null;
  address: string | null;
}

interface WebsiteConfigForFooter {
  siteName?: string | null;
  tagline?: string | null;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;
}

interface PublicFooterProps {
  data: {
    businessUnit: BusinessUnitForFooter;
    websiteConfig: WebsiteConfigForFooter | null;
  };
}

export function PublicFooter({ data }: PublicFooterProps) {
  // --- FIX: Destructure safely in case data is missing ---
  const { businessUnit, websiteConfig } = data || {};

  // Use optional chaining (?.) to prevent errors if data is missing
  const siteName = websiteConfig?.siteName || businessUnit?.displayName;
  const siteDescription = websiteConfig?.tagline || businessUnit?.description;

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center mr-3">
                  <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={40} width={40} alt="TWC Logo" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{siteName || 'Tropicana'}</h3>
                  <p className="text-xs text-slate-400">Worldwide Corporation</p>
                </div>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                {siteDescription || 'Your Oasis in the Heart of the City'}
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-2">
                {websiteConfig?.facebookUrl && (
                  <Link 
                    href={websiteConfig.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"
                  >
                    <Facebook className="h-4 w-4 text-slate-300" />
                  </Link>
                )}
                {websiteConfig?.instagramUrl && (
                  <Link 
                    href={websiteConfig.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"
                  >
                    <Instagram className="h-4 w-4 text-slate-300" />
                  </Link>
                )}
                {websiteConfig?.twitterUrl && (
                  <Link 
                    href={websiteConfig.twitterUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"
                  >
                    <Twitter className="h-4 w-4 text-slate-300" />
                  </Link>
                )}
                <Link 
                  href="#" 
                  className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center transition-colors duration-200"
                >
                  <Youtube className="h-4 w-4 text-slate-300" />
                </Link>
              </div>
            </div>

            {/* Our Properties */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Our Properties</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Anchor Hotel
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Dolores Farm Resort
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Dolores Lake Resort
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Dolores Tropicana Resort
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#accommodations" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Accommodations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Cafe Rodrigo
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Events & Weddings
                  </Link>
                </li>
                <li>
                  <Link href="#amenities" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm">
                    Business Services
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <div className="space-y-3">
                {businessUnit?.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm leading-relaxed">
                      {businessUnit.address}
                    </span>
                  </div>
                )}
                
                {websiteConfig?.primaryPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <a 
                      href={`tel:${websiteConfig.primaryPhone}`} 
                      className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm"
                    >
                      {websiteConfig.primaryPhone}
                    </a>
                  </div>
                )}
                
                {websiteConfig?.primaryEmail && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <a 
                      href={`mailto:${websiteConfig.primaryEmail}`} 
                      className="text-slate-300 hover:text-amber-400 transition-colors duration-200 text-sm"
                    >
                      {websiteConfig.primaryEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
{/* This new grid container will place the Newsletter and Awards/Actions side-by-side */}
        <div className="border-t border-slate-700 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Newsletter Section */}
        <div>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Stay in the Loop</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about exclusive offers, new properties, and special events across all our luxury hotels.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <button className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-sm font-semibold transition-colors duration-200">
                Subscribe
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mt-4">
              <input type="checkbox" id="marketing" className="w-4 h-4 rounded border-slate-600 bg-slate-700" />
              <label htmlFor="marketing" className="text-xs text-slate-400 cursor-pointer">
                I agree to receive marketing emails
              </label>
            </div>
          </div>
        </div>

        {/* Awards & Quick Actions */}
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-center">
            
            {/* Awards */}
            <div className="col-span-2 md:col-span-4 lg:col-span-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-amber-400 text-lg mb-1">★★★★★</div>
                  <p className="text-white text-xs font-medium">5-Star Rating</p>
                  <p className="text-slate-400 text-xs">Luxury Hotels</p>
                </div>
                <div>
                  <div className="text-green-400 text-lg mb-1">✓</div>
                  <p className="text-white text-xs font-medium">DOT Accredited</p>
                  <p className="text-slate-400 text-xs">Tourism Philippines</p>
                </div>
                <div>
                  <div className="text-blue-400 text-lg mb-1">♦</div>
                  <p className="text-white text-xs font-medium">Premium Member</p>
                  <p className="text-slate-400 text-xs">Hotel Association</p>
                </div>
                <div>
                  <div className="text-purple-400 text-lg mb-1">♥</div>
                  <p className="text-white text-xs font-medium">Guest Choice</p>
                  <p className="text-slate-400 text-xs">Award Winner 2024</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="col-span-2 md:col-span-4 lg:col-span-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <Link href="#book" className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors duration-200">
                  <div className="text-amber-400 text-lg mb-1">📅</div>
                  <p className="text-white text-xs font-medium">Book Now</p>
                </Link>
                <Link href="#gift" className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors duration-200">
                  <div className="text-green-400 text-lg mb-1">🎁</div>
                  <p className="text-white text-xs font-medium">Gift Cards</p>
                </Link>
                <Link href="#loyalty" className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors duration-200">
                  <div className="text-blue-400 text-lg mb-1">⭐</div>
                  <p className="text-white text-xs font-medium">Loyalty Program</p>
                </Link>
                <Link href="#careers" className="bg-slate-700 hover:bg-slate-600 rounded-lg p-3 text-center transition-colors duration-200">
                  <div className="text-purple-400 text-lg mb-1">💼</div>
                  <p className="text-white text-xs font-medium">Careers</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center lg:text-left">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} {siteName || 'Tropicana'} Worldwide Corporation. All rights reserved.
              </p>
              <p className="text-slate-500 text-xs flex items-center space-x-1">
                <span>Made with</span>
                <span className="text-red-500">♥</span>
                <span>in the Philippines</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="#privacy" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="#terms" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="#accessibility" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="#sitemap" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Sitemap
              </Link>
              <Link href="#support" className="text-slate-400 hover:text-amber-400 transition-colors duration-200">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
      
    </footer>
  )
}