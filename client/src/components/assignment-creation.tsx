import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course } from "@shared/schema";

interface AssignmentCreationProps {
  onClose: () => void;
}

export default function AssignmentCreation({ onClose }: AssignmentCreationProps) {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses']
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assignments'] });
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/assignments`] });
      
      const course = courses?.find(c => c.id === courseId);
      toast({
        title: "Başarılı",
        description: "Ekleme işleminiz tamamlandı!",
      });
      
      // Show success modal with link
      toast({
        title: "Ödev Linki",
        description: `${window.location.origin}${data.link}`,
      });
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ödev eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('courseId', courseId);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    
    images.forEach(image => {
      formData.append('images', image);
    });
    
    createMutation.mutate(formData);
  };

  return (
    <Card data-testid="card-assignment-creation">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle data-testid="text-assignment-creation-title">
          Ödev Ekle
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-assignment-creation">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ders Seçin</Label>
                <Select value={courseId} onValueChange={setCourseId} required data-testid="select-course">
                  <SelectTrigger>
                    <SelectValue placeholder="Ders seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Başlık (İsteğe bağlı)</Label>
                <Input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ödev başlığı"
                  data-testid="input-assignment-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ödev açıklamasını giriniz..."
                  rows={4}
                  data-testid="textarea-assignment-description"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Resim Ekle</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Dosyaları seçin</p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    data-testid="input-images"
                  />
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    data-testid="button-select-images"
                  >
                    Dosya Seç
                  </Button>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2" data-testid="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Önizleme ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                      data-testid={`img-preview-${index}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel">
              İptal
            </Button>
            <Button type="submit" disabled={createMutation.isPending} className="flex-1" data-testid="button-submit">
              {createMutation.isPending ? "Ekleniyor..." : "Ödev Ekle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
