import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Crown, Star, Flame, Trophy } from "lucide-react";

interface StoryChapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
}

interface StoryProgressionProps {
  userId: string;
  currentFloor: number;
  level: number;
  xp: number;
}

export default function StoryProgression({
  userId,
  currentFloor,
  level,
  xp
}: StoryProgressionProps) {
  const [chapters, setChapters] = useState<StoryChapter[]>([
    {
      id: "awakening",
      title: "The Awakening",
      description: "Your journey begins as you discover the Tower's secrets",
      icon: "🌟",
      unlocked: true,
      progress: Math.min(currentFloor, 10),
      total: 10
    },
    {
      id: "trials",
      title: "Trials of Knowledge",
      description: "Face the challenges that test your understanding",
      icon: "⚔️",
      unlocked: currentFloor >= 10,
      progress: Math.max(0, Math.min(currentFloor - 10, 10)),
      total: 10
    },
    {
      id: "mastery",
      title: "Path of Mastery",
      description: "Deepen your wisdom and unlock advanced techniques",
      icon: "🎓",
      unlocked: currentFloor >= 20,
      progress: Math.max(0, Math.min(currentFloor - 20, 10)),
      total: 10
    },
    {
      id: "champion",
      title: "Champion's Ascent",
      description: "Prove your worth against the greatest challengers",
      icon: "👑",
      unlocked: currentFloor >= 30,
      progress: Math.max(0, Math.min(currentFloor - 30, 10)),
      total: 10
    },
    {
      id: "legend",
      title: "Legend's Legacy",
      description: "Become a legend whose story inspires future climbers",
      icon: "🏆",
      unlocked: currentFloor >= 40,
      progress: Math.max(0, Math.min(currentFloor - 40, 11)),
      total: 11
    }
  ]);

  const getCurrentChapter = () => {
    return chapters.find(chapter => chapter.unlocked && chapter.progress < chapter.total) || chapters[chapters.length - 1];
  };

  const getOverallProgress = () => {
    const totalFloors = 51; // 1-50 floors
    return (currentFloor / totalFloors) * 100;
  };

  const currentChapter = getCurrentChapter();

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-4">
        <CardTitle className="font-cinzel text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-tower-gold" />
          Your Story
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Chapter: {currentChapter.title}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Tower Conquest</span>
            <span>{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>

        {/* Current Chapter */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentChapter.icon}</span>
            <div>
              <h4 className="font-semibold">{currentChapter.title}</h4>
              <p className="text-sm text-muted-foreground">{currentChapter.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{currentChapter.progress}/{currentChapter.total}</span>
          </div>
          <Progress
            value={(currentChapter.progress / currentChapter.total) * 100}
            className="h-2 mt-2"
          />
        </div>

        {/* Chapter List */}
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                chapter.unlocked
                  ? chapter.id === currentChapter.id
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/20"
                  : "bg-muted/10 opacity-50"
              }`}
            >
              <div className={`text-xl ${chapter.unlocked ? "" : "grayscale"}`}>
                {chapter.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{chapter.title}</span>
                  {chapter.unlocked && chapter.progress >= chapter.total && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-500">
                      Complete
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Floors {(index * 10) + 1}-{(index + 1) * 10 + (index === 4 ? 1 : 0)}
                </div>
              </div>
              {chapter.unlocked && (
                <div className="text-right">
                  <div className="text-sm font-mono">
                    {chapter.progress}/{chapter.total}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Achievement Preview */}
        <div className="pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Next Achievement</div>
            <div className="flex justify-center gap-2">
              {currentFloor >= 50 ? (
                <div className="flex items-center gap-2 text-yellow-500">
                  <Crown className="h-5 w-5" />
                  <span className="text-sm font-semibold">Tower Legend</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary">
                  <Star className="h-5 w-5" />
                  <span className="text-sm font-semibold">
                    Floor {Math.min(currentFloor + 1, 50)} Conqueror
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}