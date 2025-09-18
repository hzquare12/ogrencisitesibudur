import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Home, Book, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdminLogin from "@/components/admin-login";
import CourseManagement from "@/components/course-management";
import AssignmentCreation from "@/components/assignment-creation";
import AssignmentControl from "@/components/assignment-control";

type AdminPanel = 'course-management' | 'assignment-creation' | 'assignment-control' | null;

export default function Admin() {
  const [activePanel, setActivePanel] = useState<AdminPanel>(null);
  
  const { data: adminStatus } = useQuery<{ isAdmin: boolean }>({
    queryKey: ['/api/admin/status']
  });

  if (!adminStatus?.isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Header */}
        <Card className="mb-8" data-testid="card-admin-header">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-primary" data-testid="text-admin-title">
                  Admin Paneli
                </h2>
                <p className="text-muted-foreground" data-testid="text-admin-description">
                  İçerik yönetimi ve düzenleme araçları
                </p>
              </div>
              <Link href="/">
                <Button variant="secondary" data-testid="button-home">
                  <Home className="mr-2 h-4 w-4" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Admin Menu Cards */}
        {!activePanel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="admin-menu">
            
            {/* Course Management */}
            <Card className="hover:shadow-xl transition-shadow" data-testid="card-course-management">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Book className="text-blue-600 h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-course-management-title">
                    Ders Kontrolü
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-course-management-description">
                    Dersleri ekleyin veya silin
                  </p>
                  <Button 
                    onClick={() => setActivePanel('course-management')}
                    className="w-full"
                    data-testid="button-course-management"
                  >
                    Yönet
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Creation */}
            <Card className="hover:shadow-xl transition-shadow" data-testid="card-assignment-creation">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-green-600 h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-assignment-creation-title">
                    Ödev Ekle
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-assignment-creation-description">
                    Yeni ödev ve proje ekleyin
                  </p>
                  <Button 
                    onClick={() => setActivePanel('assignment-creation')}
                    className="w-full"
                    data-testid="button-assignment-creation"
                  >
                    Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Control */}
            <Card className="hover:shadow-xl transition-shadow" data-testid="card-assignment-control">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Edit className="text-purple-600 h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-assignment-control-title">
                    Ödevleri Kontrol Et
                  </h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-assignment-control-description">
                    Mevcut ödevleri yönetin
                  </p>
                  <Button 
                    onClick={() => setActivePanel('assignment-control')}
                    className="w-full"
                    data-testid="button-assignment-control"
                  >
                    Kontrol Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Panel Content */}
        {activePanel === 'course-management' && (
          <CourseManagement onClose={() => setActivePanel(null)} />
        )}
        
        {activePanel === 'assignment-creation' && (
          <AssignmentCreation onClose={() => setActivePanel(null)} />
        )}
        
        {activePanel === 'assignment-control' && (
          <AssignmentControl onClose={() => setActivePanel(null)} />
        )}
      </div>
    </div>
  );
}
