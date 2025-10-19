import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setAuth, setLoading } from '@/store/slices/authSlice';
import { setSettings } from '@/store/slices/settingsSlice';
import { apiClient } from '@/lib/api-client';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Загружаем настройки сайта
        const settings = await apiClient.getSettings();
        dispatch(setSettings({
          siteName: settings.site_name,
          logoUrl: settings.logo_url
        }));

        // Проверяем аутентификацию
        if (apiClient.isAuthenticated()) {
          const user = await apiClient.getCurrentUser();
          if (user) {
            const isAdmin = await apiClient.checkAdmin();
            dispatch(setAuth({
              user,
              session: { access_token: localStorage.getItem('access_token') } as any,
              isAdmin
            }));
          } else {
            dispatch(setLoading(false));
          }
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
};
