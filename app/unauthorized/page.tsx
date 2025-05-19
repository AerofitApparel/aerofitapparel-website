import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">Access Denied</h1>
        <p className="mt-2 text-base text-gray-500">You don't have permission to access this page.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
