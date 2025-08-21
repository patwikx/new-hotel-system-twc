"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  ImageIcon,
  Star,
  MessageSquare,
  MapPin,
  Settings,
  Eye,
  Edit,
  Plus,
  Trash2,
  MoreHorizontal,
  Utensils,
  Calendar,
  Gift,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import axios from "axios"
import { useCurrentUser } from "@/lib/current-user"
import { CreateTestimonialModal } from "./components/create-testimonial-modal"
import { CreateContactModal } from "./components/create-contact-modal"
import { CreateFAQModal } from "./components/create-faq-modal"
import { WebsiteConfigModal } from "./components/website-config-modal"
import { CMSAnalytics } from "./components/cms-analytics"
import { EditHeroSectionModal } from "./components/edit-hero-section"
import { CreateHeroSlideModal } from "./components/create-hero-section-modal"
import { CreatePageModal } from "./components/create-page-modal"
import { CreateRestaurantModal } from "./components/create-restaurant-modal"
import { CreateSpecialOfferModal } from "./components/create-special-offers-modal"
import { CreateEventModal } from "./components/create-event-modal"
import { HeroSlide } from "@/types/cms"
import { Separator } from "@/components/ui/separator"


interface Testimonial {
  id: string
  guestName: string
  guestTitle?: string
  content: string
  rating: number
  guestImage?: string
  isActive: boolean
  sortOrder: number
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  sortOrder: number
}

interface ContactInfo {
  id: string
  type: string
  label: string
  value: string
  iconName: string
  isActive: boolean
  sortOrder: number
}

interface Page {
  id: string
  title: string
  slug: string
  description?: string
  status: string
  publishedAt?: string
  createdAt: string
}

interface Restaurant {
  id: string
  name: string
  slug: string
  description: string
  type: string
  cuisine: string[]
  isActive: boolean
  isPublished: boolean
  isFeatured: boolean
  featuredImage?: string
}

interface SpecialOffer {
  id: string
  title: string
  slug: string
  type: string
  status: string
  offerPrice: number
  originalPrice?: number
  validFrom: string
  validTo: string
  isPublished: boolean
  isFeatured: boolean
  featuredImage?: string
}

interface Event {
  id: string
  title: string
  slug: string
  type: string
  status: string
  startDate: string
  endDate: string
  venue: string
  isPublished: boolean
  isFeatured: boolean
  featuredImage?: string
}

interface WebsiteConfig {
  id: string
  siteName: string
  tagline?: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  primaryPhone?: string
  primaryEmail?: string
  bookingEmail?: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  enableOnlineBooking: boolean
  enableReviews: boolean
  enableNewsletter: boolean
}

