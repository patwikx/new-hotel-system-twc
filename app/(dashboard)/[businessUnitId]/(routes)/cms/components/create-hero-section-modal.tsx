// components/cms/modals/create-hero-slide-modal.tsx

"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  backgroundImage: z.string().url("Must be a valid URL").min(1, "Background image is required"),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  description: z.string().optional(),
  backgroundVideo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ctaStyle: z.enum(["primary", "secondary", "outline"]).optional(),
  textPosition: z.enum(["left", "center", "right"]).optional(),
  textColor: z.enum(["white", "black", "dark", "light"]).optional(),
  overlayOpacity: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 1), {
    message: "Overlay opacity must be between 0 and 1"
  }),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

type HeroSlideFormValues = z.infer<typeof heroSlideSchema>;

interface CreateHeroSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessUnitId: string;
}

export const CreateHeroSlideModal = ({ isOpen, onClose, onSuccess, businessUnitId }: CreateHeroSlideModalProps) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: { 
      title: "", 
      subtitle: "", 
      description: "",
      backgroundImage: "", 
      backgroundVideo: "",
      ctaText: "", 
      ctaUrl: "", 
      ctaStyle: "primary",
      textPosition: "center",
      textColor: "white",
      overlayOpacity: "0.3",
      isActive: true,
      sortOrder: 0 
    },
  });

  const onSubmit = async (values: HeroSlideFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/cms/hero-slides`, values, {
        headers: { 'x-business-unit-id': businessUnitId },
      });
      toast.success("Hero slide created successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create slide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New Hero Slide</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="subtitle" render={({ field }) => (<FormItem><FormLabel>Subtitle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="backgroundImage" render={({ field }) => (<FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="backgroundVideo" render={({ field }) => (<FormItem><FormLabel>Background Video URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="ctaText" render={({ field }) => (<FormItem><FormLabel>CTA Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ctaUrl" render={({ field }) => (<FormItem><FormLabel>CTA URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="ctaStyle" render={({ field }) => (<FormItem><FormLabel>CTA Style</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="primary">Primary</SelectItem><SelectItem value="secondary">Secondary</SelectItem><SelectItem value="outline">Outline</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="textPosition" render={({ field }) => (<FormItem><FormLabel>Text Position</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="textColor" render={({ field }) => (<FormItem><FormLabel>Text Color</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="white">White</SelectItem><SelectItem value="black">Black</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="light">Light</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="overlayOpacity" render={({ field }) => (<FormItem><FormLabel>Overlay Opacity</FormLabel><FormControl><Input type="number" min="0" max="1" step="0.1" placeholder="0.3" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="sortOrder" render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel className="text-base">Active</FormLabel><div className="text-sm text-muted-foreground">Show on website</div></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>)} />
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={loading}>Create</Button></div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};