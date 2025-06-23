
"use client";

import type { StoredUser } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus, Mail, KeyRound, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { useRouter } from 'next/navigation';


export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && user) {
      router.replace('/create-order'); 
    }
  }, [user, authIsLoading, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Sign Up Successful!",
          description: "Welcome! Please log in with your new account.",
        });
        router.push('/'); 
      } else {
        toast({
          title: "Sign Up Failed",
          description: data.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Signup fetch error:", error);
      toast({
        title: "Sign Up Failed",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <UserPlus className="mx-auto h-10 w-10 text-primary mb-3" />
          <CardTitle className="text-2xl md:text-3xl font-headline">Create Your Account</CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            Join Foodie Orders to start ordering your favorite meals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center text-sm">
                <UserPlus size={16} className="mr-2 opacity-70" /> Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center text-sm">
                <Mail size={16} className="mr-2 opacity-70" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., you@example.com"
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
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="flex items-center text-sm">
                <KeyRound size={16} className="mr-2 opacity-70" /> Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full py-3 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pt-5">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
