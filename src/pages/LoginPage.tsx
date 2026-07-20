import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLocation, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { loginSchema, type LoginSchema } from "@/lib/validation"
import { isSupabaseConfigured } from "@/lib/supabaseClient"

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginSchema) {
    setServerError("")
    const { error } = await signIn(values.email, values.password)
    if (error) {
      setServerError(
        error === "Invalid login credentials"
          ? "Nieprawidłowy e-mail lub hasło."
          : error
      )
      return
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/"
    navigate(redirectTo, { replace: true })
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Supabase nie jest skonfigurowane</CardTitle>
            <CardDescription>
              Ustaw <code>VITE_SUPABASE_URL</code> i <code>VITE_SUPABASE_ANON_KEY</code> w pliku{" "}
              <code>.env</code> i zrestartuj aplikację. Instrukcja: README, sekcja „Konfiguracja
              Supabase”.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src="/logo-mark.png" alt="" className="mb-1 size-10 rounded-lg" />
          <CardTitle>Leadow CRM</CardTitle>
          <CardDescription>Zaloguj się, aby zarządzać leadami.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logowanie…" : "Zaloguj się"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
