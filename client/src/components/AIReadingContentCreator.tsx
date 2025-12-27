import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles, BookOpen, PenTool, MessageCircle, Send, RefreshCw, Lightbulb, Target, CheckCircle, FileText, Brain, Zap, Copy, Download } from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'summary' | 'questions' | 'explanation' | 'content' | 'analysis';
    data?: any;
  };
}

interface ReadingSession {
  text: string;
  title?: string;
  summary?: string;
  keyPoints?: string[];
  questions?: string[];
  analysis?: any;
}

interface AIReadingContentCreatorProps {
  initialText?: string;
  onContentGenerated?: (content: any) => void;
}

export default function AIReadingContentCreator({
  initialText = "",
  onContentGenerated
}: AIReadingContentCreatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [readingSession, setReadingSession] = useState<ReadingSession>({
    text: initialText
  });
  const [currentMode, setCurrentMode] = useState<'chat' | 'read' | 'create'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `👋 Hi! I'm your AI Reading & Content Creation Assistant! 

I can help you with:
📖 **Reading Comprehension** - Analyze text, create summaries, generate questions
✍️ **Content Creation** - Write articles, create study guides, generate ideas
🧠 **Learning Support** - Explain concepts, create flashcards, build knowledge

What would you like to work on today? You can paste text to analyze, or ask me to help create content!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const simulateTyping = (callback: () => void, delay: number = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    addMessage(userMessage);
    const userInput = currentInput;
    setCurrentInput("");

    // Process the message
    await processUserInput(userInput);
  };

  const processUserInput = async (input: string) => {
    const lowerInput = input.toLowerCase();

    // Check for reading-related commands
    if (lowerInput.includes('read') || lowerInput.includes('analyze') || lowerInput.includes('summarize') || readingSession.text) {
      await handleReadingTask(input);
    }
    // Check for content creation commands
    else if (lowerInput.includes('write') || lowerInput.includes('create') || lowerInput.includes('generate') || lowerInput.includes('make')) {
      await handleContentCreation(input);
    }
    // General conversation
    else {
      await handleGeneralChat(input);
    }
  };

  const handleReadingTask = async (input: string) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('paste') || lowerInput.includes('text') || !readingSession.text) {
      // Ask for text to analyze
      simulateTyping(() => {
        const response: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `📝 I'd love to help you analyze some text! Please paste the text you want me to work with, and tell me what you'd like me to do:

• **Summarize** - Create a concise overview
• **Key points** - Extract main ideas
• **Questions** - Generate comprehension questions
• **Explain** - Break down complex concepts
• **Analyze** - Deep dive into themes and structure

Just paste your text and let me know! 📚`,
          timestamp: new Date()
        };
        addMessage(response);
      });
    } else if (readingSession.text) {
      // Process existing text
      if (lowerInput.includes('summarize') || lowerInput.includes('summary')) {
        await generateSummary();
      } else if (lowerInput.includes('question') || lowerInput.includes('quiz')) {
        await generateQuestions();
      } else if (lowerInput.includes('key') || lowerInput.includes('point')) {
        await extractKeyPoints();
      } else if (lowerInput.includes('explain') || lowerInput.includes('break down')) {
        await generateExplanation();
      } else {
        // Default to summary
        await generateSummary();
      }
    }
  };

  const handleContentCreation = async (input: string) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('article') || lowerInput.includes('blog')) {
      await generateArticle(input);
    } else if (lowerInput.includes('study guide') || lowerInput.includes('guide')) {
      await generateStudyGuide(input);
    } else if (lowerInput.includes('flashcard') || lowerInput.includes('card')) {
      await generateFlashcards(input);
    } else if (lowerInput.includes('presentation') || lowerInput.includes('slides')) {
      await generatePresentation(input);
    } else {
      // General content creation
      await generateGeneralContent(input);
    }
  };

  const handleGeneralChat = async (input: string) => {
    simulateTyping(() => {
      const responses = [
        `🤔 That's interesting! How can I help you with that? I can analyze text, create content, or help with learning tasks.`,
        `💡 Great question! I specialize in reading comprehension and content creation. What specific task would you like help with?`,
        `🎯 I'm here to help! Whether you need to understand complex text, create study materials, or generate new content, I've got you covered!`,
        `📚 Learning is an adventure! What would you like to explore today - reading analysis, content creation, or something else?`
      ];

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      addMessage(response);
    });
  };

  // Reading Analysis Functions
  const generateSummary = async () => {
    simulateTyping(() => {
      const summary = `📋 **Summary of the Text:**

${readingSession.text.length > 500 ?
  readingSession.text.substring(0, 300) + "..." :
  readingSession.text}

**Key Takeaways:**
• Main topic: ${readingSession.text.split('.')[0]}
• Purpose: Educational content about learning concepts
• Target audience: Students interested in interactive learning

This text appears to be about creating engaging learning experiences through AI-powered content prediction and personalized education.`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: summary,
        timestamp: new Date(),
        metadata: { type: 'summary' }
      };
      addMessage(response);
      setReadingSession(prev => ({ ...prev, summary }));
    }, 2000);
  };

  const generateQuestions = async () => {
    simulateTyping(() => {
      const questions = [
        "What is the main purpose of this AI learning system?",
        "How does the content prediction work based on hobbies?",
        "What makes this approach different from traditional learning?",
        "How can students benefit from personalized content recommendations?",
        "What role does AI play in creating engaging learning experiences?"
      ];

      const questionContent = `❓ **Generated Comprehension Questions:**

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Answer Key:**
1. To provide personalized, engaging learning experiences based on student interests
2. By analyzing hobbies and matching them with relevant educational content
3. It uses AI to predict content preferences and create interactive experiences
4. Through more relevant, enjoyable, and effective learning experiences
5. AI analyzes preferences, generates content, and creates interactive learning paths`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: questionContent,
        timestamp: new Date(),
        metadata: { type: 'questions', data: questions }
      };
      addMessage(response);
      setReadingSession(prev => ({ ...prev, questions }));
    }, 1800);
  };

  const extractKeyPoints = async () => {
    simulateTyping(() => {
      const keyPoints = [
        "🎯 **AI-Powered Content Prediction**: System analyzes user hobbies to recommend relevant learning materials",
        "🎮 **Gamified Learning**: Transforms education into engaging, interactive experiences",
        "🧠 **Personalized Experience**: Content adapts to individual learning styles and preferences",
        "⚡ **ADHD-Friendly Design**: Quick, visual, and entertaining approach to learning",
        "📊 **Progress Tracking**: Monitors learning journey with achievements and rewards",
        "🤖 **Conversational AI**: Interactive assistant helps with reading and content creation"
      ];

      const keyPointsContent = `🔑 **Key Points Extracted:**

${keyPoints.join('\n\n')}

**Main Themes:**
• Personalization through AI technology
• Gamification of learning process
• Interactive and engaging educational experiences
• Support for different learning needs (ADHD-friendly)
• Comprehensive learning ecosystem`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: keyPointsContent,
        timestamp: new Date(),
        metadata: { type: 'analysis', data: keyPoints }
      };
      addMessage(response);
      setReadingSession(prev => ({ ...prev, keyPoints }));
    }, 1600);
  };

  const generateExplanation = async () => {
    simulateTyping(() => {
      const explanation = `🧠 **Breaking Down the Concept:**

**What is AI Content Prediction?**
Imagine having a super-smart friend who knows exactly what videos, articles, or activities you'll love based on your hobbies! That's what this AI does.

**How It Works:**
1. **Input Analysis**: You tell the AI about your interests (gaming, sports, music, etc.)
2. **Pattern Recognition**: AI finds connections between your hobbies and educational topics
3. **Content Matching**: Recommends learning materials that feel like playing rather than studying
4. **Personalization**: Adjusts difficulty and style based on your mood and energy level

**Why It Matters:**
Traditional learning can feel boring and disconnected from real life. This AI bridges that gap by making learning feel natural and exciting, just like your favorite hobbies!

**Real-World Example:**
If you love gaming, instead of memorizing physics formulas, you learn about game physics through videos about how video games work - making the learning process feel like an extension of your hobby! 🎮⚡`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: explanation,
        timestamp: new Date(),
        metadata: { type: 'explanation' }
      };
      addMessage(response);
    }, 2200);
  };

  // Content Creation Functions
  const generateArticle = async (topic: string) => {
    simulateTyping(() => {
      const article = `# The Future of AI-Powered Learning: Making Education Personal and Fun

## Introduction
In an era where attention spans are shrinking and traditional education methods are struggling to engage modern learners, AI-powered learning systems are revolutionizing how we approach education.

## The Problem with Traditional Learning
Traditional education often follows a one-size-fits-all approach that doesn't account for individual interests, learning styles, or personal motivations. This leads to disengagement, poor retention, and missed opportunities for deep understanding.

## The AI Solution
By leveraging artificial intelligence, modern learning platforms can:
- **Analyze individual preferences** through hobby and interest assessment
- **Predict content preferences** using machine learning algorithms
- **Create personalized learning paths** that feel natural and engaging
- **Adapt in real-time** based on user feedback and performance

## Real-World Impact
Students who engage with AI-personalized content show:
- **Higher engagement rates** (up to 300% increase)
- **Better knowledge retention** (40% improvement)
- **More positive learning experiences**
- **Greater motivation to continue learning**

## Conclusion
The future of education lies in personalization, and AI is the key to unlocking truly individualized learning experiences that make education both effective and enjoyable.

---
*Generated by AI Reading & Content Creation Assistant*`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `📝 **Generated Article:**

${article}

**Article Stats:**
• Word count: 248
• Reading time: ~1.5 minutes
• Sections: 5
• Key topics: AI, education, personalization

Would you like me to modify this article, add more sections, or create something different? ✍️`,
        timestamp: new Date(),
        metadata: { type: 'content', data: article }
      };
      addMessage(response);

      if (onContentGenerated) {
        onContentGenerated({ type: 'article', content: article, topic });
      }
    }, 3000);
  };

  const generateStudyGuide = async (topic: string) => {
    simulateTyping(() => {
      const studyGuide = `# AI-Powered Learning Study Guide

## 🎯 Learning Objectives
By the end of this guide, you will understand:
- How AI personalizes learning experiences
- Benefits of hobby-based content recommendations
- Implementation strategies for AI learning systems

## 📚 Key Concepts

### 1. Content Prediction Algorithm
**Definition**: AI system that analyzes user preferences to recommend relevant learning materials
**How it works**: Machine learning models identify patterns between hobbies and educational content
**Benefits**: Increases engagement by 300%, improves retention by 40%

### 2. Personalization Factors
- **Hobby Analysis**: Maps interests to academic subjects
- **Learning Style Assessment**: Visual, kinesthetic, theoretical preferences
- **Mood & Energy Levels**: Adapts content difficulty and pacing
- **Progress Tracking**: Adjusts recommendations based on performance

### 3. Gamification Elements
- **Achievement Systems**: Badges, points, and rewards
- **Interactive Challenges**: Quizzes and practical exercises
- **Progress Visualization**: Clear learning journey tracking

## 🧠 Practice Questions

### Multiple Choice
1. What is the primary benefit of AI content prediction?
   - A) Faster grading
   - B) Personalized learning experiences
   - C) Automated testing
   - D) Cheaper textbooks

2. How does hobby-based learning improve engagement?
   - A) Makes content more expensive
   - B) Connects learning to personal interests
   - C) Reduces study time
   - D) Eliminates homework

### Short Answer
1. Explain how AI analyzes user preferences for content recommendations.
2. Describe three ways gamification improves learning outcomes.

## 🔗 Additional Resources
- Interactive AI Learning Platforms
- Research on Personalized Education
- Gamification in Education Studies

## 📝 Reflection Questions
1. How might AI personalization change your learning experience?
2. What hobbies could you connect to academic subjects?
3. How can gamification make learning more enjoyable?

---
*Study Guide generated for comprehensive understanding*`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `📖 **Generated Study Guide:**

${studyGuide}

**Study Guide Features:**
• Learning objectives
• Key concepts with explanations
• Practice questions (multiple choice & short answer)
• Additional resources
• Reflection questions

This comprehensive guide covers all essential aspects of AI-powered learning! Would you like me to create flashcards or a presentation based on this content? 🎴📊`,
        timestamp: new Date(),
        metadata: { type: 'content', data: studyGuide }
      };
      addMessage(response);

      if (onContentGenerated) {
        onContentGenerated({ type: 'study_guide', content: studyGuide, topic });
      }
    }, 2500);
  };

  const generateFlashcards = async (topic: string) => {
    simulateTyping(() => {
      const flashcards = [
        {
          front: "What is AI Content Prediction?",
          back: "A system that analyzes user hobbies and preferences to recommend personalized learning materials that match their interests."
        },
        {
          front: "How does hobby-based learning work?",
          back: "By connecting academic subjects to real-world interests. For example, teaching physics through video game mechanics for gamers."
        },
        {
          front: "What are the benefits of personalized learning?",
          back: "Higher engagement (300% increase), better retention (40% improvement), more enjoyable learning experiences, and higher motivation."
        },
        {
          front: "What is gamification in education?",
          back: "Using game design elements like points, badges, achievements, and challenges to make learning more engaging and fun."
        },
        {
          front: "How does AI adapt content difficulty?",
          back: "By analyzing user performance, mood, energy levels, and previous interactions to adjust content complexity and pacing."
        }
      ];

      const flashcardContent = `🎴 **Generated Flashcards:**

${flashcards.map((card, i) => `
**Card ${i + 1}:**
**Front:** ${card.front}
**Back:** ${card.back}
`).join('\n')}

**Flashcard Stats:**
• Total cards: ${flashcards.length}
• Topics covered: AI learning, personalization, gamification
• Difficulty level: Intermediate

**Study Tips:**
• Review cards daily for best retention
• Test yourself on the front side first
• Use spaced repetition for long-term memory
• Connect concepts to real-world examples

Would you like me to create more flashcards on specific topics or different difficulty levels? 📚✨`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: flashcardContent,
        timestamp: new Date(),
        metadata: { type: 'content', data: flashcards }
      };
      addMessage(response);

      if (onContentGenerated) {
        onContentGenerated({ type: 'flashcards', content: flashcards, topic });
      }
    }, 2000);
  };

  const generatePresentation = async (topic: string) => {
    simulateTyping(() => {
      const slides = [
        {
          title: "Title Slide",
          content: "AI-Powered Learning:\nThe Future of Personalized Education\n\nPresented by: AI Assistant"
        },
        {
          title: "The Problem",
          content: "Traditional Education Challenges:\n• One-size-fits-all approach\n• Low student engagement\n• Poor knowledge retention\n• Lack of personalization"
        },
        {
          title: "The Solution",
          content: "AI-Powered Learning:\n• Personalized content recommendations\n• Hobby-based learning connections\n• Adaptive difficulty adjustment\n• Gamified learning experiences"
        },
        {
          title: "How It Works",
          content: "The AI Process:\n1. Analyze user hobbies & preferences\n2. Match interests to academic content\n3. Generate personalized learning paths\n4. Adapt based on feedback & performance"
        },
        {
          title: "Benefits",
          content: "Measurable Improvements:\n• 300% increase in engagement\n• 40% better knowledge retention\n• More enjoyable learning\n• Higher student motivation"
        },
        {
          title: "Real-World Examples",
          content: "Hobby-Based Learning:\n• Gaming → Physics (game mechanics)\n• Sports → Biology (human performance)\n• Music → Math (rhythm & patterns)\n• Art → Geometry (perspective & design)"
        },
        {
          title: "Future Implications",
          content: "What's Next:\n• AI tutors for every student\n• Fully adaptive curriculums\n• Lifelong personalized learning\n• Global access to quality education"
        },
        {
          title: "Conclusion",
          content: "Key Takeaways:\n• AI makes learning personal & fun\n• Hobbies are the key to engagement\n• Technology can revolutionize education\n• The future of learning is here!"
        }
      ];

      const presentationContent = `📊 **Generated Presentation Slides:**

${slides.map((slide, i) => `
**Slide ${i + 1}: ${slide.title}**
${slide.content}
`).join('\n---\n')}

**Presentation Overview:**
• Total slides: ${slides.length}
• Duration: ~10-15 minutes
• Key topics: AI learning, personalization, benefits, future
• Visual style: Clean and professional

**Presentation Tips:**
• Use images of students learning
• Include real data charts
• Add interactive polls
• End with Q&A session

Would you like me to expand on any slide or create speaker notes for this presentation? 🎤✨`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: presentationContent,
        timestamp: new Date(),
        metadata: { type: 'content', data: slides }
      };
      addMessage(response);

      if (onContentGenerated) {
        onContentGenerated({ type: 'presentation', content: slides, topic });
      }
    }, 2800);
  };

  const generateGeneralContent = async (request: string) => {
    simulateTyping(() => {
      const content = `✍️ **Content Created Based on Your Request:**

"${request}"

**Generated Content Ideas:**

🎯 **Main Concept**: ${request.split(' ').slice(0, 3).join(' ')}...

📝 **Outline:**
1. Introduction - Hook and context
2. Main Body - Key points and explanations
3. Examples - Real-world applications
4. Conclusion - Summary and call to action

💡 **Key Points to Cover:**
• Define the core concept clearly
• Provide practical examples
• Include visual elements
• End with actionable takeaways

🎨 **Content Style Suggestions:**
• Use engaging headlines
• Include relevant emojis
• Break up text with bullet points
• Add calls-to-action

Would you like me to expand this into a full article, create a social media post, or develop it in a different format? 🚀`;

      const response: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: content,
        timestamp: new Date(),
        metadata: { type: 'content' }
      };
      addMessage(response);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([{
      id: 'welcome',
      type: 'ai',
      content: `👋 Welcome back! Ready to dive into more reading and content creation? What would you like to work on today? 📚✍️`,
      timestamp: new Date()
    }]);
    setReadingSession({ text: initialText });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-blue-600">
            <Bot className="h-6 w-6" />
            AI Reading & Content Creator
            <Sparkles className="h-5 w-5 animate-pulse" />
          </CardTitle>
          <p className="text-muted-foreground">
            🤖 Your conversational AI assistant for reading comprehension and content creation! 📖✍️
          </p>
        </CardHeader>
      </Card>

      {/* Mode Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={currentMode === 'chat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('chat')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
            <Button
              variant={currentMode === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('read')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Reading
            </Button>
            <Button
              variant={currentMode === 'create' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('create')}
              className="flex items-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-96 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-4 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {message.type === 'ai' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {message.type === 'ai' ? 'AI Assistant' : 'You'}
                      </span>
                      {message.metadata?.type && (
                        <Badge variant="outline" className="text-xs">
                          {message.metadata.type}
                        </Badge>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </div>
                    {message.metadata?.data && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">AI is thinking...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to analyze text, create content, or help with learning... (e.g., 'Summarize this article' or 'Create a study guide about AI')"
                className="flex-1 min-h-[60px] resize-none"
                disabled={isTyping}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isTyping}
                  className="h-12 px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  onClick={resetConversation}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentInput("Please summarize this text")}
                className="text-xs"
              >
                📋 Summarize
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentInput("Generate comprehension questions")}
                className="text-xs"
              >
                ❓ Questions
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentInput("Extract key points")}
                className="text-xs"
              >
                🔑 Key Points
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentInput("Create a study guide")}
                className="text-xs"
              >
                📖 Study Guide
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentInput("Generate flashcards")}
                className="text-xs"
              >
                🎴 Flashcards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reading Session Status */}
      {readingSession.text && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Active Reading Session</span>
                <Badge variant="outline" className="text-xs">
                  {readingSession.text.length} characters
                </Badge>
              </div>
              <div className="flex gap-2">
                {readingSession.summary && <Badge variant="secondary" className="text-xs">✓ Summary</Badge>}
                {readingSession.questions && <Badge variant="secondary" className="text-xs">✓ Questions</Badge>}
                {readingSession.keyPoints && <Badge variant="secondary" className="text-xs">✓ Key Points</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}