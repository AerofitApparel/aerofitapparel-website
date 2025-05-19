import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function SetupGuidePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase App Check Setup Guide</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Follow these steps to properly configure Firebase App Check and resolve the
          "auth/firebase-app-check-token-is-invalid" error.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Enable App Check in Firebase Console</CardTitle>
            <CardDescription>Configure App Check in your Firebase project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to the{" "}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Firebase Console
                </a>
              </li>
              <li>Select your project</li>
              <li>In the left sidebar, click on "App Check" (under "Product categories" &gt; "Security")</li>
              <li>Click "Get started" if you haven't set up App Check before</li>
              <li>For Web apps, select "reCAPTCHA v3" as the provider</li>
              <li>Register your app's domains where you'll be using Firebase</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Set Up reCAPTCHA v3</CardTitle>
            <CardDescription>Create and configure a reCAPTCHA v3 site key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Go to the{" "}
                <a
                  href="https://www.google.com/recaptcha/admin/create"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  reCAPTCHA Admin Console
                </a>
              </li>
              <li>Create a new site with reCAPTCHA v3</li>
              <li>Add your domains (including localhost for development)</li>
              <li>Complete the registration and copy your site key</li>
              <li>Add this site key to your Firebase App Check configuration in the Firebase Console</li>
              <li>
                Also add this key to your environment variables as{" "}
                <code className="bg-muted px-1 py-0.5 rounded">RECAPTCHA_SITE_KEY</code>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Configure Environment Variables</CardTitle>
            <CardDescription>Add the necessary environment variables to your project</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Create or update your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file with the
              following variables:
            </p>
            <pre className="bg-muted p-4 rounded overflow-x-auto">
              <code>{`NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Enable Debug Mode for Development</CardTitle>
            <CardDescription>Configure App Check to work in development environments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-2">
              <li>In the Firebase Console, go to App Check settings</li>
              <li>Click on "Debug tokens" tab</li>
              <li>Click "Add debug token" and create a new token for your app</li>
              <li>Copy this token and keep it secure</li>
              <li>For development only, you can use the automatic debug mode we've configured in the code</li>
            </ol>
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>
                The code we've provided automatically enables debug mode in development environments. For production,
                make sure you have properly set up reCAPTCHA v3.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 5: Verify Implementation</CardTitle>
            <CardDescription>Ensure App Check is working correctly</CardDescription>
          </CardHeader>
          <CardContent>
            <p>After implementing these changes:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Restart your development server</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try authenticating again</li>
              <li>Check the browser console for any App Check related errors</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Need more help? Check the{" "}
          <a
            href="https://firebase.google.com/docs/app-check"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Firebase App Check documentation
          </a>
        </p>
      </div>
    </div>
  )
}
