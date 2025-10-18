import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';

const authSchema = z.object({
  login: z.string().trim().min(1, { message: "Логин не может быть пустым" }).max(100),
  password: z.string().min(1, { message: "Пароль не может быть пустым" }).max(100),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('root');
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

      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { login: validated.login, password: validated.password }
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Неверный логин или пароль');
        return;
      }

      toast.success('Успешный вход!');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Произошла ошибка');
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
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                type="text"
                placeholder="admin"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                maxLength={100}
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
                maxLength={100}
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
