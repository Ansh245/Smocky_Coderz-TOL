import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Heart, Gamepad2, Music, Palette, Trophy, Zap } from "lucide-react";

interface Hobby {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hobbyContext: string;
}

const hobbies: Hobby[] = [
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    color: "bg-purple-500",
    description: "Video games, esports, strategy games"
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    color: "bg-green-500",
    description: "Football, basketball, soccer, athletics"
  },
  {
    id: "music",
    name: "Music",
    icon: "🎵",
    color: "bg-blue-500",
    description: "Playing instruments, singing, music theory"
  },
  {
    id: "art",
    name: "Art & Design",
    icon: "🎨",
    color: "bg-pink-500",
    description: "Drawing, painting, digital art, design"
  },
  {
    id: "science",
    name: "Science & Tech",
    icon: "🔬",
    color: "bg-cyan-500",
    description: "Programming, robotics, experiments"
  },
  {
    id: "nature",
    name: "Nature & Outdoors",
    icon: "🌿",
    color: "bg-emerald-500",
    description: "Hiking, camping, wildlife, gardening"
  }
];

interface HobbyBasedQuizGeneratorProps {
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  userHobbies?: string[];
  onQuestionGenerated?: (question: GeneratedQuestion) => void;
}

export default function HobbyBasedQuizGenerator({
  subject,
  difficulty,
  userHobbies = [],
  onQuestionGenerated
}: HobbyBasedQuizGeneratorProps) {
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [customHobby, setCustomHobby] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<GeneratedQuestion | null>(null);

  // Mock question generation based on hobby and subject
  const generateQuestion = (hobby: Hobby, subject: string, difficulty: string): GeneratedQuestion => {
    const templates: Record<string, Record<string, GeneratedQuestion[]>> = {
      gaming: {
        math: [
          {
            question: "In your favorite RPG game, you find a treasure chest with 3 gold coins, 2 silver rings, and 1 magic potion. If you sell everything for 50 coins each, how much gold do you earn?",
            options: ["300 coins", "350 coins", "400 coins", "250 coins"],
            correctAnswer: 1,
            explanation: "3 × 50 + 2 × 50 + 1 × 50 = 150 + 100 + 50 = 300 coins",
            hobbyContext: "RPG treasure hunting"
          },
          {
            question: "Your character has 85 HP and takes 23 damage. What's your remaining health?",
            options: ["62 HP", "58 HP", "108 HP", "23 HP"],
            correctAnswer: 0,
            explanation: "85 - 23 = 62 HP remaining",
            hobbyContext: "Game combat mechanics"
          }
        ],
        science: [
          {
            question: "In your strategy game, you need to calculate the trajectory of a cannonball. This involves which physics principle?",
            options: ["Newton's Laws of Motion", "Thermodynamics", "Electricity", "Magnetism"],
            correctAnswer: 0,
            explanation: "Projectile motion follows Newton's Laws, especially gravity and inertia",
            hobbyContext: "Strategy game physics"
          }
        ]
      },
      sports: {
        math: [
          {
            question: "Your soccer team scored 3 goals in the first half and 2 in the second. What's the total score?",
            options: ["5 goals", "6 goals", "3 goals", "2 goals"],
            correctAnswer: 0,
            explanation: "3 + 2 = 5 total goals",
            hobbyContext: "Soccer match scoring"
          }
        ],
        physics: [
          {
            question: "When a basketball player jumps for a rebound, which force pulls them back to the ground?",
            options: ["Gravity", "Magnetism", "Electricity", "Wind resistance"],
            correctAnswer: 0,
            explanation: "Gravity is the force that pulls objects toward Earth",
            hobbyContext: "Basketball physics"
          }
        ]
      },
      music: {
        math: [
          {
            question: "A song is 3 minutes and 45 seconds long. How many seconds is that total?",
            options: ["225 seconds", "345 seconds", "2250 seconds", "3450 seconds"],
            correctAnswer: 0,
            explanation: "(3 × 60) + 45 = 180 + 45 = 225 seconds",
            hobbyContext: "Song duration calculation"
          }
        ]
      },
      art: {
        geometry: [
          {
            question: "When drawing in perspective, parallel lines appear to converge at a single point called the:",
            options: ["Vanishing point", "Horizon line", "Focal point", "Center point"],
            correctAnswer: 0,
            explanation: "In linear perspective, parallel lines converge at the vanishing point",
            hobbyContext: "Perspective drawing"
          }
        ]
      }
    };

    // Get questions for this hobby and subject
    const hobbyTemplates = templates[hobby.id];
    if (hobbyTemplates && hobbyTemplates[subject]) {
      const questions = hobbyTemplates[subject];
      if (questions.length > 0) {
        return questions[Math.floor(Math.random() * questions.length)];
      }
    }

    // Fallback question
    return {
      question: `How does ${hobby.name.toLowerCase()} relate to ${subject} concepts?`,
      options: [
        "Through practical applications",
        "Through theoretical connections",
        "Through creative problem-solving",
        "Through systematic analysis"
      ],
      correctAnswer: 0,
      explanation: `${hobby.name} and ${subject} intersect in many interesting ways!`,
      hobbyContext: `${hobby.name} integration`
    };
  };

  const handleGenerateQuestion = async () => {
    if (!selectedHobby) return;

    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      const question = generateQuestion(selectedHobby, subject, difficulty);
      setGeneratedQuestion(question);
      setIsGenerating(false);

      if (onQuestionGenerated) {
        onQuestionGenerated(question);
      }
    }, 1500);
  };

  const handleCustomHobbySubmit = () => {
    if (customHobby.trim()) {
      const customHobbyObj: Hobby = {
        id: "custom",
        name: customHobby,
        icon: "⭐",
        color: "bg-yellow-500",
        description: "Your personal interest"
      };
      setSelectedHobby(customHobbyObj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hobby Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Choose Your Learning Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {hobbies.map((hobby) => (
              <button
                key={hobby.id}
                onClick={() => setSelectedHobby(hobby)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedHobby?.id === hobby.id
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className={`w-12 h-12 ${hobby.color} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                  {hobby.icon}
                </div>
                <div className="text-sm font-medium">{hobby.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{hobby.description}</div>
              </button>
            ))}
          </div>

          {/* Custom Hobby Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-hobby">Or tell us about your unique interest:</Label>
            <div className="flex gap-2">
              <Input
                id="custom-hobby"
                placeholder="e.g., Cooking, Photography, Chess..."
                value={customHobby}
                onChange={(e) => setCustomHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomHobbySubmit()}
              />
              <Button
                onClick={handleCustomHobbySubmit}
                disabled={!customHobby.trim()}
                variant="outline"
              >
                Use This
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Hobby Display */}
      {selectedHobby && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${selectedHobby.color} rounded-full flex items-center justify-center text-xl`}>
                {selectedHobby.icon}
              </div>
              <div>
                <div className="font-semibold">{selectedHobby.name}</div>
                <div className="text-sm text-muted-foreground">{selectedHobby.description}</div>
              </div>
              <Badge variant="outline" className="ml-auto">
                {subject} × {selectedHobby.name}
              </Badge>
            </div>

            <Button
              onClick={handleGenerateQuestion}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating Question...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {difficulty} {subject} Question
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Question Display */}
      {generatedQuestion && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5" />
              AI-Generated Question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">{generatedQuestion.question}</h3>
              <div className="space-y-2">
                {generatedQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      index === generatedQuestion.correctAnswer
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-muted bg-muted/30"
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    {index === generatedQuestion.correctAnswer && (
                      <Badge variant="outline" className="ml-2 border-green-500 text-green-700">
                        Correct Answer
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Explanation:</div>
              <div className="text-sm">{generatedQuestion.explanation}</div>
            </div>

            <Badge variant="secondary">
              Context: {generatedQuestion.hobbyContext}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}