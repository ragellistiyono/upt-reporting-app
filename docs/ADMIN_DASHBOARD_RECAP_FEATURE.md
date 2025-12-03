# 📊 ADMIN DASHBOARD RECAP VISUALIZATION FEATURE

## Overview

This document describes the new **Recap Visualization** feature added to the Admin Dashboard. This major upgrade shifts the focus from raw data tables to visual analytics, making it easier for administrators to monitor UPT performance at a glance.

---

## 🎯 Features Implemented

### 1. **Target Management System**
- **New Appwrite Collection**: `targets`
- **Purpose**: Admin can set performance targets for each UPT per indicator type
- **Granularity**: Targets are set per Year and Semester
- **UI**: New "🎯 MANAGE TARGETS" button and modal interface

### 2. **Visual Dashboard (Cyberpunk Theme)**
- **3 Summary Cards**:
  - **Realisasi** 🏃‍♂️: Total submissions (filtered)
  - **Target** 🎯: Total targets set (filtered)
  - **Capaian** 🏵️: Achievement percentage (Realisasi / Target * 100%)
  
- **Interactive Bar Chart** (Recharts):
  - **X-Axis**: UPT Names (Malang, Probolinggo, Surabaya, Madiun, Bali, Gresik)
  - **Y-Axis**: Submission count
  - **Bars**: 
    - Purple (dimmed): Target values
    - Cyan: Realisasi (when below target)
    - Green: Realisasi (when target achieved)
  - **Tooltip**: Dark cyberpunk-styled with submission details

### 3. **Collapsible Data Table**
- Table is **hidden by default** (user sees visualization first)
- **Toggle Button**: "⬇️ VIEW DETAILED DATA TABLE" / "⬆️ HIDE DETAILED DATA TABLE"
- Preserves all existing table functionality (sorting, filtering, export)

### 4. **Smart Data Filtering**
- Chart data respects all active filters:
  - UPT Filter
  - Indicator Type Filter
  - Date Range Filter
- Targets shown only for selected indicator (or sum of all if "all" selected)

---

## 🗄️ Database Setup (Appwrite Console)

### Step 1: Create `targets` Collection

1. **Navigate to**: Appwrite Console → Database `db_kinerja_upt`
2. **Click**: "Create Collection"
3. **Collection ID**: `targets`
4. **Collection Name**: `targets`

### Step 2: Add Attributes

| Attribute Name    | Type    | Size | Required | Min | Max | Default |
|-------------------|---------|------|----------|-----|-----|---------|
| `upt_name`        | String  | 100  | ✅       | -   | -   | -       |
| `indicator_type`  | String  | 100  | ✅       | -   | -   | -       |
| `target_value`    | Integer | -    | ✅       | 0   | -   | -       |
| `year`            | Integer | -    | ✅       | -   | -   | -       |
| `semester`        | Integer | -    | ✅       | 1   | 2   | -       |

### Step 3: Create Indexes (Performance Optimization)

**Index 1**: `idx_year_semester`
- Type: Key
- Attributes: `year` (ASC), `semester` (ASC)

**Index 2**: `idx_indicator`
- Type: Key
- Attributes: `indicator_type` (ASC)

### Step 4: Set Permissions

**Collection Permissions**:
- **Create**: Role `users` (any authenticated user)
- **Read**: Role `users` (any authenticated user)
- **Update**: Role `users` (any authenticated user)
- **Delete**: Role `users` (any authenticated user)

> **Note**: In production, you may want to restrict Create/Update/Delete to admin role only.

---

## 📁 Files Created/Modified

### Created Files

1. **`src/components/ManageTargetsModal.tsx`** (300 lines)
   - Modal for setting targets per UPT
   - Auto-loads existing targets when indicator/year/semester selected
   - Batch create/update targets
   - Cyberpunk-themed UI

### Modified Files

1. **`src/lib/constants.ts`**
   - Added `TARGETS: 'targets'` to `APPWRITE_CONFIG.COLLECTIONS`

2. **`src/types/index.ts`** (Added 30 lines)
   - Added `Target` interface
   - Added `TargetFormData` interface

