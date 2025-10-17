import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setSettings } from '@/store/slices/settingsSlice';

export const SiteSettings = () => {
  const dispatch = useAppDispatch();
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (data) {
        setSiteName(data.site_name);
        setLogoUrl(data.logo_url);
      }
    };

    fetchSettings();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('Ошибка при загрузке логотипа');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    setLogoUrl(publicUrl);
    setUploading(false);
    toast.success('Логотип загружен');
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
  };

  const handleSave = async () => {
    setLoading(true);

    const { data: settings } = await supabase
      .from('site_settings')
      .select('id')
      .single();

    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: siteName,
        logo_url: logoUrl,
      })
      .eq('id', settings?.id);

    if (error) {
      toast.error('Ошибка при сохранении настроек');
    } else {
      toast.success('Настройки сохранены');
      dispatch(setSettings({ siteName, logoUrl }));
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки сайта</CardTitle>
        <CardDescription>Управление логотипом и названием сайта</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Название сайта</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Название вашего сайта"
          />
        </div>

        <div className="space-y-2">
          <Label>Логотип</Label>
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Логотип" className="h-20 w-auto" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Удалить
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
                disabled={uploading}
              />
              <Label
                htmlFor="logo-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Загрузка...' : 'Нажмите для загрузки логотипа'}
                </span>
              </Label>
            </div>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
};
