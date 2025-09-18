import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Assignment } from "@shared/schema";

interface AssignmentGalleryProps {
  courseId: string;
  courseSlug: string;
}

export default function AssignmentGallery({ courseId, courseSlug }: AssignmentGalleryProps) {
  const [expanded, setExpanded] = useState(false);

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: [`/api/courses/${courseId}/assignments`]
  });

  if (isLoading) {
    return (
      <div className="animate-pulse" data-testid="assignment-gallery-loading">
        <div className="w-full h-48 bg-muted rounded-lg mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8" data-testid="assignment-gallery-empty">
        <p className="text-muted-foreground">Henüz ödev eklenmemiş</p>
      </div>
    );
  }

  const firstAssignment = assignments[0];
  const firstImage = firstAssignment.images?.[0];

  return (
    <div className={`assignment-container ${expanded ? 'assignment-expanded' : ''}`} data-testid={`assignment-gallery-${courseSlug}`}>
      {/* Preview - Show only first image */}
      <div className="assignment-preview" data-testid="assignment-preview">
        {firstImage ? (
          <>
            <img 
              src={firstImage}
              alt={`${courseSlug} ödev örneği`}
              className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpanded(true)}
              data-testid="img-assignment-preview"
            />
            <p className="text-sm text-muted-foreground mt-2 text-center" data-testid="text-click-to-expand">
              Daha fazla görmek için tıklayın
            </p>
          </>
        ) : (
          <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center cursor-pointer"
               onClick={() => setExpanded(true)}
               data-testid="assignment-preview-placeholder">
            <p className="text-muted-foreground">Görsel yok</p>
          </div>
        )}
      </div>

      {/* Full View - Show all assignments */}
      <div className="assignment-full" data-testid="assignment-full">
        <div className="grid grid-cols-2 gap-2 mb-4" data-testid="assignment-grid-expanded">
          {assignments.slice(0, 4).map((assignment) => {
            const image = assignment.images?.[0];
            return (
              <Link key={assignment.id} href={`/${courseSlug}/${assignment.orderIndex}`}>
                <div className="cursor-pointer group" data-testid={`assignment-item-${assignment.orderIndex}`}>
                  {image ? (
                    <img 
                      src={image}
                      alt={`${courseSlug} ödev ${assignment.orderIndex}`}
                      className="w-full h-24 object-cover rounded group-hover:opacity-80 transition-opacity"
                      data-testid={`img-assignment-${assignment.orderIndex}`}
                    />
                  ) : (
                    <div className="w-full h-24 bg-muted rounded flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                      <span className="text-xs text-muted-foreground">Görsel yok</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {assignments.length > 4 && (
          <p className="text-xs text-muted-foreground mb-2" data-testid="text-more-assignments">
            +{assignments.length - 4} ödev daha
          </p>
        )}
        
        <button 
          onClick={() => setExpanded(false)}
          className="text-sm text-primary hover:underline"
          data-testid="button-collapse"
        >
          Küçült
        </button>
      </div>
    </div>
  );
}
