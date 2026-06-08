import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, signOut } = useAuth();
  const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected'>('loading');

  useEffect(() => {
    if (!user) { setStatus('loading'); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('approval_status' as any)
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled) return;
      const s = (data as any)?.approval_status ?? 'approved';
      setStatus(s);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'pending' || status === 'rejected') {
    const isPending = status === 'pending';
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              {isPending ? <Clock className="h-7 w-7 text-amber-600" /> : <XCircle className="h-7 w-7 text-destructive" />}
            </div>
            <CardTitle>{isPending ? 'Awaiting Approval' : 'Application Rejected'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {isPending
                ? "Your institute's administrator must approve your registration before you can access the system. Please check back later."
                : 'Your registration was not approved by the institute administrator. Please contact them for more information.'}
            </p>
            <Button variant="outline" className="w-full" onClick={() => signOut()}>Sign out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
