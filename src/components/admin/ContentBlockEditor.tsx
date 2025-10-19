import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface ContentBlock {
  type: 'text' | 'image';
  content: string | null;
  image_url: string | null;
  position: number;
}

interface Props {
  block: ContentBlock;
  index: number;
  onUpdate: (index: number, updates: Partial<ContentBlock>) => void;
  onDelete: (index: number) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['clean'],
  ],
};

export const ContentBlockEditor = ({ block, index, onUpdate, onDelete }: Props) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadImage(file);
      onUpdate(index, { image_url: result.url });
      toast.success('Изображение загружено');
    } catch (error) {
      toast.error('Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(index)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {block.type === 'text' ? (
        <div className="pr-12">
          <ReactQuill
            theme="snow"
            value={block.content || ''}
            onChange={(content) => onUpdate(index, { content })}
            modules={modules}
            className="bg-background"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {block.image_url ? (
            <div className="space-y-2">
              <img
                src={block.image_url}
                alt="Блок изображения"
                className="w-full h-auto rounded-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdate(index, { image_url: null })}
              >
                Изменить изображение
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`image-upload-${index}`}
                disabled={uploading}
              />
              <label
                htmlFor={`image-upload-${index}`}
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {uploading ? (
                  <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Загрузка...' : 'Нажмите для загрузки изображения'}
                </span>
              </label>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