3. **`src/app/admin/page.tsx`** (Major refactor - 250 lines added)
   - Added recharts imports
   - Added `ManageTargetsModal` import
   - Added state: `targets`, `isLoadingTargets`, `showManageTargets`, `showDataTable`
   - Added `fetchTargets` useEffect
   - Added `handleTargetsSuccess` function
   - Added `chartData` calculation (useMemo)
   - Added `totalRealisasi`, `totalTarget`, `capaianPercentage` calculations
   - Added "🎯 MANAGE TARGETS" button
   - Added **Recap Visualization Section** with 3 cards + bar chart
   - Added **Toggle Button** for data table
   - Wrapped table sections with `showDataTable` conditional

4. **`package.json`**
   - Added `recharts` dependency

---

## 🎨 UI/UX Flow

### Before (Old Layout)
```
┌─────────────────────────────────────┐
│  Stats Cards (Total, Active, Month) │
├─────────────────────────────────────┤
│  Instructions Management            │
├─────────────────────────────────────┤
│  Filter Controls                    │
├─────────────────────────────────────┤
│  ⬇️ DATA TABLE (Always Visible)    │
│  [All submissions listed]           │
└─────────────────────────────────────┘
```

### After (New Layout)
```
┌─────────────────────────────────────┐
│  Stats Cards (Total, Active, Month) │
├─────────────────────────────────────┤
│  Instructions Management            │
│  [🎯 MANAGE TARGETS] [➕ CREATE]   │
├─────────────────────────────────────┤
│  📊 RECAP VISUALIZATION (New!)     │
│  ┌───────┬───────┬───────┐         │
│  │Realisasi│Target│Capaian│         │
│  └───────┴───────┴───────┘         │
│  [Bar Chart - UPT Performance]      │
├─────────────────────────────────────┤
│  Filter Controls                    │
├─────────────────────────────────────┤
│  [⬇️ VIEW DETAILED DATA TABLE]     │
├─────────────────────────────────────┤
│  📊 DATA TABLE (Hidden by default)  │
│  (Only shown when toggled)          │
└─────────────────────────────────────┘
```

---

## 🔧 How to Use (Admin Workflow)

### Setting Targets

1. Click **"🎯 MANAGE TARGETS"** button
2. Select **Indicator Type** (e.g., "Publikasi Siaran Pers")
3. Select **Year** (e.g., 2025)
4. Select **Semester** (1 or 2)
5. Enter target values for each UPT:
   - UPT Malang: 48
   - UPT Probolinggo: 36
   - UPT Surabaya: 52
   - etc.
6. Click **"SAVE TARGETS"**

> Targets are automatically loaded if they already exist for the selected period.

### Viewing Performance

1. Use **Filter Controls** to narrow down data:
   - Select specific UPT
   - Select specific Indicator Type
   - Set date range
2. View **Recap Visualization** section:
   - **Realisasi Card**: Shows total submissions matching filters
   - **Target Card**: Shows sum of targets for filtered data
   - **Capaian Card**: Shows achievement percentage
   - **Bar Chart**: Visual comparison per UPT
     - Cyan bars = Below target
     - Green bars = Target achieved
     - Purple background = Target value
3. Click **"⬇️ VIEW DETAILED DATA TABLE"** to see raw data
4. Click **"📥 DOWNLOAD EXCEL"** to export filtered data

---

## 🎨 Cyberpunk Theme Styling

All new components follow the established Cyberpunk theme:

### Colors Used
- **Primary (Blue)**: `#00F0FF` - Chart section, toggle button
- **Secondary (Purple)**: `#BD00FF` - Manage Targets button, Target card, Target bars
- **Success (Green)**: `#39FF14` - Capaian card, bars above target
- **Warning (Pink)**: `#FF00FF` - Unchanged sections

### Visual Effects
- **Glow Shadows**: All cards have neon glow on hover
- **Transitions**: Smooth 300ms transitions on all interactive elements
- **Monospace Font**: All text uses monospace for terminal aesthetic
- **Dark Backgrounds**: `#0A0A1A` (cyber-dark) and `#050510` (cyber-darker)

