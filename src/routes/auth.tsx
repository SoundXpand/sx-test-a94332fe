import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Home, Music } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { ROLE_TYPES, MAIN_GENRES, DISTRIBUTORS, TRACKS_RELEASED_BUCKETS, LISTENERS_BUCKETS } from "@/lib/onboarding-options";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — SoundXpand" }] }),
});

const step1Schema = z.object({
  role_type: z.enum(ROLE_TYPES, { errorMap: () => ({ message: "Select what you are" }) }),
  first_name: z.string().trim().min(1, "First name required").max(60),
  last_name: z.string().trim().min(1, "Last name required").max(60),
  email: z.string().trim().email("Invalid email"),
  mobile: z.string().trim().min(7, "Phone required").max(20),
  country: z.string().trim().min(2, "Country required"),
  city: z.string().trim().min(1, "City required").max(60),
  artist_name: z.string().trim().min(1, "Your name required").max(80),
  main_genre: z.string().min(1, "Main music genre required"),
  current_distributor: z.string().min(1, "Current distributor required"),
  tracks_released_bucket: z.string().min(1, "Required"),
  spotify_monthly_listeners_bucket: z.string().min(1, "Required"),
  private_link: z.string().optional(),
  social_instagram: z.string().optional(),
  social_facebook: z.string().optional(),
  social_tiktok: z.string().optional(),
  social_vk: z.string().optional(),
  social_youtube: z.string().optional(),
  privacy_accepted: z.literal(true, { errorMap: () => ({ message: "You must accept the privacy policy" }) }),
});

const step2Schema = z.object({
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

      <div className="mx-auto max-w-2xl px-6 pb-16">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Music className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">SoundXpand</span>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-8 backdrop-blur-xl shadow-2xl">
          <AuthTabs />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          New accounts require administrator approval before dashboard access.
        </p>
      </div>
    </div>
  );
}

