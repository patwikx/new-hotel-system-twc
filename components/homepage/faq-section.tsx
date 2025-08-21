"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, CheckCircle, ChevronDown } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  sortOrder: number
}

interface FAQSectionProps {
  faqs?: Array<{
    id: string
    question: string
    answer: string
    category: string
    isActive: boolean
    sortOrder: number
  }>
}

export function FAQSection({ faqs: propFaqs = [] }: FAQSectionProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    // If FAQs are provided as props, use them instead of fetching
    if (propFaqs.length > 0) {
      const formattedFaqs = propFaqs
        .filter(f => f.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      setFaqs(formattedFaqs)
      setLoading(false)
      return
    }

    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/cms/faqs")
        if (response.ok) {
          const data = await response.json()
          setFaqs(data.filter((faq: FAQ) => faq.isActive).sort((a: FAQ, b: FAQ) => a.sortOrder - b.sortOrder))
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const categories = ["all", ...Array.from(new Set(faqs.map((faq) => faq.category)))]
  const filteredFAQs = selectedCategory === "all" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  if (loading) {
    return (
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-10 bg-slate-200 rounded-lg w-80 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-slate-200 rounded-lg w-96 mx-auto animate-pulse" />
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (faqs.length === 0) return null

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Find answers to common questions about our hotels, services, and booking process
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Expert Verified</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <span>Updated Daily</span>
            <div className="w-px h-4 bg-slate-300"></div>
            <span>24/7 Support</span>
          </div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                    selectedCategory === category
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {category} {category !== "all" && `(${faqs.filter(f => f.category === category).length})`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <AccordionTrigger className="px-6 py-5 text-left hover:no-underline group [&[data-state=open]>div>svg]:rotate-180">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <span className="font-semibold text-slate-900 flex-1 text-left group-hover:text-amber-600 transition-colors">
                      {faq.question}
                    </span>
                    <div className="flex items-center gap-3">
                      {faq.category !== "general" && (
                        <Badge className="text-xs bg-slate-100 text-slate-600 border-0 hover:bg-slate-200">
                          {faq.category}
                        </Badge>
                      )}
                      <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5">
                  <div className="ml-12 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Help section */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-slate-600 mb-6">
                Our customer support team is here to help you 24/7
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="tel:+1234567890" 
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Us
                </a>
                <a 
                  href="mailto:support@example.com" 
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}