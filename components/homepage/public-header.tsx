// components/homepage/public-header.tsx

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone, Mail, MapPin, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

// --- Define the shapes of the data this component expects to receive ---
interface HotelForHeader {
  id: string;
  displayName: string;
  city: string;
}

interface WebsiteConfigForHeader {
    primaryPhone?: string | null;
    primaryEmail?: string | null;
}

// --- The component now accepts a single 'data' prop ---
interface PublicHeaderProps {
  data: {
    allHotels: HotelForHeader[];
    websiteConfig: WebsiteConfigForHeader | null;
  }
}

export function PublicHeader({ data }: PublicHeaderProps) {
  // Destructure the data object for easier access
  const { allHotels, websiteConfig } = data;

  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // The navigationItems are now built dynamically from the props
  const navigationItems = [
    { name: "Home", href: "/" },
    {
      name: "Our Hotels",
      href: "#",
      submenu: allHotels.map((hotel) => ({
        name: hotel.displayName,
        href: `/property/${hotel.id}`,
        location: hotel.city,
      })),
    },
    { name: "Gallery", href: "#gallery" },
    { name: "Contact", href: "#contact" },
  ];
  
  // useEffect for scroll behavior remains the same
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 shadow-sm backdrop-blur-sm")}>
      <div className="hidden lg:block bg-primary text-primary-foreground">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-6">
              {websiteConfig?.primaryPhone && (
                <a href={`tel:${websiteConfig.primaryPhone}`} className="flex items-center gap-2 hover:text-white/80 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>{websiteConfig.primaryPhone}</span>
                </a>
              )}
              {websiteConfig?.primaryEmail && (
                <a href={`mailto:${websiteConfig.primaryEmail}`} className="flex items-center gap-2 hover:text-white/80 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>{websiteConfig.primaryEmail}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs opacity-90">
              <MapPin className="h-4 w-4" />
              <span>Cagampang Ext. Brgy Bula, General Santos City • {allHotels.length} Locations</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image src="https://4b9moeer4y.ufs.sh/f/pUvyWRtocgCV0y3FUvkBwoHGKNiCbEI9uWYstSRk5rXgMLfx" height={40} width={40} alt="TWC Logo" />
            <div className="flex flex-col">
              <span className={cn("text-xl font-bold font-serif group-hover:text-primary transition-colors  text-gray-900")}>Tropicana</span>
              <span className={cn("text-xs -mt-1 font-medium")}>Worldwide Corporation</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.submenu && item.submenu.length > 0 ? (
                  <>
                    <button className={cn("flex items-center gap-1 font-medium text-sm py-2 hover:text-primary transition-colors")}>
                      {item.name}
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white text-gray-700 rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.name} href={subItem.href} className="block px-4 py-3 text-sm hover:text-primary hover:bg-gray-50">
                          <div className="font-medium">{subItem.name}</div>
                          {subItem.location && <div className="text-xs text-gray-400 mt-1">{subItem.location}</div>}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link href={item.href} className={cn("font-medium text-sm py-2 hover:text-primary transition-colors")}>{item.name}</Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild className="hidden sm:inline-flex"><Link href="#booking">Book Now</Link></Button>
            <Sheet>
              <SheetTrigger asChild className="lg:hidden"><Button variant="ghost" size="icon" className={cn(isScrolled ? "text-gray-600" : "text-white")}><Menu className="h-6 w-6" /><span className="sr-only">Menu</span></Button></SheetTrigger>
              <SheetContent>
                {/* Mobile Menu Content can be built here using the same navigationItems array */}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}