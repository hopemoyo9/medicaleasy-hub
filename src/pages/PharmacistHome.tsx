import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  Phone, 
  Search, 
  ArrowRight, 
  Pill, 
  Building2,
  User,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const PharmacistHome = () => {
  const navigate = useNavigate();
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Get stats for pharmacist dashboard
  const { data: activePrescriptions = [] } = useQuery({
    queryKey: ['pharmacist-active-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    },
  });

  const { data: completedToday = [] } = useQuery({
    queryKey: ['pharmacist-completed-today'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from('prescriptions')
        .select('id')
        .eq('status', 'completed')
        .gte('pharmacist_updated_at', today.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const { data: doctorContacts = [] } = useQuery({
    queryKey: ['doctor-contacts'],
    queryFn: async () => {
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'doctor');
      
      if (rolesError) throw rolesError;
      
      const doctorIds = userRoles?.map(r => r.user_id) || [];
      
      if (doctorIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', doctorIds);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handlePatientSearch = async () => {
    if (!patientIdSearch.trim()) {
      setSearchError('Please enter a National ID number');
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      // Search for patient by checking if the ID contains the search term
      // In a real system, you'd have a national_id field
      const { data: patients, error } = await supabase
        .from('patients')
        .select('id, full_name')
        .ilike('id', `%${patientIdSearch}%`);

      if (error) throw error;

      if (patients && patients.length > 0) {
        // Navigate to prescriptions with patient filter
        navigate(`/pharmacist-prescriptions?patient=${patients[0].id}`);
      } else {
        setSearchError('No patient found with this National ID');
      }
    } catch (error) {
      setSearchError('Error searching for patient');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20">
      {/* Patient Search Section - Before everything else */}
      <div className="mb-8">
        <Card className="border-2 border-green-200 dark:border-green-800 shadow-xl bg-white/80 dark:bg-card/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Search Patient</CardTitle>
                <CardDescription className="text-green-100">
                  Find patient prescriptions by National ID number
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                <Input
                  placeholder="Enter Patient National ID Number..."
                  value={patientIdSearch}
                  onChange={(e) => {
                    setPatientIdSearch(e.target.value);
                    setSearchError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePatientSearch()}
                  className="pl-10 h-12 text-lg border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <Button 
                onClick={handlePatientSearch}
                disabled={isSearching}
                className="h-12 px-8 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSearching ? 'Searching...' : 'Search'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {searchError && (
              <div className="mt-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{searchError}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-lg mb-8 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/20 rounded-xl">
            <Pill className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Portal</h1>
            <p className="text-green-100">Welcome to the Pharmacist Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Building2 className="h-5 w-5 text-green-200" />
          <span className="text-green-100">MedicalEasy General Hospital Pharmacy</span>
          <span className="mx-2 text-green-300">|</span>
          <Clock className="h-5 w-5 text-green-200" />
          <span className="text-green-100">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-l-4 border-l-green-500 bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Active Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-green-600">{activePrescriptions.length}</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Processed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-emerald-600">{completedToday.length}</div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Completed prescriptions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500 bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Available Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-teal-600">{doctorContacts.length}</div>
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                <User className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">For consultation</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* View Prescriptions */}
        <Card className="bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-300"
              onClick={() => navigate('/pharmacist-prescriptions')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">View Prescriptions</h3>
                <p className="text-sm text-muted-foreground">View and process active prescriptions</p>
              </div>
              <ArrowRight className="h-6 w-6 text-green-500 group-hover:translate-x-2 transition-transform" />
            </div>
          </CardContent>
        </Card>

        {/* Comment Bar - Add Notes */}
        <Card className="bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all cursor-pointer group border-2 border-transparent hover:border-green-300"
              onClick={() => navigate('/pharmacist-prescriptions')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Comment Bar</h3>
                <p className="text-sm text-muted-foreground">Add notes on prescription alterations</p>
              </div>
              <ArrowRight className="h-6 w-6 text-emerald-500 group-hover:translate-x-2 transition-transform" />
            </div>
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                All comments are time-stamped with pharmacy info
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor's Contact Info */}
        <Card className="bg-white dark:bg-card shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl">
                <Phone className="h-8 w-8 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-400">Doctor's Contact Info</h3>
                <p className="text-sm text-muted-foreground">Quick reference for prescribers</p>
              </div>
            </div>
            
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {doctorContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No doctors available</p>
              ) : (
                doctorContacts.map((doctor) => (
                  <div key={doctor.id} className="p-3 bg-gray-50 dark:bg-muted/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Dr. {doctor.full_name}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{doctor.email}</span>
                      </div>
                      {doctor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{doctor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pharmacy Information Footer */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-300">MedicalEasy Pharmacy</h4>
                <p className="text-sm text-green-600 dark:text-green-400">National Medical Network</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-green-700 dark:text-green-400">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>pharmacy@medicaleasy.com</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacistHome;
