<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { Suspense } from 'react';
import OrderPage from './OrderPageInner';

export default function PageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-lg">Loading Order Page...</div>}>
      <OrderPage />
    </Suspense>
  );
=======
export default function Home() {
  return <></>;
>>>>>>> 7d3cda9 (initial scaffold)
=======
=======

>>>>>>> b395a2a (I see this error with the app, reported by NextJS, please fix it. The er)
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { LogIn, Mail, KeyRound, Loader2, UserPlus } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && user) {
      router.replace('/create-order');
    }
  }, [user, authIsLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call / validation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you'd validate credentials against a backend
    // For this demo, any non-empty email/password is fine
    login(email);
    
    // login() in AuthContext handles redirection, so no need for router.push here
    // Toast can be shown by AuthContext or here if needed after successful login
    // toast({ title: "Login Successful!", description: "Welcome back!" });
    
    // No need to setIsSubmitting(false) if redirecting
  };

  if (authIsLoading || (!authIsLoading && user)) {
    return (
      <div className="flex flex-grow items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <LogIn className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-2xl md:text-3xl font-headline">Welcome Back!</CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Sign in to continue to Foodie Orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center text-sm">
                <Mail size={16} className="mr-2 opacity-70" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center text-sm">
                <KeyRound size={16} className="mr-2 opacity-70" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full py-3 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pt-5">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
>>>>>>> 633c2f0 (Updated app)
}
