import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, User, FileText, Calendar, Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];
type Prescription = Database['public']['Tables']['prescriptions']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type MedicalHistory = Database['public']['Tables']['medical_history']['Row'];

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Partial<Patient>>({});

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id!)
        .single();
      
      if (error) throw error;
      setEditedPatient(data);
      return data;
    },
    enabled: !!id,
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ['patient-prescriptions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['patient-appointments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id!)
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: medicalHistory = [] } = useQuery({
    queryKey: ['patient-medical-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_history')
        .select('*')
        .eq('patient_id', id!)
        .order('diagnosed_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (updates: Partial<Patient>) => {
      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Patient Updated',
        description: 'Patient information has been successfully updated.',
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    updatePatientMutation.mutate(editedPatient);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle },
      completed: { variant: 'secondary', icon: CheckCircle },
      cancelled: { variant: 'destructive', icon: XCircle },
      scheduled: { variant: 'outline', icon: Calendar },
      no_show: { variant: 'destructive', icon: AlertCircle },
    };
    const config = variants[status] || { variant: 'default', icon: Activity };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
          <Button onClick={() => navigate('/patients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground">Patient ID: {patient.id.slice(0, 8)}</p>
          </div>
        </div>
        <Button
          variant={isEditing ? 'default' : 'outline'}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={updatePatientMutation.isPending}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Patient
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="full_name"
                  value={editedPatient.full_name || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, full_name: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.full_name}</p>
              )}
            </div>
            <div>
              <Label>Date of Birth</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedPatient.date_of_birth || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, date_of_birth: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{new Date(patient.date_of_birth).toLocaleDateString()}</p>
              )}
            </div>
            <div>
              <Label>Gender</Label>
              {isEditing ? (
                <Select
                  value={editedPatient.gender || patient.gender}
                  onValueChange={(value) => setEditedPatient({ ...editedPatient, gender: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 font-medium capitalize">{patient.gender}</p>
              )}
            </div>
            <div>
              <Label>Blood Group</Label>
              {isEditing ? (
                <Select
                  value={editedPatient.blood_group || patient.blood_group || ''}
                  onValueChange={(value) => setEditedPatient({ ...editedPatient, blood_group: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 font-medium">{patient.blood_group || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={editedPatient.phone || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, phone: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.phone || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={editedPatient.email || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, email: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.email || 'N/A'}</p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label>Address</Label>
              {isEditing ? (
                <Textarea
                  value={editedPatient.address || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, address: e.target.value })}
                  rows={2}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.address || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label>Emergency Contact</Label>
              {isEditing ? (
                <Input
                  value={editedPatient.emergency_contact || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, emergency_contact: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.emergency_contact || 'N/A'}</p>
              )}
            </div>
            <div>
              <Label>Emergency Phone</Label>
              {isEditing ? (
                <Input
                  value={editedPatient.emergency_phone || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, emergency_phone: e.target.value })}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.emergency_phone || 'N/A'}</p>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Label>Medical Notes</Label>
              {isEditing ? (
                <Textarea
                  value={editedPatient.medical_notes || ''}
                  onChange={(e) => setEditedPatient({ ...editedPatient, medical_notes: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="mt-1 font-medium">{patient.medical_notes || 'No medical notes'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="prescriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prescriptions">
            <FileText className="mr-2 h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Calendar className="mr-2 h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="history">
            <Activity className="mr-2 h-4 w-4" />
            Medical History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>All prescriptions including pharmacist feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pharmacist Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell className="font-medium">
                        {prescription.medication_name}
                        {prescription.medication_substituted && (
                          <Badge variant="outline" className="ml-2">
                            Substituted: {prescription.substituted_medication}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{prescription.dosage}</TableCell>
                      <TableCell>{prescription.frequency}</TableCell>
                      <TableCell>{prescription.duration}</TableCell>
                      <TableCell>{getStatusBadge(prescription.status)}</TableCell>
                      <TableCell>
                        {prescription.pharmacist_notes ? (
                          <div className="space-y-1">
                            <p className="text-sm">{prescription.pharmacist_notes}</p>
                            {!prescription.medication_available && (
                              <Badge variant="destructive" className="text-xs">
                                Not Available
                              </Badge>
                            )}
                            {prescription.pharmacist_updated_at && (
                              <p className="text-xs text-muted-foreground">
                                Updated: {new Date(prescription.pharmacist_updated_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No notes</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
              <CardDescription>Appointment history and upcoming visits</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">
                        {new Date(appointment.appointment_date).toLocaleString()}
                      </TableCell>
                      <TableCell>{appointment.duration_minutes} min</TableCell>
                      <TableCell>{appointment.reason || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {appointment.notes || 'No notes'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Past medical conditions and diagnoses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{record.condition}</h4>
                          {record.diagnosed_date && (
                            <p className="text-sm text-muted-foreground">
                              Diagnosed: {new Date(record.diagnosed_date).toLocaleDateString()}
                            </p>
                          )}
                          {record.notes && (
                            <p className="text-sm mt-2">{record.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {medicalHistory.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No medical history records found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientDetails;
