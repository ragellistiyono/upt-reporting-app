# 📋 UPT HISTORY PAGE - VISUAL PREVIEW

## Page Layout Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  [←]  MY SUBMISSION HISTORY                      user@pln.com  [X]│  │
│  │       UPT MALANG // REPORT ARCHIVE                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  SUBMISSION RECORDS                             Total: 5 records   │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  DATE    INDICATOR TYPE        SUB-CATEGORY   TITLE      DOCS     │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  18 Nov  [PUBLIKASI SIARAN...]     —          PLN Ber... View Link│  │
│  │  17 Nov  [INFLUENCER DAN SMR] [INFLUENCER]    Kampanye... View Link│
│  │  15 Nov  [PRODUKSI KONTEN]         —          Video ...  —        │  │
│  │  10 Nov  [KONTEN IN-CHANGE]        —          Artikel... View Link│  │
│  │  05 Nov  [KONTEN WAG]              —          Poster...  —        │  │
│  ├────────────────────────────────────────────────────────────────────┤  │
│  │  > Showing all 5 submissions          [BACK TO DASHBOARD]         │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ⬡ CYBERPUNK UPT REPORTING SYSTEM v2.0.77                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Color Coding Guide

### Header Section
```
╔════════════════════════════════════════════════════════════╗
║ COLOR: bg-cyber-light (#1A1A2E)                           ║
║ BORDER: border-neon-green (#39FF14) - 2px                 ║
║ SHADOW: shadow-glow-green-sm                              ║
╚════════════════════════════════════════════════════════════╝

[←] Back Button
    bg-cyber-dark with border-neon-green
    Hover: bg-neon-green with text-cyber-dark

TITLE: "MY SUBMISSION HISTORY"
    text-neon-green, font-mono, font-bold, tracking-wider

SUBTITLE: "UPT MALANG // REPORT ARCHIVE"
    text-cyber-text-dim, font-mono
```

### Table Header
```
╔════════════════════════════════════════════════════════════╗
║ COLOR: bg-cyber-light (#1A1A2E)                           ║
║ BORDER-BOTTOM: border-neon-green (#39FF14) - 2px          ║
╚════════════════════════════════════════════════════════════╝

"SUBMISSION RECORDS"
    text-neon-green, font-mono, font-bold

"Total: X records"
    text-cyber-text-dim with highlighted count in text-neon-green
```

### Table Columns
```
┌──────────────────────────────────────────────────┐
│ Column Headers                                   │
│ ────────────────────────────────────────────────│
│ text-neon-green (#39FF14)                       │
│ font-mono, font-bold, text-sm                   │
│ border-bottom: border-neon-green/30             │
└──────────────────────────────────────────────────┘

Columns:
1. DATE         → 100px width
2. INDICATOR    → 200px width
3. SUB-CATEGORY → 150px width
4. TITLE        → Flexible (max-w-md, truncate)
5. DOCUMENTATION → 120px width
```

### Table Rows
```
┌──────────────────────────────────────────────────┐
│ Even Rows (0, 2, 4...)                          │
│ bg-cyber-darker (#050510)                       │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Odd Rows (1, 3, 5...)                           │
│ bg-cyber-dark/50 (#0A0A1A with 50% opacity)     │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Hover State (any row)                           │
│ bg-cyber-light/50                               │
│ transition-colors                               │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│ Row Borders                                     │
│ border-bottom: border-neon-green/10             │
└──────────────────────────────────────────────────┘
```

---

## Interactive Elements Detail

### 1. Date Cell
```
┌──────────────┐
│  18 Nov 2024 │ ← text-cyber-text, font-mono, text-sm
└──────────────┘
```

### 2. Indicator Type Badge
```
┌─────────────────────────┐
│ PUBLIKASI SIARAN PERS   │ ← bg-neon-green/20
│                         │   border-neon-green/50
│                         │   text-neon-green, text-xs
└─────────────────────────┘
```

### 3. Sub-Category Badge (Conditional)
```
IF indicator_type === 'INFLUENCER DAN SMR':
  ┌─────────────┐
  │ INFLUENCER  │ ← bg-neon-blue/20
  │             │   border-neon-blue/50
  │             │   text-neon-blue, text-xs
  └─────────────┘

ELSE:
  —  ← text-cyber-text-dim, text-xs
```

### 4. Title Cell (Truncated)
```
┌─────────────────────────────────────┐
│ PLN Berhasil Menyelesaikan Pr...   │ ← text-cyber-text
│                                     │   font-mono, text-sm
│ (Full text on hover via title attr)│   truncate, max-w-md
└─────────────────────────────────────┘
```

