import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Link2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course, Assignment } from "@shared/schema";

interface AssignmentControlProps {
  onClose: () => void;
}

export default function AssignmentControl({ onClose }: AssignmentControlProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses']
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery<Assignment[]>({
    queryKey: [`/api/courses/${selectedCourseId}/assignments`],
    enabled: !!selectedCourseId
  });

  const deleteMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      return await apiRequest('DELETE', `/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${selectedCourseId}/assignments`] });
      toast({
        title: "Başarılı",
        description: "Ödev başarıyla silindi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ödev silinirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const copyAssignmentLink = (courseSlug: string, orderIndex: number) => {
    const link = `${window.location.origin}/${courseSlug}/${orderIndex}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link kopyalandı",
        description: link,
      });
    });
  };

  const handleEdit = (assignmentId: string) => {
    // TODO: Implement edit functionality
    toast({
      title: "Düzenleme",
      description: "Ödev düzenleme özelliği yakında eklenecek",
    });
  };

  const handleDelete = (assignment: Assignment) => {
    if (confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
      deleteMutation.mutate(assignment.id);
    }
  };

  const selectedCourse = courses?.find(c => c.id === selectedCourseId);

  return (
    <Card data-testid="card-assignment-control">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle data-testid="text-assignment-control-title">
          Ödev Kontrolü
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-assignment-control">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Ders Seçin</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId} data-testid="select-course-control">
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

        {/* Assignment List */}
        {selectedCourseId && (
          <div className="space-y-4">
            <h4 className="text-xl font-semibold" data-testid="text-assignments-title">
              Ödevler
            </h4>
            
            {assignmentsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                    <div className="w-full h-32 bg-muted rounded mb-3"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : assignments?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground" data-testid="text-no-assignments">
                  Bu ders için henüz ödev eklenmemiş.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="assignments-control-grid">
                {assignments?.map((assignment) => {
                  const firstImage = assignment.images?.[0];
                  return (
                    <div key={assignment.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`assignment-control-${assignment.id}`}>
                      <div className="mb-3">
                        {firstImage ? (
                          <img 
                            src={firstImage} 
                            alt={`Ödev ${assignment.orderIndex}`}
                            className="w-full h-32 object-cover rounded"
                            data-testid={`img-assignment-control-${assignment.orderIndex}`}
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Görsel yok</span>
                          </div>
                        )}
                      </div>
                      
                      <h5 className="font-medium mb-2" data-testid={`text-assignment-title-${assignment.orderIndex}`}>
                        {assignment.title || `Ödev ${assignment.orderIndex}`}
                      </h5>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-assignment-desc-${assignment.orderIndex}`}>
                        {assignment.description || "Açıklama yok"}
                      </p>
                      
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectedCourse && copyAssignmentLink(selectedCourse.slug, assignment.orderIndex)}
                          className="text-xs"
                          data-testid={`button-copy-link-${assignment.orderIndex}`}
                        >
                          <Link2 className="mr-1 h-3 w-3" />
                          Link
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(assignment.id)}
                          className="text-xs"
                          data-testid={`button-edit-${assignment.orderIndex}`}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Düzenle
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(assignment)}
                          className="text-xs text-destructive hover:text-destructive"
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${assignment.orderIndex}`}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
