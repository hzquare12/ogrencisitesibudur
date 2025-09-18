import { useQuery } from "@tanstack/react-query";

interface AdminStatus {
  isAdmin: boolean;
}

export function useAuth() {
  const { data: adminStatus, isLoading } = useQuery<AdminStatus>({
    queryKey: ['/api/admin/status']
  });

  return {
    isAdmin: adminStatus?.isAdmin || false,
    isLoading
  };
}
