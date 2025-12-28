"use client";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PremiumDialog from "@/components/PremiumDialog";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isInstructor, setIsInstructor] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      if (user) {
        try {
          const res = await fetch("/api/premium/status");
          const data = await res.json();
          setPremiumStatus(data);

          if (!data.isPremium) {
            setShowPremiumDialog(true);
          }
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
    if (user) {
      setIsInstructor(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/features">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Features
            </Button>
          </Link>
        </div>

        <PremiumDialog
          open={showPremiumDialog}
          onOpenChange={setShowPremiumDialog}
          feature="Analytics Dashboard"
        />

        {isInstructor && premiumStatus.isPremium ? (
          <AnalyticsDashboard instructorId={user.email} />
        ) : !premiumStatus.isPremium ? (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
            <p className="text-muted-foreground">
              Analytics Dashboard is only available for Premium users.
            </p>
          </div>
        ) : (
          <div className="text-center p-12">
            <h2 className="text-2xl font-bold mb-4">Instructor Access Required</h2>
            <p className="text-muted-foreground">
              This feature is available for instructors. Contact support to upgrade your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