### 5. Documentation Link
```
IF documentation_link exists:
  ┌───────────┐
  │ View Link │ ← text-neon-blue
  │           │   hover:text-neon-green
  │           │   underline
  │           │   Opens in new tab (target="_blank")
  └───────────┘

ELSE:
  —  ← text-cyber-text-dim, text-xs
```

---

## State Variations

### 🔄 Loading State
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    ╱─╲                                   │
│                   │   │  ← Spinning loader              │
│                    ╲─╱     border-neon-green            │
│                                                          │
│        FETCHING SUBMISSION RECORDS...                    │
│        (text-neon-green, font-mono, text-lg)            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 📭 Empty State
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                ┌───────────┐                             │
│                │           │                             │
│                │     📋    │ ← Large icon (text-6xl)     │
│                │           │   in bordered box           │
│                └───────────┘                             │
│                                                          │
│             NO SUBMISSIONS YET                           │
│        (text-neon-green, text-2xl, font-bold)           │
│                                                          │
│   > You haven't submitted any reports yet.               │
│        (text-cyber-text-dim, font-mono)                 │
│                                                          │
│      ┌──────────────────────┐                           │
│      │ CREATE FIRST REPORT  │ ← Neon green button       │
│      └──────────────────────┘                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### ✅ Data State
```
┌──────────────────────────────────────────────────────────┐
│  SUBMISSION RECORDS              Total: 5 records        │
├──────────────────────────────────────────────────────────┤
│  [Full table with data as shown in main preview]        │
├──────────────────────────────────────────────────────────┤
│  > Showing all 5 submissions    [BACK TO DASHBOARD]     │
└──────────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

### Desktop (> 1024px)
- Full table with all columns visible
- Comfortable padding (p-4 on cells)
- Max width: 7xl (1280px) centered

### Tablet (768px - 1024px)
- Table scrolls horizontally (overflow-x-auto)
- Reduced padding (p-3 on cells)
- Back button and logout remain in header

### Mobile (< 768px)
- Full horizontal scroll for table
- Header stacks vertically
- Minimal padding (p-2 on cells)
- Footer buttons stack vertically

---

## Animation & Transitions

### Row Hover Animation
```css
/* Default */
background-color: cyber-darker (or alternating)
transition: colors

