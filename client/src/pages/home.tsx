import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AssignmentGallery from "@/components/assignment-gallery";
import type { Course } from "@shared/schema";

export default function Home() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses']
  });

  const getCourseIcon = (courseName: string) => {
    switch (courseName.toLowerCase()) {
      case 'matematik':
        return <i className="fas fa-calculator text-blue-600 text-xl" />;
      case 'fizik':
        return <i className="fas fa-atom text-green-600 text-xl" />;
      case 'bilgisayar bilimi':
        return <i className="fas fa-code text-purple-600 text-xl" />;
      default:
        return <i className="fas fa-book text-gray-600 text-xl" />;
    }
  };

  const getCourseIconBg = (courseName: string) => {
    switch (courseName.toLowerCase()) {
      case 'matematik':
        return 'bg-blue-100';
      case 'fizik':
        return 'bg-green-100';
      case 'bilgisayar bilimi':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary" data-testid="site-title">
                FTEAL TUNA ERDEM
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium">
                Ana Sayfa
              </span>
              <Link href="/admin">
                <Button variant="default" size="sm" data-testid="button-admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-main-title">
            FTEAL TUNA ERDEM
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-8" data-testid="text-subtitle">
            YAPTIKLARI SİTESİ
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto" data-testid="text-description">
            Eğitim sürecindeki projeler ve ödevlerin sergilendiği platform
          </p>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-center mb-12" data-testid="text-courses-title">
          Dersler ve Projeler
        </h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-48 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg" data-testid="text-no-courses">
              Henüz ders eklenmemiş. Dersler eklemek için admin panelini kullanın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="courses-grid">
            {courses?.map((course) => (
              <Card key={course.id} className="hover:shadow-xl transition-shadow" data-testid={`card-course-${course.slug}`}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`${getCourseIconBg(course.name)} p-3 rounded-lg`}>
                      {getCourseIcon(course.name)}
                    </div>
                    <h4 className="text-xl font-semibold ml-4" data-testid={`text-course-name-${course.slug}`}>
                      {course.name}
                    </h4>
                  </div>
                  <p className="text-muted-foreground mb-6" data-testid={`text-course-description-${course.slug}`}>
                    {course.name} dersi ödevleri ve projeleri
                  </p>
                  
                  <AssignmentGallery courseId={course.id} courseSlug={course.slug} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
