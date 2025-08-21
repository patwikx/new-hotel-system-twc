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
import { Gift, X, Plus } from "lucide-react"

const createSpecialOfferSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  subtitle: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  type: z.enum(["EARLY_BIRD", "LAST_MINUTE", "SEASONAL", "PACKAGE", "ROOM_UPGRADE", "DINING", "SPA", "ACTIVITY", "LOYALTY", "PROMO_CODE"]),
  status: z.enum(["DRAFT", "ACTIVE", "EXPIRED", "PAUSED", "SCHEDULED"]),
  originalPrice: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Original price must be a positive number"
  }),
  offerPrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Offer price is required and must be a positive number"
  }),
  validFrom: z.string().min(1, "Valid from date is required"),
  validTo: z.string().min(1, "Valid to date is required"),
  bookingDeadline: z.string().optional(),
  stayPeriodFrom: z.string().optional(),
  stayPeriodTo: z.string().optional(),
  minNights: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Minimum nights must be a positive number"
  }),
  maxNights: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum nights must be a positive number"
  }),
  minAdvanceBook: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Minimum advance booking must be a non-negative number"
  }),
  maxAdvanceBook: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Maximum advance booking must be a non-negative number"
  }),
  maxUses: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum uses must be a positive number"
  }),
  maxPerGuest: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Maximum per guest must be a positive number"
  }),
  promoCode: z.string().optional(),
  requiresCode: z.boolean().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  termsConditions: z.string().optional(),
  featuredImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  sortOrder: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Sort order must be a non-negative number"
  }),
})

const offerTypes = [
  { value: "EARLY_BIRD", label: "Early Bird" },
  { value: "LAST_MINUTE", label: "Last Minute" },
  { value: "SEASONAL", label: "Seasonal" },
  { value: "PACKAGE", label: "Package Deal" },
  { value: "ROOM_UPGRADE", label: "Room Upgrade" },
  { value: "DINING", label: "Dining Package" },
  { value: "SPA", label: "Spa Package" },
  { value: "ACTIVITY", label: "Activity Package" },
  { value: "LOYALTY", label: "Loyalty Reward" },
  { value: "PROMO_CODE", label: "Promo Code" },
]

const offerStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PAUSED", label: "Paused" },
  { value: "EXPIRED", label: "Expired" },
]

interface CreateSpecialOfferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  businessUnitId: string
}

