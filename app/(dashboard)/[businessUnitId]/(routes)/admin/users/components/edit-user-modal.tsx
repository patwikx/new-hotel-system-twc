"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useParams } from "next/navigation"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { UserStatus } from "@prisma/client"

// UPDATED: Zod schema for editing a user
const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  status: z.nativeEnum(UserStatus),
})

type EditUserFormValues = z.infer<typeof editUserSchema>;

// UPDATED: Interfaces to match the parent component and schema
interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  status: UserStatus
  assignments: {
    businessUnitId: string
    businessUnit: { id: string; name: string }
    role: { id: string; name: string; displayName: string }
  }[]
}

interface Role {
  id: string
  name: string
  displayName: string
}

interface BusinessUnit {
  id: string
  name: string
  displayName: string
}

interface Assignment {
  businessUnitId: string
  roleId: string
}

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
  roles: Role[]
  businessUnits: BusinessUnit[]
}

export const EditUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  roles,
  businessUnits
}: EditUserModalProps) => {
  const params = useParams()
  const businessUnitId = params.businessUnitId as string
  
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      status: UserStatus.PENDING_ACTIVATION,
    },
  })

  useEffect(() => {
    if (user && isOpen) {
      // UPDATED: form.reset with new fields
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        status: user.status,
      })
      
      setAssignments(
        user.assignments.map(a => ({
          businessUnitId: a.businessUnitId,
          roleId: a.role.id
        }))
      )
    }
  }, [user, isOpen, form])

  const addAssignment = () => setAssignments([...assignments, { businessUnitId: "", roleId: "" }])
  const removeAssignment = (index: number) => {
    if (assignments.length > 1) setAssignments(assignments.filter((_, i) => i !== index))
  }
  const updateAssignment = (index: number, field: keyof Assignment, value: string) => {
    const updated = [...assignments]
    updated[index] = { ...updated[index], [field]: value }
    setAssignments(updated)
  }

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return
    try {
      setLoading(true)
      const validAssignments = assignments.filter(a => a.businessUnitId && a.roleId)
      if (validAssignments.length === 0) {
        toast.error("At least one business unit assignment is required")
        return
      }

      // UPDATED: API endpoint and payload
      await axios.patch(`/api/users/${user.id}`, {
        ...values,
        assignments: validAssignments
      }, {
        headers: { 'x-business-unit-id': businessUnitId }
      })

      toast.success("User updated successfully")
      onSuccess()
    } catch (error) {
      toast.error(`Failed to update user ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
          <DialogDescription>
            Update user information, status, and role assignments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* UPDATED: Form fields to match new schema */}
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@tropicana.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* UPDATED: Replaced Switch with a Select for Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Role Assignments</h3>
                <Button type="button" variant="outline" size="sm" onClick={addAssignment}>Add Assignment</Button>
              </div>
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Select value={assignment.businessUnitId} onValueChange={(value) => updateAssignment(index, 'businessUnitId', value)}>
                        <SelectTrigger><SelectValue placeholder="Select Property" /></SelectTrigger>
                        <SelectContent>
                          {businessUnits.map((bu) => <SelectItem key={bu.id} value={bu.id}>{bu.displayName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={assignment.roleId} onValueChange={(value) => updateAssignment(index, 'roleId', value)}>
                        <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.displayName}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {assignments.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeAssignment(index)} className="text-destructive"><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update User"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}