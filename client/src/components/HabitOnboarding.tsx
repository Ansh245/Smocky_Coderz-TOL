import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  details: string[];
}

const habits: Habit[] = [
  {
    id: "consistency",
    title: "Consistency",
    description: "Build daily learning rituals",
    icon: "📅",
    color: "bg-blue-500",
    details: [
      "Daily micro-learning sessions",
      "Streak tracking with rewards",
      "Morning reminders to start your ascent",
      "Habit rings showing progress"
    ]
  },
  {
    id: "focus",
    title: "Focus",
    description: "Distraction-free learning blocks",
    icon: "🎯",
    color: "bg-green-500",
    details: [
      "Short, focused content (1-5 minutes)",
      "One concept per screen",
      "Minimal UI distractions",
      "Progress indicators for completion"
    ]
  },
  {
    id: "curiosity",
    title: "Curiosity",
    description: "Story-based learning adventures",
    icon: "📖",
    color: "bg-purple-500",
    details: [
      "Narrative-driven lessons",
      "Character progression stories",
      "Branching story paths",
      "Imagination-sparking content"
    ]
  },
  {
    id: "confidence",
    title: "Confidence",
    description: "Level-ups and meaningful rewards",
    icon: "⭐",
    color: "bg-yellow-500",
    details: [
      "Progressive achievement system",
      "XP and level progression",
      "Badge unlocks and milestones",
      "Celebratory animations"
    ]
  }
];

interface HabitOnboardingProps {
  onComplete: () => void;
}

export default function HabitOnboarding({ onComplete }: HabitOnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());

  const currentHabit = habits[currentIndex];
  const isLast = currentIndex === habits.length - 1;

  const handleNext = () => {
    if (currentIndex < habits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCompleteHabit = (habitId: string) => {
    setCompletedHabits(prev => new Set(Array.from(prev).concat(habitId)));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            {habits.map((habit, index) => (
              <div
                key={habit.id}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Habit Card */}
        <Card className="bg-card/50 border-border overflow-hidden">
          <CardContent className="p-8">
            {/* Habit Header */}
            <div className="text-center mb-8">
              <div className={`w-20 h-20 ${currentHabit.color} rounded-full flex items-center justify-center mx-auto mb-4 text-4xl`}>
                {currentHabit.icon}
              </div>
              <h2 className="font-cinzel text-3xl font-bold text-tower-gold mb-2">
                {currentHabit.title}
              </h2>
              <p className="text-xl text-muted-foreground">
                {currentHabit.description}
              </p>
            </div>

            {/* Habit Details */}
            <div className="space-y-4 mb-8">
              <h3 className="font-cinzel text-xl font-semibold mb-4">What you'll experience:</h3>
              {currentHabit.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  Habit {currentIndex + 1} of {habits.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {completedHabits.has(currentHabit.id) ? "✓ Explored" : "Explore this habit"}
                </div>
              </div>

              <Button
                onClick={handleNext}
                className="flex items-center gap-2 tower-glow"
              >
                {isLast ? "Start Learning" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip onboarding
          </button>
        </div>
      </div>
    </div>
  );
}