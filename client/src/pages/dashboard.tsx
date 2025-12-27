import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sword,
  BookOpen,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  LogOut,
  Zap,
  Target,
  Crown
} from "lucide-react";
import { FLOOR_NAMES } from "@shared/schema";
import type { User, Lecture, UserProgress } from "@shared/schema";
import HabitTracker from "@/components/HabitTracker";
import AITeacher from "@/components/AITeacher";
import StoryProgression from "@/components/StoryProgression";
import AchievementSystem from "@/components/AchievementSystem";

interface ProgressData {
  user: User;
  currentFloorProgress: UserProgress[];
  totalFloorLectures: number;
  completedCount: number;
}

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const [, navigate] = useLocation();

  // Fetch fresh user data from server
  const { data: freshUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/user/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const userData = await res.json();
      // Update auth context with fresh data
      updateUser(userData);
      return userData;
    },
    enabled: !!user?.id,
    refetchInterval: 2000, // Refetch every 2 seconds to stay in sync
  });

  const { data: progressData, isLoading: progressLoading } = useQuery<ProgressData>({
    queryKey: ["/api/progress", user?.id],
    enabled: !!user,
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const isLoading = userLoading || progressLoading;
  const displayUser = freshUser || user;

  const floorName = FLOOR_NAMES[displayUser.currentFloor] || `Floor ${displayUser.currentFloor}`;
  
  // Calculate XP progress correctly
  // Total XP needed to reach current level
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let levelXpReq = 100;
  for (let i = 1; i < displayUser.level; i++) {
    xpForCurrentLevel += levelXpReq;
    levelXpReq = Math.floor(100 * Math.pow(1.5, i));
  }
  xpForNextLevel = xpForCurrentLevel + levelXpReq;
  const xpInCurrentLevel = displayUser.xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = (xpInCurrentLevel / xpNeededForNextLevel) * 100;
  
  const floorLecturesCompleted = progressData?.completedCount || 0;
  const totalFloorLectures = progressData?.totalFloorLectures || 3;
  const lecturesCompletedOnFloor = displayUser.lecturesCompleted % 10;
  const totalLecturesCompleted = displayUser.lecturesCompleted;
  const canBattle = lecturesCompletedOnFloor >= 10 || (lecturesCompletedOnFloor === 0 && totalLecturesCompleted > 0) || floorLecturesCompleted >= totalFloorLectures;

  // Memoize userBehavior to prevent infinite re-renders
  const userBehavior = useMemo(() => ({
    sessionLength: Math.max(displayUser.lecturesCompleted * 60, 120),
    interactions: Math.max(displayUser.lecturesCompleted * 5, 10),
    accuracy: displayUser.battlesWon + displayUser.battlesLost > 0
      ? displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)
      : 0.7,
    responseTime: displayUser.streak > 3 ? 8 : 15,
    errors: Math.max(0, displayUser.lecturesCompleted - displayUser.battlesWon)
  }), [displayUser.lecturesCompleted, displayUser.battlesWon, displayUser.battlesLost, displayUser.streak]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="font-bebas text-xl text-tower-gold">{displayUser.level}</span>
              </div>
              <div>
                <h1 className="font-cinzel text-xl font-semibold text-tower-gold">
                  {displayUser.displayName}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Floor {displayUser.currentFloor} - {floorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="h-5 w-5" />
                <span className="font-bebas text-xl tracking-wider">{displayUser.streak}</span>
              </div>
              <Link href="/leaderboard">
                <Button variant="ghost" size="icon" data-testid="button-leaderboard">
                  <Trophy className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Tower Progress */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="bg-card/50 border-border sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="font-cinzel text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-tower-gold" />
                  Tower Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Floor visualization */}
                <div className="relative">
                  <div className="space-y-2">
                    {[...Array(10)].map((_, i) => {
                      const floorNum = Math.floor(displayUser.currentFloor / 10) * 10 + (10 - i);
                      const isCurrent = floorNum === displayUser.currentFloor;
                      const isPassed = floorNum < displayUser.currentFloor;
                      const isLocked = floorNum > displayUser.currentFloor;

                      return (
                        <div
                          key={i}
                          className={`relative p-3 rounded-lg transition-all ${
                            isCurrent
                              ? "bg-primary/20 border border-primary/40 tower-glow"
                              : isPassed
                                ? "bg-muted/30 border border-muted"
                                : "bg-muted/10 border border-muted/30 opacity-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-bebas text-lg tracking-wider ${
                              isCurrent ? "text-tower-gold" : isPassed ? "text-muted-foreground" : "text-muted-foreground/50"
                            }`}>
                              FLOOR {floorNum}
                            </span>
                            {isCurrent && (
                              <Badge variant="outline" className="border-primary text-primary text-xs">
                                YOU
                              </Badge>
                            )}
                            {isPassed && <Star className="h-4 w-4 text-primary" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next battle indicator */}
                {canBattle && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sword className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-accent">Battle Ready!</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Complete your floor to challenge a rival
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Main Content */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Current Floor Hero */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-border overflow-hidden">
              <div className="relative p-8">
                <div className="absolute inset-0 floor-indicator opacity-50" />
                <div className="relative z-10">
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                    Floor {displayUser.currentFloor}
                  </Badge>
                  <h2 className="font-cinzel text-4xl font-bold text-tower-gold mb-2">
                    {floorName}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {lecturesCompletedOnFloor >= 10 
                      ? "🎯 Ready to face the guardian!" 
                      : `Complete ${10 - lecturesCompletedOnFloor} more lectures to challenge this floor's guardian`
                    }
                  </p>

                  {/* Lecture Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Floor Progress</span>
                      <span className="font-bebas text-lg text-tower-gold tracking-wider">
                        {lecturesCompletedOnFloor}/10
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full xp-bar-fill rounded-full"
                        style={{ width: `${(lecturesCompletedOnFloor / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/lecture" className="flex-1">
                      <Button className="w-full py-6 text-lg tower-glow" data-testid="button-continue-lecture">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Continue Lecture {lecturesCompletedOnFloor + 1}
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    
                    {canBattle ? (
                      <Link href="/battle" className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full py-6 text-lg border-accent text-accent hover:bg-accent/10"
                          data-testid="button-enter-battle"
                        >
                          <Sword className="h-5 w-5 mr-2" />
                          Enter Battle
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="flex-1 py-6 text-lg opacity-50"
                        disabled
                        data-testid="button-battle-locked"
                      >
                        <Sword className="h-5 w-5 mr-2" />
                        Battle Locked
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* XP Progress */}
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
                      <span className="font-bebas text-2xl text-tower-gold">{displayUser.level}</span>
                    </div>
                    <div>
                      <h3 className="font-cinzel text-xl font-semibold">Level {displayUser.level}</h3>
                      <p className="text-sm text-muted-foreground">
                        {displayUser.xp.toLocaleString()} XP Total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-2xl text-tower-gold tracking-wider">
                      {Math.round(xpProgress)}%
                    </div>
                    <p className="text-xs text-muted-foreground">To Level {displayUser.level + 1}</p>
                  </div>
                </div>

                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full xp-bar-fill rounded-full"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Your Stats - Moved to Center */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="font-cinzel text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-tower-gold/20 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-tower-gold" />
                  </div>
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Total XP - Hero Stat */}
                <div className="text-center p-6 bg-gradient-to-r from-tower-gold/10 to-yellow-500/10 rounded-xl border border-tower-gold/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-6 w-6 text-tower-gold" />
                    <span className="text-sm font-medium text-tower-gold uppercase tracking-wide">Total XP</span>
                  </div>
                  <div className="font-bebas text-5xl text-tower-gold tracking-wider mb-1">
                    {displayUser.xp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Experience Points Earned
                  </div>
                </div>

                {/* Battle Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-5 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Sword className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Victories</span>
                    </div>
                    <div className="font-bebas text-3xl text-green-600 dark:text-green-400 tracking-wider mb-1">
                      {displayUser.battlesWon}
                    </div>
                    <div className="text-xs text-muted-foreground">Battles Won</div>
                  </div>

                  <div className="text-center p-5 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <Sword className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">Defeats</span>
                    </div>
                    <div className="font-bebas text-3xl text-red-600 dark:text-red-400 tracking-wider mb-1">
                      {displayUser.battlesLost}
                    </div>
                    <div className="text-xs text-muted-foreground">Battles Lost</div>
                  </div>
                </div>

                {/* Win Rate - Special Highlight */}
                <div className="text-center p-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Target className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Win Rate</span>
                  </div>
                  <div className="font-bebas text-4xl tracking-wider mb-1" style={{
                    color: displayUser.battlesWon + displayUser.battlesLost > 0
                      ? Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100) >= 60
                        ? '#10b981' // green for good win rate
                        : Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100) >= 40
                        ? '#f59e0b' // yellow for average
                        : '#ef4444' // red for low
                      : '#6b7280' // gray for no battles
                  }}>
                    {displayUser.battlesWon + displayUser.battlesLost > 0
                      ? `${Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100)}%`
                      : "N/A"
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Battle Success Rate
                  </div>
                  {displayUser.battlesWon + displayUser.battlesLost > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100)}%`,
                            backgroundColor: Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100) >= 60
                              ? '#10b981'
                              : Math.round((displayUser.battlesWon / (displayUser.battlesWon + displayUser.battlesLost)) * 100) >= 40
                              ? '#f59e0b'
                              : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Current Level</div>
                    <div className="font-bebas text-2xl text-primary tracking-wider">{displayUser.level}</div>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
                    <div className="font-bebas text-2xl text-orange-500 tracking-wider flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4" />
                      {displayUser.streak}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Progress & Achievements - Full Width Hero Section */}
            <div className="bg-gradient-to-br from-card via-card/95 to-card/50 border border-border rounded-xl shadow-xl overflow-hidden">
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="font-cinzel text-3xl font-bold text-primary mb-2">Daily Progress & Achievements</h2>
                  <p className="text-muted-foreground">Track your learning journey and unlock new milestones</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left Column - Daily Habits */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-cinzel text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        Daily Habits
                      </h3>
                    </div>

                    {/* Overall Progress */}
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Overall Progress</span>
                      </div>
                      <div className="font-bebas text-6xl text-blue-600 dark:text-blue-400 tracking-wider mb-2">
                        57%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Daily Goals Completed
                      </div>
                    </div>

                    {/* Daily Learning */}
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-emerald-700 dark:text-emerald-400">Daily Learning</div>
                            <div className="text-xs text-muted-foreground">Complete at least one lesson</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bebas text-2xl text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            3
                          </div>
                          <div className="text-xs text-muted-foreground">0/1</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="h-3 bg-emerald-500 rounded-full w-0"></div>
                      </div>
                    </div>

                    {/* Focused Sessions */}
                    <div className="p-5 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-purple-700 dark:text-purple-400">Focused Sessions</div>
                            <div className="text-xs text-muted-foreground">Complete 2 focused learning blocks</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bebas text-2xl text-purple-600 dark:text-purple-400 tracking-wider flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            5
                          </div>
                          <div className="text-xs text-muted-foreground">1/2</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="h-3 bg-purple-500 rounded-full w-1/2"></div>
                      </div>
                    </div>

                    {/* Story Exploration */}
                    <div className="p-5 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-amber-700 dark:text-amber-400">Story Exploration</div>
                            <div className="text-xs text-muted-foreground">Engage with narrative content</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bebas text-2xl text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            2
                          </div>
                          <div className="text-xs text-muted-foreground">1/1</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="h-3 bg-amber-500 rounded-full w-full"></div>
                      </div>
                    </div>

                    {/* Challenge Mastery */}
                    <div className="p-5 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-rose-700 dark:text-rose-400">Challenge Mastery</div>
                            <div className="text-xs text-muted-foreground">Complete quiz challenges</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bebas text-2xl text-rose-600 dark:text-rose-400 tracking-wider flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            4
                          </div>
                          <div className="text-xs text-muted-foreground">2/3</div>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div className="h-3 bg-rose-500 rounded-full w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Center Column - Achievements & Story */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-cinzel text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                        </div>
                        Achievements
                      </h3>
                    </div>

                    {/* Achievements Count */}
                    <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <span className="text-lg font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">Achievements</span>
                      </div>
                      <div className="font-bebas text-5xl text-yellow-600 dark:text-yellow-400 tracking-wider mb-2">
                        3 of 16
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Unlocked
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-sm px-3 py-1">👶 First Steps</Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-sm px-3 py-1">📚 Steady Learner</Badge>
                        <Badge className="bg-green-100 text-green-800 border-green-300 text-sm px-3 py-1">🎓 Dedicated Student</Badge>
                      </div>
                    </div>

                    {/* Longest Streak */}
                    <div className="text-center p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Flame className="h-6 w-6 text-orange-600" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400 uppercase tracking-wide">Longest Streak</span>
                      </div>
                      <div className="font-bebas text-4xl text-orange-600 dark:text-orange-400 tracking-wider mb-1">
                        🔥 5
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Days in a row
                      </div>
                    </div>

                    {/* Recent Unlocks */}
                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">⬆️</span>
                        </div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Recent Unlocks</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">⬆️</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-green-700 dark:text-green-400">Growing Strong</div>
                            <div className="text-xs text-muted-foreground">Reach level 5</div>
                          </div>
                          <Badge variant="outline" className="text-xs">common</Badge>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">📚</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-blue-700 dark:text-blue-400">Steady Learner</div>
                            <div className="text-xs text-muted-foreground">Complete 10 lectures</div>
                          </div>
                          <Badge variant="outline" className="text-xs">common</Badge>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-sm">👶</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-yellow-700 dark:text-yellow-400">First Steps</div>
                            <div className="text-xs text-muted-foreground">Complete your first lecture</div>
                          </div>
                          <Badge variant="outline" className="text-xs">common</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Story Progress */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="font-cinzel text-xl font-semibold mb-6 flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        Your Story
                      </h3>
                    </div>

                    {/* Current Chapter */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <div className="text-center mb-4">
                        <div className="font-bebas text-2xl text-indigo-600 dark:text-indigo-400 tracking-wider mb-2">
                          Chapter: The Awakening
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tower Conquest • Progress: 6%
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4 mb-4">
                        <div className="h-4 bg-indigo-500 rounded-full w-3/50"></div>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        🌟 The Awakening • Floors 1-10 • 3/10
                      </div>
                    </div>

                    {/* Story Chapters */}
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm">🌟</span>
                            </div>
                            <div>
                              <div className="font-semibold text-emerald-700 dark:text-emerald-400">The Awakening</div>
                              <div className="text-xs text-muted-foreground">Floors 1-10</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bebas text-lg text-emerald-600 dark:text-emerald-400">3/10</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg border border-muted/50 opacity-60">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">⚔️</span>
                            </div>
                            <div>
                              <div className="font-semibold text-muted-foreground">Trials of Knowledge</div>
                              <div className="text-xs text-muted-foreground">Floors 11-20</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bebas text-lg text-muted-foreground">0/10</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/30 rounded-lg border border-muted/50 opacity-40">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">🎓</span>
                            </div>
                            <div>
                              <div className="font-semibold text-muted-foreground">Path of Mastery</div>
                              <div className="text-xs text-muted-foreground">Floors 21-30</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bebas text-lg text-muted-foreground">0/10</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Goals */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="text-center">
                          <div className="text-xs font-medium text-cyan-700 dark:text-cyan-400 mb-1 uppercase tracking-wide">Next Achievement</div>
                          <div className="font-bebas text-xl text-cyan-600 dark:text-cyan-400 tracking-wider">Floor 4 Conqueror</div>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="text-center">
                          <div className="text-xs font-medium text-pink-700 dark:text-pink-400 mb-1 uppercase tracking-wide">Next Milestone</div>
                          <div className="font-bebas text-xl text-pink-600 dark:text-pink-400 tracking-wider mb-1">Floor 4</div>
                          <div className="text-xs text-muted-foreground">Complete battle to advance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Teacher */}
            <AITeacher
              userId={displayUser.id}
              context="dashboard"
              userBehavior={userBehavior}
            />
          </div>

          {/* Right Panel - Compact Sidebar */}
          <div className="hidden xl:block xl:col-span-3 space-y-4">
            {/* Achievements */}
            <AchievementSystem user={displayUser} />

            {/* Story Progression */}
            <StoryProgression
              userId={displayUser.id}
              currentFloor={displayUser.currentFloor}
              level={displayUser.level}
              xp={displayUser.xp}
            />

            {/* Next Milestone */}
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <h3 className="font-cinzel text-base font-semibold mb-3">Next Milestone</h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                      <Crown className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Floor {displayUser.currentFloor + 1}</div>
                      <div className="text-xs text-muted-foreground">
                        Complete battle to advance
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
