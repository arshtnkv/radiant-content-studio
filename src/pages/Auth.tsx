import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiClient } from '@/lib/api-client';

const authSchema = z.object({
  login: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = authSchema.parse({ login, password });

      const response = await apiClient.login(validated.login, validated.password);
      
      const isAdmin = await apiClient.checkAdmin();
      
      dispatch(setAuth({
        user: response.user,
        session: { access_token: response.access_token },
        isAdmin
      }));

      toast.success('Вход выполнен успешно');
      navigate('/admin');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Неверный email или пароль');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Произошла ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'var(--gradient-subtle)' }}>
      <Card className="w-full max-w-md shadow-lg" style={{ boxShadow: 'var(--shadow-elegant)' }}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Вход в админ-панель
          </CardTitle>
          <CardDescription>
            Войдите используя учетные данные администратора
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Email</Label>
              <Input
                id="login"
                type="email"
                placeholder="admin@admin.com"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
