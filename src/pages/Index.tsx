import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';

interface ContentBlock {
  id: string;
  type: string;
  content: string | null;
  image_url: string | null;
  position: number;
}

const Index = () => {
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomePage = async () => {
      try {
        const pages = await apiClient.getPages({ is_home: true, is_published: true });
        const homePageData = pages[0];

        if (homePageData) {
          setPage(homePageData);
          const blocksData = await apiClient.getPageBlocks(homePageData.id);
          setBlocks(blocksData || []);
        }
      } catch (error) {
        console.error('Error fetching home page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl py-12 px-4">
          <Skeleton className="h-12 w-3/4 mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-subtle)' }}>
        <Header />
        <div className="container max-w-4xl py-24 px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Добро пожаловать!
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Это ваш новый сайт с системой управления контентом.
          </p>
          <p className="text-muted-foreground">
            Главная страница еще не настроена. Войдите в админ-панель для создания контента.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl py-12 px-4">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {page.title}
        </h1>
        
        <div className="space-y-6">
          {blocks.map((block) => (
            <div key={block.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {block.type === 'text' && block.content && (
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
              {block.type === 'image' && block.image_url && (
                <img
                  src={block.image_url}
                  alt="Изображение"
                  className="w-full rounded-lg shadow-lg"
                  style={{ boxShadow: 'var(--shadow-elegant)' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
