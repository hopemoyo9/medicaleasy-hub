import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Building2, Database as DatabaseIcon, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type InstituteStatus = Database["public"]["Enums"]["institute_status"];
type AppRole = Database["public"]["Enums"]["app_role"];

type InstituteRecord = {
  id: string;
  name: string;
  type: Database["public"]["Enums"]["institute_type"];
  registration_key: string;
  status: InstituteStatus;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
};

type ProfileRecord = {
  id: string;
  full_name: string;
  email: string;
};

type UserRoleRecord = {
  user_id: string;
  role: AppRole;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const statusBadge = (status: InstituteStatus) => {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
};

const BackendManagement = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | InstituteStatus>("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const { data: institutes = [], isLoading: institutesLoading } = useQuery({
    queryKey: ["backend-institutes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutes")
        .select("id,name,type,registration_key,status,created_by,approved_by,created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as InstituteRecord[];
    },
    enabled: role === "super_admin",
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["backend-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id,full_name,email");
      if (error) throw error;
      return (data ?? []) as ProfileRecord[];
    },
    enabled: role === "super_admin",
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["backend-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id,role");
      if (error) throw error;
      return (data ?? []) as UserRoleRecord[];
    },
    enabled: role === "super_admin",
  });

  const updateInstituteStatus = useMutation({
    mutationFn: async ({ instituteId, status }: { instituteId: string; status: InstituteStatus }) => {
      if (!user) throw new Error("You must be logged in");

      const { error } = await supabase
        .from("institutes")
        .update({ status, approved_by: status === "approved" ? user.id : null })
        .eq("id", instituteId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(`Institute ${variables.status === "approved" ? "approved" : "rejected"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["backend-institutes"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update institute status");
    },
    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const profileMap = useMemo(() => {
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }, [profiles]);

  const roleMap = useMemo(() => {
    const map = new Map<string, AppRole[]>();
    userRoles.forEach((entry) => {
      const list = map.get(entry.user_id) ?? [];
      map.set(entry.user_id, [...list, entry.role]);
    });
    return map;
  }, [userRoles]);

  const filteredInstitutes = useMemo(() => {
    return institutes.filter((institute) => {
      const matchesStatus = statusFilter === "all" || institute.status === statusFilter;
      const searchable = `${institute.name} ${institute.registration_key}`.toLowerCase();
      const matchesSearch = searchable.includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [institutes, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = institutes.length;
    const approved = institutes.filter((item) => item.status === "approved").length;
    const pending = institutes.filter((item) => item.status === "pending").length;
    return { total, approved, pending };
  }, [institutes]);

  if (roleLoading || institutesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (role !== "super_admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>This backend management page is available to super administrators only.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backend Management</h1>
        <p className="text-muted-foreground">Manage all institute workspaces and approval status in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workspaces</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-2xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Institute Databases</CardTitle>
          <CardDescription>
            Each institute is isolated in its own workspace scope, represented below with a generated database name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by institute name or key..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | InstituteStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredInstitutes.map((institute) => {
              const owner = institute.created_by ? profileMap.get(institute.created_by) : null;
              const ownerRoles = institute.created_by ? roleMap.get(institute.created_by) ?? [] : [];
              const dbName = `${slugify(institute.name)}_db`;
              const instituteDomain = `@${slugify(institute.name)}.com`;

              return (
                <Card key={institute.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <p className="font-semibold">{institute.name}</p>
                          {statusBadge(institute.status)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <DatabaseIcon className="h-4 w-4" />
                            <span>Database: {dbName}</span>
                          </p>
                          <p>Institute Domain: {instituteDomain}</p>
                          <p>Type: {institute.type}</p>
                          <p>Registration Key: {institute.registration_key}</p>
                          <p>
                            Owner: {owner ? `${owner.full_name} (${owner.email})` : "Not linked"}
                            {ownerRoles.length > 0 ? ` • Roles: ${ownerRoles.join(", ")}` : ""}
                          </p>
                          <p>Created: {new Date(institute.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {institute.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setActionLoadingId(institute.id);
                                updateInstituteStatus.mutate({ instituteId: institute.id, status: "approved" });
                              }}
                              disabled={actionLoadingId === institute.id && updateInstituteStatus.isPending}
                            >
                              {actionLoadingId === institute.id && updateInstituteStatus.isPending ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-1 h-4 w-4" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setActionLoadingId(institute.id);
                                updateInstituteStatus.mutate({ instituteId: institute.id, status: "rejected" });
                              }}
                              disabled={actionLoadingId === institute.id && updateInstituteStatus.isPending}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline">No action needed</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredInstitutes.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
                  No institutes match the current filters.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendManagement;
