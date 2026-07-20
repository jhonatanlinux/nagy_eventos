import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import { AppLogo } from "@/components/common/AppLogo";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/auth-layout/AuthLayout";
import { AuthService } from "@/services/auth/AuthService";
import { useAuthStore } from "@/stores/authStore";

import { loginSchema, type LoginFormValues } from "../schemas/loginSchema";

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const login = useAuthStore((state) => state.login);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@nagyeventos.com.br",
      password: "",
      remember: true,
    },
  });

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function submit(values: LoginFormValues) {
    setMessage("");
    setErrorMessage("");

    try {
      await login(values.email, values.password, values.remember);
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage("E-mail ou senha incorretos.");
    }
  }

  async function requestPasswordReset() {
    const email = watch("email");
    setMessage("");
    setErrorMessage("");

    try {
      await AuthService.requestPasswordReset(email);
      setMessage("Solicitacao de recuperacao registrada.");
    } catch {
      setErrorMessage("Nao foi possivel solicitar a recuperacao de senha.");
    }
  }

  return (
    <AuthLayout>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
      >
        <Card className="border-border/70 bg-card/95 shadow-premium">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8 flex justify-center">
              <AppLogo className="justify-center" />
            </div>

            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-bold">Entrar no sistema</h1>
              <p className="text-sm text-muted-foreground">
                Acesso seguro para gestao de eventos, agenda e financeiro.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(submit)}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    {...register("email")}
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    className="pl-9"
                    {...register("password")}
                  />
                </div>
                {errors.password ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-brand-orange"
                    {...register("remember")}
                  />
                  Lembrar acesso
                </label>
                <button
                  type="button"
                  className="font-medium text-primary hover:text-primary/80"
                  onClick={requestPasswordReset}
                >
                  Esqueci minha senha
                </button>
              </div>

              {message ? (
                <p className="text-sm text-primary">{message}</p>
              ) : null}
              {errorMessage ? (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                <LogIn className="h-4 w-4" aria-hidden />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
