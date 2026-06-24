import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Home, Music } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — SoundXpand" }] }),
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Full name required").max(80),
  artist_name: z.string().trim().min(1, "Artist/Label name required").max(80),
  email: z.string().trim().email("Invalid email"),
  mobile: z.string().trim().min(7, "Mobile required").max(20),
  country: z.string().trim().min(2, "Country required"),
  password: z.string().min(8, "Min 8 characters").max(72),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function AuthPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <header className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <Home className="h-4 w-4" /> Home
        </Link>
      </header>

      <div className="mx-auto max-w-md px-6 pb-16">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Music className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">SoundXpand</span>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-xl shadow-2xl">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="register"><RegisterForm /></TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New accounts require administrator approval before dashboard access.
        </p>
      </div>
    </div>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (result?.error) {
          toast.error(result.error instanceof Error ? result.error.message : "Google sign-in failed");
          setLoading(false);
        }
      }}
    >
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </Button>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  if (forgot) {
    return (
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success("Reset link sent. Check your email.");
          setForgot(false);
        }}
      >
        <h2 className="text-lg font-semibold">Reset password</h2>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>Send reset link</Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setForgot(false)}>
          Back to sign in
        </button>
      </form>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) return toast.error(error.message);
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      }}
    >
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Password</Label>
          <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setForgot(true)}>
            Forgot?
          </button>
        </div>
        <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or</span></div>
      </div>
      <GoogleButton />
    </form>
  );
}

function RegisterForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    full_name: "", artist_name: "", email: "", mobile: "",
    country: "", password: "", confirm: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  if (sent) {
    return (
      <div className="text-center py-6 space-y-3">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to <span className="text-foreground">{form.email}</span>.
          After verifying, your account will be reviewed by an administrator.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) return toast.error(parsed.error.issues[0].message);
        setBusy(true);
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: form.full_name,
              artist_name: form.artist_name,
              mobile: form.mobile,
              country: form.country,
            },
          },
        });
        setBusy(false);
        if (error) return toast.error(error.message);
        setSent(true);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Full name</Label><Input required value={form.full_name} onChange={set("full_name")} /></div>
        <div className="space-y-1"><Label>Artist / Label</Label><Input required value={form.artist_name} onChange={set("artist_name")} /></div>
      </div>
      <div className="space-y-1"><Label>Email</Label><Input type="email" required value={form.email} onChange={set("email")} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Mobile</Label><Input required value={form.mobile} onChange={set("mobile")} /></div>
        <div className="space-y-1"><Label>Country</Label><Input required value={form.country} onChange={set("country")} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Password</Label><Input type="password" required value={form.password} onChange={set("password")} /></div>
        <div className="space-y-1"><Label>Confirm</Label><Input type="password" required value={form.confirm} onChange={set("confirm")} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
      <p className="text-xs text-muted-foreground text-center">A unique SX### username is assigned automatically.</p>
      <GoogleButton />
    </form>
  );
}
