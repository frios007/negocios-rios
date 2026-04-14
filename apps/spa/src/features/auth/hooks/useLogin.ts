import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useAuthStore } from "../store/auth.store";
import { loginApi } from "../api/auth.api";
import type { LoginInput } from "../schemas/login.schema";
import type { AxiosError } from "axios";
import type { ApiResponse } from "@/lib/api/types";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginInput) => loginApi(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.user.businessUnits);
      router.navigate({ to: "/dashboard" });
    },
    onError: (error: AxiosError<ApiResponse<null>>) => {
      toast.error(error.response?.data?.message ?? "Error al iniciar sesión");
    },
  });
}
