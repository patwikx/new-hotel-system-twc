"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { useParams } from "next/navigation"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { UserStatus } from "@prisma/client"

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  // Explicitly make `status` required
  status: z.nativeEnum(UserStatus).default(UserStatus.PENDING_ACTIVATION).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// --- FIX START ---
// 1. Create a specific type alias for the form values from the schema.
type CreateUserFormValues = z.infer<typeof createUserSchema>;
// --- FIX END ---


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

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  roles: Role[]
  businessUnits: BusinessUnit[]
}

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSuccess,
  roles,
  businessUnits
}: CreateUserModalProps) => {
  const params = useParams()
  const businessUnitId = params.businessUnitId as string
  
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<Assignment[]>([
    { businessUnitId: businessUnitId || "", roleId: "" }
  ])

  // 2. Use the new type alias with the useForm hook.
  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      status: UserStatus.PENDING_ACTIVATION,
    },
  })

  const addAssignment = () => setAssignments([...assignments, { businessUnitId: "", roleId: "" }])
  const removeAssignment = (index: number) => {
    if (assignments.length > 1) setAssignments(assignments.filter((_, i) => i !== index))
  }
  const updateAssignment = (index: number, field: keyof Assignment, value: string) => {
    const updated = [...assignments]
    updated[index] = { ...updated[index], [field]: value }
    setAssignments(updated)
  }

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      setLoading(true)
      const validAssignments = assignments.filter(a => a.businessUnitId && a.roleId)
      if (validAssignments.length === 0) {
        toast.error("At least one valid role assignment is required.")
        setLoading(false);
        return
      }

      await axios.post(`/api/users`, {
        ...values,
        assignments: validAssignments
      }, {
        headers: { 'x-business-unit-id': businessUnitId }
      })

      toast.success("User created successfully")
      onSuccess()
    } catch (error) {
      toast.error(`Failed to create user ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    form.reset()
    setAssignments([{ businessUnitId: businessUnitId || "", roleId: "" }])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@tropicana.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
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
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}