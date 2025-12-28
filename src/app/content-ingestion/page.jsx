"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, BookOpen, Network, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";

export default function ContentIngestion() {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });
  const router = useRouter();
  const { user } = useAuth();

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

  const handleFileUpload = async (type) => {
    if (!premiumStatus.isPremium) {
      toast.error("Content Ingestion is only available for Premium users. Please upgrade!");
      return;
    }

    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/content/ingest', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Content ingested successfully! ${data.chunks} chunks created.`);
        setFile(null);
      } else {
        toast.error(data.error || "Failed to ingest content");
      }
    } catch (error) {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Smart Content Ingestion</h1>
          <p className="text-muted-foreground">
            Auto-ingest PDFs and textbooks to build knowledge graphs
          </p>
        </div>

        {!premiumStatus.isPremium && (
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Preview Only</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Content Ingestion is a Premium feature. Upgrade to upload and process PDFs, textbooks, and build knowledge graphs!
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Content
                </CardTitle>
                <CardDescription>
                  Upload PDFs or textbooks for automatic processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.txt,.epub"
                  onChange={(e) => setFile(e.target.files[0])}
                  disabled={uploading}
                />

                {file && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => handleFileUpload('pdf')}
                    disabled={uploading || !file}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleFileUpload('textbook')}
                    disabled={uploading || !file}
                    variant="outline"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Text/eBook
                  </Button>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing content...
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF documents
                  </li>
                  <li className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Text files and eBooks (TXT, EPUB)
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Knowledge Graph Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-purple-500" />
                  Knowledge Graph
                </CardTitle>
                <CardDescription>
                  AI-powered content organization and relationship mapping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">What happens:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>Content is extracted and chunked</li>
                      <li>Key concepts are identified</li>
                      <li>Relationships are mapped</li>
                      <li>Knowledge graph is built</li>
                      <li>Content becomes searchable</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                      Benefits:
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Network className="h-3 w-3 text-green-500" />
                        Better content coherence
                      </li>
                      <li className="flex items-center gap-2">
                        <Network className="h-3 w-3 text-green-500" />
                        Improved search & retrieval
                      </li>
                      <li className="flex items-center gap-2">
                        <Network className="h-3 w-3 text-green-500" />
                        Automatic prerequisite detection
                      </li>
                      <li className="flex items-center gap-2">
                        <Network className="h-3 w-3 text-green-500" />
                        Smart content recommendations
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
