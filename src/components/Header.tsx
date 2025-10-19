import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Settings, LogOut, Home } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export const Header = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAdmin } = useAppSelector(state => state.auth);
  const { logoUrl, siteName } = useAppSelector(state => state.settings);

  const handleLogout = async () => {
    await apiClient.logout();
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-10 w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {siteName}
              </span>
            </div>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Админ-панель
            </Button>
          )}
          
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
