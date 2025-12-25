# 🔥 How Streak Works

## Understanding Streaks

A **streak** counts **consecutive DAYS** of learning activity, not activities within the same day.

## Examples

### Scenario 1: Same Day Activities ⏰
```
Today (Dec 25):
- 9:00 AM: View course → Streak = 1 ✅
- 10:00 AM: View another course → Streak = 1 (stays same)
- 2:00 PM: Complete chapter → Streak = 1 (stays same)
- 8:00 PM: View another course → Streak = 1 (stays same)

Result: Streak stays at 1 because all activities are on the same day
```

### Scenario 2: Consecutive Days 🔥
```
Day 1 (Dec 25):
- View course → Streak = 1 ✅

Day 2 (Dec 26):
- View course → Streak = 2 ✅ (incremented!)

Day 3 (Dec 27):
- Complete chapter → Streak = 3 ✅ (incremented!)

Result: Streak increases each consecutive day
```

### Scenario 3: Broken Streak 💔
```
Day 1 (Dec 25):
- View course → Streak = 1 ✅

Day 2 (Dec 26):
- (No activity) → Streak = 1 (still valid)

Day 3 (Dec 27):
- (No activity) → Streak broken!

Day 4 (Dec 28):
- View course → Streak = 1 (starts fresh)

Result: Missing 2+ days breaks the streak
```

## Key Rules

1. **Same Day = No Increment**
   - Multiple activities on the same day don't increase streak
   - Streak stays at current value

2. **Consecutive Days = Increment**
   - Activity on Day 1, then Day 2 → Streak increases
   - Activity on Day 2, then Day 3 → Streak increases

3. **Skip 1 Day = OK**
   - Day 1: Activity (Streak = 1)
   - Day 2: No activity (Streak = 1, still valid)
   - Day 3: Activity (Streak = 2)

4. **Skip 2+ Days = Broken**
   - Day 1: Activity (Streak = 1)
   - Day 2: No activity
   - Day 3: No activity
   - Day 4: Activity (Streak = 1, starts fresh)

## What Counts as Activity?

These actions count towards your streak:
- ✅ View course (10 XP)
- ✅ Complete lesson (50 XP)
- ✅ Complete chapter (100 XP)
- ✅ Perfect quiz (200 XP)
- ✅ Complete course (500 XP)

## Testing Your Streak

### Today (First Time)
1. View any course
2. Check navbar → Streak should show **1** 🔥
3. View another course today
4. Check navbar → Streak still shows **1** (same day)

### Tomorrow (Consecutive Day)
1. View any course tomorrow
2. Check navbar → Streak should show **2** 🔥🔥
3. Do more activities tomorrow
4. Check navbar → Streak still shows **2** (same day)

### Day After Tomorrow
1. View any course
2. Check navbar → Streak should show **3** 🔥🔥🔥

## Checking Logs

Open browser console (F12) and look for:

```
🎯 Awarding XP for viewing course...
✅ XP Award Result: { success: true, xpGained: 10, currentStreak: 1 }

📊 Streak Calculation: { action: 'view_course', lastActive: '...', currentStreak: 1 }
⏰ Same day - streak stays at 1
```

Or for consecutive days:
```
📅 Days difference: 1
🔥 Consecutive day! Streak increased to 2
```

## Why Didn't My Streak Increase?

### Reason 1: Same Day
- You already did an activity today
- Streak only increases on consecutive DAYS
- **Solution**: Come back tomorrow!

### Reason 2: Not Enough Time Passed
- The system checks at midnight (00:00)
- If you did activity at 11:59 PM and 12:01 AM, that's 2 days
- **Solution**: Wait for the next calendar day

### Reason 3: Streak Was Broken
- You missed 2+ days
- Streak reset to 0
- **Solution**: Start fresh with today's activity

## Current Status

Check your current streak:
1. Go to `/gamification`
2. Look at the "Streak" card
3. Or check the navbar (🔥 icon)

The number shows your current consecutive days of learning!
