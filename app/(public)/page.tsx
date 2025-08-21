import { HeroSection } from "@/components/homepage/hero-section"
import { FeaturesSection } from "@/components/homepage/features-section"
import { AccommodationsSection } from "@/components/homepage/accommodations"
import { AmenitiesSection } from "@/components/homepage/amenities-section"
import { GallerySection } from "@/components/homepage/gallery-section"
import { TestimonialsSection } from "@/components/homepage/testimonials-section"
import { FAQSection } from "@/components/homepage/faq-section"
import { ContactSection } from "@/components/homepage/contact-section"

// This function now correctly builds the API URL with the businessUnitId
async function getHomepageData() {
  try {
    const businessUnitId = process.env.NEXT_PUBLIC_BUSINESS_UNIT_ID
    if (!businessUnitId) {
      throw new Error("NEXT_PUBLIC_BUSINESS_UNIT_ID is not set in .env.local")
    }

    // Construct the URL with the required query parameter
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const apiUrl = new URL(`${baseUrl}/api/cms/homepage`)
    apiUrl.searchParams.set("businessUnitId", businessUnitId)

    const response = await fetch(apiUrl.toString(), {
      cache: "no-store", // Always fetch fresh data for homepage
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching homepage data:", error)
    return null
  }
}

export default async function HomePage() {
  const data = await getHomepageData()

  // This loading state will show if the data fetch fails or is in progress
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Welcome to Our Hotel
          </h1>
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </div>
    )
  }

  // --- CORRECTED SECTION ---
  // Each component now receives its specific data as a prop.
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {data.heroSections?.length > 0 && (
        <HeroSection heroSections={data.heroSections} />
      )}

      {/* Features Section */}
      {data.features?.length > 0 && <FeaturesSection features={data.features} />}
      
      {/* Accommodations Section (was missing from the original JSX) */}
      {data.accommodations?.length > 0 && (
        <AccommodationsSection accommodations={data.accommodations} />
      )}

      {/* Amenities Section */}
      {data.amenities && <AmenitiesSection amenities={data.amenities} />}

      {/* Gallery Section */}
      {data.gallery && <GallerySection gallery={data.gallery} />}

      {/* Testimonials Section */}
      {data.testimonials?.length > 0 && (
        <TestimonialsSection testimonials={data.testimonials} />
      )}

      {/* FAQ Section */}
      {data.faqs && <FAQSection faqs={data.faqs} />}

      {/* Contact Section */}
      {data.contact && <ContactSection contact={data.contact} />}
    </main>
  )
}