"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Users, Settings, LayoutDashboard } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { userData } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="font-bold text-xl">
                Admin Panel
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {userData && (
                <span className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium">{userData.displayName}</span> ({userData.role})
                </span>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard">Exit Admin</Link>
              </Button>
            </div>
          </div>
        </header>
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
          <aside className="fixed top-16 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
            <nav className="h-full py-6 pr-6 lg:py-8">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const Icon = item.icon

                  return (
                    <Button
                      key={item.name}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </nav>
          </aside>
          <main className="flex w-full flex-col overflow-hidden py-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
