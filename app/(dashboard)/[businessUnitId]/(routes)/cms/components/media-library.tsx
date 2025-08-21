"use client"

import { useState, useEffect, useCallback } from "react" // ✅ 1. Import useCallback
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ImageIcon,
  Upload,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Download,
  Eye,
  FileText, // ✅ 2. Import FileText icon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axios from "axios"
// import { UploadMediaModal } from "./upload-media-modal" // 💡 Placeholder for your upload modal

interface MediaItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  title?: string
  description?: string
  category?: string
  tags: string[]
  usageCount: number
  isActive: boolean
  createdAt: string
}

interface MediaLibraryProps {
  businessUnitId: string
  onSelectMedia?: (media: MediaItem) => void
  selectionMode?: boolean
}

export const MediaLibrary = ({
  businessUnitId,
  onSelectMedia,
  selectionMode = false,
}: MediaLibraryProps) => {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [uploadModalOpen, setUploadModalOpen] = useState(false) // ✅ 4. State for upload modal

  const fetchMedia = useCallback(async () => { // ✅ 1. Wrap in useCallback
    try {
      setLoading(true)
      const response = await axios.get(`/api/cms/media?businessUnitId=${businessUnitId}`)
      setMedia(response.data)
    } catch (error) {
      toast.error("Failed to fetch media")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [businessUnitId])

  useEffect(() => {
    if (businessUnitId) {
      fetchMedia()
    }
  }, [businessUnitId, fetchMedia]) // ✅ 1. Add fetchMedia to dependency array

  // ✅ 3. Use flatMap for a more type-safe way to get unique categories
  const categories = ["all", ...Array.from(new Set(media.flatMap(item => (item.category ? [item.category] : []))))]

  const filteredMedia = media.filter(item => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDelete = async (item: MediaItem) => {
    try {
      await axios.delete(`/api/cms/media/${item.id}?businessUnitId=${businessUnitId}`)
      toast.success("Media item deleted successfully")
      fetchMedia()
    } catch (error) {
      toast.error("Failed to delete media item")
      console.error(error)
    }
  }

  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId)
    } else {
      newSelection.add(itemId)
    }
    setSelectedItems(newSelection)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <> {/* Use Fragment to wrap component and modal */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Media Library</h2>
            <p className="text-muted-foreground">Manage your website images and files</p>
          </div>
          <Button className="gap-2" onClick={() => setUploadModalOpen(true)}> {/* ✅ 4. Open modal */}
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectionMode && selectedItems.size > 0 && (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedItems.size} item(s) selected</span>
            <Button size="sm" variant="outline">
              Use Selected
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSelectedItems(new Set())}>
              Clear Selection
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`group cursor-pointer transition-all hover:shadow-lg ${
                selectedItems.has(item.id) ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => {
                if (selectionMode) {
                  toggleSelection(item.id)
                } else if (onSelectMedia) {
                  onSelectMedia(item)
                }
              }}
            >
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.title || item.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium truncate">{item.title || item.originalName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatFileSize(item.size)}</span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Used {item.usageCount} times</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMedia.length === 0 && !loading && (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No media found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first media file to get started"}
            </p>
            <Button className="gap-2" onClick={() => setUploadModalOpen(true)}> {/* ✅ 4. Open modal */}
              <Upload className="h-4 w-4" />
              Upload Media
            </Button>
          </div>
        )}
      </div>

      {/* ✅ 4. Replace CreatePageModal with your UploadMediaModal */}
      {/* <UploadMediaModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          fetchMedia(); // Refresh the list after successful upload
          setUploadModalOpen(false);
        }}
        businessUnitId={businessUnitId}
      /> */}
    </>
  )
}

// Note: I've commented out the call to `UploadMediaModal`
// since the component itself was not provided. You can uncomment it
// once you have created it.