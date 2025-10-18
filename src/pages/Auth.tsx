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
  email: z.string().trim().email({ message: "Некорректный email" }).max(255),
  password: z.string().min(6, { message: "Пароль должен быть минимум 6 символов" }).max(100),
});

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('admin@admin.com');
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
      const validated = authSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Неверный логин или пароль');
        } else {
          toast.error(error.message);
        }
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
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
