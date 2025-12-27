import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Flame } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  streak: number;
}

interface HabitTrackerProps {
  userId: string;
}

export default function HabitTracker({ userId }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: "consistency",
      name: "Daily Learning",
      description: "Complete at least one lesson",
      icon: "📅",
      target: 1,
      current: 0,
      streak: 3
    },
    {
      id: "focus",
      name: "Focused Sessions",
      description: "Complete 2 focused learning blocks",
      icon: "🎯",
      target: 2,
      current: 1,
      streak: 5
    },
    {
      id: "curiosity",
      name: "Story Exploration",
      description: "Engage with narrative content",
      icon: "📖",
      target: 1,
      current: 1,
      streak: 2
    },
    {
      id: "confidence",
      name: "Challenge Mastery",
      description: "Complete quiz challenges",
      icon: "⭐",
      target: 3,
      current: 2,
      streak: 4
    }
  ]);

  // In a real implementation, this would fetch from an API
  // For now, we'll simulate with localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`habits-${userId}-${today}`);
    if (stored) {
      setHabits(JSON.parse(stored));
    }
  }, [userId]);

  const updateHabit = (habitId: string, increment: number) => {
    setHabits(prev => {
      const updated = prev.map(habit =>
        habit.id === habitId
          ? { ...habit, current: Math.min(habit.target, habit.current + increment) }
          : habit
      );

      // Store in localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`habits-${userId}-${today}`, JSON.stringify(updated));

      return updated;
    });
  };

  const getOverallProgress = () => {
    const totalCurrent = habits.reduce((sum, h) => sum + h.current, 0);
    const totalTarget = habits.reduce((sum, h) => sum + h.target, 0);
    return (totalCurrent / totalTarget) * 100;
  };

  const getLongestStreak = () => {
    return Math.max(...habits.map(h => h.streak));
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="font-cinzel text-lg flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Habits
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span>Overall Progress</span>
          <span className="font-bebas text-lg">{Math.round(getOverallProgress())}%</span>
        </div>
        <Progress value={getOverallProgress()} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl">{habit.icon}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{habit.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    🔥 {habit.streak}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {habit.current}/{habit.target}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{habit.description}</p>
              <Progress
                value={(habit.current / habit.target) * 100}
                className="h-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              {habit.current >= habit.target ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span>Longest Streak</span>
            <span className="font-bebas text-lg text-orange-500">
              🔥 {getLongestStreak()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}