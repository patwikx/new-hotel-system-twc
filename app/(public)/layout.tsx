import type React from "react";
import { Inter, Playfair_Display } from 'next/font/google';
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/homepage/public-header";
import { PublicFooter } from "@/components/homepage/public-footer";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });

export const metadata = {
  title: "Tropicana Worldwide - Luxury Hotels & Resorts",
  description: "Experience luxury and comfort at our premium hotels with world-class amenities and exceptional service.",
};

/**
 * Fetches only the essential data needed for the global header and footer.
 */
async function getLayoutData() {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost";
    const cleanHost = host.replace(/:\d+$/, '');

    let businessUnit = await prisma.businessUnit.findFirst({
      where: { isActive: true, website: { contains: cleanHost, mode: 'insensitive' } },
      include: { websiteConfig: true },
    });

    if (!businessUnit) {
      businessUnit = await prisma.businessUnit.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        include: { websiteConfig: true },
      });
    }

    if (!businessUnit) throw new Error("No active business units found.");

    // Fetch only the list of all hotels for the navigation menu.
    const allHotels = await prisma.businessUnit.findMany({ 
      where: { isActive: true }, 
      select: { id: true, displayName: true, city: true },
      orderBy: { displayName: 'asc' }
    });

    // The 'roomTypes' query has been removed to optimize the layout.
    return { businessUnit, allHotels, websiteConfig: businessUnit.websiteConfig };
  } catch (error) {
    console.error("Error fetching layout data:", error);
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const layoutData = await getLayoutData();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body suppressHydrationWarning>
        {layoutData && <PublicHeader data={layoutData} />}
        <main>
            {children}
        </main>
        {layoutData && <PublicFooter data={layoutData} />}
      </body>
    </html>
  );
}