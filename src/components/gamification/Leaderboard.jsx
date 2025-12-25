"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Calendar, Users } from "lucide-react";

export default function Leaderboard({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState({
    daily: [],
    weekly: [],
    allTime: []
  });

  useEffect(() => {
    fetchLeaderboard();
    
    // Refresh leaderboard every 10 seconds for real-time updates
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/gamification/leaderboard");
      const data = await res.json();
      
      if (data.error) {
        setLeaderboard({
          daily: [],
          weekly: [],
          allTime: []
        });
        return;
      }
      
      setLeaderboard(data);
    } catch (error) {
      setLeaderboard({
        daily: [],
        weekly: [],
        allTime: []
      });
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const LeaderboardList = ({ users }) => {
    if (!users || users.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data available yet. Complete some courses to appear on the leaderboard!
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {users.map((user, idx) => {
          const isCurrentUser = user.id === currentUserId;
        return (
          <div
            key={user.id}
            className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
              isCurrentUser ? "border-blue-400 bg-blue-50" : "hover:bg-accent"
            }`}
          >
            <div className="text-2xl font-bold w-12 text-center">
              {getRankIcon(idx + 1)}
            </div>
            
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                {user.name}
                {isCurrentUser && <Badge variant="secondary">You</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                Level {user.level} • {user.coursesCompleted} courses
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-bold text-lg">{user.xp.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>
        );
      })}
    </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </CardTitle>
        <CardDescription>Compete with other learners</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">
              <Calendar className="h-4 w-4 mr-2" />
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly">
              <TrendingUp className="h-4 w-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="allTime">
              <Users className="h-4 w-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <LeaderboardList users={leaderboard.daily} />
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <LeaderboardList users={leaderboard.weekly} />
          </TabsContent>

          <TabsContent value="allTime" className="mt-4">
            <LeaderboardList users={leaderboard.allTime} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
