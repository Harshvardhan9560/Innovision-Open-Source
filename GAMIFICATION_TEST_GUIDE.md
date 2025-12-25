# Gamification Testing Guide

## What Was Fixed

1. **Leaderboard** - Now fetches and displays user names and avatars
2. **Real-time XP** - XP updates every 30 seconds automatically
3. **XP Awarding** - Added `awardXP()` function to context
4. **Course Viewing** - Awards 10 XP when viewing a course
5. **Better Error Handling** - Shows defaults instead of breaking

## How to Test

### Method 1: Use the Test Button (Easiest)

1. Login to your account
2. Go to `/gamification` page
3. Click the "Test Award XP" button in the Overview tab
4. You should see:
   - Toast notification showing XP awarded
   - XP counter in navbar updates
   - Progress bar fills up
   - Level increases after 1000 XP

### Method 2: Use the Test API Endpoint

Open these URLs in your browser (replace `your-email@example.com` with your actual email):

**Initialize your gamification data:**
```
http://localhost:3000/api/gamification/test?userId=your-email@example.com&action=init
```

**Check your current stats:**
```
http://localhost:3000/api/gamification/test?userId=your-email@example.com&action=check
```

**Award yourself 100 XP:**
```
http://localhost:3000/api/gamification/test?userId=your-email@example.com&action=award&xp=100&type=complete_chapter
```

**Award yourself 500 XP (complete course):**
```
http://localhost:3000/api/gamification/test?userId=your-email@example.com&action=award&xp=500&type=complete_course
```

### Method 3: Natural Usage

1. Login to your account
2. Go to any course roadmap (e.g., `/roadmap/some-id`)
3. You'll automatically get 10 XP for viewing the course
4. Complete chapters to earn more XP

## XP Rewards

- **View Course**: 10 XP
- **Complete Lesson**: 50 XP
- **Complete Chapter**: 100 XP
- **Perfect Quiz**: 200 XP
- **Complete Course**: 500 XP
- **Help Student**: 75 XP

## Troubleshooting

### "No data available" on Leaderboard

This is normal if:
- You're the first user
- No one has earned XP yet
- Firebase indexes aren't created yet

**Solution**: Use the test button or API to award yourself some XP

### XP not updating in navbar

- Wait 30 seconds (auto-refresh interval)
- Or refresh the page
- Check browser console for errors

### Firebase Index Errors

If you see errors about missing indexes in the console:

1. Firebase will show you a link to create the index
2. Click the link and create the composite index
3. Wait 2-3 minutes for it to build
4. Refresh the page

Common indexes needed:
- `gamification` collection: `xp` (desc), `lastActive` (desc)
- `gamification` collection: `lastActive` (asc), `xp` (desc)

## Expected Behavior

✅ **Working correctly when:**
- Test button awards XP and shows toast
- XP counter in navbar updates
- Progress bar fills up
- Level increases at 1000 XP
- Badges appear when earned
- Leaderboard shows users (after multiple users have XP)

❌ **Not working if:**
- Test button does nothing
- Console shows Firebase errors
- XP stays at 0 after awarding
- Page crashes or shows errors

## Next Steps

After testing works:
1. Remove the test button from production (it's just for testing)
2. Integrate XP awarding into chapter completion flow
3. Add XP for quiz completion
4. Add XP for course completion
5. Test with multiple users for leaderboard

## Files Modified

- `/src/app/api/gamification/leaderboard/route.js` - Enriches user data
- `/src/contexts/xp.jsx` - Added awardXP function and polling
- `/src/components/Home/RoadMap.jsx` - Awards XP on course view
- `/src/components/gamification/GamificationDashboard.jsx` - Better error handling
- `/src/components/gamification/Leaderboard.jsx` - Better error handling
- `/src/components/gamification/TestXPButton.jsx` - NEW: Test button
- `/src/app/api/gamification/test/route.js` - NEW: Test endpoint
