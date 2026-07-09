import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full bg-surface shadow-2xl border-border">
      <CardHeader className="bg-gradient-dark p-8 text-center rounded-t-xl border-b-0 pb-6 relative">
        <Link href="/login" className="absolute left-4 top-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-secondary hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="font-display text-4xl tracking-[0.2em] text-white">
          CITLY<span className="text-white/40">.</span>
        </div>
        <p className="text-xs text-white/60 mt-1">
          Reset your password
        </p>
      </CardHeader>
      
      <CardContent className="p-6 pt-8">
        <p className="text-sm text-text-secondary text-center mb-6">
          Enter your email address and we will send you a link to reset your password.
        </p>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Email Address
            </label>
            <Input type="email" placeholder="owner@restaurant.com" required />
          </div>

          <Button className="w-full mt-4" size="lg">
            Send Reset Link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
