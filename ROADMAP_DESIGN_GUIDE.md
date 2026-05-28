# Roadmap Page - Design Guide

## Visual Hierarchy

### 1. Header Section
```
┌─────────────────────────────────────────────┐
│ [Icon] Roadmap Title                        │
│        Goal: Title • Level: Current         │
└─────────────────────────────────────────────┘
```

### 2. Stats Grid (4 Cards)
```
┌──────────┬──────────┬──────────┬──────────┐
│ [Icon]   │ [Icon]   │ [Icon]   │ [Icon]   │
│   75%    │    5     │  12/20   │   40h    │
│ Progress │  Phases  │  Tasks   │   Time   │
└──────────┴──────────┴──────────┴──────────┘
```

### 3. Phase Card (Collapsed)
```
┌─────────────────────────────────────────────┐
│ ▶ [1] Phase Title              75%  8  12h │
│       Phase description...                  │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────────┘
```

### 4. Phase Card (Expanded)
```
┌─────────────────────────────────────────────┐
│ ▼ [1] Phase Title              75%  8  12h │
│       Phase description...                  │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├─────────────────────────────────────────────┤
│ ☑ [1] Task Title - Completed                │
│       Description...      [EASY]  30 min    │
│                                              │
│ ☐ [2] Task Title - Pending                  │
│       Description...    [MEDIUM]  45 min    │
│                                              │
│ ☐ [3] Task Title - Pending                  │
│       Description...      [HARD]  60 min    │
└─────────────────────────────────────────────┘
```

## Component Breakdown

### Phase Header
```tsx
<div className="p-5 cursor-pointer hover:bg-zinc-800/50">
  <div className="flex items-center gap-4">
    {/* Chevron */}
    <ChevronRight className="h-5 w-5 text-zinc-400" />
    
    {/* Phase Number */}
    <div className="h-10 w-10 rounded-lg bg-white">
      <span className="text-sm font-bold text-black">1</span>
    </div>
    
    {/* Phase Info */}
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white">Phase Title</h3>
      <p className="text-sm text-zinc-400">Description...</p>
    </div>
    
    {/* Stats */}
    <div className="flex gap-6">
      <div>75%<br/>Progress</div>
      <div>8<br/>Tasks</div>
      <div>12h<br/>Duration</div>
    </div>
  </div>
  
  {/* Progress Bar */}
  <div className="mt-4 h-1.5 bg-zinc-800 rounded-full">
    <div className="h-full bg-white" style="width: 75%" />
  </div>
</div>
```

### Task Item
```tsx
<div className="flex items-center gap-4 p-4 rounded-lg border bg-zinc-800 border-zinc-700">
  {/* Checkbox */}
  <div className="h-5 w-5 rounded border-2 border-zinc-600" />
  
  {/* Task Number */}
  <div className="h-8 w-8 rounded bg-zinc-700">
    <span className="text-xs font-bold text-zinc-300">1</span>
  </div>
  
  {/* Task Info */}
  <div className="flex-1">
    <h4 className="font-medium text-white">Task Title</h4>
    <p className="text-xs text-zinc-500">Description...</p>
  </div>
  
  {/* Metadata */}
  <div className="flex gap-4">
    <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500">
      EASY
    </span>
    <span className="text-sm text-zinc-400">
      <Clock /> 30 min
    </span>
  </div>
</div>
```

## Color Coding

### Difficulty Badges
```css
/* EASY */
.difficulty-easy {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

/* MEDIUM */
.difficulty-medium {
  background: rgba(234, 179, 8, 0.1);
  color: #EAB308;
}

/* HARD */
.difficulty-hard {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}
```

### Stat Card Icons
```css
/* Progress - Blue */
.stat-progress {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

/* Phases - Purple */
.stat-phases {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

/* Tasks - Green */
.stat-tasks {
  background: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

/* Time - Orange */
.stat-time {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}
```

## States

### Phase States
```tsx
// Collapsed
<ChevronRight className="h-5 w-5 text-zinc-400" />

// Expanded
<ChevronDown className="h-5 w-5 text-zinc-400" />

// Hover
className="hover:bg-zinc-800/50 transition-colors"
```

### Task States
```tsx
// Pending
<div className="bg-zinc-800 border-zinc-700">
  <div className="h-5 w-5 rounded border-2 border-zinc-600" />
  <h4 className="text-white">Task Title</h4>
</div>

// Completed
<div className="bg-zinc-800/30 border-zinc-700/50">
  <div className="h-5 w-5 rounded border-2 bg-white border-white">
    <CheckCircle2 className="text-black" />
  </div>
  <h4 className="text-zinc-500 line-through">Task Title</h4>
</div>
```

## Spacing Guide

### Card Spacing
```css
/* Phase Card */
padding: 20px;           /* p-5 */
margin-bottom: 16px;     /* mb-4 */

/* Task Item */
padding: 16px;           /* p-4 */
margin-bottom: 12px;     /* mb-3 */

/* Stat Card */
padding: 20px;           /* p-5 */
gap: 16px;               /* gap-4 */
```

