import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Search, Pill, Phone, Mail, User, Clock, Building2, Calendar, Stethoscope, MessageSquare, Send, AlertCircle, History, CheckCircle2, RefreshCw, FileCheck } from 'lucide-react';
import { format } from 'date-fns';

const PharmacistPrescriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [selectedHistoryPrescription, setSelectedHistoryPrescription] = useState<any>(null);
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

  const { data: completedPrescriptions = [] } = useQuery({
    queryKey: ['completed-prescriptions'],
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
        .eq('status', 'completed')
        .order('pharmacist_updated_at', { ascending: false });
      
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
      queryClient.invalidateQueries({ queryKey: ['completed-prescriptions'] });
      toast({
        title: 'Prescription Processed',
        description: 'Your notes have been saved and the prescription has been updated.',
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

  const getDoctorById = (doctorId: string) => {
    return profiles.find(p => p.id === doctorId);
  };

  const getPharmacistById = (pharmacistId: string) => {
    return profiles.find(p => p.id === pharmacistId);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.medication_name.toLowerCase().includes(searchLower) ||
      p.patients?.full_name?.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower)
    );
  });

  const filteredHistory = completedPrescriptions.filter(p => {
    const searchLower = historySearchQuery.toLowerCase();
    return (
      p.medication_name.toLowerCase().includes(searchLower) ||
      p.patients?.full_name?.toLowerCase().includes(searchLower) ||
      p.id.toLowerCase().includes(searchLower) ||
      (p.pharmacist_notes?.toLowerCase().includes(searchLower))
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

  const handleSelectPrescription = (prescription: any) => {
    setSelectedPrescription(prescription);
    setPharmacistNotes(prescription.pharmacist_notes || '');
    setMedicationAvailable(prescription.medication_available ?? true);
    setMedicationSubstituted(prescription.medication_substituted ?? false);
    setSubstitutedMedication(prescription.substituted_medication || '');
  };

  const PrescriptionDetailCard = ({ prescription, isHistory = false }: { prescription: any; isHistory?: boolean }) => {
    const doctor = getDoctorById(prescription.prescribed_by);
    const pharmacist = isHistory ? getPharmacistById(prescription.pharmacist_id) : null;

    return (
      <Card className={`shadow-md border-t-4 ${isHistory ? 'border-t-blue-500' : 'border-t-emerald-500'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Stethoscope className={`h-5 w-5 ${isHistory ? 'text-blue-600' : 'text-emerald-600'}`} />
              Prescription Details
            </CardTitle>
            <Badge className={isHistory ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"}>
              ID: {prescription.id.slice(0, 8)}...
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hospital & Doctor Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className={`h-5 w-5 ${isHistory ? 'text-blue-600' : 'text-emerald-600'}`} />
                <h3 className="font-semibold">Hospital Information</h3>
              </div>
              <p className="text-sm font-medium">MedicalEasy General Hospital</p>
              <p className="text-xs text-muted-foreground">National Medical Network</p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <User className={`h-5 w-5 ${isHistory ? 'text-blue-600' : 'text-emerald-600'}`} />
                <h3 className="font-semibold">Attending Doctor</h3>
              </div>
              {doctor ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dr. {doctor.full_name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {doctor.email}
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {doctor.phone}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Doctor info unavailable</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium">Prescription Date & Time</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(prescription.created_at), 'EEEE, MMMM dd, yyyy')} at {format(new Date(prescription.created_at), 'HH:mm:ss')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Medication Details */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Pill className={`h-4 w-4 ${isHistory ? 'text-blue-600' : 'text-emerald-600'}`} />
              Medication Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Medication Name</Label>
                  <p className="font-medium">{prescription.medication_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dosage</Label>
                  <p className="font-medium">{prescription.dosage}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Frequency</Label>
                  <p className="font-medium">{prescription.frequency}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <p className="font-medium">{prescription.duration}</p>
                </div>
              </div>
            </div>
            {prescription.notes && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Label className="text-xs text-muted-foreground">Doctor's Notes</Label>
                <p className="text-sm">{prescription.notes}</p>
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Patient Information</h3>
            <p className="text-sm"><span className="text-muted-foreground">Name:</span> {prescription.patients?.full_name}</p>
            {prescription.patients?.phone && (
              <p className="text-sm"><span className="text-muted-foreground">Contact:</span> {prescription.patients?.phone}</p>
            )}
          </div>

          {/* History-specific: Pharmacist Notes */}
          {isHistory && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Pharmacist Processing Details
                </h3>

                {/* Processed By & Time */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Processed by</span>
                  </div>
                  <p className="text-sm">{pharmacist?.full_name || 'Unknown Pharmacist'}</p>
                  {prescription.pharmacist_updated_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      on {format(new Date(prescription.pharmacist_updated_at), 'MMMM dd, yyyy')} at {format(new Date(prescription.pharmacist_updated_at), 'HH:mm:ss')}
                    </p>
                  )}
                </div>

                {/* Medication Status */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${prescription.medication_available ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm">
                      Medication {prescription.medication_available ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="p-3 border rounded-lg flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${prescription.medication_substituted ? 'bg-amber-500' : 'bg-gray-300'}`} />
                    <span className="text-sm">
                      {prescription.medication_substituted ? 'Substitution Made' : 'No Substitution'}
                    </span>
                  </div>
                </div>

                {/* Substituted Medication */}
                {prescription.medication_substituted && prescription.substituted_medication && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Label className="text-xs text-muted-foreground">Substituted With</Label>
                    <p className="font-medium">{prescription.substituted_medication}</p>
                  </div>
                )}

                {/* Pharmacist Notes */}
                {prescription.pharmacist_notes && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-xs text-muted-foreground">Pharmacist Notes</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{prescription.pharmacist_notes}</p>
                  </div>
                )}

                {!prescription.pharmacist_notes && !prescription.medication_substituted && (
                  <p className="text-sm text-muted-foreground italic">No additional notes were added for this prescription.</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-lg mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Pill className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Dispensing Portal</h1>
            <p className="text-emerald-100">Process prescriptions and document medication changes</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Active ({prescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({completedPrescriptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Prescriptions Tab */}
        <TabsContent value="active">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Prescription List */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-600" />
                    Active Prescriptions
                  </CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, medication, or patient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
                  {filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No active prescriptions found</p>
                    </div>
                  ) : (
                    filteredPrescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        onClick={() => handleSelectPrescription(prescription)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedPrescription?.id === prescription.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                            : 'border-border hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-emerald-600" />
                            <span className="font-semibold text-sm">{prescription.medication_name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Patient: {prescription.patients?.full_name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(prescription.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Prescription Details & Comment Section */}
            <div className="lg:col-span-2 space-y-4">
              {selectedPrescription ? (
                <>
                  <PrescriptionDetailCard prescription={selectedPrescription} />

                  {/* Comment Section Card */}
                  <Card className="shadow-md border-t-4 border-t-orange-500">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600" />
                        Pharmacist Notes & Changes
                      </CardTitle>
                      <CardDescription>
                        Document any changes made to the original prescription
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Alert for changes */}
                      <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-orange-800 dark:text-orange-200">Important</p>
                          <p className="text-orange-700 dark:text-orange-300">All changes to the original prescription must be documented below. These notes will be attached to the patient file.</p>
                        </div>
                      </div>

                      {/* Medication Status Toggles */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${medicationAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                            <Label htmlFor="available" className="cursor-pointer">Medication Available</Label>
                          </div>
                          <Switch
                            id="available"
                            checked={medicationAvailable}
                            onCheckedChange={setMedicationAvailable}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${medicationSubstituted ? 'bg-amber-500' : 'bg-gray-300'}`} />
                            <Label htmlFor="substituted" className="cursor-pointer">Medication Substituted</Label>
                          </div>
                          <Switch
                            id="substituted"
                            checked={medicationSubstituted}
                            onCheckedChange={setMedicationSubstituted}
                          />
                        </div>
                      </div>

                      {/* Substitution Input */}
                      {medicationSubstituted && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Label htmlFor="substituted-med" className="text-sm font-medium">Substituted Medication Name *</Label>
                          <Input
                            id="substituted-med"
                            placeholder="Enter the name of the substituted medication"
                            value={substitutedMedication}
                            onChange={(e) => setSubstitutedMedication(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      )}

                      {/* Notes Textarea */}
                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium">Comments / Reason for Changes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Document any changes made to the prescription, reasons for substitution, or other relevant notes..."
                          value={pharmacistNotes}
                          onChange={(e) => setPharmacistNotes(e.target.value)}
                          rows={5}
                          className="mt-2"
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-3 justify-end pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedPrescription(null);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitFeedback}
                          disabled={updatePrescriptionMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Submit & Complete Prescription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="shadow-md h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Pill className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select a Prescription</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Choose a prescription from the list to view details and add your pharmacist notes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - History List */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-600" />
                    Processed Prescriptions
                  </CardTitle>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search history..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No processed prescriptions found</p>
                    </div>
                  ) : (
                    filteredHistory.map((prescription) => (
                      <div
                        key={prescription.id}
                        onClick={() => setSelectedHistoryPrescription(prescription)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          selectedHistoryPrescription?.id === prescription.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                            : 'border-border hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-sm">{prescription.medication_name}</span>
                          </div>
                          <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            Completed
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Patient: {prescription.patients?.full_name}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {prescription.pharmacist_updated_at 
                            ? format(new Date(prescription.pharmacist_updated_at), 'MMM dd, yyyy HH:mm')
                            : format(new Date(prescription.updated_at), 'MMM dd, yyyy HH:mm')
                          }
                        </div>
                        {prescription.medication_substituted && (
                          <Badge variant="outline" className="mt-2 text-xs text-amber-600 border-amber-300">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Substituted
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - History Details */}
            <div className="lg:col-span-2 space-y-4">
              {selectedHistoryPrescription ? (
                <PrescriptionDetailCard prescription={selectedHistoryPrescription} isHistory />
              ) : (
                <Card className="shadow-md h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <History className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Select a Prescription</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Choose a processed prescription from the history to view details and pharmacist notes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacistPrescriptions;
