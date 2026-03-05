import { useState, useEffect } from "react";
import { Building2, Check, X, Clock, Mail, Phone, MapPin, Key, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const INSTITUTE_ICONS: Record<string, string> = {
  hospital: "🏥",
  clinic: "🏨",
  surgery: "🔬",
  pharmacy: "💊",
};

interface Institute {
  id: string;
  name: string;
  type: string;
  registration_key: string;
  status: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_by: string | null;
  created_at: string;
}

const InstituteApproval = () => {
  const { user } = useAuth();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const fetchInstitutes = async () => {
    setLoading(true);
    let query = supabase.from("institutes").select("*").order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load institutes");
      console.error(error);
    } else {
      setInstitutes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstitutes();
  }, [filter]);

  const handleAction = async (instituteId: string, action: "approved" | "rejected") => {
    if (!user) return;
    setActionLoading(instituteId);

    const { error } = await supabase
      .from("institutes")
      .update({
        status: action as any,
        approved_by: user.id,
      })
      .eq("id", instituteId);

    if (error) {
      toast.error(`Failed to ${action === "approved" ? "approve" : "reject"} institute`);
      console.error(error);
    } else {
      toast.success(`Institute ${action === "approved" ? "approved" : "rejected"} successfully`);

      // If approving, also assign admin role to the creator
      if (action === "approved") {
        const institute = institutes.find((i) => i.id === instituteId);
        if (institute?.created_by) {
          const { error: roleError } = await supabase.from("user_roles").upsert({
            user_id: institute.created_by,
            role: "admin" as any,
          }, { onConflict: "user_id,role" });

          if (roleError) {
            console.error("Failed to assign admin role:", roleError);
            toast.error("Institute approved but failed to assign admin role");
          } else {
            toast.success("Admin role assigned to institute creator");
          }
        }
      }
      fetchInstitutes();
    }
    setActionLoading(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-accent text-accent-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Institute Approval</h1>
        <p className="text-muted-foreground">Review and manage institute registrations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["pending", "all", "approved", "rejected"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : institutes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No {filter !== "all" ? filter : ""} institutes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {institutes.map((inst) => (
            <Card key={inst.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{INSTITUTE_ICONS[inst.type] || "🏢"}</span>
                    <div>
                      <CardTitle className="text-lg">{inst.name}</CardTitle>
                      <CardDescription className="capitalize">{inst.type}</CardDescription>
                    </div>
                  </div>
                  {statusBadge(inst.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Key className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">{inst.registration_key}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{new Date(inst.created_at).toLocaleDateString()}</span>
                  </div>
                  {inst.phone && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{inst.phone}</span>
                    </div>
                  )}
                  {inst.email && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{inst.email}</span>
                    </div>
                  )}
                  {inst.address && (
                    <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{inst.address}</span>
                    </div>
                  )}
                </div>

                {inst.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAction(inst.id, "approved")}
                      disabled={actionLoading === inst.id}
                    >
                      {actionLoading === inst.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleAction(inst.id, "rejected")}
                      disabled={actionLoading === inst.id}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstituteApproval;
