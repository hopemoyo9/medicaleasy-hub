import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Pill, Calendar, FileText, User } from "lucide-react";
import { format } from "date-fns";

const PatientPortal = () => {
  const { user } = useAuth();

  const { data: patient } = useQuery({
    queryKey: ["patient-self", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("patients").select("*").eq("patient_user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["patient-self-rx", patient?.id],
    enabled: !!patient?.id,
    queryFn: async () => {
      const { data } = await supabase.from("prescriptions").select("*").eq("patient_id", patient!.id).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["patient-self-appts", patient?.id],
    enabled: !!patient?.id,
    queryFn: async () => {
      const { data } = await supabase.from("appointments").select("*").eq("patient_id", patient!.id).order("appointment_date", { ascending: false });
      return data || [];
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["patient-self-history", patient?.id],
    enabled: !!patient?.id,
    queryFn: async () => {
      const { data } = await supabase.from("medical_history").select("*").eq("patient_id", patient!.id).order("diagnosed_date", { ascending: false });
      return data || [];
    },
  });

  if (!patient) {
    return (
      <Card>
        <CardHeader><CardTitle>Welcome</CardTitle><CardDescription>Your patient record has not been linked yet. Please contact your clinic.</CardDescription></CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-medical-secondary text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl"><User className="h-8 w-8" /></div>
          <div>
            <h1 className="text-3xl font-bold">Hello, {patient.full_name}</h1>
            <p className="opacity-90">Your health summary</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Pill className="h-5 w-5" /> Prescriptions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {prescriptions.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : prescriptions.map((rx: any) => (
              <div key={rx.id} className="p-3 border rounded">
                <div className="flex justify-between"><p className="font-medium">{rx.medication_name}</p><Badge>{rx.status}</Badge></div>
                <p className="text-xs text-muted-foreground">{rx.dosage} · {rx.frequency} · {rx.duration}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Appointments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {appointments.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : appointments.map((a: any) => (
              <div key={a.id} className="p-3 border rounded">
                <div className="flex justify-between">
                  <p className="font-medium">{a.reason || "Visit"}</p>
                  <Badge variant="secondary">{a.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(a.appointment_date), "PPp")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Medical History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {history.length === 0 ? <p className="text-sm text-muted-foreground">None.</p> : history.map((h: any) => (
              <div key={h.id} className="p-3 border rounded">
                <p className="font-medium">{h.condition}</p>
                {h.notes && <p className="text-sm text-muted-foreground mt-1">{h.notes}</p>}
                <p className="text-xs text-muted-foreground mt-1">{h.diagnosed_date}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientPortal;