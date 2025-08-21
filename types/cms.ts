// Content Management System types for hotel website
export interface HeroSection {
  id: string
  title: string
  subtitle: string
  backgroundImageUrl: string
  ctaText: string
  ctaLink: string
  isActive: boolean
  sortOrder: number
}

export interface Feature {
  id: string
  title: string
  description: string
  iconName: string
  isActive: boolean
  sortOrder: number
}

export interface Testimonial {
  id: string
  customerName: string
  customerTitle?: string
  content: string
  rating: number
  avatarUrl?: string
  isActive: boolean
  sortOrder: number
}

export interface GalleryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  category: string
  isActive: boolean
  sortOrder: number
}

export interface ContactInfo {
  id: string
  type: 'PHONE' | 'EMAIL' | 'ADDRESS' | 'SOCIAL'
  label: string
  value: string
  iconName: string
  isActive: boolean
  sortOrder: number
}

export interface PageContent {
  id: string
  section: string
  key: string
  value: string
  type: 'TEXT' | 'HTML' | 'IMAGE' | 'URL'
  isActive: boolean
}

export interface Amenity {
  id: string
  name: string
  description?: string
  iconName: string
  category: string
  isActive: boolean
  sortOrder: number
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  sortOrder: number
}

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  backgroundImageUrl: string; // Standardized name
  ctaText: string;
  ctaLink: string; // Standardized name
  isActive: boolean;
  sortOrder: number;
}

export interface HeroSlide {
  id: string
  businessUnitId: string
  title: string
  subtitle?: string
  description?: string
  backgroundImage: string
  backgroundVideo?: string
  ctaText?: string
  ctaUrl?: string
  ctaStyle: string
  textPosition: string
  textColor: string
  overlayOpacity: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  // Add business unit information
  businessUnit: {
    id: string
    name: string
    displayName: string
  }
}