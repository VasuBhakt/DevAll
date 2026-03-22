import { AuthService } from "@/services/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Global state for auth
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: Infinity,
    retry: false,
  });

  // Mutations (Standard Login/Logout)
  const loginMutation = useMutation({
    mutationFn: AuthService.signin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: AuthService.signout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
    },
  });

  return {
    user: user?.data ?? null,
    isLoggedIn: !!user?.data,
    isLoading,
    isError,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginStatus: loginMutation.status,
  };
};
