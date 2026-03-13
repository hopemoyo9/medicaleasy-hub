import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AddPatientDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    blood_group: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    medical_notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.date_of_birth || !formData.gender) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to add patients");
        return;
      }

      const { error } = await supabase.from("patients").insert({
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender as "male" | "female" | "other",
        phone: formData.phone || null,
        email: formData.email || null,
        blood_group: formData.blood_group as any || null,
        address: formData.address || null,
        emergency_contact: formData.emergency_contact || null,
        emergency_phone: formData.emergency_phone || null,
        medical_notes: formData.medical_notes || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success(`Patient ${formData.full_name} added successfully!`);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setOpen(false);
      setFormData({ full_name: "", date_of_birth: "", gender: "", phone: "", email: "", blood_group: "", address: "", emergency_contact: "", emergency_phone: "", medical_notes: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="medical" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>Enter patient information to create a new record</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="John Doe" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input id="dob" type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact">Emergency Contact</Label>
              <Input id="emergency_contact" value={formData.emergency_contact} onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Emergency Phone</Label>
              <Input id="emergency_phone" type="tel" value={formData.emergency_phone} onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })} placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medical_notes">Medical Notes</Label>
            <Textarea id="medical_notes" value={formData.medical_notes} onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })} placeholder="Any relevant medical conditions..." className="min-h-[80px]" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="medical" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
