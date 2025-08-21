"use client"

import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Section - Placeholder */}
        <div className="flex items-center space-x-4">
          {/* You can add breadcrumbs or a page title here in the future */}
        </div>

        {/* Center Section - Removed */}
        <div className="flex-1 max-w-md mx-8">
          {/* Search bar was here */}
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications were here */}
        </div>
      </div>
    </header>
  )
}