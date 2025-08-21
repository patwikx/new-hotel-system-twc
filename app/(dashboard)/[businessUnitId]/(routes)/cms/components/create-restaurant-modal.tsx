"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Utensils, X } from "lucide-react"

const createRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.enum(["FINE_DINING", "CASUAL_DINING", "CAFE", "BAR", "POOLSIDE", "ROOM_SERVICE", "BUFFET", "SPECIALTY"]),
  cuisine: z.array(z.string()).min(1, "At least one cuisine type is required"),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  totalSeats: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Total seats must be a positive number"
  }),
  privateRooms: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Private rooms must be a non-negative number"
  }),
  outdoorSeating: z.boolean().optional(),
  airConditioned: z.boolean().optional(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  averageMeal: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Average meal price must be a positive number"
  }),
  acceptsReservations: z.boolean().optional(),
  advanceBookingDays: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Advance booking days must be a positive number"
  }),
  minPartySize: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Minimum party size must be a positive number"
  }),
  maxPartySize: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum party size must be a positive number"
  }),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  dressCode: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Sort order must be a non-negative number"
  }),
})

const restaurantTypes = [
  { value: "FINE_DINING", label: "Fine Dining" },
  { value: "CASUAL_DINING", label: "Casual Dining" },
  { value: "CAFE", label: "Cafe" },
  { value: "BAR", label: "Bar" },
  { value: "POOLSIDE", label: "Poolside" },
  { value: "ROOM_SERVICE", label: "Room Service" },
  { value: "BUFFET", label: "Buffet" },
  { value: "SPECIALTY", label: "Specialty" },
]

const cuisineOptions = [
  "Filipino", "International", "Asian", "Chinese", "Japanese", "Korean", "Thai", "Vietnamese",
  "Italian", "French", "Mediterranean", "American", "Mexican", "Indian", "Seafood", "Steakhouse",
  "Vegetarian", "Vegan", "Fusion", "Continental", "Local", "Regional"
]

const priceRanges = [
  { value: "$", label: "$ - Budget Friendly" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Upscale" },
  { value: "$$$$", label: "$$$$ - Fine Dining" },
]

interface CreateRestaurantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  businessUnitId: string
}

export const CreateRestaurantModal = ({ isOpen, onClose, onSuccess, businessUnitId }: CreateRestaurantModalProps) => {
  const [loading, setLoading] = useState(false)
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])

  const form = useForm<z.infer<typeof createRestaurantSchema>>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDesc: "",
      type: "CASUAL_DINING",
      cuisine: [],
      location: "",
      phone: "",
      email: "",
      totalSeats: "",
      privateRooms: "0",
      outdoorSeating: false,
      airConditioned: true,
      priceRange: "$$",
      averageMeal: "",
      acceptsReservations: true,
      advanceBookingDays: "30",
      minPartySize: "1",
      maxPartySize: "",
      featuredImage: "",
      dressCode: "",
      isActive: true,
      isPublished: false,
      isFeatured: false,
      sortOrder: "0",
    },
  })

  const onSubmit = async (values: z.infer<typeof createRestaurantSchema>) => {
    try {
      setLoading(true)

      const payload = {
        ...values,
        cuisine: selectedCuisines,
        totalSeats: values.totalSeats ? parseInt(values.totalSeats) : null,
        privateRooms: values.privateRooms ? parseInt(values.privateRooms) : 0,
        averageMeal: values.averageMeal ? parseFloat(values.averageMeal) : null,
        advanceBookingDays: values.advanceBookingDays ? parseInt(values.advanceBookingDays) : 30,
        minPartySize: values.minPartySize ? parseInt(values.minPartySize) : 1,
        maxPartySize: values.maxPartySize ? parseInt(values.maxPartySize) : null,
        sortOrder: values.sortOrder ? parseInt(values.sortOrder) : 0,
      }

      await axios.post(`/api/cms/restaurants`, payload, {
        headers: {
          "x-business-unit-id": businessUnitId,
        },
      })

      toast.success("Restaurant created successfully")
      form.reset()
      setSelectedCuisines([])
      onSuccess()
    } catch (error) {
      toast.error(`Failed to create restaurant: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedCuisines([])
    onClose()
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const addCuisine = (cuisine: string) => {
    if (!selectedCuisines.includes(cuisine)) {
      const newCuisines = [...selectedCuisines, cuisine]
      setSelectedCuisines(newCuisines)
      form.setValue('cuisine', newCuisines)
    }
  }

  const removeCuisine = (cuisine: string) => {
    const newCuisines = selectedCuisines.filter(c => c !== cuisine)
    setSelectedCuisines(newCuisines)
    form.setValue('cuisine', newCuisines)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Create Restaurant
          </DialogTitle>
          <DialogDescription>Add a new restaurant or dining venue to your property.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Cafe Rodrigo" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e)
                            if (!form.getValues('slug')) {
                              form.setValue('slug', generateSlug(e.target.value))
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., cafe-rodrigo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the restaurant..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description for cards and listings..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Restaurant Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restaurant Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurantTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priceRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dressCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dress Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Smart Casual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cuisine Types */}
              <div className="space-y-2">
                <FormLabel>Cuisine Types</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCuisines.map((cuisine) => (
                    <Badge key={cuisine} variant="secondary" className="gap-1">
                      {cuisine}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCuisine(cuisine)} />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineOptions
                      .filter(cuisine => !selectedCuisines.includes(cuisine))
                      .map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location & Contact</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Lobby Level" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+63 83 555 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="restaurant@hotel.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Capacity & Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Capacity & Features</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="totalSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Seats</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privateRooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Private Rooms</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outdoorSeating"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Outdoor Seating</FormLabel>
                        <div className="text-sm text-muted-foreground">Has outdoor area</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="airConditioned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Air Conditioned</FormLabel>
                        <div className="text-sm text-muted-foreground">Climate controlled</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing & Reservations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing & Reservations</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="averageMeal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Meal Price (₱)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="advanceBookingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Advance Booking (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minPartySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Party Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPartySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Party Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="acceptsReservations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Accepts Reservations</FormLabel>
                      <div className="text-sm text-muted-foreground">Allow online reservations</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media</h3>
              <FormField
                control={form.control}
                name="featuredImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Featured Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://images.pexels.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Publishing Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Publishing Settings</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">Restaurant is active</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Published</FormLabel>
                        <div className="text-sm text-muted-foreground">Show on website</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured</FormLabel>
                        <div className="text-sm text-muted-foreground">Highlight restaurant</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Restaurant"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}