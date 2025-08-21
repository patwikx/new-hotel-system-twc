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
import { Globe } from "lucide-react"
import { HeroSection } from "@/types/cms"

const editHeroSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  backgroundImageUrl: z.string().url("Must be a valid URL"),
  ctaText: z.string().min(1, "CTA text is required"),
  ctaLink: z.string().min(1, "CTA link is required"),
  isActive: z.boolean().optional(),
  sortOrder: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
    message: "Sort order must be a positive number"
  }),
})


interface EditHeroSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  heroSection: HeroSection | null
  businessUnitId: string
}

export const EditHeroSectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  heroSection,
  businessUnitId
}: EditHeroSectionModalProps) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof editHeroSectionSchema>>({
    resolver: zodResolver(editHeroSectionSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      backgroundImageUrl: "",
      ctaText: "",
      ctaLink: "",
      isActive: true,
      sortOrder: "1",
    },
  })

  useEffect(() => {
    if (heroSection && isOpen) {
      form.reset({
        title: heroSection.title,
        subtitle: heroSection.subtitle,
        backgroundImageUrl: heroSection.backgroundImageUrl,
        ctaText: heroSection.ctaText,
        ctaLink: heroSection.ctaLink,
        isActive: heroSection.isActive,
        sortOrder: heroSection.sortOrder.toString(),
      })
    }
  }, [heroSection, isOpen, form])

  const onSubmit = async (values: z.infer<typeof editHeroSectionSchema>) => {
    if (!heroSection) return

    try {
      setLoading(true)
      
      const payload = {
        ...values,
        sortOrder: values.sortOrder ? parseInt(values.sortOrder) : 1,
      }
      
      await axios.patch(`/api/cms/hero-sections/${heroSection.id}`, payload, {
        headers: {
          'x-business-unit-id': businessUnitId
        }
      })

      toast.success("Hero section updated successfully")
      onSuccess()
    } catch (error) {
      toast.error(`Failed to update hero section: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  if (!heroSection) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Edit Hero Section
          </DialogTitle>
          <DialogDescription>
            Update the hero section content for your website.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Welcome to Paradise Resort" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Experience luxury and comfort in our beautiful resort..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="backgroundImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Image URL</FormLabel>
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
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-Action Text</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Book Now" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-to-Action Link</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., /booking" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" {...field} />
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
                      <div className="text-sm text-muted-foreground">
                        Show on website
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Hero Section"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}