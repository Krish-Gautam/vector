# Vector Dashboard - Design System

## Color Palette

### Backgrounds
```css
--bg-primary: #000000      /* Pure black */
--bg-secondary: #0A0A0A    /* Sidebar background */
--bg-card: #18181B         /* zinc-900 */
--bg-hover: #27272A        /* zinc-800 */
```

### Borders
```css
--border-primary: #27272A  /* zinc-800 */
--border-secondary: #3F3F46 /* zinc-700 */
```

### Text
```css
--text-primary: #FFFFFF    /* White */
--text-secondary: #A1A1AA  /* zinc-400 */
--text-tertiary: #71717A   /* zinc-500 */
--text-muted: #52525B      /* zinc-600 */
```

### Accent Colors
```css
--accent-orange: #F97316   /* Streak */
--accent-blue: #3B82F6     /* Completion */
--accent-green: #22C55E    /* Tasks */
--accent-purple: #A855F7   /* Grade */
```

## Typography

### Font Families
```css
--font-sans: system-ui, -apple-system, sans-serif
```

### Font Sizes
```css
--text-4xl: 36px    /* Large numbers */
--text-3xl: 30px    /* Page title */
--text-2xl: 24px    /* Stat values */
--text-xl: 20px     /* Card titles */
--text-lg: 18px     /* Section titles */
--text-base: 16px   /* Body */
--text-sm: 14px     /* Labels */
--text-xs: 12px     /* Captions */
--text-micro: 10px  /* Tiny labels */
```

### Font Weights
```css
--weight-bold: 700      /* Headings, numbers */
--weight-semibold: 600  /* Labels */
--weight-medium: 500    /* Navigation */
--weight-regular: 400   /* Body */
```

## Spacing

### Scale
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
```

### Component Padding
```css
--padding-card: 24px        /* p-6 */
--padding-stat: 20px        /* p-5 */
--padding-task: 16px        /* p-4 */
--padding-nav: 10px 12px    /* py-2.5 px-3 */
```

## Border Radius

```css
--radius-sm: 6px      /* rounded-md */
--radius-md: 8px      /* rounded-lg */
--radius-lg: 12px     /* rounded-xl */
--radius-full: 9999px /* rounded-full */
```

## Components

### Card
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
  {/* Content */}
</div>
```

### Stat Card
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
  <div className="flex items-center justify-between mb-3">
    <div className="h-10 w-10 rounded-lg bg-{color}-500/10 flex items-center justify-center">
      <Icon className="h-5 w-5 text-{color}-500" strokeWidth={2} />
    </div>
    <span className="text-2xl font-bold text-white">{value}</span>
  </div>
  <p className="text-sm text-zinc-400">{label}</p>
</div>
```

### Button Primary
```tsx
<button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors">
  {label}
</button>
```

### Button Secondary
```tsx
<button className="px-3 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors">
  {label}
</button>
```

### Navigation Item (Active)
```tsx
<a className="flex items-center gap-3 px-3 py-2.5 bg-white text-black rounded-lg font-medium">
  <Icon size={18} strokeWidth={2} />
  {label}
</a>
```

### Navigation Item (Inactive)
```tsx
<a className="flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-lg transition-colors">
  <Icon size={18} strokeWidth={2} />
  {label}
</a>
```

### Task Item
```tsx
<div className="flex items-center gap-4 p-4 rounded-lg border bg-zinc-800 border-zinc-700 hover:border-zinc-600 cursor-pointer transition-all">
  <div className="h-5 w-5 rounded border-2 border-zinc-600 flex items-center justify-center" />
  <div className="flex-1">
    <h3 className="font-medium text-white">{title}</h3>
    <div className="flex items-center gap-2 mt-1">
      <Clock className="h-3 w-3 text-zinc-500" />
      <span className="text-xs text-zinc-500">{time}</span>
    </div>
  </div>