function AuthTabs() {
  const initial = typeof window !== "undefined" && window.location.hash === "#register" ? "register" : "login";
  const [tab, setTab] = useState<string>(initial);
  useEffect(() => {
    const sync = () => {
      const h = window.location.hash;
      if (h === "#register") setTab("register");
      else if (h === "#login") setTab("login");
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const change = (v: string) => {
    setTab(v);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", `#${v}`);
    }
  };
  return (
    <Tabs value={tab} onValueChange={change}>
      <TabsList className="grid grid-cols-2 w-full mb-6">
        <TabsTrigger value="login">Sign in</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login"><LoginForm /></TabsContent>
      <TabsContent value="register"><RegisterForm /></TabsContent>
    </Tabs>
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

type RegisterForm = z.input<typeof step1Schema> & { password: string; confirm: string; full_name: string };

function RegisterForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Partial<RegisterForm>>({
    role_type: undefined, first_name: "", last_name: "", email: "", mobile: "",
    country: "", city: "", artist_name: "", main_genre: "", current_distributor: "",
    tracks_released_bucket: "", spotify_monthly_listeners_bucket: "",
    private_link: "", social_instagram: "", social_facebook: "", social_tiktok: "",
    social_vk: "", social_youtube: "", privacy_accepted: false as any,
    password: "", confirm: "",
  });
  const set = <K extends keyof RegisterForm>(k: K) => (v: RegisterForm[K]) => setForm(f => ({ ...f, [k]: v }));

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

  if (step === 1) {
    return (
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault();
        const parsed = step1Schema.safeParse(form);
        if (!parsed.success) return toast.error(parsed.error.issues[0].message);
        setStep(2);
      }}>
        <div className="space-y-1.5">
          <Label>You are *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ROLE_TYPES.map(r => (
              <button type="button" key={r}
                onClick={() => set("role_type")(r)}
                className={`px-3 py-2 rounded-lg border text-sm transition ${form.role_type === r ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>First name *</Label><Input required value={form.first_name} onChange={e => set("first_name")(e.target.value)} /></div>
          <div className="space-y-1"><Label>Last name *</Label><Input required value={form.last_name} onChange={e => set("last_name")(e.target.value)} /></div>
        </div>
        <div className="space-y-1"><Label>Email *</Label><Input type="email" required value={form.email} onChange={e => set("email")(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1"><Label>Phone *</Label><Input required value={form.mobile} onChange={e => set("mobile")(e.target.value)} /></div>
          <div className="space-y-1"><Label>Country *</Label><Input required value={form.country} onChange={e => set("country")(e.target.value)} /></div>
        </div>
        <div className="space-y-1"><Label>City *</Label><Input required value={form.city} onChange={e => set("city")(e.target.value)} /></div>
        <div className="space-y-1"><Label>Your name (Artist, Band, Label) *</Label><Input required value={form.artist_name} onChange={e => set("artist_name")(e.target.value)} /></div>

        <div className="space-y-1">
          <Label>Main music genre *</Label>
          <Select value={form.main_genre} onValueChange={set("main_genre")}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="max-h-72">{MAIN_GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Current distributor *</Label>
          <Select value={form.current_distributor} onValueChange={set("current_distributor")}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent className="max-h-72">{DISTRIBUTORS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Number of tracks released (all albums, EP, singles) *</Label>
          <Select value={form.tracks_released_bucket} onValueChange={set("tracks_released_bucket")}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{TRACKS_RELEASED_BUCKETS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1"><Label>Private link for your next release/project</Label><Input value={form.private_link} onChange={e => set("private_link")(e.target.value)} placeholder="Optional" /></div>

        <div className="space-y-1">
          <Label>Spotify monthly listeners on main stations *</Label>
          <Select value={form.spotify_monthly_listeners_bucket} onValueChange={set("spotify_monthly_listeners_bucket")}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{LISTENERS_BUCKETS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Your social media presence (optional)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Instagram" value={form.social_instagram} onChange={e => set("social_instagram")(e.target.value)} />
            <Input placeholder="Facebook" value={form.social_facebook} onChange={e => set("social_facebook")(e.target.value)} />
            <Input placeholder="TikTok" value={form.social_tiktok} onChange={e => set("social_tiktok")(e.target.value)} />
            <Input placeholder="VK" value={form.social_vk} onChange={e => set("social_vk")(e.target.value)} />
            <Input placeholder="YouTube" value={form.social_youtube} onChange={e => set("social_youtube")(e.target.value)} className="col-span-2" />
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
          <Checkbox checked={!!form.privacy_accepted} onCheckedChange={v => set("privacy_accepted")(!!v as any)} className="mt-0.5" />
          <span>I declare that I have read SoundXpand's Privacy Protection Policy. *</span>
        </label>

        <Button type="submit" className="w-full">Continue</Button>
      </form>
    );
  }

  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      const parsed = step2Schema.safeParse({ password: form.password, confirm: form.confirm });
      if (!parsed.success) return toast.error(parsed.error.issues[0].message);
      setBusy(true);
      const { error } = await supabase.auth.signUp({
        email: form.email!,
        password: form.password!,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: `${form.first_name} ${form.last_name}`.trim(),
            artist_name: form.artist_name,
            mobile: form.mobile,
            country: form.country,
            role_type: form.role_type,
            first_name: form.first_name,
            last_name: form.last_name,
            city: form.city,
            main_genre: form.main_genre,
            current_distributor: form.current_distributor,
            tracks_released_bucket: form.tracks_released_bucket,
            private_link: form.private_link || null,
            spotify_monthly_listeners_bucket: form.spotify_monthly_listeners_bucket,
            social_instagram: form.social_instagram || null,
            social_facebook: form.social_facebook || null,
            social_tiktok: form.social_tiktok || null,
            social_vk: form.social_vk || null,
            social_youtube: form.social_youtube || null,
            privacy_accepted: !!form.privacy_accepted,
          },
        },
      });
      setBusy(false);
      if (error) return toast.error(error.message);
      setSent(true);
    }}>
      <h3 className="font-semibold">Set a password</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Password *</Label><Input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
        <div className="space-y-1"><Label>Confirm *</Label><Input type="password" required value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} /></div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
        <Button type="submit" className="flex-1" disabled={busy}>{busy ? "Creating…" : "Create account"}</Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">A unique SX### username is assigned automatically.</p>
      <GoogleButton />
    </form>
  );
}
