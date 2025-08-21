"use client"

import { useParams } from "next/navigation"
import { useCurrentUser } from "@/lib/current-user"

import { Globe } from "lucide-react"
import { MediaLibrary } from "../components/media-library"

const MediaPage = () => {
  const params = useParams()
  const businessUnitId = params.businessUnitId as string
  const user = useCurrentUser()

  const isAuthorized = user?.assignments?.some(
    (assignment) =>
      assignment.businessUnitId === businessUnitId &&
      (assignment.role.name === "SUPER_ADMIN" || assignment.role.name === "HOTEL_MANAGER"),
  )

  if (!isAuthorized) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Access Denied</h3>
        <p className="text-muted-foreground">
          You need admin or manager access to manage media for this business unit
        </p>
      </div>
    )
  }

  return <MediaLibrary businessUnitId={businessUnitId} />
}

export default MediaPage