import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full bg-surface shadow-2xl border-border">
      <CardHeader className="bg-gradient-accent p-8 text-center rounded-t-xl border-b-0 pb-6">
        <div className="font-display text-4xl tracking-[0.2em] text-white">
          CITLY<span className="text-white/40">.</span>
        </div>
        <p className="text-xs text-white/60 mt-1">
          Create your restaurant account
        </p>
      </CardHeader>
      
      <CardContent className="p-6 pt-6">
        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <Link href="/login" className="flex-1 text-center py-2 text-sm font-semibold rounded-md text-text-secondary hover:text-text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="flex-1 text-center py-2 text-sm font-semibold rounded-md bg-accent text-white">
            Register
          </Link>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Restaurant Name
            </label>
            <Input type="text" placeholder="The Great Cafe" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Full Name
            </label>
            <Input type="text" placeholder="John Doe" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Email Address
            </label>
            <Input type="email" placeholder="owner@restaurant.com" required />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Password
            </label>
            <Input type="password" placeholder="••••••••" required />
          </div>

          <Button className="w-full mt-2" size="lg">
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