export const CreateSpecialOfferModal = ({ isOpen, onClose, onSuccess, businessUnitId }: CreateSpecialOfferModalProps) => {
  const [loading, setLoading] = useState(false)
  const [inclusions, setInclusions] = useState<string[]>([])
  const [exclusions, setExclusions] = useState<string[]>([])
  const [newInclusion, setNewInclusion] = useState("")
  const [newExclusion, setNewExclusion] = useState("")

  const form = useForm<z.infer<typeof createSpecialOfferSchema>>({
    resolver: zodResolver(createSpecialOfferSchema),
    defaultValues: {
      title: "",
      slug: "",
      subtitle: "",
      description: "",
      shortDesc: "",
      type: "PACKAGE",
      status: "DRAFT",
      originalPrice: "",
      offerPrice: "",
      validFrom: "",
      validTo: "",
      bookingDeadline: "",
      stayPeriodFrom: "",
      stayPeriodTo: "",
      minNights: "1",
      maxNights: "",
      minAdvanceBook: "",
      maxAdvanceBook: "",
      maxUses: "",
      maxPerGuest: "1",
      promoCode: "",
      requiresCode: false,
      termsConditions: "",
      featuredImage: "",
      isPublished: false,
      isFeatured: false,
      isPinned: false,
      sortOrder: "0",
    },
  })

  const onSubmit = async (values: z.infer<typeof createSpecialOfferSchema>) => {
    try {
      setLoading(true)

      const payload = {
        ...values,
        originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : null,
        offerPrice: parseFloat(values.offerPrice),
        minNights: values.minNights ? parseInt(values.minNights) : 1,
        maxNights: values.maxNights ? parseInt(values.maxNights) : null,
        minAdvanceBook: values.minAdvanceBook ? parseInt(values.minAdvanceBook) : null,
        maxAdvanceBook: values.maxAdvanceBook ? parseInt(values.maxAdvanceBook) : null,
        maxUses: values.maxUses ? parseInt(values.maxUses) : null,
        maxPerGuest: values.maxPerGuest ? parseInt(values.maxPerGuest) : 1,
        sortOrder: values.sortOrder ? parseInt(values.sortOrder) : 0,
        inclusions,
        exclusions,
      }

      await axios.post(`/api/cms/special-offers`, payload, {
        headers: {
          "x-business-unit-id": businessUnitId,
        },
      })

      toast.success("Special offer created successfully")
      form.reset()
      setInclusions([])
      setExclusions([])
      onSuccess()
    } catch (error) {
      toast.error(`Failed to create special offer: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setInclusions([])
    setExclusions([])
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

  const addInclusion = () => {
    if (newInclusion.trim() && !inclusions.includes(newInclusion.trim())) {
      const updated = [...inclusions, newInclusion.trim()]
      setInclusions(updated)
      form.setValue('inclusions', updated)
      setNewInclusion("")
    }
  }

  const removeInclusion = (inclusion: string) => {
    const updated = inclusions.filter(i => i !== inclusion)
    setInclusions(updated)
    form.setValue('inclusions', updated)
  }

  const addExclusion = () => {
    if (newExclusion.trim() && !exclusions.includes(newExclusion.trim())) {
      const updated = [...exclusions, newExclusion.trim()]
      setExclusions(updated)
      form.setValue('exclusions', updated)
      setNewExclusion("")
    }
  }

  const removeExclusion = (exclusion: string) => {
    const updated = exclusions.filter(e => e !== exclusion)
    setExclusions(updated)
    form.setValue('exclusions', updated)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Create Special Offer
          </DialogTitle>
          <DialogDescription>Create a new special offer or package for your guests.</DialogDescription>
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
                      <FormLabel>Offer Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Summer Paradise Package" 
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
                        <Input placeholder="e.g., summer-paradise-package" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Catchy subtitle for the offer..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detailed description of the offer..." className="min-h-[100px]" {...field} />
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

            {/* Offer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Offer Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {offerTypes.map((type) => (
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
                          {offerStatuses.map((status) => (
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
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="offerPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Price (₱)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="5000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (₱) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="7000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Validity Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Validity & Booking Periods</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="validTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valid To</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bookingDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stayPeriodFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stay Period From (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stayPeriodTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stay Period To (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Booking Restrictions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Booking Restrictions</h3>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="minNights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Nights</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxNights"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Nights</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Uses</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxPerGuest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Per Guest</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Promo Code</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="promoCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SUMMER2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiresCode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Requires Code</FormLabel>
                        <div className="text-sm text-muted-foreground">Code required to access offer</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Inclusions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What&apos;s Included</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {inclusions.map((inclusion) => (
                  <Badge key={inclusion} variant="secondary" className="gap-1">
                    {inclusion}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeInclusion(inclusion)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add inclusion (e.g., Free WiFi, Breakfast)"
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
                />
                <Button type="button" onClick={addInclusion} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Exclusions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">What&apos;s Not Included</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {exclusions.map((exclusion) => (
                  <Badge key={exclusion} variant="outline" className="gap-1">
                    {exclusion}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeExclusion(exclusion)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add exclusion (e.g., Airfare, Personal expenses)"
                  value={newExclusion}
                  onChange={(e) => setNewExclusion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
                />
                <Button type="button" onClick={addExclusion} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Terms & Conditions</h3>
              <FormField
                control={form.control}
                name="termsConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Terms and conditions for this offer..." className="min-h-[100px]" {...field} />
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
                        <div className="text-sm text-muted-foreground">Highlight offer</div>
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
                {loading ? "Creating..." : "Create Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}