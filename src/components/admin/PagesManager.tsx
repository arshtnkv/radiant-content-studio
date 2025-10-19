import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Home, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Page {
  id: string;
  title: string;
  slug: string;
  is_home: boolean;
  is_published: boolean;
}

export const PagesManager = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      const data = await apiClient.getPages({});
      setPages(data || []);
    } catch (error) {
      toast.error('Ошибка при загрузке страниц');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSetHome = async (pageId: string) => {
    try {
      // Сначала обновляем все страницы, убирая is_home
      for (const page of pages) {
        if (page.id !== pageId && page.is_home) {
          await apiClient.updatePage(page.id, { ...page, is_home: false });
        }
      }

      // Затем устанавливаем is_home для выбранной страницы
      const targetPage = pages.find(p => p.id === pageId);
      if (targetPage) {
        await apiClient.updatePage(pageId, { ...targetPage, is_home: true });
      }

      toast.success('Главная страница установлена');
      fetchPages();
    } catch (error) {
      toast.error('Ошибка при установке главной страницы');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await apiClient.deletePage(deleteId);
      toast.success('Страница удалена');
      fetchPages();
    } catch (error) {
      toast.error('Ошибка при удалении страницы');
    }
    
    setDeleteId(null);
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      await apiClient.updatePage(page.id, {
        ...page,
        is_published: !page.is_published
      });

      toast.success(page.is_published ? 'Страница снята с публикации' : 'Страница опубликована');
      fetchPages();
    } catch (error) {
      toast.error('Ошибка при изменении статуса публикации');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление страницами</CardTitle>
              <CardDescription>Создавайте и редактируйте страницы сайта</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/page/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              Создать страницу
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Загрузка...</p>
            ) : pages.length === 0 ? (
              <p className="text-muted-foreground">Нет созданных страниц</p>
            ) : (
              pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{page.title}</h3>
                      {page.is_home && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Главная
                        </span>
                      )}
                      {!page.is_published && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          Не опубликована
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Просмотр
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/page/${page.id}`)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Редактировать
                    </Button>
                    
                    {!page.is_home && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetHome(page.id)}
                        className="gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Сделать главной
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTogglePublish(page)}
                    >
                      {page.is_published ? 'Снять с публикации' : 'Опубликовать'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(page.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Страница и все её блоки будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
