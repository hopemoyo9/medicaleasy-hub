import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, Loader2, Building2, Key, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import registerBg from "@/assets/register-bg.jpg";

const INSTITUTE_TYPES = [
  { value: "hospital", label: "Hospital", icon: "🏥" },
  { value: "clinic", label: "Clinic", icon: "🏨" },
  { value: "surgery", label: "Surgery Center", icon: "🔬" },
  { value: "pharmacy", label: "Pharmacy", icon: "💊" },
] as const;

const Register = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<"staff" | "admin">("staff");
  const [registeredInstitutes, setRegisteredInstitutes] = useState<Array<{ id: string; name: string; type: string; status: string }>>([]);

  // Staff registration form
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    instituteId: "",
  });

  // Admin registration form
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    instituteName: "",
    instituteType: "" as string,
    registrationKey: "",
    institutePhone: "",
    instituteEmail: "",
    instituteAddress: "",
  });

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const fetchRegisteredInstitutes = async () => {
    const { data, error } = await supabase.functions.invoke("list-registered-institutes");

    if (error) {
      console.error("Failed to fetch registered institutes:", error);
      setRegisteredInstitutes([]);
      return;
    }

    setRegisteredInstitutes(data?.institutes || []);
  };

  // Keep institute list fresh while staff registration is open
  useEffect(() => {
    if (registrationType !== "staff") return;

    fetchRegisteredInstitutes();
    const intervalId = window.setInterval(fetchRegisteredInstitutes, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [registrationType]);

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (staffForm.password !== staffForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (staffForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!staffForm.name || !staffForm.email || !staffForm.instituteId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: staffForm.email,
      password: staffForm.password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (authError) {
      toast.error(authError.message);
      setIsLoading(false);
      return;
    }
    if (!authData.user) {
      toast.error("Failed to create account");
      setIsLoading(false);
      return;
    }

    // Update profile with institute_id
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: staffForm.email,
        full_name: staffForm.name,
        institute_id: staffForm.instituteId,
      });

    if (profileError) {
      console.error("Profile update error:", profileError);
      toast.error("Account created but profile setup failed. Please contact support before signing in.");
      setIsLoading(false);
      return;
    }

    toast.success("Registration successful! An administrator will assign your role shortly.");
    setIsLoading(false);
    navigate(`/login?institute=${staffForm.instituteId}`);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (adminForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!adminForm.name || !adminForm.email || !adminForm.instituteName || !adminForm.instituteType || !adminForm.registrationKey) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    // 1. Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminForm.email,
      password: adminForm.password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });

    if (authError) {
      toast.error(authError.message);
      setIsLoading(false);
      return;
    }
    if (!authData.user) {
      toast.error("Failed to create account");
      setIsLoading(false);
      return;
    }

    // 2. Authenticate the master registration key via the master database
    //    and auto-register the institute (approved + domain generated).
    const { data: regData, error: regError } = await supabase.functions.invoke(
      "register-institute",
      {
        body: {
          name: adminForm.instituteName,
          type: adminForm.instituteType,
          registration_key: adminForm.registrationKey.trim(),
          phone: adminForm.institutePhone,
          email: adminForm.instituteEmail,
          address: adminForm.instituteAddress,
          created_by: authData.user.id,
        },
      }
    );

    if (regError || !regData?.institute) {
      const msg = (regData as any)?.error || regError?.message || "Failed to register institute";
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    const institute = regData.institute as { id: string; name: string; domain: string };

    // 3. Update profile with institute_id
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: adminForm.email,
        full_name: adminForm.name,
        institute_id: institute.id,
      });

    if (profileError) {
      console.error("Profile update error:", profileError);
      toast.error("Account created but profile setup failed. Please contact support before signing in.");
      setIsLoading(false);
      return;
    }

    toast.success(
      `${institute.name} has been authenticated and registered. Your institute domain is ${institute.domain}.`,
      { duration: 9000 }
    );
    setIsLoading(false);
    navigate(`/login?institute=${institute.id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${registerBg})` }}
      />
      <div className="absolute inset-0 bg-background/60" />
      <Card className="w-full max-w-lg shadow-2xl border-t-4 border-t-medical-primary relative z-10">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary shadow-glow flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">
            Register with MedicalEasy
          </CardTitle>
          <CardDescription>Choose your registration type below</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={registrationType} onValueChange={(v) => setRegistrationType(v as "staff" | "admin")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="staff">Staff Member</TabsTrigger>
              <TabsTrigger value="admin">Institute Admin</TabsTrigger>
            </TabsList>

            {/* STAFF REGISTRATION */}
            <TabsContent value="staff">
              <form onSubmit={handleStaffSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="staff-name" placeholder="Dr. John Doe" className="pl-10"
                      value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-institute">Select Your Institute</Label>
                  <Select value={staffForm.instituteId} onValueChange={(v) => setStaffForm({ ...staffForm, instituteId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your institute..." />
                    </SelectTrigger>
                    <SelectContent>
                      {registeredInstitutes.length === 0 ? (
                        <SelectItem value="_none" disabled>No institutes registered yet</SelectItem>
                      ) : (
                        registeredInstitutes.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {INSTITUTE_TYPES.find((t) => t.value === inst.type)?.icon ?? "🏥"} {inst.name}
                            {inst.status !== "approved" ? ` — ${inst.status}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="staff-email" type="email" placeholder="you@hospital.com" className="pl-10"
                      value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="staff-password" type="password" placeholder="••••••••" className="pl-10"
                        value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-confirm">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="staff-confirm" type="password" placeholder="••••••••" className="pl-10"
                        value={staffForm.confirmPassword} onChange={(e) => setStaffForm({ ...staffForm, confirmPassword: e.target.value })} required />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  After registration, your institute's administrator will assign your role.
                </p>

                <Button type="submit" variant="medical" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : "Register as Staff"}
                </Button>
              </form>
            </TabsContent>

            {/* ADMIN / INSTITUTE REGISTRATION */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 mb-2">
                  <p className="text-xs text-primary font-medium">
                    🏥 Register your institute with MedicalEasy. A super administrator will review and approve your registration.
                  </p>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-name">Your Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-name" placeholder="John Doe" className="pl-10"
                        value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-email">Your Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-email" type="email" placeholder="admin@hospital.com" className="pl-10"
                        value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required />
                    </div>
                  </div>
                </div>

                {/* Institute Info */}
                <div className="space-y-1.5">
                  <Label htmlFor="inst-name">Institute Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="inst-name" placeholder="City General Hospital" className="pl-10"
                      value={adminForm.instituteName} onChange={(e) => setAdminForm({ ...adminForm, instituteName: e.target.value })} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Institute Type</Label>
                    <Select value={adminForm.instituteType} onValueChange={(v) => setAdminForm({ ...adminForm, instituteType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTITUTE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-key">Registration Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="reg-key" placeholder="UNIQUE-KEY-123" className="pl-10"
                        value={adminForm.registrationKey} onChange={(e) => setAdminForm({ ...adminForm, registrationKey: e.target.value })} required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="inst-phone">Phone (optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="inst-phone" placeholder="+1 234 567 890" className="pl-10"
                        value={adminForm.institutePhone} onChange={(e) => setAdminForm({ ...adminForm, institutePhone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="inst-email">Institute Email (optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="inst-email" type="email" placeholder="info@hospital.com" className="pl-10"
                        value={adminForm.instituteEmail} onChange={(e) => setAdminForm({ ...adminForm, instituteEmail: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-address">Address (optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="inst-address" placeholder="123 Medical Drive, City" className="pl-10"
                      value={adminForm.instituteAddress} onChange={(e) => setAdminForm({ ...adminForm, instituteAddress: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-password" type="password" placeholder="••••••••" className="pl-10"
                        value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-confirm">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-confirm" type="password" placeholder="••••••••" className="pl-10"
                        value={adminForm.confirmPassword} onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} required />
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="medical" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Register Institute"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign in here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
