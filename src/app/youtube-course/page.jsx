"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Youtube, Loader2, BookOpen, CheckCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";

export default function YouTubeCourse() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false, count: 0 });
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (user) {
        try {
          const res = await fetch("/api/premium/status");
          const data = await res.json();
          setPremiumStatus(data);
          
          // Also fetch YouTube course count
          const ytRes = await fetch("/api/youtube/status");
          if (ytRes.ok) {
            const ytData = await ytRes.json();
            setPremiumStatus(prev => ({ ...prev, count: ytData.count || 0 }));
          }
        } catch (error) {
          console.error("Error fetching premium status:", error);
        }
      }
    };
    fetchPremiumStatus();
  }, [user]);

  const generateCourse = async () => {
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    setIsProcessing(true);
    setProgress("Fetching video information...");

    try {
      // Step 1: Get video info
      const infoResponse = await fetch("/api/youtube/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl })
      });
      const videoInfo = await infoResponse.json();
      
      setProgress("Extracting transcript...");

      // Step 2: Get transcript
      const transcriptResponse = await fetch("/api/youtube/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: videoInfo.videoId })
      });
      const transcriptData = await transcriptResponse.json();

      setProgress("Generating course from video content...");

      // Step 3: Generate course using existing API
      const prompt = `Create a comprehensive learning course from this YouTube video:

Title: ${videoInfo.title}
Transcript: ${transcriptData.transcript}

Generate a structured course with chapters covering all the topics discussed in the video. Each chapter should include learning objectives, key concepts, and practice exercises.`;

      const courseResponse = await fetch("/api/user_prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          difficulty: "balanced"
        })
      });
      
      const courseData = await courseResponse.json();
      
      if (!courseData.id) {
        throw new Error("Failed to generate course");
      }

      // Poll for completion
      setProgress("Processing course content...");
      
      const checkStatus = async () => {
        const statusRes = await fetch(`/api/roadmap/${courseData.id}`);
        const status = await statusRes.json();
        
        if (status.process === "completed") {
          toast.success("Course generated successfully!");
          router.push(`/roadmap/${courseData.id}`);
        } else if (status.process === "error") {
          throw new Error("Course generation failed");
        } else {
          setTimeout(checkStatus, 2000);
        }
      };
      
      checkStatus();
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate course");
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">YouTube to Course Generator</h1>
          <p className="text-muted-foreground">
            Convert any YouTube video into a structured learning course
          </p>
        </div>

        {!premiumStatus.isPremium && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Free User Limit</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Free users can generate 1 YouTube course. You've used {premiumStatus.count || 0}/1. Upgrade to Premium for unlimited access!
                </p>
                <Button
                  onClick={() => router.push("/premium")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Upgrade to Premium - ₹100/month
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-6 w-6 text-red-500" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription>
              Paste a YouTube video link to generate a chapter-wise course
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isProcessing}
              />
              <Button 
                onClick={generateCourse}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Course
                  </>
                )}
              </Button>
            </div>

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {progress}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fetching video information
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Extracting transcript
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating course content
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="space-y-2 text-sm list-decimal list-inside">
                <li>Extracts video transcript automatically</li>
                <li>Creates chapter-wise summary</li>
                <li>Generates in-depth course content</li>
                <li>Adds quizzes and exercises</li>
                <li>Creates a complete learning roadmap</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
