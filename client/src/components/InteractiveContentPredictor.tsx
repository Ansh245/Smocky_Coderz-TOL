import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Heart, Zap, BookOpen, RefreshCw, Trophy, Star, Rocket, Brain, Gamepad2, Music, Palette, Microscope, ChefHat, Telescope, Play } from "lucide-react";

interface Hobby {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subjects: string[];
}

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  subject: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  hobby: string;
  rating: number;
  views: number;
  isYouTube?: boolean;
  segments: Array<{
    startTime: number;
    endTime: number;
    title: string;
    description?: string;
  }>;
  questions: Array<{
    timestamp: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    points: number;
  }>;
}

interface PredictionResult {
  videos: LearningVideo[];
  funMessage: string;
  score: number; // How good the match is (0-100)
}

interface QuickPrediction {
  selectedHobbies: string[];
  mood: string;
  energy: 'high' | 'medium' | 'low';
}

const hobbies: Hobby[] = [
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    color: "bg-purple-500",
    description: "Video games, strategy, programming",
    subjects: ["programming", "math", "physics", "strategy", "logic"]
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "bg-green-500",
    description: "Football, basketball, athletics",
    subjects: ["physics", "math", "biology", "strategy", "health"]
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    color: "bg-blue-500",
    description: "Playing instruments, music theory",
    subjects: ["math", "physics", "history", "art", "rhythm"]
  },
  {
    id: "art",
    name: "Art & Design",
    icon: "🎨",
    color: "bg-pink-500",
    description: "Drawing, painting, digital art",
    subjects: ["geometry", "color theory", "perspective", "history", "creativity"]
  },
  {
    id: "science",
    name: "Science & Tech",
    icon: "🔬",
    color: "bg-cyan-500",
    description: "Experiments, inventions, technology",
    subjects: ["physics", "chemistry", "biology", "engineering", "math"]
  },
  {
    id: "nature",
    name: "Nature & Outdoors",
    icon: "🌿",
    color: "bg-emerald-500",
    description: "Hiking, wildlife, environment",
    subjects: ["biology", "geography", "ecology", "earth science", "survival"]
  },
  {
    id: "cooking",
    name: "Cooking",
    icon: "👨‍🍳",
    color: "bg-orange-500",
    description: "Recipes, techniques, food science",
    subjects: ["chemistry", "math", "biology", "culture", "health"]
  },
  {
    id: "space",
    name: "Space & Astronomy",
    icon: "🚀",
    color: "bg-indigo-500",
    description: "Stars, planets, space exploration",
    subjects: ["physics", "astronomy", "engineering", "math", "history"]
  }
];

interface InteractiveContentPredictorProps {
  onContentPredicted?: (videos: LearningVideo[], profile: UserProfile) => void;
  userMood?: 'energetic' | 'calm' | 'focused' | 'curious' | 'tired' | 'frustrated';
}

