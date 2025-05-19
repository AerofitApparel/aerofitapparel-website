"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserData } from "@/lib/auth-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCheck, ShieldCheck, Calendar } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalAdmins: 0,
    newUsersToday: 0,
  })
  const [recentUsers, setRecentUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const totalUsers = usersSnapshot.size

        // Get users by role
        const customersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "customer")))
        const totalCustomers = customersSnapshot.size

        const adminsSnapshot = await getDocs(
          query(collection(db, "users"), where("role", "in", ["admin", "super_admin"])),
        )
        const totalAdmins = adminsSnapshot.size

        // Get new users today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = Timestamp.fromDate(today)

        const newUsersSnapshot = await getDocs(
          query(collection(db, "users"), where("createdAt", ">=", todayTimestamp.toMillis())),
        )
        const newUsersToday = newUsersSnapshot.size

        // Get recent users
        const recentUsersSnapshot = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5)),
        )

        const recentUsersData: UserData[] = []
        recentUsersSnapshot.forEach((doc) => {
          recentUsersData.push(doc.data() as UserData)
        })

        setStats({
          totalUsers,
          totalCustomers,
          totalAdmins,
          newUsersToday,
        })

        setRecentUsers(recentUsersData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your application's user statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Users with customer role</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">Users with admin privileges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.newUsersToday}</div>
            <p className="text-xs text-muted-foreground">Users registered today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Users</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
              <CardDescription>The 5 most recently registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : recentUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No users found</div>
              ) : (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.uid} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.displayName || "Unnamed User"}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">User distribution chart would go here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
