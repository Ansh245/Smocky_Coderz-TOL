import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Flame, Crown, Target, BookOpen, Zap, Heart } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'consistency' | 'mastery' | 'social' | 'exploration';
  progress?: number;
  maxProgress?: number;
}

interface AchievementSystemProps {
  user: {
    battlesWon: number;
    battlesLost: number;
    lecturesCompleted: number;
    streak: number;
    level: number;
    xp: number;
    currentFloor: number;
  };
}

export default function AchievementSystem({ user }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Define all achievements with unlock conditions
    const allAchievements: Achievement[] = [
      // Consistency achievements
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first lecture',
        icon: '👶',
        color: 'bg-green-500',
        unlocked: user.lecturesCompleted >= 1,
        rarity: 'common',
        category: 'consistency'
      },
      {
        id: 'steady_learner',
        name: 'Steady Learner',
        description: 'Complete 10 lectures',
        icon: '📚',
        color: 'bg-blue-500',
        unlocked: user.lecturesCompleted >= 10,
        rarity: 'common',
        category: 'consistency'
      },
      {
        id: 'dedicated_student',
        name: 'Dedicated Student',
        description: 'Complete 50 lectures',
        icon: '🎓',
        color: 'bg-purple-500',
        unlocked: user.lecturesCompleted >= 50,
        rarity: 'rare',
        category: 'consistency'
      },
      {
        id: 'scholar',
        name: 'Scholar',
        description: 'Complete 100 lectures',
        icon: '📖',
        color: 'bg-indigo-500',
        unlocked: user.lecturesCompleted >= 100,
        rarity: 'epic',
        category: 'consistency'
      },

      // Streak achievements
      {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Maintain a 3-day streak',
        icon: '🔥',
        color: 'bg-orange-500',
        unlocked: user.streak >= 3,
        rarity: 'common',
        category: 'consistency'
      },
      {
        id: 'on_fire',
        name: 'On Fire!',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        color: 'bg-red-500',
        unlocked: user.streak >= 7,
        rarity: 'rare',
        category: 'consistency'
      },
      {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '🚀',
        color: 'bg-yellow-500',
        unlocked: user.streak >= 30,
        rarity: 'epic',
        category: 'consistency'
      },

      // Battle achievements
      {
        id: 'first_victory',
        name: 'First Victory',
        description: 'Win your first battle',
        icon: '🏆',
        color: 'bg-yellow-500',
        unlocked: user.battlesWon >= 1,
        rarity: 'common',
        category: 'mastery'
      },
      {
        id: 'warrior',
        name: 'Warrior',
        description: 'Win 10 battles',
        icon: '⚔️',
        color: 'bg-gray-600',
        unlocked: user.battlesWon >= 10,
        rarity: 'rare',
        category: 'mastery'
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Win 50 battles',
        icon: '👑',
        color: 'bg-purple-600',
        unlocked: user.battlesWon >= 50,
        rarity: 'epic',
        category: 'mastery'
      },

      // Level achievements
      {
        id: 'level_up',
        name: 'Growing Strong',
        description: 'Reach level 5',
        icon: '⬆️',
        color: 'bg-green-600',
        unlocked: user.level >= 5,
        rarity: 'common',
        category: 'mastery'
      },
      {
        id: 'experienced',
        name: 'Experienced',
        description: 'Reach level 10',
        icon: '⭐',
        color: 'bg-blue-600',
        unlocked: user.level >= 10,
        rarity: 'rare',
        category: 'mastery'
      },
      {
        id: 'master',
        name: 'Master',
        description: 'Reach level 25',
        icon: '🎯',
        color: 'bg-red-600',
        unlocked: user.level >= 25,
        rarity: 'epic',
        category: 'mastery'
      },

      // Floor achievements
      {
        id: 'floor_climber',
        name: 'Floor Climber',
        description: 'Reach floor 5',
        icon: '🏔️',
        color: 'bg-brown-500',
        unlocked: user.currentFloor >= 5,
        rarity: 'common',
        category: 'exploration'
      },
      {
        id: 'high_climber',
        name: 'High Climber',
        description: 'Reach floor 25',
        icon: '⛰️',
        color: 'bg-gray-500',
        unlocked: user.currentFloor >= 25,
        rarity: 'rare',
        category: 'exploration'
      },
      {
        id: 'summit_seeker',
        name: 'Summit Seeker',
        description: 'Reach floor 50',
        icon: '🏔️',
        color: 'bg-white',
        unlocked: user.currentFloor >= 50,
        rarity: 'legendary',
        category: 'exploration'
      }
    ];

    setAchievements(allAchievements);
  }, [user]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="font-cinzel text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-tower-gold" />
          Achievements
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {unlockedAchievements.length} of {achievements.length} unlocked
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {achievements.slice(0, 9).map((achievement) => (
            <Dialog key={achievement.id}>
              <DialogTrigger asChild>
                <div
                  className={`p-3 rounded-lg text-center cursor-pointer transition-all hover:scale-105 ${
                    achievement.unlocked
                      ? `bg-primary/10 border-2 ${getRarityColor(achievement.rarity)}`
                      : "bg-muted/20 opacity-40"
                  }`}
                  onClick={() => setSelectedAchievement(achievement)}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {achievement.name}
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <span className="text-3xl">{achievement.icon}</span>
                    <div>
                      <div className="font-cinzel text-xl">{achievement.name}</div>
                      <Badge variant="outline" className={`mt-1 ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <Star className="h-5 w-5" />
                      <span className="font-semibold">Achievement Unlocked!</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Keep learning to unlock this achievement
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>

        {/* Achievement Categories */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Recent Unlocks</div>
          {unlockedAchievements.slice(-3).reverse().map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
              <span className="text-xl">{achievement.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{achievement.name}</div>
                <div className="text-xs text-muted-foreground">{achievement.description}</div>
              </div>
              <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}