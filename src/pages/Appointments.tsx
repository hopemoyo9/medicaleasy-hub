import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { AddAppointmentDialog } from "@/components/AddAppointmentDialog";

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, patients(full_name)")
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date).toDateString();
    return aptDate === (selectedDate?.toDateString() || new Date().toDateString());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-primary/10 text-primary";
      case "completed": return "bg-success/10 text-success";
      case "cancelled": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Book consultations and surgeries</p>
        </div>
        <AddAppointmentDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
            <CardDescription>Choose a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border shadow-sm" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {selectedDate ? format(selectedDate, "PPP") : "Today's"} Appointments
            </CardTitle>
            <CardDescription>{todayAppointments.length} appointment(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
            ) : todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments for this date</p>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{(apt as any).patients?.full_name || "Unknown"}</span>
                    </div>
                    <Badge className={getStatusColor(apt.status)}>{apt.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{format(new Date(apt.appointment_date), "p")} · {apt.duration_minutes} min</p>
                  {apt.reason && <p className="text-xs text-muted-foreground mt-1">{apt.reason}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Appointments;