export default function InteractiveContentPredictor({
  onContentPredicted,
  userMood = 'focused'
}: InteractiveContentPredictorProps) {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [currentMood, setCurrentMood] = useState(userMood);
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'energetic': return '⚡';
      case 'curious': return '🧠';
      case 'tired': return '😴';
      case 'frustrated': return '😤';
      default: return '🎯';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high': return <Rocket className="h-5 w-5 text-orange-500" />;
      case 'low': return <BookOpen className="h-5 w-5 text-blue-500" />;
      default: return <Zap className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleHobbyToggle = (hobbyId: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobbyId)
        ? prev.filter(id => id !== hobbyId)
        : [...prev, hobbyId]
    );
  };

  const generatePrediction = async () => {
    if (selectedHobbies.length === 0) return;

    setIsPredicting(true);
    setShowConfetti(false);

    // Simulate AI thinking time
    setTimeout(() => {
      const mockVideos: LearningVideo[] = [
        {
          id: "gaming-physics-energetic",
          title: "Physics of Video Games: Real Science Behind Gaming!",
          description: "Discover how physics makes video games realistic and exciting",
          videoUrl: "https://www.youtube.com/embed/w9WSyqgkqFA",
          thumbnail: "https://img.youtube.com/vi/w9WSyqgkqFA/maxresdefault.jpg",
          duration: 480,
          subject: "physics",
          difficulty: "intermediate",
          hobby: "gaming",
          rating: 4.9,
          views: 245000,
          segments: [
            { startTime: 0, endTime: 80, title: "Explosive Physics!", description: "Boom! Physics in action" }
          ],
          questions: [
            { timestamp: 120, question: "What gives objects their 'punch' in games?", options: ["Size", "Momentum", "Color", "Shape"], correctAnswer: 1, explanation: "Momentum = mass × velocity - the secret to powerful game physics!", points: 15 }
          ]
        },
        {
          id: "sports-physics-energetic",
          title: "Physics of Sports: Speed, Power & Performance!",
          description: "Discover the science behind athletic excellence and extreme sports",
          videoUrl: "https://www.youtube.com/embed/w9WSyqgkqFA",
          thumbnail: "https://img.youtube.com/vi/w9WSyqgkqFA/maxresdefault.jpg",
          duration: 540,
          subject: "physics",
          difficulty: "intermediate",
          hobby: "sports",
          rating: 4.9,
          views: 312000,
          segments: [
            { startTime: 0, endTime: 90, title: "Speed Demons", description: "Physics of high-speed sports" }
          ],
          questions: [
            { timestamp: 150, question: "What reduces air resistance in sports?", options: ["Weight", "Aerodynamics", "Color", "Size"], correctAnswer: 1, explanation: "Aerodynamics helps athletes move faster!", points: 15 }
          ]
        },
        {
          id: "music-math-calm",
          title: "Harmony in Numbers: Mathematical Music Theory",
          description: "Peaceful exploration of the mathematics behind musical harmony",
          videoUrl: "https://www.youtube.com/embed/ZeZrx7kHTnI",
          thumbnail: "https://img.youtube.com/vi/ZeZrx7kHTnI/maxresdefault.jpg",
          duration: 780,
          subject: "math",
          difficulty: "beginner",
          hobby: "music",
          rating: 4.7,
          views: 223000,
          segments: [
            { startTime: 0, endTime: 130, title: "Ratios in Harmony", description: "Why some notes sound good together" }
          ],
          questions: [
            { timestamp: 200, question: "What creates musical harmony?", options: ["Random notes", "Frequency ratios", "Loud volume", "Fast tempo"], correctAnswer: 1, explanation: "Simple frequency ratios create pleasing sounds!", points: 15 }
          ]
        }
      ];

      // Smart filtering based on selections
      let recommendedVideos = mockVideos.filter(video =>
        selectedHobbies.includes(video.hobby)
      );

      // If no perfect matches, find related content
      if (recommendedVideos.length === 0) {
        const hobbySubjects = selectedHobbies.flatMap(hobbyId => {
          const hobby = hobbies.find(h => h.id === hobbyId);
          return hobby ? hobby.subjects : [];
        });

        recommendedVideos = mockVideos.filter(video =>
          hobbySubjects.some(subject =>
            video.subject.toLowerCase().includes(subject.toLowerCase())
          )
        );
      }

      // Adjust for mood and energy
      if (currentMood === 'energetic' || energyLevel === 'high') {
        recommendedVideos = recommendedVideos.filter(v => v.difficulty === 'intermediate' || v.difficulty === 'advanced');
      } else if (currentMood === 'tired' || energyLevel === 'low') {
        recommendedVideos = recommendedVideos.filter(v => v.difficulty === 'beginner');
      }

      // Fallback to any videos if still empty
      if (recommendedVideos.length === 0) {
        recommendedVideos = mockVideos.slice(0, 2);
      }

      // Calculate match score
      const matchScore = Math.min(95 + Math.random() * 5, 100);

      // Generate fun message
      const funMessages = [
        `🎉 BOOM! Found ${recommendedVideos.length} perfect matches for your ${selectedHobbies.map(id => hobbies.find(h => h.id === id)?.name).join(' + ')} vibe!`,
        `🚀 BLAST OFF! Your ${getMoodEmoji(currentMood)} mood + ${selectedHobbies.length} hobbies = EPIC content!`,
        `🎯 TARGET LOCKED! ${matchScore.toFixed(0)}% match rate for your interests!`,
        `💥 KAPOW! Unleashing ${recommendedVideos.length} awesome videos just for you!`,
        `🎪 CIRCUS TIME! Your hobbies are the star of this learning show!`
      ];

      const result: PredictionResult = {
        videos: recommendedVideos,
        funMessage: funMessages[Math.floor(Math.random() * funMessages.length)],
        score: matchScore
      };

      setPrediction(result);
      setIsPredicting(false);
      setShowConfetti(true);

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);

      if (onContentPredicted) {
        onContentPredicted(recommendedVideos, {
          primaryHobby: selectedHobbies[0],
          mood: currentMood
        });
      }
    }, 2000);
  };

  const resetPredictor = () => {
    setSelectedHobbies([]);
    setPrediction(null);
    setShowConfetti(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-purple-600">
            <Bot className="h-6 w-6" />
            AI Content Predictor
            <Sparkles className="h-5 w-5 animate-pulse" />
          </CardTitle>
          <p className="text-muted-foreground">
            ⚡ Quick & Fun! Pick your vibes, I'll predict your perfect study content! 🎯
          </p>
        </CardHeader>
      </Card>

      {/* Quick Selection Interface */}
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="p-6">
          {/* Hobby Selection */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              🎮 Pick Your Hobbies!
              <span className="text-sm font-normal text-muted-foreground">
                (Select 1-3 that excite you)
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {hobbies.map((hobby) => (
                <button
                  key={hobby.id}
                  onClick={() => handleHobbyToggle(hobby.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedHobbies.includes(hobby.id)
                      ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 ${hobby.color} rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-sm`}>
                    {hobby.icon}
                  </div>
                  <div className="text-sm font-semibold text-center">{hobby.name}</div>
                  {selectedHobbies.includes(hobby.id) && (
                    <div className="mt-2 flex justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mood & Energy Quick Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Mood */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {getMoodEmoji(currentMood)} Your Mood
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
                  { value: 'curious', emoji: '🧠', label: 'Curious' },
                  { value: 'focused', emoji: '🎯', label: 'Focused' },
                  { value: 'tired', emoji: '😴', label: 'Tired' }
                ].map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setCurrentMood(mood.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentMood === mood.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-sm font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {getEnergyIcon(energyLevel)} Energy Level
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'low', emoji: '🐌', label: 'Low' },
                  { value: 'medium', emoji: '🚶', label: 'Medium' },
                  { value: 'high', emoji: '🚀', label: 'High' }
                ].map((energy) => (
                  <button
                    key={energy.value}
                    onClick={() => setEnergyLevel(energy.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      energyLevel === energy.value
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{energy.emoji}</div>
                    <div className="text-sm font-medium">{energy.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Predict Button */}
          <div className="text-center">
            <Button
              onClick={generatePrediction}
              disabled={selectedHobbies.length === 0 || isPredicting}
              className="px-8 py-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
              size="lg"
            >
              {isPredicting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                  AI Magic Happening... ✨
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-3" />
                  Predict My Perfect Content! 🎯
                </>
              )}
            </Button>
            {selectedHobbies.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Pick at least one hobby to get started! 🎮
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {prediction && (
        <Card className="border-2 border-green-500/50 bg-gradient-to-r from-green-500/5 to-blue-500/5">
          <CardContent className="p-6">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">
                {showConfetti ? '🎉' : '🎯'}
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                {prediction.funMessage}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-lg">
                  {prediction.score.toFixed(0)}% Match!
                </span>
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              </div>
            </div>

            {/* Recommended Videos */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Your Perfect Study Content:
              </h4>

              {prediction.videos.map((video, index) => (
                <Card key={video.id} className="border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-2xl">
                          {video.hobby === 'gaming' ? '🎮' :
                           video.hobby === 'sports' ? '⚽' :
                           video.hobby === 'music' ? '🎵' :
                           video.hobby === 'art' ? '🎨' :
                           video.hobby === 'science' ? '🔬' :
                           video.hobby === 'nature' ? '🌿' :
                           video.hobby === 'cooking' ? '👨‍🍳' :
                           video.hobby === 'space' ? '🚀' : '📚'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-lg mb-1">{video.title}</h5>
                        <p className="text-muted-foreground mb-3">{video.description}</p>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {video.subject}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {video.difficulty}
                          </Badge>
                          <span className="text-muted-foreground">
                            {Math.floor(video.duration / 60)} min
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{video.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reset Button */}
            <div className="text-center mt-6">
              <Button
                onClick={resetPredictor}
                variant="outline"
                className="px-6"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Different Vibes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-20 left-1/4 animate-bounce">🎉</div>
          <div className="absolute top-32 right-1/3 animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute top-40 left-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>
          <div className="absolute top-24 right-1/4 animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
        </div>
      )}
    </div>
  );
}