import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!slug) return;

      try {
        const pageData = await apiClient.getPageBySlug(slug);
        setPage(pageData);

        const blocksData = await apiClient.getPageBlocks(pageData.id);
        setBlocks(blocksData || []);
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-4xl py-12 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Страница не найдена</h1>
          <p className="text-muted-foreground">Запрошенная страница не существует.</p>
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
}
