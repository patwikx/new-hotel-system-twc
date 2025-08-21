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

const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  backgroundImage: z.string().url("Must be a valid URL"),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
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
    defaultValues: { title: "", subtitle: "", backgroundImage: "", ctaText: "", ctaUrl: "", sortOrder: 0 },
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
            <FormField control={form.control} name="backgroundImage" render={({ field }) => (<FormItem><FormLabel>Background Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="ctaText" render={({ field }) => (<FormItem><FormLabel>CTA Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="ctaUrl" render={({ field }) => (<FormItem><FormLabel>CTA URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="sortOrder" render={({ field }) => (<FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={loading}>Create</Button></div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};