import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AddAppointmentDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    patient_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "30",
    reason: "",
    notes: "",
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, full_name").order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      const appointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;

      const { error } = await supabase.from("appointments").insert({
        patient_id: formData.patient_id,
        appointment_date: appointmentDateTime,
        duration_minutes: parseInt(formData.duration_minutes),
        reason: formData.reason || null,
        notes: formData.notes || null,
        doctor_id: user.id,
      });

      if (error) throw error;

      toast.success("Appointment scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setOpen(false);
      setFormData({ patient_id: "", appointment_date: "", appointment_time: "", duration_minutes: "30", reason: "", notes: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="medical" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>Book an appointment for a patient</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
              <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={formData.appointment_date} onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Time *</Label>
              <Input type="time" value={formData.appointment_time} onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select value={formData.duration_minutes} onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Consultation, Follow-up, Surgery..." />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional notes..." className="min-h-[80px]" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="medical" className="flex-1" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
