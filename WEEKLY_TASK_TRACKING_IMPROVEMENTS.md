# Weekly Task Tracking System - Implementation Summary

## Overview
Fixed and enhanced the weekly task tracking system to ensure users always have a 7-day task plan that updates automatically.

## Problems Fixed

### 1. **No Weekly Task Generation**
- **Before**: Tasks were only generated one day at a time
- **After**: System automatically generates and maintains a 7-day rolling plan

### 2. **Incorrect Weekly Tracker Display**
- **Before**: Weekly tracker showed streak days (past activity), not actual weekly plan
- **After**: Weekly tracker shows actual scheduled tasks for the next 7 days with completion status

### 3. **No Automatic Task Replenishment**
- **Before**: Tasks only generated after completing previous ones
- **After**: System automatically ensures 7 days of tasks are always available

### 4. **Missing Weekly Plan Visibility**
- **Before**: No way to see the full week's plan
- **After**: Dashboard shows complete weekly overview with task counts per day

## Changes Made

### Backend Changes

#### 1. **Daily Task Service** (`apps/api/src/modules/dailytask/dailytask.service.ts`)

**New Methods:**
- `generateWeeklyTasks(userId)` - Generates tasks for 7 days ahead
- `ensureWeeklyPlan(userId)` - Ensures 7-day plan exists, fills gaps
- `getWeeklyTasks(userId)` - Retrieves tasks for the current week

**Modified Methods:**
- `generateDailyTasks(userId, targetDateStr?)` - Now accepts optional date parameter for future task generation
- `completeDailyTask()` - Now calls `ensureWeeklyPlan()` instead of just generating next day

**Key Logic:**
```typescript
// Automatically maintains 7-day rolling window
async ensureWeeklyPlan(userId: string) {
  // Check existing tasks for next 7 days
  // Generate tasks for any missing days
  // Ensures continuous 7-day plan
}
```

#### 2. **Dashboard Service** (`apps/api/src/modules/dashboard/dashboard.service.ts`)

**Changes:**
- Added automatic weekly plan check on dashboard load
- Added `weekly` tasks array to response
- Fetches 7 days of tasks (today + 6 days ahead)

**New Response Structure:**
```typescript
{
  tasks: {
    today: [...],      // Today's tasks
    weekly: [...]      // 7 days of tasks with scheduledFor dates
  }
}
```

#### 3. **Daily Task Controller** (`apps/api/src/modules/dailytask/dailytask.controller.ts`)

**New Endpoints:**
- `POST /api/dailytask/generate-weekly` - Manually generate 7 days of tasks
- `POST /api/dailytask/ensure-weekly-plan` - Ensure 7-day plan exists

#### 4. **Daily Task Routes** (`apps/api/src/modules/dailytask/dailytask.routes.ts`)

**New Routes:**
```typescript
router.post("/generate-weekly", verifyUser, generateWeeklyTasks);
router.post("/ensure-weekly-plan", verifyUser, ensureWeeklyPlan);
```

### Frontend Changes

#### 1. **Dashboard Page** (`apps/web/app/dashboard/page.tsx`)

**Interface Updates:**
```typescript
interface DashboardTask {
  scheduledFor?: string;  // Added for weekly tasks
}

interface DashboardData {
  tasks: {
    today: DashboardTask[];
    weekly: DashboardTask[];  // New weekly array
  }
}
```

**Weekly Tracker Redesign:**
- Shows next 7 days (not past streak)
- Displays task count per day
- Shows completion status per day
- Visual indicators:
  - ✓ Green: All tasks completed
  - Blue: Tasks scheduled, some incomplete
  - Gray: No tasks scheduled

**New Features:**
- `handleGenerateWeeklyPlan()` - Manual weekly plan generation
- Better visual feedback for task status
- Shows date numbers alongside day names

**Weekly Tracker Display Logic:**
```typescript
// Maps tasks to dates
const tasksByDate = new Map<string, DashboardTask[]>();

// Creates 7-day view with task counts
return Array.from({ length: 7 }, (_, idx) => {
  const date = new Date(today);
  date.setDate(today.getDate() + idx);
  // Returns: hasTask, completed, taskCount, completedCount
});
```

## How It Works

### 1. **Dashboard Load**
```
User opens dashboard
  ↓
Backend: ensureWeeklyPlan() called
  ↓
System checks for tasks in next 7 days
  ↓
Generates tasks for any missing days
  ↓
Returns today's tasks + weekly tasks
  ↓
Frontend displays weekly tracker with actual plan
```

### 2. **Task Completion Flow**
```
User completes a task
  ↓
Backend: completeDailyTask() called
  ↓
Updates task as completed
  ↓
Updates roadmap task progress
  ↓
If roadmap task completed:
  ↓
  ensureWeeklyPlan() called
  ↓
  Generates new tasks to maintain 7-day window
  ↓
Frontend updates UI
```

### 3. **Weekly Plan Generation**
```
ensureWeeklyPlan() called
  ↓
Fetch existing tasks for next 7 days
  ↓
For each day (0-6):
  ↓
  If no task exists for that day:
    ↓
    Get next incomplete roadmap task
    ↓
    Calculate session minutes
    ↓
    Create daily task for that date
  ↓
Return generated tasks
```

## Benefits

### For Users
1. **Always have a plan** - 7 days of tasks always available
2. **Better visibility** - See the full week ahead
3. **Automatic updates** - System maintains plan without manual intervention
4. **Progress tracking** - Visual weekly progress indicator

### For System
1. **Proactive generation** - Tasks created before needed
2. **Consistent experience** - Users never see empty days
3. **Better engagement** - Clear weekly goals visible
4. **Flexible scheduling** - Can generate tasks for any future date

## Testing Recommendations

1. **Test Weekly Generation**
   - Open dashboard with no tasks
   - Verify 7 days of tasks are created
   - Check each day has appropriate task

2. **Test Task Completion**
   - Complete a task
   - Verify weekly plan is maintained
   - Check new tasks are added if needed

3. **Test Manual Generation**
   - Click "Generate Weekly Plan" button
   - Verify tasks are created
   - Check dashboard refreshes

4. **Test Edge Cases**
   - User with no roadmap tasks
   - User with completed roadmap
   - User with partial week already scheduled

## Future Enhancements

1. **Drag-and-drop rescheduling** - Allow users to move tasks between days
2. **Custom weekly goals** - Let users set weekly study time targets
3. **Weekly summary** - End-of-week progress report
4. **Task preview** - Show task details in weekly tracker
5. **Bulk operations** - Mark multiple tasks complete at once
6. **Weekly notifications** - Remind users of upcoming tasks

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard with weekly plan (auto-generates if needed) |
| POST | `/api/dailytask/:id/complete` | Complete a task (auto-maintains weekly plan) |
| POST | `/api/dailytask/generate-weekly` | Manually generate 7 days of tasks |
| POST | `/api/dailytask/ensure-weekly-plan` | Ensure 7-day plan exists |

## Database Impact

No schema changes required. Uses existing `daily_tasks` table with `scheduled_for` field to store future tasks.

## Deployment Notes

1. No database migrations needed
2. Backward compatible with existing data
3. Existing tasks will be preserved
4. First dashboard load will generate missing weekly tasks
5. No breaking changes to existing API contracts
