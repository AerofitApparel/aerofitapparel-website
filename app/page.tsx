import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to Our App</h1>
          <p className="mt-3 text-lg text-gray-600">A secure authentication system with role-based access control</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Sign In</Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Powered by Firebase Authentication and Next.js</p>
        </div>
      </div>
    </div>
  )
}
