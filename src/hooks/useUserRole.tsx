import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [isPharmacyInstitute, setIsPharmacyInstitute] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setRole(null);
          setIsPharmacyInstitute(false);
          setLoading(false);
          return;
        }

        const [rolesResult, profileResult] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .select('institute_id, institutes(type)' as any)
            .eq('id', user.id)
            .maybeSingle(),
        ]);

        const { data, error } = rolesResult;

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
          return;
        }

        if (profileResult.error) {
          console.error('Error fetching user institute:', profileResult.error);
        }

        const institute = (profileResult.data as any)?.institutes;
        const instituteType = Array.isArray(institute) ? institute[0]?.type : institute?.type;
        setIsPharmacyInstitute(instituteType === 'pharmacy');

        const roles = (data ?? []).map((item) => item.role);
        const rolePriority: AppRole[] = ['super_admin', 'admin', 'doctor', 'nurse', 'pharmacist', 'patient'];
        const effectiveRole = rolePriority.find((priorityRole) => roles.includes(priorityRole)) ?? null;

        setRole(effectiveRole);
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { role, loading, isPharmacyInstitute };
};
