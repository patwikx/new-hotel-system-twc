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
import { Calendar, X } from "lucide-react"

const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.enum(["WEDDING", "CONFERENCE", "MEETING", "WORKSHOP", "CELEBRATION", "CULTURAL", "SEASONAL", "ENTERTAINMENT", "CORPORATE", "PRIVATE"]),
  status: z.enum(["PLANNING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "POSTPONED"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venue: z.string().min(1, "Venue is required"),
  venueDetails: z.string().optional(),
  venueCapacity: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Venue capacity must be a positive number"
  }),
  isFree: z.boolean().optional(),
  ticketPrice: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Ticket price must be a positive number"
  }),
  requiresBooking: z.boolean().optional(),
  maxAttendees: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum attendees must be a positive number"
  }),
  waitlistEnabled: z.boolean().optional(),
  bookingOpenDate: z.string().optional(),
  bookingCloseDate: z.string().optional(),
  minAge: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Minimum age must be a non-negative number"
  }),
  maxAge: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Maximum age must be a non-negative number"
  }),
  isAdultsOnly: z.boolean().optional(),
  isFamilyEvent: z.boolean().optional(),
  category: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  hostName: z.string().optional(),
  hostBio: z.string().optional(),
  contactInfo: z.string().optional(),
  fullDetails: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Sort order must be a non-negative number"
  }),
})

const eventTypes = [
  { value: "WEDDING", label: "Wedding" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "MEETING", label: "Meeting" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CELEBRATION", label: "Celebration" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "PRIVATE", label: "Private" },
]

const eventStatuses = [
  { value: "PLANNING", label: "Planning" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "POSTPONED", label: "Postponed" },
]

const categoryOptions = [
  "Cultural", "Entertainment", "Seasonal", "Educational", "Wellness", "Adventure", 
  "Family", "Romance", "Business", "Celebration", "Holiday", "Traditional"
]

const tagOptions = [
  "Family-friendly", "Adults-only", "Outdoor", "Indoor", "Free", "Premium", 
  "Limited-seats", "All-inclusive", "Interactive", "Relaxing", "Adventurous"
]

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  businessUnitId: string
}

export const CreateEventModal = ({ isOpen, onClose, onSuccess, businessUnitId }: CreateEventModalProps) => {
  const [loading, setLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [requirements, setRequirements] = useState<string[]>([])
  const [includes, setIncludes] = useState<string[]>([])
  const [highlights, setHighlights] = useState<string[]>([])


  const form = useForm<z.infer<typeof createEventSchema>>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      shortDesc: "",
      type: "ENTERTAINMENT",
      status: "PLANNING",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      venue: "",
      venueDetails: "",
      venueCapacity: "",
      isFree: true,
      ticketPrice: "",
      requiresBooking: false,
      maxAttendees: "",
      waitlistEnabled: false,
      bookingOpenDate: "",
      bookingCloseDate: "",
      minAge: "",
      maxAge: "",
      isAdultsOnly: false,
      isFamilyEvent: true,
      featuredImage: "",
      hostName: "",
      hostBio: "",
      contactInfo: "",
      fullDetails: "",
      isPublished: false,
      isFeatured: false,
      isPinned: false,
      sortOrder: "0",
    },
  })

  const onSubmit = async (values: z.infer<typeof createEventSchema>) => {
    try {
      setLoading(true)

      const payload = {
        ...values,
        venueCapacity: values.venueCapacity ? parseInt(values.venueCapacity) : null,
        ticketPrice: values.ticketPrice ? parseFloat(values.ticketPrice) : null,
        maxAttendees: values.maxAttendees ? parseInt(values.maxAttendees) : null,
        minAge: values.minAge ? parseInt(values.minAge) : null,
        maxAge: values.maxAge ? parseInt(values.maxAge) : null,
        sortOrder: values.sortOrder ? parseInt(values.sortOrder) : 0,
        category: selectedCategories,
        tags: selectedTags,
        requirements,
        includes,
        highlights,
      }

      await axios.post(`/api/cms/events`, payload, {
        headers: {
          "x-business-unit-id": businessUnitId,
        },
      })

      toast.success("Event created successfully")
      form.reset()
      setSelectedCategories([])
      setSelectedTags([])
      setRequirements([])
      setIncludes([])
      setHighlights([])
      onSuccess()
    } catch (error) {
      toast.error(`Failed to create event: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setSelectedCategories([])
    setSelectedTags([])
    setRequirements([])
    setIncludes([])
    setHighlights([])
    onClose()
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Event
          </DialogTitle>
          <DialogDescription>Create a new event or activity for your guests.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Cultural Night Show" 
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
                        <Input placeholder="e.g., cultural-night-show" {...field} />
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
                      <Textarea placeholder="Detailed description of the event..." className="min-h-[100px]" {...field} />
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

            {/* Event Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Event Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Time</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Venue Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grand Ballroom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="venueDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Specific location details and setup information..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing & Booking */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing & Booking</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Free Event</FormLabel>
                        <div className="text-sm text-muted-foreground">No ticket price required</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresBooking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requires Booking</FormLabel>
                        <div className="text-sm text-muted-foreground">Advance booking required</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {!form.watch("isFree") && (
                <FormField
                  control={form.control}
                  name="ticketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket Price (₱)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waitlistEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Waitlist</FormLabel>
                        <div className="text-sm text-muted-foreground">Allow waitlist when full</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Age Restrictions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Age Restrictions</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="minAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Age</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Age</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" placeholder="65" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAdultsOnly"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Adults Only</FormLabel>
                        <div className="text-sm text-muted-foreground">18+ only event</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFamilyEvent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Family Event</FormLabel>
                        <div className="text-sm text-muted-foreground">Family-friendly</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Categories & Tags</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FormLabel>Categories</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCategories.map((category) => (
                      <Badge key={category} variant="secondary" className="gap-1">
                        {category}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                          const updated = selectedCategories.filter(c => c !== category)
                          setSelectedCategories(updated)
                          form.setValue('category', updated)
                        }} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => {
                    if (!selectedCategories.includes(value)) {
                      const updated = [...selectedCategories, value]
                      setSelectedCategories(updated)
                      form.setValue('category', updated)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions
                        .filter(cat => !selectedCategories.includes(cat))
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => {
                          const updated = selectedTags.filter(t => t !== tag)
                          setSelectedTags(updated)
                          form.setValue('tags', updated)
                        }} />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(value) => {
                    if (!selectedTags.includes(value)) {
                      const updated = [...selectedTags, value]
                      setSelectedTags(updated)
                      form.setValue('tags', updated)
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {tagOptions
                        .filter(tag => !selectedTags.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Media & Host */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Media & Host Information</h3>
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Event host or organizer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact details for inquiries" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hostBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief biography of the host..." {...field} />
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
                        <div className="text-sm text-muted-foreground">Highlight event</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPinned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Pinned</FormLabel>
                        <div className="text-sm text-muted-foreground">Pin to top</div>
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
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}