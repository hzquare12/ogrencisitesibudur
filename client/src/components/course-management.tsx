import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course } from "@shared/schema";

interface CourseManagementProps {
  onClose: () => void;
}

type Action = 'add' | 'delete' | null;

export default function CourseManagement({ onClose }: CourseManagementProps) {
  const [action, setAction] = useState<Action>(null);
  const [courseName, setCourseName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [passwords, setPasswords] = useState(["", "", "", "", ""]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses']
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return await apiRequest('POST', '/api/courses', data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Başarılı",
        description: `"${courseName}" dersi başarıyla eklendi!`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata", 
        description: error.message || "Ders eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: { courseId: string; passwords: string[] }) => {
      return await apiRequest('DELETE', `/api/courses/${data.courseId}`, { passwords: data.passwords });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      const course = courses?.find(c => c.id === selectedCourse);
      toast({
        title: "Başarılı",
        description: `"${course?.name}" dersi başarıyla silindi!`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ders silinirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = courseName.toLowerCase()
      .replace('ı', 'i')
      .replace('ğ', 'g')
      .replace('ü', 'u')
      .replace('ş', 's')
      .replace('ö', 'o')
      .replace('ç', 'c')
      .replace(/\s+/g, '-');
    
    addMutation.mutate({ name: courseName, slug });
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    deleteMutation.mutate({ courseId: selectedCourse, passwords });
  };

  const updatePassword = (index: number, value: string) => {
    const newPasswords = [...passwords];
    newPasswords[index] = value;
    setPasswords(newPasswords);
  };

  return (
    <Card data-testid="card-course-management">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle data-testid="text-course-management-title">
          Ders Yönetimi
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-course-management">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!action && (
          <div className="text-center space-y-4">
            <p className="text-lg mb-4" data-testid="text-select-operation">
              Yapmak istediğiniz işlemi seçiniz
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setAction('add')} 
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-add-course"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ders Ekle
              </Button>
              <Button 
                onClick={() => setAction('delete')} 
                variant="destructive"
                data-testid="button-delete-course"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Ders Sil
              </Button>
            </div>
          </div>
        )}

        {/* Add Course Form */}
        {action === 'add' && (
          <form onSubmit={handleAdd} className="space-y-4" data-testid="form-add-course">
            <div className="space-y-2">
              <Label htmlFor="course-name">Ders Adı</Label>
              <Input
                id="course-name"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Örn: Matematik"
                required
                data-testid="input-course-name"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1" data-testid="button-cancel-add">
                İptal
              </Button>
              <Button type="submit" disabled={addMutation.isPending} className="flex-1" data-testid="button-submit-add">
                {addMutation.isPending ? "Ekleniyor..." : "Ekle"}
              </Button>
            </div>
          </form>
        )}

        {/* Delete Course Form */}
        {action === 'delete' && (
          <form onSubmit={handleDelete} className="space-y-4" data-testid="form-delete-course">
            <div className="space-y-2">
              <Label>Silinecek Ders</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse} required data-testid="select-course-to-delete">
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
              <Label>Güvenlik Doğrulaması (5 kez şifre giriniz)</Label>
              <div className="space-y-2">
                {passwords.map((password, index) => (
                  <Input
                    key={index}
                    type="password"
                    value={password}
                    onChange={(e) => updatePassword(index, e.target.value)}
                    placeholder={`${index + 1}. Şifre`}
                    required
                    data-testid={`input-password-${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAction(null)} className="flex-1" data-testid="button-cancel-delete">
                İptal
              </Button>
              <Button type="submit" variant="destructive" disabled={deleteMutation.isPending} className="flex-1" data-testid="button-submit-delete">
                {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
