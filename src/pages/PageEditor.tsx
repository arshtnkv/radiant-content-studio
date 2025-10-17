import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { ContentBlockEditor } from '@/components/admin/ContentBlockEditor';
import { useAppSelector } from '@/store/hooks';

interface ContentBlock {
  id?: string;
  type: 'text' | 'image';
  content: string | null;
  image_url: string | null;
  position: number;
  page_id?: string;
}

export default function PageEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const { user, isAdmin } = useAppSelector(state => state.auth);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const isNew = pageId === 'new';

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/auth');
      return;
    }

    if (!isNew && pageId) {
      const fetchPage = async () => {
        const { data: pageData } = await supabase
          .from('pages')
          .select('*')
          .eq('id', pageId)
          .single();

        if (pageData) {
          setTitle(pageData.title);
          setSlug(pageData.slug);

          const { data: blocksData } = await supabase
            .from('content_blocks')
            .select('*')
            .eq('page_id', pageId)
            .order('position', { ascending: true });

          setBlocks((blocksData || []).map(block => ({
            id: block.id,
            type: block.type as 'text' | 'image',
            content: block.content,
            image_url: block.image_url,
            position: block.position,
            page_id: block.page_id
          })));
        }
      };

      fetchPage();
    }
  }, [pageId, isNew, user, isAdmin, navigate]);

  const handleAddBlock = (type: 'text' | 'image') => {
    setBlocks([...blocks, {
      type,
      content: type === 'text' ? '' : null,
      image_url: null,
      position: blocks.length,
    }]);
  };

  const handleUpdateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks.map((block, i) => ({ ...block, position: i })));
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Заполните название и slug страницы');
      return;
    }

    setLoading(true);

    try {
      let pageIdToUse = pageId;

      if (isNew) {
        const { data: newPage, error: pageError } = await supabase
          .from('pages')
          .insert({
            title,
            slug,
            is_published: true,
          })
          .select()
          .single();

        if (pageError) throw pageError;
        pageIdToUse = newPage.id;
      } else {
        const { error: updateError } = await supabase
          .from('pages')
          .update({ title, slug })
          .eq('id', pageId);

        if (updateError) throw updateError;

        await supabase
          .from('content_blocks')
          .delete()
          .eq('page_id', pageId);
      }

      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
          page_id: pageIdToUse,
          type: block.type,
          content: block.content,
          image_url: block.image_url,
          position: index,
        }));

        const { error: blocksError } = await supabase
          .from('content_blocks')
          .insert(blocksToInsert);

        if (blocksError) throw blocksError;
      }

      toast.success('Страница сохранена');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {isNew ? 'Новая страница' : 'Редактирование страницы'}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название страницы</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="url-stranitsy"
              />
              <p className="text-xs text-muted-foreground">
                Адрес страницы: /page/{slug || 'url-stranitsy'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Блоки контента</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock('text')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Текстовый блок
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock('image')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Изображение
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Нет блоков. Добавьте текст или изображение.
              </p>
            ) : (
              blocks.map((block, index) => (
                <ContentBlockEditor
                  key={index}
                  block={block}
                  index={index}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full gap-2"
          size="lg"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Save className="h-4 w-4" />
          {loading ? 'Сохранение...' : 'Сохранить страницу'}
        </Button>
      </div>
    </div>
  );
}
