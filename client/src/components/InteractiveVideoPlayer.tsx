import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, SkipForward, Volume2, VolumeX, CheckCircle, XCircle } from "lucide-react";

interface VideoSegment {
  startTime: number;
  endTime: number;
  title: string;
  description?: string;
}

interface VideoQuestion {
  timestamp: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface InteractiveVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  segments: VideoSegment[];
  questions: VideoQuestion[];
  subject: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  hobby: string;
  isYouTube?: boolean;
}

interface InteractiveVideoPlayerProps {
  video: InteractiveVideo;
  onComplete: (score: number, totalQuestions: number) => void;
  onClose: () => void;
}

export default function InteractiveVideoPlayer({
  video,
  onComplete,
  onClose
}: InteractiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [questionResults, setQuestionResults] = useState<Array<{question: VideoQuestion, correct: boolean, selectedAnswer: number}>>([]);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Check for questions at current timestamp
  useEffect(() => {
    if (!showQuestion) {
      const questionAtTime = video.questions.find(q =>
        Math.abs(q.timestamp - currentTime) < 1 && !answeredQuestions.has(q.timestamp)
      );

      if (questionAtTime) {
        setCurrentQuestion(questionAtTime);
        setSelectedAnswer(null);
        setShowQuestion(true);
        setIsPlaying(false);
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    }
  }, [currentTime, video.questions, answeredQuestions, showQuestion]);

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seeking
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle question answer
  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    setQuestionResults(prev => [...prev, {
      question: currentQuestion,
      correct: isCorrect,
      selectedAnswer: answerIndex
    }]);

    // Mark question as answered
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.timestamp));

    // Auto-continue after showing result
    setTimeout(() => {
      setShowQuestion(false);
      setCurrentQuestion(null);
      setSelectedAnswer(null);

      // Resume video
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }, 2000);
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    const totalQuestions = video.questions.length;
    onComplete(score, totalQuestions);
  };

  // Handle iframe load error
  const handleIframeError = () => {
    setVideoError("This video is currently unavailable. It may be private, deleted, or restricted.");
  };

  // Handle iframe load success
  const handleIframeLoad = () => {
    setVideoError(null);
  };

  // Listen for YouTube iframe messages (for error detection)
  useEffect(() => {
    if (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')) {
      const handleMessage = (event: MessageEvent) => {
        // YouTube sends messages about video state
        if (event.origin === 'https://www.youtube.com' && event.data) {
          try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (data.event === 'onError') {
              setVideoError("This YouTube video is currently unavailable. It may be private, deleted, or restricted.");
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [video.videoUrl]);

  // Get current segment
  const currentSegment = video.segments.find(segment =>
    currentTime >= segment.startTime && currentTime <= segment.endTime
  );

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showQuestion && currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full bg-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-6 w-6" />
              Quick Check: {currentSegment?.title || 'Understanding Check'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedAnswer === null
                        ? "border-muted hover:border-primary hover:bg-primary/5"
                        : selectedAnswer === index
                          ? index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-red-500 bg-red-50 text-red-700"
                          : index === currentQuestion.correctAnswer
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-muted opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === null
                          ? "bg-muted"
                          : selectedAnswer === index
                            ? index === currentQuestion.correctAnswer
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : index === currentQuestion.correctAnswer
                              ? "bg-green-500 text-white"
                              : "bg-muted"
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {selectedAnswer !== null && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      )}
                      {selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedAnswer !== null && (
              <div className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${
                    selectedAnswer === currentQuestion.correctAnswer ? "text-green-700" : "text-red-700"
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
                  </span>
                  {selectedAnswer === currentQuestion.correctAnswer && (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      +{currentQuestion.points} points
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Continuing video in a moment...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <p className="text-muted-foreground">{video.description}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Video
        </Button>
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Check if video is YouTube embed */}
            {video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') ? (
              <div className="w-full h-full relative">
                {videoError ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    <div className="text-center space-y-4 p-8">
                      <div className="text-6xl mb-4">⚠️</div>
                      <h3 className="text-xl font-semibold mb-2">Video Unavailable</h3>
                      <p className="text-gray-300 max-w-md mb-4">{videoError}</p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          onClick={() => {
                            setVideoError(null);
                            // Try to reload the iframe
                            const iframe = document.querySelector('iframe');
                            if (iframe) {
                              iframe.src = iframe.src;
                            }
                          }}
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => {
                            // Simulate video completion for demo purposes
                            setTimeout(() => onComplete(video.questions.length * 10, video.questions.length), 3000);
                          }}
                          className="bg-tower-gold hover:bg-tower-gold/80"
                        >
                          Skip to Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={video.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={video.title}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                  />
                )}

                {/* Manual error reporting button - positioned over iframe */}
                {!videoError && (
                  <div className="absolute top-4 right-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setVideoError("Video reported as unavailable by user.")}
                      className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      title="Click if video shows 'unavailable'"
                    >
                      Report Error
                    </Button>
                  </div>
                )}
              </div>
            ) : video.videoUrl.includes('/videos/') ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                <div className="text-center space-y-4 p-8">
                  <div className="text-6xl mb-4">
                    {video.hobby === 'gaming' ? '🎮' :
                     video.hobby === 'sports' ? '⚽' :
                     video.hobby === 'music' ? '🎵' :
                     video.hobby === 'art' ? '🎨' :
                     video.hobby === 'science' ? '🔬' :
                     video.hobby === 'nature' ? '🌿' :
                     video.hobby === 'cooking' ? '👨‍🍳' :
                     video.hobby === 'space' ? '🚀' : '📚'}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-300 max-w-md mb-4">
                    {video.description}
                  </p>
                  <div className="bg-gray-700/50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">What you'll learn:</h4>
                    <ul className="text-sm text-left space-y-1">
                      {video.segments.slice(0, 3).map((segment, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-tower-gold">•</span>
                          {segment.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        // Simulate video completion for demo purposes
                        setTimeout(() => onComplete(video.questions.length * 10, video.questions.length), 3000);
                      }}
                      className="bg-tower-gold hover:bg-tower-gold/80"
                    >
                      Start Learning (Award XP)
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Interactive video content coming soon. Complete this demo to unlock quiz questions!
                  </p>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={video.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {/* Video Controls - only show for real videos */}
            {!video.videoUrl.includes('/videos/') && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={togglePlay}
                    className="text-white"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <div className="flex-1">
                    <Progress
                      value={(currentTime / video.duration) * 100}
                      className="h-2 cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const percentage = clickX / rect.width;
                        handleSeek(percentage * video.duration);
                      }}
                    />
                  </div>

                  <div className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(video.duration)}
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={toggleMute}
                    className="text-white"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Segment Info */}
      {currentSegment && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{currentSegment.title}</h3>
                {currentSegment.description && (
                  <p className="text-sm text-muted-foreground">{currentSegment.description}</p>
                )}
              </div>
              <Badge variant="outline">
                {formatTime(currentSegment.startTime)} - {formatTime(currentSegment.endTime)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span>Questions answered: {answeredQuestions.size}/{video.questions.length}</span>
              <span>Score: {score} points</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{video.subject}</Badge>
              <Badge variant={
                video.difficulty === 'beginner' ? 'default' :
                video.difficulty === 'intermediate' ? 'secondary' : 'destructive'
              }>
                {video.difficulty}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}