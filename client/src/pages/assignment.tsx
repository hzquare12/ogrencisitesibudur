import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, ExternalLink, QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import type { Assignment, Course } from "@shared/schema";

interface AssignmentResponse {
  assignment: Assignment;
  course: Course;
}

export default function Assignment() {
  const { courseSlug, orderIndex } = useParams();
  const { toast } = useToast();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const { data, isLoading, error } = useQuery<AssignmentResponse>({
    queryKey: [`/api/assignments/${courseSlug}/${orderIndex}`]
  });

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link kopyalandı",
        description: "Ödev linki panoya kopyalandı",
      });
    });
  };

  const generateQR = async () => {
    try {
      const url = window.location.href;
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      setQrCodeDataUrl(qrDataUrl);
      setQrModalOpen(true);
    } catch (error) {
      toast({
        title: "Hata",
        description: "QR kod oluşturulurken hata oluştu",
        variant: "destructive"
      });
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `ödev-qr-${courseSlug}-${orderIndex}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast({
      title: "QR Kod İndirildi",
      description: "QR kod başarıyla indirildi"
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4" data-testid="text-assignment-not-found">
              Ödev Bulunamadı
            </h1>
            <p className="text-muted-foreground mb-6" data-testid="text-assignment-error">
              Belirtilen ödev mevcut değil veya kaldırılmış olabilir.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { assignment, course } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyLink} data-testid="button-copy-link">
                <ExternalLink className="mr-2 h-4 w-4" />
                Link Kopyala
              </Button>
              <Button variant="outline" size="sm" onClick={generateQR} data-testid="button-generate-qr">
                <QrCode className="mr-2 h-4 w-4" />
                QR Kod
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card data-testid="card-assignment-detail">
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-primary/10 px-3 py-1 rounded-full">
                <span className="text-primary font-medium text-sm" data-testid="text-course-name">
                  {course.name}
                </span>
              </div>
            </div>
            <CardTitle className="text-3xl" data-testid="text-assignment-title">
              {assignment.title || `Ödev ${assignment.orderIndex}`}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Images */}
            {assignment.images && assignment.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold" data-testid="text-images-title">
                  Görüntüler
                </h3>
                <div className={`grid gap-4 ${
                  assignment.images.length === 1 ? 'grid-cols-1' : 
                  assignment.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`} data-testid="assignment-images-grid">
                  {assignment.images.map((image: string, index: number) => (
                    <div key={index} className="rounded-lg overflow-hidden border border-border">
                      <img 
                        src={image} 
                        alt={`Ödev görseli ${index + 1}`}
                        className="w-full h-auto object-cover"
                        data-testid={`img-assignment-${index}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {assignment.description && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold" data-testid="text-description-title">
                  Açıklama
                </h3>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap" data-testid="text-assignment-description">
                    {assignment.description}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {(!assignment.images || assignment.images.length === 0) && !assignment.description && (
              <div className="text-center py-12">
                <p className="text-muted-foreground" data-testid="text-assignment-empty">
                  Bu ödev için henüz içerik eklenmemiş.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Kod
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {qrCodeDataUrl && (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Assignment QR Code" 
                  className="border border-border rounded-lg"
                  data-testid="img-qr-code"
                />
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Bu QR kodu taratarak ödeve doğrudan erişebilirsiniz
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {window.location.href}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  toast({
                    title: "Link kopyalandı",
                    description: "Ödev linki panoya kopyalandı"
                  });
                }}
                data-testid="button-copy-link-modal"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Link Kopyala
              </Button>
              <Button 
                className="flex-1"
                onClick={downloadQR}
                data-testid="button-download-qr"
              >
                QR Kod İndir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
