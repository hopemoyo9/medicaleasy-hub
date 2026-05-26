import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Mail, Lock, Loader2, Building2 } from "lucide-react";
import registerBg from "@/assets/register-bg.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [instituteName, setInstituteName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const instituteId = searchParams.get("institute");
    if (instituteId) {
      const fetchInstitute = async () => {
        const { data, error } = await supabase
          .from("institutes")
          .select("name")
          .eq("id", instituteId)
          .single();
        if (!error && data) {
          setInstituteName(data.name);
        }
      };
      fetchInstitute();
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Login successful!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${registerBg})` }}
      />
      <div className="absolute inset-0 bg-background/60" />
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-medical-primary relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary shadow-glow flex items-center justify-center">
              <Activity className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-medical-primary to-medical-secondary bg-clip-text text-transparent">Welcome Back</CardTitle>
          <CardDescription className="text-base">Sign in to your MedicalEasy account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="medical" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</> : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