### Element Gaps
```css
/* Phase Header Elements */
gap: 16px;               /* gap-4 */

/* Task Elements */
gap: 16px;               /* gap-4 */

/* Stat Cards */
gap: 16px;               /* gap-4 */

/* Phase Stats */
gap: 24px;               /* gap-6 */
```

## Typography

### Font Sizes
```css
/* Page Title */
font-size: 30px;         /* text-3xl */
font-weight: 700;        /* font-bold */

/* Phase Title */
font-size: 18px;         /* text-lg */
font-weight: 700;        /* font-bold */

/* Task Title */
font-size: 16px;         /* text-base */
font-weight: 500;        /* font-medium */

/* Stat Value */
font-size: 24px;         /* text-2xl */
font-weight: 700;        /* font-bold */

/* Stat Label */
font-size: 14px;         /* text-sm */
color: #A1A1AA;          /* text-zinc-400 */

/* Description */
font-size: 14px;         /* text-sm */
color: #A1A1AA;          /* text-zinc-400 */

/* Task Description */
font-size: 12px;         /* text-xs */
color: #71717A;          /* text-zinc-500 */

/* Difficulty Badge */
font-size: 12px;         /* text-xs */
font-weight: 500;        /* font-medium */
```

## Icons

### Icon Sizes
```tsx
// Header Icon
<Target className="h-6 w-6" strokeWidth={2} />

// Stat Card Icon
<Icon className="h-5 w-5" strokeWidth={2} />

// Chevron Icon
<ChevronRight className="h-5 w-5" strokeWidth={2} />

// Task Icon
<Clock className="h-4 w-4" strokeWidth={2} />

// Checkbox Icon
<CheckCircle2 className="h-4 w-4" strokeWidth={3} />
```

### Icon Colors
```css
/* Primary Icons */
color: currentColor;

/* Secondary Icons */
color: #A1A1AA;          /* text-zinc-400 */

/* Stat Icons */
color: var(--stat-color); /* Blue, Purple, Green, Orange */
```

## Animations

### Transitions
```css
/* Phase Hover */
transition: background-color 200ms;

/* Progress Bar */
transition: width 500ms;

/* All Transitions */
transition: all 300ms;
```

### Loading Animation
```tsx
<div className="animate-pulse" />
<div className="animate-pulse delay-75" />
<div className="animate-pulse delay-150" />
```

## Responsive Breakpoints

### Mobile (< 768px)
```tsx
// Single column stats
<div className="grid grid-cols-1 gap-4">

// Stacked phase info
<div className="flex-col">

// Hidden phase stats
<div className="hidden md:flex">
```

### Tablet (768px - 1024px)
```tsx
// 2-column stats
<div className="grid md:grid-cols-2 gap-4">

// Compact phase stats
<div className="md:flex md:gap-4">
```

### Desktop (> 1024px)
```tsx
// 4-column stats
<div className="grid lg:grid-cols-4 gap-4">

// Full phase stats
<div className="flex gap-6">
```

## Accessibility

### Keyboard Navigation
```tsx
// Focusable phase cards
<div 
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && togglePhase(phase.id)}
>

// Focus styles
className="focus:outline-none focus:ring-2 focus:ring-white"
```

### Screen Readers
```tsx
// Aria labels
<div aria-label={`Phase ${phase.phase_order}: ${phase.title}`}>

// Aria expanded
<div aria-expanded={isExpanded}>

// Semantic HTML
<button>
<nav>
<main>
```

## Best Practices

### Do's ✅
- Keep phase cards compact when collapsed
- Show essential info in collapsed state
- Use consistent spacing throughout
- Maintain color coding for difficulty
- Show progress visually with bars
- Use icons to enhance understanding
- Keep task items scannable

### Don'ts ❌
- Don't show all tasks by default
- Don't use too many colors
- Don't hide important information
- Don't make clickable areas too small
- Don't use confusing icons
- Don't overcrowd the interface
- Don't forget loading states

## Performance Tips

### Optimization
```tsx
// Lazy render collapsed phases
{isExpanded && <TaskList />}

// Memoize calculations
const phaseProgress = useMemo(() => calculateProgress(phase), [phase]);

// Use Set for expansion state
const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

// Efficient updates
setExpandedPhases(prev => {
  const newSet = new Set(prev);
  newSet.add(phaseId);
  return newSet;
});
```

## Testing Checklist

- [ ] Phases expand/collapse correctly
- [ ] Progress bars show accurate percentages
- [ ] Task counts are correct
- [ ] Time calculations are accurate
- [ ] Difficulty badges show correct colors
- [ ] Completed tasks show checkmarks
- [ ] Loading state displays properly
- [ ] Empty state shows when no roadmap
- [ ] Mobile layout works correctly
- [ ] Keyboard navigation functions
- [ ] Screen readers can navigate
- [ ] All icons render properly