---

## 📊 Chart Configuration

### Recharts Components Used
- `BarChart`: Main chart container
- `Bar`: Realisasi and Target bars
- `XAxis`: UPT names (angled -45° for readability)
- `YAxis`: Submission count
- `CartesianGrid`: Background grid (subtle)
- `Tooltip`: Dark-themed hover details
- `Legend`: Bar labels
- `Cell`: Individual bar coloring (green if target met, cyan if below)

### Responsive Design
- Chart adapts to container width
- Height fixed at 400px
- Mobile-friendly (collapses to single column)

---

## 🧪 Testing Checklist

### Database Setup
- [ ] Created `targets` collection in Appwrite
- [ ] Added all 5 attributes with correct types
- [ ] Created 2 indexes (year_semester, indicator)
- [ ] Set permissions for authenticated users

### Functionality
- [ ] "🎯 MANAGE TARGETS" button opens modal
- [ ] Modal loads existing targets correctly
- [ ] Can set targets for all UPTs
- [ ] Targets save successfully to Appwrite
- [ ] Chart displays correct data
- [ ] Realisasi card shows accurate count
- [ ] Target card shows sum of targets
- [ ] Capaian card calculates percentage correctly
- [ ] Bars turn green when target is met
- [ ] Filters affect chart data
- [ ] Toggle button shows/hides table
- [ ] Table remains fully functional when visible

### UI/UX
- [ ] All colors match Cyberpunk theme
- [ ] Glow effects work on hover
- [ ] Buttons have scale animations
- [ ] Chart tooltip is readable
- [ ] Mobile responsive (3 cards stack on small screens)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

---

## 🚀 Future Enhancements (Optional)

1. **Historical Comparison**
   - Add dropdown to compare different semesters/years
   - Show trend lines

2. **Export Chart as Image**
   - Add button to download chart as PNG/SVG

3. **Drill-Down Details**
   - Click on bar to filter table to that specific UPT

4. **Target vs Realisasi Alerts**
   - Show notifications when UPTs are falling behind targets

5. **Multi-Indicator View**
   - Stack bars for multiple indicators side-by-side

6. **Admin Target Templates**
   - Save/load target presets for quick setup

---

## 📝 Notes

- **Performance**: Chart re-renders only when `chartData` changes (optimized with `useMemo`)
- **Data Freshness**: Targets are fetched on page load and after each save
- **Semester Auto-Detection**: Modal defaults to current semester based on system date
- **Zero Target Handling**: If no targets are set, Capaian shows 0%
- **Filter Syncing**: Chart always reflects active filters (UPT, Indicator, Date Range)

---

## 🐛 Troubleshooting

### Chart not displaying
- **Check**: Recharts installed? Run `npm install recharts`
- **Check**: Browser console for errors
- **Check**: Data exists in `submissions` collection

### Targets not saving
- **Check**: Appwrite collection `targets` created?
- **Check**: Permissions set correctly?
- **Check**: Network tab in DevTools for API errors

### Capaian showing 0%
- **Normal**: If no targets are set for the selected indicator
- **Action**: Set targets using Manage Targets modal

### TypeScript errors
- **Run**: `npx tsc --noEmit` to see specific errors
- **Common**: Import paths incorrect, missing type definitions

---

## ✅ Success Criteria

This feature is successfully implemented when:

1. ✅ Admin can set targets per UPT via modal
2. ✅ Targets persist in Appwrite database
3. ✅ Chart displays Realisasi vs Target for all UPTs
4. ✅ Summary cards calculate correctly
5. ✅ Bars change color based on target achievement
6. ✅ Filters affect chart data
7. ✅ Data table is hidden by default
8. ✅ Toggle button shows/hides table
9. ✅ All styling follows Cyberpunk theme
10. ✅ No TypeScript compilation errors

---

**Implementation Date**: November 23, 2025  
**Developer**: GitHub Copilot  
**Status**: ✅ Complete  
