"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  BookOpen,
  GraduationCap,
  Loader2,
  School,
  Building2,
  Brain,
  Wifi,
  BarChart3,
  Video,
  Upload,
  Code2,
  Languages,
  Trophy,
  Calendar,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export default function PremiumPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [premiumStatus, setPremiumStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchPremiumStatus = async () => {
      try {
        const res = await fetch("/api/premium/status");
        const data = await res.json();
        setPremiumStatus(data);
      } catch (error) {
        console.error("Error fetching premium status:", error);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchPremiumStatus();
  }, [user, router]);

  const handleUpgrade = async (planType = "premium") => {
    if (!user) {
      toast.error("Please login to upgrade");
      router.push("/login");
      return;
    }

    setLoading(true);
    setSelectedPlan(planType);

    try {
      const orderRes = await fetch("/api/premium/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        console.error("Order creation failed:", errorData);
        throw new Error(errorData.details || "Failed to create order");
      }

      const orderData = await orderRes.json();

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "InnoVision Premium",
          description: planType === "education" ? "Education Plan - 1 Month" : "Premium Subscription - 1 Month",
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              const verifyRes = await fetch("/api/premium/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (!verifyRes.ok) {
                throw new Error("Payment verification failed");
              }

              toast.success("Premium activated successfully!");
              setTimeout(() => {
                router.push("/generate");
              }, 2000);
            } catch (error) {
              toast.error("Payment verification failed. Please contact support.");
              console.error("Verification error:", error);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            email: user.email,
            name: user.displayName || user.email,
          },
          theme: {
            color: "#3b82f6",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        toast.error("Failed to load payment gateway");
        setLoading(false);
      };
    } catch (error) {
      toast.error("Failed to initiate payment");
      console.error("Payment error:", error);
      setLoading(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (premiumStatus?.isPremium) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 rounded-full mb-4">
              <Crown className="h-10 w-10 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
              You're Premium! <Sparkles className="h-8 w-8 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground">Enjoy unlimited access to all features</p>
          </div>

          <Card className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Unlimited course generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Full curriculum access</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Engineering courses</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>YouTube course generation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Studio courses</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Content Ingestion</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Code Editor & AI Builder</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Multi-language translation</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Analytics Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>AI Personalization</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>Offline Learning</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>LMS Integration</span>
              </div>
            </div>

            <Button onClick={() => router.push("/generate")} className="w-full mt-6">
              Start Creating Courses
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
            <Crown className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-xl text-muted-foreground">Unlock unlimited learning possibilities</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <Card className="p-6 border-2">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="text-3xl font-bold mb-1">₹0</div>
            <div className="text-sm text-muted-foreground mb-6">forever</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>3 custom courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>1 YouTube course</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>1 Studio course</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>1 Offline download</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Basic gamification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-muted-foreground">Curriculum access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-muted-foreground">Engineering courses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                <span className="text-muted-foreground">Advanced features</span>
              </li>
            </ul>
            <div className="text-sm text-muted-foreground">
              Current: {premiumStatus?.courseCount || 0}/3 courses used
            </div>
          </Card>

          {/* Premium Plan */}
          <Card className="p-6 border-2 border-yellow-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black px-3 py-1 text-sm font-semibold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Premium
              <Crown className="h-6 w-6 text-yellow-500" />
            </h3>
            <div className="text-3xl font-bold mb-1">₹100</div>
            <div className="text-sm text-muted-foreground mb-6">per month</div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Unlimited custom courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Unlimited YouTube courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Unlimited Studio courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Full curriculum (LKG-12)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Engineering courses</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">All advanced features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Priority support</span>
              </li>
            </ul>
            <Button
              onClick={() => handleUpgrade("premium")}
              disabled={loading && selectedPlan === "premium"}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              {loading && selectedPlan === "premium" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade Now
                </>
              )}
            </Button>
          </Card>

          {/* Education Plan */}
          <Card className="p-6 border-2 border-blue-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-semibold">
              50% OFF
            </div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Education
              <School className="h-6 w-6 text-blue-500" />
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold">₹50</span>
              <span className="text-lg text-muted-foreground line-through">₹100</span>
            </div>
            <div className="text-sm text-muted-foreground mb-2">per month</div>
            <div className="text-xs text-blue-600 font-medium mb-4 flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              For Schools & Colleges
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">All Premium features</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">50% discount</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Valid .edu email required</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Student ID verification</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Classroom integration</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Bulk licensing available</span>
              </li>
            </ul>
            <Button
              onClick={() => handleUpgrade("education")}
              disabled={loading && selectedPlan === "education"}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              {loading && selectedPlan === "education" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Get Education Plan
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* All Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">All Premium Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold text-sm">Unlimited Courses</h4>
              <p className="text-xs text-muted-foreground">Custom, YouTube, Studio</p>
            </Card>
            <Card className="p-4 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold text-sm">Full Curriculum</h4>
              <p className="text-xs text-muted-foreground">LKG to Class 12</p>
            </Card>
            <Card className="p-4 text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold text-sm">Engineering</h4>
              <p className="text-xs text-muted-foreground">All branches & semesters</p>
            </Card>
            <Card className="p-4 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h4 className="font-semibold text-sm">Content Ingestion</h4>
              <p className="text-xs text-muted-foreground">PDFs & textbooks</p>
            </Card>
            <Card className="p-4 text-center">
              <Code2 className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
              <h4 className="font-semibold text-sm">Code Editor</h4>
              <p className="text-xs text-muted-foreground">AI Website Builder</p>
            </Card>
            <Card className="p-4 text-center">
              <Languages className="h-8 w-8 mx-auto mb-2 text-pink-500" />
              <h4 className="font-semibold text-sm">Translation</h4>
              <p className="text-xs text-muted-foreground">Multi-language support</p>
            </Card>
            <Card className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
              <h4 className="font-semibold text-sm">Analytics</h4>
              <p className="text-xs text-muted-foreground">Performance tracking</p>
            </Card>
            <Card className="p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <h4 className="font-semibold text-sm">AI Personalization</h4>
              <p className="text-xs text-muted-foreground">Smart recommendations</p>
            </Card>
            <Card className="p-4 text-center">
              <Wifi className="h-8 w-8 mx-auto mb-2 text-teal-500" />
              <h4 className="font-semibold text-sm">Offline Learning</h4>
              <p className="text-xs text-muted-foreground">Unlimited downloads</p>
            </Card>
            <Card className="p-4 text-center">
              <Video className="h-8 w-8 mx-auto mb-2 text-rose-500" />
              <h4 className="font-semibold text-sm">Multimodal</h4>
              <p className="text-xs text-muted-foreground">Audio & video scripts</p>
            </Card>
            <Card className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <h4 className="font-semibold text-sm">Gamification</h4>
              <p className="text-xs text-muted-foreground">XP, badges, streaks</p>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <h4 className="font-semibold text-sm">LMS Integration</h4>
              <p className="text-xs text-muted-foreground">Moodle & Canvas</p>
            </Card>
          </div>
        </div>

        {/* Education Plan Banner */}
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Are you a Student or Teacher?</h3>
                <p className="text-muted-foreground">
                  Get 50% off with our Education Plan. Valid for schools, colleges, and universities.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleUpgrade("education")}
              disabled={loading && selectedPlan === "education"}
              className="bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap"
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              Get Education Discount
            </Button>
          </div>
        </Card>

        {/* FAQ or Trust Section */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Secure payments powered by Razorpay. Cancel anytime.</p>
          <p className="mt-1">Questions? Contact us at vikas.ambalazari@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
