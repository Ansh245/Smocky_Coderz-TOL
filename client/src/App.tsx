import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import LecturePage from "@/pages/lecture";
import BattlePage from "@/pages/battle";
import LeaderboardPage from "@/pages/leaderboard";
import TeacherDashboard from "@/pages/teacher";
// Admin/teacher routes simplified in Replit update
import NotFound from "@/pages/not-found";
import HabitOnboarding from "@/components/HabitOnboarding";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType; 
  allowedRoles?: ("student" | "admin")[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role as "student" | "admin")) {
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as "student" | "admin")) {
    return null;
  }

  return <Component />;
}

function Router() {
  const { user } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Check if user needs onboarding (new users with no progress)
  const needsOnboarding = user && user.role === "student" && user.lecturesCompleted === 0 && !onboardingCompleted;

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
    if (user?.id) {
      localStorage.setItem(`onboarding-${user.id}`, 'completed');
    }
  };

  // Check localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(`onboarding-${user.id}`);
      if (stored === 'completed') {
        setOnboardingCompleted(true);
      }
    }
  }, [user?.id]);

  if (needsOnboarding) {
    return <HabitOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />

      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} allowedRoles={["student"]} />}
      </Route>
      <Route path="/lecture">
        {() => <ProtectedRoute component={LecturePage} allowedRoles={["student"]} />}
      </Route>
      <Route path="/battle">
        {() => <ProtectedRoute component={BattlePage} allowedRoles={["student"]} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
