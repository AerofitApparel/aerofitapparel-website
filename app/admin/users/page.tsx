"use client"

import { useState, useEffect } from "react"
import { getUsers, updateUserRole, setUserDisabled } from "@/lib/auth-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Search, UserX, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { UserRole, UserData } from "@/lib/auth-service"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const usersData = await getUsers(50)
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const lowercasedQuery = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(lowercasedQuery) ||
          user.email?.toLowerCase().includes(lowercasedQuery),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingUser(userId)

    try {
      const success = await updateUserRole(userId, newRole)

      if (success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uid === userId
              ? {
                  ...user,
                  role: newRole,
                }
              : user,
          ),
        )

        toast({
          title: "Success",
          description: "User role updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setUpdatingUser(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete the user document from Firestore
      await deleteDoc(doc(db, "users", userId))

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== userId))
      setFilteredUsers((prevUsers) => prevUsers.filter((user) => user.uid !== userId))

      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description:
          "Failed to delete user. Note: This client-side implementation can only delete the Firestore document, not the actual Firebase Auth user.",
        variant: "destructive",
      })
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const success = await setUserDisabled(userId, !currentStatus)

      if (success) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uid === userId
              ? {
                  ...user,
                  disabled: !currentStatus,
                }
              : user,
          ),
        )

        toast({
          title: "Success",
          description: `User ${!currentStatus ? "disabled" : "enabled"} successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions (Client-side implementation)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Client-Side Implementation</AlertTitle>
            <AlertDescription>
              This is a client-side implementation of user management. It can only modify Firestore documents, not
              actual Firebase Auth users. For full admin capabilities, you would need a server with the Firebase Admin
              SDK.
            </AlertDescription>
          </Alert>

          {loading && users.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.displayName || "N/A"}</TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(value) => handleRoleChange(user.uid, value as UserRole)}
                          disabled={updatingUser === user.uid}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.disabled ? "destructive" : "success"}>
                          {user.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleUserStatus(user.uid, !!user.disabled)}
                            title={user.disabled ? "Enable user" : "Disable user"}
                          >
                            {user.disabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteUser(user.uid)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
