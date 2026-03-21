import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-mono font-bold tracking-tight text-foreground">
              MUSICHUB
            </h1>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {isSignUp ? "Create your account" : "Sign in to your workspace"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="pl-9 bg-secondary border-border font-mono text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-mono text-xs text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 bg-secondary border-border font-mono text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-mono text-xs gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Sign In"}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center font-mono text-xs text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
