import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Trash2, Check, X, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const RoleManagement = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('doctor');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  const pendingProfiles = (profiles as any[]).filter((p) => p.approval_status === 'pending');

  const approveMutation = useMutation({
    mutationFn: async ({ profileId, role }: { profileId: string; role: AppRole }) => {
      // Look up the approving admin's institute so we can link the new staff member to it.
      let approverInstituteId: string | null = null;
      if (user?.id) {
        const { data: approverProfile } = await supabase
          .from('profiles')
          .select('institute_id')
          .eq('id', user.id)
          .maybeSingle();
        approverInstituteId = (approverProfile as any)?.institute_id ?? null;
      }

      const { error: roleErr } = await supabase
        .from('user_roles')
        .upsert({ user_id: profileId, role } as any, { onConflict: 'user_id,role' });
      if (roleErr) throw roleErr;

      const updatePayload: Record<string, unknown> = {
        approval_status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      };
      if (approverInstituteId) {
        // Ensure the approved staff member is linked to the same institute as the approving admin.
        updatePayload.institute_id = approverInstituteId;
      }

      const { error: profErr } = await supabase
        .from('profiles')
        .update(updatePayload as any)
        .eq('id', profileId);
      if (profErr) throw profErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({ title: 'Staff approved', description: 'The user can now sign in with their assigned role.' });
    },
    onError: (e: any) => toast({ title: 'Approval failed', description: e.message, variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'rejected' } as any)
        .eq('id', profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({ title: 'Application rejected' });
    },
    onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'Role Assigned',
        description: 'User role has been successfully assigned.',
      });
      setSelectedUser('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast({
        title: 'Role Removed',
        description: 'User role has been successfully removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: 'Error',
        description: 'Please select a user and role.',
        variant: 'destructive',
      });
      return;
    }
    assignRoleMutation.mutate({ userId: selectedUser, role: selectedRole });
  };

  const getUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || 'Unknown User';
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'nurse': return 'secondary';
      case 'pharmacist': return 'outline';
      default: return 'default';
    }
  };

  const filteredRoles = userRoles.filter(ur => {
    const userName = getUserName(ur.user_id).toLowerCase();
    return userName.includes(searchQuery.toLowerCase()) || ur.role.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">Assign and manage user roles in the system</p>
      </div>

      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" /> Pending Staff Approvals
          </CardTitle>
          <CardDescription>
            New doctors, nurses and pharmacists awaiting your approval to access {`your institute's`} system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProfiles.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No pending applications.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{p.requested_role || 'unspecified'}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ profileId: p.id, role: (p.requested_role || 'doctor') as AppRole })}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve as {p.requested_role || 'doctor'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(p.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign New Role</CardTitle>
          <CardDescription>Select a user and assign them a role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name} ({profile.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleAssignRole} disabled={assignRoleMutation.isPending}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Role Assignments</CardTitle>
          <CardDescription>View and manage existing role assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map(ur => {
                const profile = profiles.find(p => p.id === ur.user_id);
                return (
                  <TableRow key={ur.id}>
                    <TableCell className="font-medium">{profile?.full_name || 'Unknown'}</TableCell>
                    <TableCell>{profile?.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(ur.role)}>
                        {ur.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(ur.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRoleMutation.mutate(ur.id)}
                        disabled={removeRoleMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;