/* Hover */
background-color: cyber-light/50
transition-duration: 150ms
cursor: pointer
```

### Link Hover Animation
```css
/* Default */
color: neon-blue (#00F0FF)
text-decoration: underline

/* Hover */
color: neon-green (#39FF14)
transition-duration: 200ms
```

### Button Hover Animation
```css
/* Default */
background-color: neon-green
color: cyber-dark
box-shadow: shadow-glow-green-sm

/* Hover */
background-color: neon-blue
box-shadow: shadow-glow-blue
transform: scale(1.02)
transition: all 300ms

/* Active */
transform: scale(0.98)
```

---

## Accessibility Features

### Keyboard Navigation
- ✅ Tab order: Back button → Logout → Documentation links → Footer buttons
- ✅ Enter key activates links/buttons
- ✅ Esc key (future: close modals)

### Screen Reader Support
- ✅ Table has semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- ✅ Column headers use `<th>` tags
- ✅ Links have descriptive text ("View Link" + context from row)
- ✅ Empty state has clear message

### Color Contrast
- ✅ Text on dark background meets WCAG AA standard
- ✅ Neon green (#39FF14) on dark (#050510) = High contrast
- ✅ Links underlined for non-color identification

---

## Data Examples

### Example Row 1 (Full Data)
```
┌─────────┬─────────────────────┬─────────────┬─────────────┬──────────┐
│ 18 Nov  │ [PUBLIKASI SIARAN   │     —       │ PLN Ber...  │ View Link│
│ 2024    │  PERS]              │             │             │          │
└─────────┴─────────────────────┴─────────────┴─────────────┴──────────┘
```

### Example Row 2 (With Sub-Category)
```
┌─────────┬─────────────────────┬─────────────┬─────────────┬──────────┐
│ 17 Nov  │ [INFLUENCER DAN SMR]│[INFLUENCER] │ Kampanye... │ View Link│
│ 2024    │                     │             │             │          │
└─────────┴─────────────────────┴─────────────┴─────────────┴──────────┘
```

### Example Row 3 (No Documentation)
```
┌─────────┬─────────────────────┬─────────────┬─────────────┬──────────┐
│ 15 Nov  │ [PRODUKSI KONTEN]   │     —       │ Video Tu... │    —     │
│ 2024    │                     │             │             │          │
└─────────┴─────────────────────┴─────────────┴─────────────┴──────────┘
```

---

## Footer Section
```
┌──────────────────────────────────────────────────────────┐
│  > Showing all 5 submissions                             │
│  (text-cyber-text-dim, font-mono, text-sm)              │
│                                                          │
│                           [BACK TO DASHBOARD]            │
│                           bg-neon-green                  │
│                           shadow-glow-green-sm           │
│                           hover:bg-neon-blue             │
└──────────────────────────────────────────────────────────┘
```

---

## Complete Component Hierarchy

```
UPTHistoryPage
├── Loading State Check (if isLoading)
│   └── Centered Spinner
│
├── Role Verification (if role !== 'uptuser')
│   └── Redirect to /login
│
└── Main Layout (if authenticated)
    ├── Header Section
    │   ├── Back Button (Link to /upt)
    │   ├── Page Title
    │   ├── Page Subtitle
    │   ├── User Info
    │   └── Logout Button
    │
    ├── Content Section (Conditional Rendering)
    │   ├── Data Loading State (if isLoadingData)
    │   │   └── Spinner + Message
    │   │
    │   ├── Empty State (if !isLoadingData && submissions.length === 0)
    │   │   ├── Icon
    │   │   ├── Title
    │   │   ├── Message
    │   │   └── "Create First Report" Button
    │   │
    │   └── Data Table (if !isLoadingData && submissions.length > 0)
    │       ├── Table Header (title + count)
    │       ├── Table Element
    │       │   ├── <thead> (column headers)
    │       │   └── <tbody> (data rows)
    │       │       └── Map over submissions
    │       │           ├── Date Cell
    │       │           ├── Indicator Badge Cell
    │       │           ├── Sub-Category Cell (conditional)
    │       │           ├── Title Cell (truncated)
    │       │           └── Documentation Link Cell
    │       └── Table Footer (count + back button)
    │
    └── Page Footer
        └── System Version Info
```

---

## Performance Considerations

### Data Fetching
- ✅ Fetches only user's own submissions via `Query.equal('submitted_by_user', user.$id)`
- ✅ Ordered by creation date (newest first) via `Query.orderDesc('$createdAt')`
- ✅ Cached by React state (no re-fetch on re-render)
- ✅ Loading state prevents layout shift

### Rendering Optimization
- ✅ Conditional rendering reduces unnecessary DOM nodes
- ✅ Map with stable keys (using `submission.$id`)
- ✅ Truncated titles prevent excessive cell width
- ✅ Hover effects use CSS (no JavaScript)

### Accessibility
- ✅ Semantic HTML reduces screen reader processing
- ✅ Title attributes provide full text without expanding cells
- ✅ Links open in new tab (preserves user session)

---

## Testing Scenarios

### Scenario 1: First Time User
1. Login as new UPT user (no submissions)
2. Navigate to /upt/history
3. **Expected**: Empty state with "CREATE FIRST REPORT" button
4. Click button → Redirects to /upt/submit-report

### Scenario 2: User with Data
1. Login as UPT user with 5+ submissions
2. Navigate to /upt/history
3. **Expected**: 
   - Loading spinner appears briefly
   - Table loads with all submissions
   - Newest submission at top
   - All columns populated correctly

### Scenario 3: Link Interactions
1. On history page with data
2. Hover over documentation link
3. **Expected**: Color changes neon-blue → neon-green
4. Click link
5. **Expected**: Opens in new tab, preserves current page

### Scenario 4: Navigation Flow
1. From UPT dashboard, click "VIEW HISTORY"
2. **Expected**: Lands on /upt/history
3. Click back arrow (←) in header
4. **Expected**: Returns to /upt dashboard
5. Navigate back to history
6. Click "BACK TO DASHBOARD" footer button
7. **Expected**: Returns to /upt dashboard

---

## Summary

**Page**: `/upt/history`  
**Purpose**: Display user's submission history in cyberpunk-themed table  
**States**: 3 (Loading, Empty, Data)  
**Theme**: Cyberpunk Green (#39FF14)  
**Data Source**: Appwrite `submissions` collection filtered by `submitted_by_user`  
**Navigation**: Bi-directional with dashboard (back arrow + footer button)  
**Responsive**: Full table on desktop, horizontal scroll on mobile  

**Status**: ✅ Fully Functional | Zero Errors | Theme Compliant
