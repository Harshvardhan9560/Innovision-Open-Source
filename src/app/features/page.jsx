"use client";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, Wifi, Brain, Video, BookOpen, Crown, Download } from "lucide-react";

export default function FeaturesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (user) {
        try {
          const res = await fetch("/api/premium/status");
          const data = await res.json();
          setPremiumStatus(data);
        } catch (error) {
          console.error("Error fetching premium status:", error);
        }
      }
    };
    fetchPremiumStatus();
  }, [user]);

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const features = [
    {
      title: "Analytics Dashboard",
      description: "Track student performance, engagement metrics, and course completion rates",
      icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
      href: "/features/analytics",
      color: "bg-blue-50 dark:bg-blue-950",
      premium: true,
      badge: "Premium"
    },
    {
      title: "Multimodal Content",
      description: "Generate audio scripts and video storyboards for your courses (Coming Soon - Preview Only)",
      icon: <Video className="w-12 h-12 text-purple-500" />,
      href: "/features/multimodal",
      color: "bg-purple-50 dark:bg-purple-950",
      premium: true,
      badge: "Preview",
      comingSoon: true
    },
    {
      title: "AI Personalization",
      description: "Advanced learning recommendations using reinforcement learning",
      icon: <Brain className="w-12 h-12 text-green-500" />,
      href: "/features/personalization",
      color: "bg-green-50 dark:bg-green-950",
      premium: true,
      badge: "Premium"
    },
    {
      title: "Offline Learning",
      description: "Download courses and learn offline. Free users: 1 course only. Premium: Unlimited downloads!",
      icon: <Wifi className="w-12 h-12 text-orange-500" />,
      href: "/features/offline",
      color: "bg-orange-50 dark:bg-orange-950",
      premium: true,
      badge: "1 Free Course",
      highlight: true
    },
    {
      title: "LMS Integration",
      description: "Connect with Moodle or Canvas to sync courses and grades",
      icon: <BookOpen className="w-12 h-12 text-red-500" />,
      href: "/features/lms",
      color: "bg-red-50 dark:bg-red-950",
      premium: true,
      badge: "Premium"
    },
    {
      title: "Project-Based Learning",
      description: "Build real-world projects with mentor guidance and professional reviews",
      icon: <BarChart3 className="w-12 h-12 text-teal-500" />,
      href: "/features/projects",
      color: "bg-teal-50 dark:bg-teal-950",
      premium: true,
      badge: "Premium"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Advanced Features</h1>
        <p className="text-lg text-muted-foreground">
          Unlock powerful tools to enhance your learning experience
        </p>
      </div>

      {!premiumStatus.isPremium && (
        <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6 text-black" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">Premium Features</h3>
              <p className="text-muted-foreground mb-4">
                Most features are available only for Premium users. Free users get limited access:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-500" />
                  <span className="font-semibold">Offline Learning: Download 1 course for free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-500" />
                  <span>Multimodal Content: Preview only (Coming Soon)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span>All other features: Premium only</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push("/premium")}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Upgrade to Premium - ₹100/month
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className={`h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer relative ${
              feature.highlight ? 'border-2 border-orange-500 shadow-orange-500/20' : ''
            }`}>
              {feature.premium && (
                <div className="absolute top-3 right-3">
                  {feature.comingSoon ? (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
                      {feature.badge}
                    </span>
                  ) : feature.highlight ? (
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {feature.badge}
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-500 text-black text-xs font-semibold rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      {feature.badge}
                    </span>
                  )}
                </div>
              )}
              <CardHeader>
                <div className={`w-20 h-20 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <CardTitle className="pr-20">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {feature.comingSoon ? 'Preview →' : 'Explore →'}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
