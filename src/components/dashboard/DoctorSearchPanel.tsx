import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Mail, Phone, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type DoctorProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

const DoctorSearchPanel = () => {
  const [search, setSearch] = useState("");

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["institute-doctors"],
    queryFn: async () => {
      // Get all user_ids with doctor role
      const { data: doctorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "doctor");

      if (rolesError) throw rolesError;
      if (!doctorRoles?.length) return [];

      const doctorIds = doctorRoles.map((r) => r.user_id);

      // Get profiles for those doctors
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", doctorIds);

      if (profilesError) throw profilesError;
      return (profiles ?? []) as DoctorProfile[];
    },
  });

  const filtered = doctors.filter((d) =>
    `${d.full_name} ${d.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="border-t-4 border-t-medical-accent shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-medical-accent" />
          Find Doctors for Referral
        </CardTitle>
        <CardDescription>Search colleagues registered at your institute</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading doctors...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {search ? "No doctors match your search" : "No doctors registered yet"}
          </p>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {filtered.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-medical-primary/20 to-medical-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-medical-primary" />
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
                <Badge variant="secondary" className="flex-shrink-0">Doctor</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorSearchPanel;