</div>
```

### Progress Bar
```tsx
<div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
  <div 
    className="h-full bg-white rounded-full transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Icon Badge
```tsx
<div className="h-10 w-10 rounded-lg bg-{color}-500/10 flex items-center justify-center">
  <Icon className="h-5 w-5 text-{color}-500" strokeWidth={2} />
</div>
```

### Section Header
```tsx
<div className="mb-6">
  <h2 className="text-xl font-bold text-white">{title}</h2>
  <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
</div>
```

### Weekly Day Cell (Complete)
```tsx
<div className="aspect-square rounded-lg border-2 bg-white border-white flex items-center justify-center">
  <CheckCircle2 className="h-5 w-5 text-black" strokeWidth={2} />
</div>
```

### Weekly Day Cell (Partial)
```tsx
<div className="aspect-square rounded-lg border-2 bg-zinc-800 border-zinc-700 flex flex-col items-center justify-center">
  <div className="text-xs font-bold text-white">{completed}</div>
  <div className="text-[10px] text-zinc-500">/{total}</div>
</div>
```

### Weekly Day Cell (Empty)
```tsx
<div className="aspect-square rounded-lg border-2 bg-zinc-900 border-zinc-800 flex items-center justify-center">
  <Circle className="h-5 w-5 text-zinc-700" strokeWidth={2} />
</div>
```

## Icons

### Library
```tsx
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Circle,
  Settings,
  LogOut
} from "lucide-react";
```

### Usage
```tsx
<Icon 
  className="h-5 w-5 text-zinc-400" 
  strokeWidth={2} 
/>
```

## Animations

### Transitions
```css
transition-colors  /* Color changes */
transition-all     /* Multiple properties */
duration-300       /* 300ms */
duration-500       /* 500ms */
```

### Loading Dots
```tsx
<div className="flex items-center gap-3">
  <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
  <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-75" />
  <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-150" />
</div>
```

### Spinner
```tsx
<div className="h-4 w-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
```

## Layout

### Container
```tsx
<div className="max-w-[1400px] mx-auto px-6 py-8">
  {/* Content */}
</div>
```

### Grid (Stats)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 stat cards */}
</div>
```

### Grid (Main)
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    {/* Left column - 2/3 width */}
  </div>
  <div>
    {/* Right column - 1/3 width */}
  </div>
</div>
```

### Sidebar
```tsx
<aside className="w-[260px] flex-col border-r border-zinc-800/50 bg-[#0A0A0A] px-4 py-5">
  {/* Navigation */}
</aside>
```

## States

### Hover
```css
hover:bg-zinc-900
hover:text-white
hover:border-zinc-600
hover:bg-zinc-200
```

### Active
```css
bg-white text-black  /* Navigation */
bg-white border-white /* Weekly day */
```

### Disabled
```css
opacity-50
cursor-not-allowed
```

### Loading
```css
animate-pulse
animate-spin
```

## Responsive

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### Mobile Sidebar
```tsx
<div className="fixed inset-0 z-50 xl:hidden">
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
  <div className="absolute left-0 top-0 h-full w-[260px] bg-[#0A0A0A]">
    {/* Sidebar content */}
  </div>
</div>
```

## Best Practices

### Do's ✅
- Use consistent spacing
- Maintain color palette
- Keep borders subtle
- Use proper contrast
- Add hover states
- Show loading states
- Use semantic HTML
- Keep animations subtle

### Don'ts ❌
- Don't use gradients
- Don't mix color schemes
- Don't overuse borders
- Don't use low contrast
- Don't skip hover states
- Don't hide loading states
- Don't use divs for buttons
- Don't overanimate

## Accessibility

### Contrast
- Text on background: 21:1 (AAA)
- Secondary text: 7.5:1 (AA)
- Interactive elements: Clear focus states

### Keyboard
- Tab navigation works
- Enter/Space for buttons
- Escape closes modals

### Screen Readers
- Semantic HTML
- Aria labels where needed
- Alt text for icons (decorative)
