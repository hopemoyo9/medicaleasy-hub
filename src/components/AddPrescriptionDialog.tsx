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

export const AddPrescriptionDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    patient_id: "",
    medication: "",
    dosage: "",
    duration: "",
    frequency: "",
    instructions: "",
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
    if (!formData.patient_id || !formData.medication || !formData.dosage || !formData.duration || !formData.frequency) {
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("institute_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.institute_id) {
        toast.error("Your account is not linked to an institute yet. Ask your institute administrator to approve your account.");
        return;
      }

      const { error } = await supabase.from("prescriptions").insert({
        patient_id: formData.patient_id,
        medication_name: formData.medication,
        dosage: formData.dosage,
        duration: formData.duration,
        frequency: formData.frequency,
        notes: formData.instructions || null,
        prescribed_by: user.id,
        institute_id: profile.institute_id,
      });

      if (error) throw error;

      // Notify pharmacists in the same institute
      try {
        const { data: me } = await supabase.from("profiles").select("institute_id, full_name").eq("id", user.id).maybeSingle();
        if (me?.institute_id) {
          const { data: pharmRoles } = await supabase.from("user_roles").select("user_id").eq("role", "pharmacist");
          const ids = (pharmRoles || []).map((r: any) => r.user_id);
          if (ids.length) {
            const { data: pharmProfiles } = await supabase
              .from("profiles").select("id").eq("institute_id", me.institute_id).in("id", ids);
            const targets = (pharmProfiles || []).map((p: any) => p.id);
            if (targets.length) {
              await supabase.from("notifications").insert(
                targets.map((uid: string) => ({
                  user_id: uid,
                  institute_id: me.institute_id,
                  title: "New prescription",
                  body: `${me.full_name || "A doctor"} prescribed ${formData.medication}`,
                  kind: "prescription",
                  link: "/pharmacist-prescriptions",
                  created_by: user.id,
                })),
              );
            }
          }
        }
      } catch (_) { /* non-fatal */ }

      toast.success("Prescription created successfully!");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      setOpen(false);
      setFormData({ patient_id: "", medication: "", dosage: "", duration: "", frequency: "", instructions: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="medical" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Create Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Prescription</DialogTitle>
          <DialogDescription>Enter prescription details for the patient</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient *</Label>
            <Select value={formData.patient_id} onValueChange={(value) => setFormData({ ...formData, patient_id: value })}>
              <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medication">Medication/Drug Name *</Label>
            <Input id="medication" value={formData.medication} onChange={(e) => setFormData({ ...formData, medication: e.target.value })} placeholder="Amoxicillin" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input id="dosage" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} placeholder="500mg" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input id="duration" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} placeholder="7 days" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Input id="frequency" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} placeholder="3 times daily" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea id="instructions" value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} placeholder="Take with food, avoid alcohol..." className="min-h-[80px]" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="medical" className="flex-1" disabled={loading}>
              {loading ? "Creating..." : "Create Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
