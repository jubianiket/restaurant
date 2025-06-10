
"use client";

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UserPlus, Mail, KeyRound, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }


    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Sign Up Data:', { name, email, password }); // In a real app, send this to your backend
    toast({
      title: "Sign Up Successful!",
      description: "Welcome! You can now try logging in (login page not yet implemented).",
    });
    
    // Reset form 
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsLoading(false);
    // In a real app, you might redirect:
    // router.push('/login'); 
  };

  return (
    <AppLayout>
      <div className="flex flex-grow items-center justify-center p-4 md:p-8 bg-gradient-to-br from-background to-muted/30">
        <Card className="w-full max-w-md shadow-2xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <UserPlus className="mx-auto h-10 w-10 text-primary mb-3" />
            <CardTitle className="text-2xl md:text-3xl font-headline">Create Your Account</CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Join Foodie Orders to start ordering your favorite meals quickly and easily.
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className="text-base"
                />
              </div>
              <Button type="submit" className="w-full py-3 text-base" disabled={isLoading}>
                {isLoading ? (
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
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
