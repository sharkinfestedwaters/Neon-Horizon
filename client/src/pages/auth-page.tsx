import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

type FormData = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const loginForm = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onLoginSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: FormData) => {
    registerMutation.mutate(data);
  };
  
  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="bg-[#080A14] min-h-screen grid-bg text-white font-sans">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center min-h-screen p-4">
        {/* Hero Section */}
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <div className="space-y-4 max-w-md">
            <h1 className="text-5xl font-bold tracking-tight text-cyan-400">Neon Horizons</h1>
            <p className="text-xl text-cyan-300/70">
              Create, customize and manage your sci-fi RPG characters
            </p>
            <div className="space-y-2 mt-6">
              <p className="text-cyan-300/90 flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> 
                Create unique characters with custom stats
              </p>
              <p className="text-cyan-300/90 flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> 
                Choose from 5 species and various cybernetic features
              </p>
              <p className="text-cyan-300/90 flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> 
                Save multiple characters to your account
              </p>
              <p className="text-cyan-300/90 flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> 
                Export character sheets as PDF
              </p>
              <p className="text-cyan-300/90 flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> 
                Share characters with other players
              </p>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="md:w-1/2 w-full max-w-md">
          <Card className="bg-black/20 border-cyan-800/50">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-cyan-400">
                {activeTab === "login" ? "Sign In" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login" 
                  ? "Sign in to access your characters" 
                  : "Create an account to start building characters"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username", { required: true })}
                        className="bg-black/30 border-cyan-900/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password", { required: true })}
                        className="bg-black/30 border-cyan-900/50 text-white"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cyan-700 hover:bg-cyan-600"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        {...registerForm.register("username", { required: true })}
                        className="bg-black/30 border-cyan-900/50 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password"
                        type="password"
                        placeholder="Choose a password"
                        {...registerForm.register("password", { required: true, minLength: 6 })}
                        className="bg-black/30 border-cyan-900/50 text-white"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cyan-700 hover:bg-cyan-600"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center text-xs text-cyan-500/60">
              Neon Horizons - A Sci-Fi Character Creator
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}