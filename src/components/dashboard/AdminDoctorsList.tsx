import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DoctorProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

const AdminDoctorsList = () => {
  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["admin-institute-doctors"],
    queryFn: async () => {
      const { data: doctorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");

      if (rolesError) throw rolesError;
      if (!doctorRoles?.length) return [];

      const doctorIds = doctorRoles.map((r) => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", doctorIds);

      if (profilesError) throw profilesError;
      return (profiles ?? []) as DoctorProfile[];
    },
  });

  return (
    <Card className="border-t-4 border-t-medical-secondary shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-medical-secondary" />
          Registered Doctors
        </CardTitle>
        <CardDescription>All doctors at your institute ({doctors.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
        ) : doctors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No doctors registered yet</p>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-medical-secondary/20 to-medical-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-medical-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{doctor.full_name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3" />
                      {doctor.email}
                    </span>
                    {doctor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {doctor.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Badge>Doctor</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDoctorsList;
