import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/store/hooks';
import { setAuth, setLoading } from '@/store/slices/authSlice';
import { setSettings } from '@/store/slices/settingsSlice';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Загружаем настройки сайта
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (data) {
        dispatch(setSettings({
          siteName: data.site_name,
          logoUrl: data.logo_url
        }));
      }
    };

    fetchSettings();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        if (user) {
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'admin')
              .single();
            
            dispatch(setAuth({
              user,
              session,
              isAdmin: !!roleData
            }));
          }, 0);
        } else {
          dispatch(setAuth({
            user: null,
            session: null,
            isAdmin: false
          }));
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
        
        dispatch(setAuth({
          user,
          session,
          isAdmin: !!roleData
        }));
      } else {
        dispatch(setLoading(false));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};
