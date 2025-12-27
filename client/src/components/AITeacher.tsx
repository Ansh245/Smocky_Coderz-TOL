import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Heart, Zap, BookOpen } from "lucide-react";

interface MoodState {
  score: number;
  state: 'frustrated' | 'neutral' | 'engaged';
  confidence: number;
}

interface AITeacherProps {
  userId: string;
  context: 'lecture' | 'quiz' | 'dashboard' | 'battle';
  userBehavior?: {
    responseTime?: number;
    accuracy?: number;
    sessionLength?: number;
    interactions?: number;
    errors?: number;
  };
  onMessageRead?: () => void;
}

export default function AITeacher({
  userId,
  context,
  userBehavior = {},
  onMessageRead
}: AITeacherProps) {
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [mood, setMood] = useState<MoodState>({ score: 0.5, state: 'neutral', confidence: 0.5 });
  const [isTyping, setIsTyping] = useState(false);

  // Force initial analysis on mount
  useEffect(() => {
    const initialMood = analyzeMood(userBehavior);
    setMood(initialMood);
    setIsTyping(true);
    setTimeout(() => {
      const message = generateMessage(initialMood, context);
      setCurrentMessage(message);
      setIsTyping(false);
    }, 1000);
  }, []); // Run once on mount

  // Analyze mood based on behavior
  const analyzeMood = (behavior: typeof userBehavior): MoodState => {
    const { responseTime, accuracy, sessionLength, interactions, errors } = behavior;

    let score = 0.5; // neutral baseline
    let factors = 0; // count how many factors we have data for

    // Response time analysis (faster = more engaged, slower = frustrated)
    if (responseTime !== undefined) {
      factors++;
      if (responseTime < 10) score += 0.2; // fast responses = engaged
      else if (responseTime > 30) score -= 0.2; // slow responses = frustrated
    }

    // Accuracy analysis (higher = more confident, lower = struggling)
    if (accuracy !== undefined) {
      factors++;
      if (accuracy > 0.8) score += 0.15;
      else if (accuracy < 0.4) score -= 0.15;
    }

    // Session length (longer = engaged, very short = frustrated)
    if (sessionLength !== undefined) {
      factors++;
      if (sessionLength > 300) score += 0.1; // 5+ minutes = engaged
      else if (sessionLength < 60) score -= 0.1; // <1 minute = frustrated
    }

    // Interactions (more = engaged)
    if (interactions !== undefined) {
      factors++;
      if (interactions > 10) score += 0.1;
    }

    // Errors (more = frustrated)
    if (errors !== undefined && interactions) {
      factors++;
      const errorRate = errors / interactions;
      if (errorRate > 0.3) score -= 0.15;
    }

    // Clamp score between 0 and 1
    score = Math.max(0, Math.min(1, score));

    let state: 'frustrated' | 'neutral' | 'engaged';
    if (score < 0.3) state = 'frustrated';
    else if (score > 0.7) state = 'engaged';
    else state = 'neutral';

    // Confidence based on amount of data and how far from neutral
    // More data + stronger signal = higher confidence
    const dataConfidence = Math.min(factors / 5, 1); // 0-1 based on data completeness
    const signalStrength = Math.abs(score - 0.5) * 2; // 0-1 based on deviation from neutral
    const confidence = Math.min(dataConfidence * signalStrength, 1);

    console.log('AI Teacher Debug:', { behavior, score, state, factors, dataConfidence, signalStrength, confidence });

    return { score, state, confidence };
  };

  // Generate adaptive message based on mood and context
  const generateMessage = (moodState: MoodState, context: string): string => {
    const messages = {
      lecture: {
        frustrated: [
          "I see you're finding this challenging. Let's break it down into smaller steps together.",
          "Take your time - learning is a journey, not a race. What part would you like me to explain differently?",
          "You're doing great by persisting! Remember, every expert was once a beginner."
        ],
        neutral: [
          "Great focus on this material! Let's explore this concept together.",
          "I'm here to support your learning journey. How are you feeling about this topic?",
          "You're building valuable knowledge. Let's continue at your pace."
        ],
        engaged: [
          "I love your enthusiasm! Let's dive deeper into this fascinating topic.",
          "Your engagement is inspiring! Ready to explore some advanced connections?",
          "Excellent focus! Let's challenge ourselves with some related concepts."
        ]
      },
      quiz: {
        frustrated: [
          "Quizzes can be tricky, but you're learning with every attempt. Let's review the key concepts.",
          "Don't worry about mistakes - they're stepping stones to mastery. What confused you?",
          "You're brave for trying! Let's approach this differently next time."
        ],
        neutral: [
          "Good effort on the quiz! Let's review what we learned and plan our next steps.",
          "You're making progress with each attempt. How do you feel about your answers?",
          "Solid work! Let's identify areas for growth and celebrate your strengths."
        ],
        engaged: [
          "Fantastic energy on this quiz! Your focus is paying off. Ready for the next challenge?",
          "I can see your determination shining through! Let's analyze what worked well.",
          "Outstanding concentration! You're developing real expertise here."
        ]
      },
      dashboard: {
        frustrated: [
          "I notice you've been working hard. Remember to take breaks and celebrate small wins.",
          "Learning has its ups and downs. What support do you need right now?",
          "You're stronger than you think. Let's focus on one small goal today."
        ],
        neutral: [
          "Welcome back! Ready to continue your learning adventure?",
          "Consistency is building your foundation. What's your focus for today?",
          "You're making steady progress. Let's see what interests you most."
        ],
        engaged: [
          "Your dedication inspires me! What exciting learning awaits today?",
          "I love seeing your enthusiasm! Let's tackle something challenging.",
          "Your focus is remarkable. Ready to push your boundaries?"
        ]
      },
      battle: {
        frustrated: [
          "Battles can be intense, but they're learning opportunities. Let's regroup and try again.",
          "Competition brings out the best in us. What strategy would you like to adjust?",
          "You're gaining valuable experience. Every battle makes you stronger."
        ],
        neutral: [
          "Good sportsmanship in battle! Let's analyze what we learned from this match.",
          "You're developing strategic thinking. How do you feel about your performance?",
          "Balanced approach to competition. Ready to try a different tactic?"
        ],
        engaged: [
          "Your competitive spirit is amazing! Let's celebrate your victories and learn from challenges.",
          "Outstanding battle focus! Your strategy is evolving beautifully.",
          "I can feel your determination! Ready for the next arena challenge?"
        ]
      }
    };

    const contextMessages = messages[context as keyof typeof messages] || messages.lecture;
    const moodMessages = contextMessages[moodState.state];
    return moodMessages[Math.floor(Math.random() * moodMessages.length)];
  };

  // Update mood when behavior changes
  useEffect(() => {
    const newMood = analyzeMood(userBehavior);
    setMood(newMood);

    // Generate new message
    setIsTyping(true);
    setTimeout(() => {
      const message = generateMessage(newMood, context);
      setCurrentMessage(message);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Simulate typing delay
  }, [userBehavior, context]);

  const getMoodIcon = () => {
    switch (mood.state) {
      case 'frustrated': return <Heart className="h-5 w-5 text-red-500" />;
      case 'engaged': return <Zap className="h-5 w-5 text-yellow-500" />;
      default: return <BookOpen className="h-5 w-5 text-primary" />;
    }
  };

  const getMoodColor = () => {
    switch (mood.state) {
      case 'frustrated': return 'border-red-200 bg-red-50';
      case 'engaged': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <Card className={`border-2 ${getMoodColor()} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">AI Teacher</span>
              {getMoodIcon()}
              <span className="text-xs text-muted-foreground capitalize">
                {mood.state} (confidence: {Math.round(mood.confidence * 100)}%)
              </span>
            </div>

            <div className="min-h-[3rem]">
              {isTyping ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{currentMessage}</p>
              )}
            </div>

            {!isTyping && currentMessage && (
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMessageRead}
                  className="text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Thanks!
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}