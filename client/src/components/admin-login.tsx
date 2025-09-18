import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest('POST', '/api/admin/login', { password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
      toast({
        title: "Giriş başarılı",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanlış şifre! Tekrar deneyiniz.",
        variant: "destructive",
      });
      setPassword("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      loginMutation.mutate(password);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="card-admin-login">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" data-testid="icon-lock" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-admin-login-title">
            Admin Girişi
          </CardTitle>
          <CardDescription data-testid="text-admin-login-description">
            Yönetim paneline erişim için şifre gerekli
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi giriniz"
                required
                data-testid="input-admin-password"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
              data-testid="button-admin-login"
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
