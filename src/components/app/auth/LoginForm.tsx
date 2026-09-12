"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { progress } from "@/lib/progress";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const run = async (fn: () => Promise<string | null>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const msg = await fn();
      if (msg) setNotice(msg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const signIn = () =>
    run(async () => {
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      progress.start();
      router.replace(next);
      router.refresh();
      return null;
    });

  const signUp = () =>
    run(async () => {
      const { data, error } = await createClient().auth.signUp({ email, password, options: { emailRedirectTo: callback() } });
      if (error) throw error;
      if (data.session) {
        progress.start();
        router.replace(next);
        router.refresh();
        return null;
      }
      return "Check your inbox to confirm your email, then come back here.";
    });

  const magic = () =>
    run(async () => {
      const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: callback() } });
      if (error) throw error;
      return "Magic link sent. Open it on this device.";
    });

  const fields = (withPassword: boolean, autoComplete: "current-password" | "new-password") => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      {withPassword && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete={autoComplete} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="signin">
      <TabsList className="w-full">
        <TabsTrigger value="signin" className="flex-1">
          Sign in
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex-1">
          Create account
        </TabsTrigger>
        <TabsTrigger value="magic" className="flex-1">
          Magic link
        </TabsTrigger>
      </TabsList>

      {(error || notice) && (
        <p className={`mt-4 rounded-md border p-3 text-sm ${error ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted"}`}>{error ?? notice}</p>
      )}

      <TabsContent value="signin" className="mt-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void signIn();
          }}
        >
          {fields(true, "current-password")}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Sign in
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup" className="mt-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void signUp();
          }}
        >
          {fields(true, "new-password")}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Create account
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="magic" className="mt-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void magic();
          }}
        >
          {fields(false, "current-password")}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />} Email me a link
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
