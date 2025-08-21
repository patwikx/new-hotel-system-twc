"use client"

import { useState, useEffect } from "react"
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
import { Settings } from "lucide-react"

const websiteConfigSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  tagline: z.string().optional(),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  primaryPhone: z.string().optional(),
  primaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  bookingEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  enableOnlineBooking: z.boolean().optional(),
  enableReviews: z.boolean().optional(),
  enableNewsletter: z.boolean().optional(),
})

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

interface WebsiteConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  config: WebsiteConfig | null
  businessUnitId: string
}

export const WebsiteConfigModal = ({
  isOpen,
  onClose,
  onSuccess,
  config,
  businessUnitId
}: WebsiteConfigModalProps) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof websiteConfigSchema>>({
    resolver: zodResolver(websiteConfigSchema),
    defaultValues: {
      siteName: "",
      tagline: "",
      description: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      primaryPhone: "",
      primaryEmail: "",
      bookingEmail: "",
      facebookUrl: "",
      instagramUrl: "",
      twitterUrl: "",
      enableOnlineBooking: true,
      enableReviews: true,
      enableNewsletter: true,
    },
  })

  useEffect(() => {
    if (config && isOpen) {
      form.reset({
        siteName: config.siteName,
        tagline: config.tagline || "",
        description: config.description || "",
        metaTitle: config.metaTitle || "",
        metaDescription: config.metaDescription || "",
        metaKeywords: config.metaKeywords || "",
        primaryPhone: config.primaryPhone || "",
        primaryEmail: config.primaryEmail || "",
        bookingEmail: config.bookingEmail || "",
        facebookUrl: config.facebookUrl || "",
        instagramUrl: config.instagramUrl || "",
        twitterUrl: config.twitterUrl || "",
        enableOnlineBooking: config.enableOnlineBooking,
        enableReviews: config.enableReviews,
        enableNewsletter: config.enableNewsletter,
      })
    }
  }, [config, isOpen, form])

  const onSubmit = async (values: z.infer<typeof websiteConfigSchema>) => {
    try {
      setLoading(true)

      await axios.post(`/api/cms/website-config`, values, {
        headers: {
          "x-business-unit-id": businessUnitId,
        },
      })

      toast.success("Website configuration updated successfully")
      onSuccess()
    } catch (error) {
      toast.error(`Failed to update configuration: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Website Configuration
          </DialogTitle>
          <DialogDescription>Configure your website settings and metadata.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paradise Resort" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Your Perfect Getaway" {...field} />
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
                      <Textarea placeholder="Brief description of your hotel..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+63 2 8888 1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Email</FormLabel>
                      <FormControl>
                        <Input placeholder="info@hotel.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bookingEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Email</FormLabel>
                    <FormControl>
                      <Input placeholder="reservations@hotel.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">SEO Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="SEO title for search engines" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="hotel, luxury, resort" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="SEO description for search engines" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Features</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="enableOnlineBooking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Online Booking</FormLabel>
                        <div className="text-sm text-muted-foreground">Allow online reservations</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableReviews"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Reviews</FormLabel>
                        <div className="text-sm text-muted-foreground">Show guest reviews</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="enableNewsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Newsletter</FormLabel>
                        <div className="text-sm text-muted-foreground">Newsletter signup</div>
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
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}