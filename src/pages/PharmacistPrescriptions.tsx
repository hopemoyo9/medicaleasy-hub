import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, Pill, Phone, Mail, User, FileText } from 'lucide-react';

const PharmacistPrescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [pharmacistNotes, setPharmacistNotes] = useState('');
  const [medicationAvailable, setMedicationAvailable] = useState(true);
  const [medicationSubstituted, setMedicationSubstituted] = useState(false);
  const [substitutedMedication, setSubstitutedMedication] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['pharmacist-prescriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients (
            id,
            full_name,
            phone,
            email
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (error) throw error;
      return data;
    },
  });

  const updatePrescriptionMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('prescriptions')
        .update({
          pharmacist_notes: pharmacistNotes,
          medication_available: medicationAvailable,
          medication_substituted: medicationSubstituted,
          substituted_medication: medicationSubstituted ? substitutedMedication : null,
          pharmacist_updated_at: new Date().toISOString(),
          pharmacist_id: user?.id,
          status: 'completed'
        })
        .eq('id', prescriptionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacist-prescriptions'] });
      toast({
        title: 'Prescription Updated',
        description: 'Pharmacist notes have been saved and patient file updated.',
      });
      setSelectedPrescription(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setPharmacistNotes('');
    setMedicationAvailable(true);
    setMedicationSubstituted(false);
    setSubstitutedMedication('');
  };

  const getStaffByRole = (role: 'doctor' | 'nurse') => {
    const staffIds = userRoles.filter(ur => ur.role === role).map(ur => ur.user_id);
    return profiles.filter(p => staffIds.includes(p.id));
  };

  const doctors = getStaffByRole('doctor');
  const nurses = getStaffByRole('nurse');

  const filteredPrescriptions = prescriptions.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.medication_name.toLowerCase().includes(searchLower) ||
      p.patients?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmitFeedback = () => {
    if (!selectedPrescription) return;
    
    if (medicationSubstituted && !substitutedMedication.trim()) {
      toast({
        title: 'Error',
        description: 'Please specify the substituted medication.',
        variant: 'destructive',
      });
      return;
    }

    updatePrescriptionMutation.mutate(selectedPrescription.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>
        <p className="text-muted-foreground">Process prescriptions and provide feedback</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Doctors
            </h3>
            <div className="space-y-2">
              {doctors.map(doctor => (
                <Card key={doctor.id}>
                  <CardContent className="p-3">
                    <p className="font-medium">{doctor.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {doctor.email}
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {doctor.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Nurses
            </h3>
            <div className="space-y-2">
              {nurses.map(nurse => (
                <Card key={nurse.id}>
                  <CardContent className="p-3">
                    <p className="font-medium">{nurse.full_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {nurse.email}
                    </div>
                    {nurse.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {nurse.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Prescriptions</CardTitle>
          <CardDescription>Process prescriptions and update patient records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by medication or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5" />
                    {prescription.medication_name}
                  </CardTitle>
                  <CardDescription>
                    Patient: {prescription.patients?.full_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                    <p><span className="font-medium">Frequency:</span> {prescription.frequency}</p>
                    <p><span className="font-medium">Duration:</span> {prescription.duration}</p>
                    {prescription.notes && (
                      <p className="text-muted-foreground">{prescription.notes}</p>
                    )}
                  </div>
                  <Badge variant="outline">Active</Badge>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => setSelectedPrescription(prescription)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Process Prescription
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Process Prescription</DialogTitle>
                        <DialogDescription>
                          Update medication status and add notes
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div>
                            <Label className="text-base font-semibold">Prescription Details</Label>
                            <div className="mt-2 space-y-1 text-sm">
                              <p><span className="font-medium">Medication:</span> {prescription.medication_name}</p>
                              <p><span className="font-medium">Patient:</span> {prescription.patients?.full_name}</p>
                              <p><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="available">Medication Available</Label>
                            <Switch
                              id="available"
                              checked={medicationAvailable}
                              onCheckedChange={setMedicationAvailable}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="substituted">Medication Substituted</Label>
                            <Switch
                              id="substituted"
                              checked={medicationSubstituted}
                              onCheckedChange={setMedicationSubstituted}
                            />
                          </div>

                          {medicationSubstituted && (
                            <div>
                              <Label htmlFor="substituted-med">Substituted Medication Name</Label>
                              <Input
                                id="substituted-med"
                                placeholder="Enter substituted medication"
                                value={substitutedMedication}
                                onChange={(e) => setSubstitutedMedication(e.target.value)}
                              />
                            </div>
                          )}

                          <div>
                            <Label htmlFor="notes">Pharmacist Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Add notes about this prescription..."
                              value={pharmacistNotes}
                              onChange={(e) => setPharmacistNotes(e.target.value)}
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => {
                            setSelectedPrescription(null);
                            resetForm();
                          }}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSubmitFeedback}
                            disabled={updatePrescriptionMutation.isPending}
                          >
                            Submit & Update Patient File
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacistPrescriptions;