const CMSPage = () => {
  const params = useParams()
  const businessUnitId = params.businessUnitId as string
  const user = useCurrentUser()

  const isAuthorized = user?.assignments?.some(
    (assignment) =>
      assignment.businessUnitId === businessUnitId &&
      (assignment.role.name === "SUPER_ADMIN" || assignment.role.name === "HOTEL_MANAGER")
  );

  // State management
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [createHeroOpen, setCreateHeroOpen] = useState(false)
  const [editHeroOpen, setEditHeroOpen] = useState(false)
  const [createTestimonialOpen, setCreateTestimonialOpen] = useState(false)
  const [createContactOpen, setCreateContactOpen] = useState(false)
  const [createFAQOpen, setCreateFAQOpen] = useState(false)
  const [createPageOpen, setCreatePageOpen] = useState(false)
  const [createRestaurantOpen, setCreateRestaurantOpen] = useState(false)
  const [createSpecialOfferOpen, setCreateSpecialOfferOpen] = useState(false)
  const [createEventOpen, setCreateEventOpen] = useState(false)
  const [websiteConfigOpen, setWebsiteConfigOpen] = useState(false)

  // Edit modal states
  const [selectedHero, setSelectedHero] = useState<HeroSlide | null>(null)

  // Delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string; name: string } | null>(null)

  const fetchCMSData = async () => {
  try {
    setLoading(true)
    const [heroRes, testimonialsRes, faqsRes, contactRes, pagesRes, restaurantsRes, offersRes, eventsRes, configRes] = await Promise.all([
      // Remove businessUnitId parameter to fetch ALL hero slides
      axios.get(`/api/cms/hero-sections`),
      // Keep businessUnitId for other resources if you want them filtered
      axios.get(`/api/cms/testimonials?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/faqs?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/contact-info?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/pages?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/restaurants?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/special-offers?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/events?businessUnitId=${businessUnitId}`),
      axios.get(`/api/cms/website-config?businessUnitId=${businessUnitId}`),
    ])

    // Add debugging
    console.log('Hero slides data:', heroRes.data)
    console.log('Hero slides length:', heroRes.data?.length)

    setHeroSlides(heroRes.data)
    setTestimonials(testimonialsRes.data)
    setFAQs(faqsRes.data)
    setContactInfo(contactRes.data)
    setPages(pagesRes.data)
    setRestaurants(restaurantsRes.data)
    setSpecialOffers(offersRes.data)
    setEvents(eventsRes.data)
    setWebsiteConfig(configRes.data)
  } catch (error) {
    toast.error("Failed to fetch CMS data")
    console.error(error)
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    if (businessUnitId && isAuthorized) {
      fetchCMSData()
    }
  }, [businessUnitId, isAuthorized])

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      await axios.delete(`/api/cms/${deleteItem.type}/${deleteItem.id}?businessUnitId=${businessUnitId}`)
      toast.success(`${deleteItem.name} deleted successfully`)
      setDeleteModalOpen(false)
      setDeleteItem(null)
      fetchCMSData()
    } catch (error) {
      toast.error("Failed to delete item")
      console.error(error)
    }
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
  )

  const getPublishStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PUBLISHED: "default",
      DRAFT: "secondary",
      ARCHIVED: "outline",
      SCHEDULED: "outline"
    }
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>
  }

  if (!isAuthorized) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Access Denied</h3>
        <p className="text-muted-foreground">
          You need admin or manager access to manage website content for this business unit
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Content Management</h1>
          <p className="text-muted-foreground">Manage your hotel website content, dining, offers, and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setWebsiteConfigOpen(true)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Website Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/`, "_blank")}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview Website
          </Button>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hero Slides</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heroSlides.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testimonials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQs</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faqs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Special Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialOffers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Info</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactInfo.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
          <TabsTrigger value="offers">Special Offers</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        {/* Hero Slides Tab */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Hero Slides</h2>
            <Button onClick={() => setCreateHeroOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Hero Slide
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           
{heroSlides.map((hero) => (
  <Card key={hero.id}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">{hero.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedHero(hero)
                setEditHeroOpen(true)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setDeleteItem({ type: "hero-slides", id: hero.id, name: hero.title })
                setDeleteModalOpen(true)
              }}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardDescription>{hero.subtitle}</CardDescription>
      {/* Add business unit badge */}
      <Badge variant="outline" className="w-fit">
        {hero.businessUnit.displayName}
      </Badge>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <img
          src={hero.backgroundImage || "/placeholder.svg"}
          alt={hero.title}
          className="w-full h-32 object-cover rounded-md"
        />
        <div className="flex items-center justify-between">
          {getStatusBadge(hero.isActive)}
          <Badge variant="outline">Order: {hero.sortOrder}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">CTA: {hero.ctaText}</p>
      </div>
    </CardContent>
  </Card>
))}
          </div>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Guest Testimonials</h2>
            <Button onClick={() => setCreateTestimonialOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Testimonial
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{testimonial.guestName}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "testimonials", id: testimonial.id, name: testimonial.guestName })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{testimonial.guestTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm line-clamp-3">{testimonial.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      {getStatusBadge(testimonial.isActive)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
            <Button onClick={() => setCreateFAQOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add FAQ
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base line-clamp-2">{faq.question}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "faqs", id: faq.id, name: faq.question })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-3">{faq.answer}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                      {getStatusBadge(faq.isActive)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Website Pages</h2>
            <Button onClick={() => setCreatePageOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{page.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "pages", id: page.id, name: page.title })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>/{page.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
                    <div className="flex items-center justify-between">
                      {getPublishStatusBadge(page.status)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(page.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Restaurants Tab */}
        <TabsContent value="restaurants" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Restaurants & Dining</h2>
            <Button onClick={() => setCreateRestaurantOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Restaurant
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{restaurant.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Menu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "restaurants", id: restaurant.id, name: restaurant.name })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>/{restaurant.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {restaurant.featuredImage && (
                      <img
                        src={restaurant.featuredImage}
                        alt={restaurant.name}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {restaurant.type}
                      </Badge>
                      <div className="flex gap-1">
                        {restaurant.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        {getStatusBadge(restaurant.isActive)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.cuisine.slice(0, 2).map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                      {restaurant.cuisine.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{restaurant.cuisine.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Special Offers Tab */}
        <TabsContent value="offers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Special Offers & Packages</h2>
            <Button onClick={() => setCreateSpecialOfferOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Offer
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {specialOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "special-offers", id: offer.id, name: offer.title })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {offer.featuredImage && (
                      <img
                        src={offer.featuredImage}
                        alt={offer.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        ₱{offer.offerPrice.toLocaleString()}
                      </div>
                      {offer.originalPrice && (
                        <div className="text-sm text-muted-foreground line-through">
                          ₱{offer.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {offer.type}
                      </Badge>
                      <div className="flex gap-1">
                        {offer.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        {getPublishStatusBadge(offer.status)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validTo).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Events & Activities</h2>
            <Button onClick={() => setCreateEventOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "events", id: event.id, name: event.title })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{event.venue}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.featuredImage && (
                      <img
                        src={event.featuredImage}
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <div className="flex gap-1">
                        {event.isFeatured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        {getPublishStatusBadge(event.status)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <Button onClick={() => setCreateContactOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact Info
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {contactInfo.map((contact) => (
              <Card key={contact.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{contact.label}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteItem({ type: "contact-info", id: contact.id, name: contact.label })
                            setDeleteModalOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">{contact.value}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {contact.type}
                      </Badge>
                      {getStatusBadge(contact.isActive)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateHeroSlideModal
        isOpen={createHeroOpen}
        onClose={() => setCreateHeroOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateHeroOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <EditHeroSectionModal
        isOpen={editHeroOpen}
        onClose={() => {
          setEditHeroOpen(false)
          setSelectedHero(null)
        }}
        onSuccess={() => {
          fetchCMSData()
          setEditHeroOpen(false)
          setSelectedHero(null)
        }}
        heroSection={selectedHero}
        businessUnitId={businessUnitId}
      />

      <CreateTestimonialModal
        isOpen={createTestimonialOpen}
        onClose={() => setCreateTestimonialOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateTestimonialOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreateContactModal
        isOpen={createContactOpen}
        onClose={() => setCreateContactOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateContactOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreateFAQModal
        isOpen={createFAQOpen}
        onClose={() => setCreateFAQOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateFAQOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreatePageModal
        isOpen={createPageOpen}
        onClose={() => setCreatePageOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreatePageOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreateRestaurantModal
        isOpen={createRestaurantOpen}
        onClose={() => setCreateRestaurantOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateRestaurantOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreateSpecialOfferModal
        isOpen={createSpecialOfferOpen}
        onClose={() => setCreateSpecialOfferOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateSpecialOfferOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <CreateEventModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setCreateEventOpen(false)
        }}
        businessUnitId={businessUnitId}
      />

      <WebsiteConfigModal
        isOpen={websiteConfigOpen}
        onClose={() => setWebsiteConfigOpen(false)}
        onSuccess={() => {
          fetchCMSData()
          setWebsiteConfigOpen(false)
        }}
        config={websiteConfig}
        businessUnitId={businessUnitId}
      />

        <Separator />
            {/* Analytics Section */}
      <CMSAnalytics businessUnitId={businessUnitId} />
    </div>
  )
}

export default CMSPage