"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Key, UserCheck, UserX } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/modals/alert-modal"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { UserStatus } from "@prisma/client"
import { Checkbox } from "@/components/ui/checkbox"

// Import your components (ensure paths are correct)
import { CreateUserModal } from "./components/create-user-modal"
import { EditUserModal } from "./components/edit-user-modal"
import { ChangePasswordModal } from "./components/change-password-modal"
import { UsersDataTable } from "./components/users-data-table"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  status: UserStatus;
  avatar: string | null;
  createdAt: string;
  assignments: {
    businessUnitId: string;
    businessUnit: { id: string; name: string };
    role: { id: string; name: string; displayName: string };
  }[];
}

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface BusinessUnit {
  id: string;
  name: string;
  displayName: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const UsersPage = () => {
  const params = useParams();
  const businessUnitId = params.businessUnitId as string;

  // State Management
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modal State Management
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Data Fetching
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/users`, {
        headers: { "x-business-unit-id": businessUnitId },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  }, [businessUnitId]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/roles`);
      setRoles(response.data);
    } catch (error) {
      toast.error("Failed to fetch roles");
    }
  }, []);

  const fetchBusinessUnits = useCallback(async () => {
    try {
      const response = await axios.get(`/api/admin/business-units`);
      setBusinessUnits(response.data);
    } catch (error) {
      toast.error("Failed to fetch business units");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRoles(), fetchBusinessUnits()]);
      setLoading(false);
    };
    if (businessUnitId) {
      loadData();
    }
  }, [businessUnitId, fetchUsers, fetchRoles, fetchBusinessUnits]);

  // Client-side Filtering
  const filteredUsers = useMemo(() => users.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.assignments.some((a) => a.role.name === roleFilter);
      
    return matchesSearch && matchesStatus && matchesRole;
  }), [users, searchTerm, statusFilter, roleFilter]);

  // User Actions
  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    try {
      await axios.patch(`/api/admin/users/${user.id}/status`, { status: newStatus }, { headers: { "x-business-unit-id": businessUnitId } });
      toast.success(`User status updated to ${newStatus.toLowerCase()}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`/api/admin/users/${selectedUser.id}`, { headers: { "x-business-unit-id": businessUnitId } });
      toast.success("User deleted successfully");
      setDeleteUserOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Column Definitions for the Data Table
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.username}?size=40`} />
              <AvatarFallback>{`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={status === UserStatus.ACTIVE ? "default" : "secondary"} className="gap-1">
            {status === UserStatus.ACTIVE ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
            {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
          </Badge>
        );
      }
    },
    {
      id: "role",
      header: "Role on this Property",
      cell: ({ row }) => {
        const assignment = row.original.assignments.find((a) => a.businessUnitId === businessUnitId);
        const roleName = assignment?.role.displayName || "No Role";
        const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
          'Super Administrator': "destructive", 'Hotel Manager': "default", 'Front Desk Staff': "secondary",
        };
        return <Badge variant={variants[roleName] || "outline"} className="gap-1"><Shield className="h-3 w-3" />{roleName}</Badge>;
      }
    },
    {
      id: "assignments",
      header: "Total Properties",
      cell: ({ row }) => <div className="text-center">{row.original.assignments.length}</div>
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditUserOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setChangePasswordOpen(true); }}><Key className="mr-2 h-4 w-4" />Change Password</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>{user.status === 'ACTIVE' ? <><UserX className="mr-2 h-4 w-4" />Deactivate</> : <><UserCheck className="mr-2 h-4 w-4" />Activate</>}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setSelectedUser(user); setDeleteUserOpen(true); }} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [businessUnitId]); // Re-create columns if businessUnitId changes

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and their roles for this property.</p>
        </div>
        <Button onClick={() => setCreateUserOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.status === 'ACTIVE').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inactive Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.status === 'INACTIVE').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Roles Defined</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{roles.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by name, username, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={UserStatus.PENDING_ACTIVATION}>Pending</SelectItem>
                <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => <SelectItem key={role.id} value={role.name}>{role.displayName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>A list of all users with access to this property.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersDataTable columns={columns} data={filteredUsers} />
        </CardContent>
      </Card>

      <CreateUserModal isOpen={createUserOpen} onClose={() => setCreateUserOpen(false)} onSuccess={() => { fetchUsers(); setCreateUserOpen(false); }} roles={roles} businessUnits={businessUnits} />
      <EditUserModal isOpen={editUserOpen} onClose={() => { setEditUserOpen(false); setSelectedUser(null); }} onSuccess={() => { fetchUsers(); setEditUserOpen(false); setSelectedUser(null); }} user={selectedUser} roles={roles} businessUnits={businessUnits} />
      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => { setChangePasswordOpen(false); setSelectedUser(null); }} onSuccess={() => { setChangePasswordOpen(false); setSelectedUser(null); }} user={selectedUser} />
      <AlertModal isOpen={deleteUserOpen} onClose={() => { setDeleteUserOpen(false); setSelectedUser(null); }} onConfirm={handleDeleteUser} loading={false} />
    </div>
  )
}

export default UsersPage