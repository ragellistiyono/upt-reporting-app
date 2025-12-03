# 🎨 CYBERPUNK THEME VISUAL GUIDE

## Color Palette

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  BACKGROUND COLORS                                  │
│  ════════════════════                               │
│  ██ cyber-dark      #0A0A1A   Main background       │
│  ██ cyber-darker    #050510   Card backgrounds      │
│  ██ cyber-light     #1A1A2E   Panel headers         │
│                                                     │
│  NEON ACCENT COLORS                                 │
│  ═══════════════════                                │
│  ██ neon-blue       #00F0FF   System/Info           │
│  ██ neon-pink       #FF00FF   Admin theme           │
│  ██ neon-green      #39FF14   UPT theme             │
│  ██ neon-purple     #BD00FF   Additional accent     │
│  ██ neon-orange     #FF6600   Warnings/highlights   │
│                                                     │
│  TEXT COLORS                                        │
│  ═══════════                                        │
│  ██ cyber-text      #E0E0E0   Primary text          │
│  ██ cyber-text-dim  #A0A0A0   Secondary text        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## UI Components Preview

### 🔐 Login Page
```
╔═══════════════════════════════════════════════════════════╗
║  ⚫🟢🔵                SYSTEM_ACCESS.exe                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ╔═══════════════════════════════════╗                   ║
║  ║  UPT REPORTING SYSTEM v2.0.77    ║                   ║
║  ║  PLN INDONESIA - SECURE LOGIN    ║                   ║
║  ╚═══════════════════════════════════╝                   ║
║                                                           ║
║  > INITIALIZING AUTHENTICATION PROTOCOL...                ║
║  > NEURAL INTERFACE: READY                                ║
║  > ENTER CREDENTIALS TO PROCEED                           ║
║                                                           ║
║  > USER_ID:                                               ║
║  [user@system.pln                           ] ← neon blue ║
║                                                           ║
║  > ACCESS_KEY:                                            ║
║  [••••••••                                  ] ← neon pink ║
║                                                           ║
║  ┌──────────────────────────────────────────────┐         ║
║  │  [ INITIATE_CONNECTION ]  ← glowing button  │         ║
║  └──────────────────────────────────────────────┘         ║
║                                                           ║
║  ⬢ SECURED BY APPWRITE QUANTUM ENCRYPTION                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

### 👨‍💼 Admin Dashboard (Pink Theme)
```
╔═══════════════════════════════════════════════════════════╗
║  ⬢  ADMIN DASHBOARD                        [LOGOUT]      ║
║     SYSTEM ADMINISTRATOR // FULL ACCESS                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ║
║  │ 📊 TOTAL    │  │ 👥 ACTIVE   │  │ 📅 THIS     │      ║
║  │ SUBMISSIONS │  │ UPTs        │  │ MONTH       │      ║
║  │     0       │  │     6       │  │     0       │      ║
║  └─────────────┘  └─────────────┘  └─────────────┘      ║
║    (blue glow)     (green glow)     (purple glow)       ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │                                                     │ ║
║  │              🚀                                     │ ║
║  │      ADMIN CONTROL PANEL                           │ ║
║  │                                                     │ ║
║  │  Welcome to the UPT Reporting System...            │ ║
║  │                                                     │ ║
║  │  > Coming soon: Submission table & filters         │ ║
║  │  > Coming soon: User management                    │ ║
║  │                                                     │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ⬢ CYBERPUNK UPT REPORTING SYSTEM v2.0.77                ║
╚═══════════════════════════════════════════════════════════╝
```

---

### 👨‍🔧 UPT Dashboard (Green Theme)
```
╔═══════════════════════════════════════════════════════════╗
║  ⬡  UPT DASHBOARD                          [LOGOUT]      ║
║     UPT MALANG // REPORTER ACCESS                         ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      ║
║  │ 📝 MY       │  │ 📅 THIS     │  │ 📊 LAST     │      ║
║  │ SUBMISSIONS │  │ MONTH       │  │ 7 DAYS      │      ║
║  │     0       │  │     0       │  │     0       │      ║
║  └─────────────┘  └─────────────┘  └─────────────┘      ║
║    (blue glow)     (green glow)     (purple glow)       ║
║                                                           ║
║  ┌──────────────────┐  ┌──────────────────┐             ║
║  │                  │  │                  │             ║
║  │       ➕         │  │       📋         │             ║
║  │  NEW SUBMISSION  │  │   MY REPORTS     │             ║
║  │                  │  │                  │             ║
║  │ [CREATE REPORT]  │  │ [VIEW HISTORY]   │             ║
║  │                  │  │                  │             ║
║  └──────────────────┘  └──────────────────┘             ║
║   (blue glow)           (pink glow)                      ║
║                                                           ║
║  ⬡ CYBERPUNK UPT REPORTING SYSTEM v2.0.77                ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Animation Effects

### Glow Shadows
```css
/* Full Glow (for cards, buttons) */
shadow-glow-blue:   0 0 15px #00F0FF, 0 0 30px #00F0FF
shadow-glow-pink:   0 0 15px #FF00FF, 0 0 30px #FF00FF
shadow-glow-green:  0 0 15px #39FF14, 0 0 30px #39FF14

/* Subtle Glow (for hover states) */
shadow-glow-blue-sm:   0 0 8px #00F0FF
shadow-glow-pink-sm:   0 0 8px #FF00FF
shadow-glow-green-sm:  0 0 8px #39FF14
```

### Hover Effects
```
Normal State:  [BUTTON]
Hover State:   [BUTTON] ← scale(1.02) + glow increase
Active State:  [BUTTON] ← scale(0.98)
```

### Loading Spinner
```
   ╱─╲
  │   │  ← Rotating with neon-blue border
   ╲─╱    border-t-transparent for spinning effect
```

---

## Typography Patterns

### Headers
```
// Terminal-style uppercase with tracking
ADMIN DASHBOARD         ← text-3xl font-mono font-bold tracking-wider
SYSTEM ADMINISTRATOR    ← text-sm font-mono
```

### System Messages
```
> INITIALIZING...          ← text-neon-blue font-mono
> NEURAL INTERFACE: READY  ← text-neon-green font-mono
> ENTER CREDENTIALS        ← text-neon-blue font-mono
```

### Stats/Numbers
```
   0     ← text-4xl font-mono font-bold
Across all UPTs  ← text-sm font-mono text-cyber-text-dim
```

---

## Layout Patterns

### Card Structure
```
┌─────────────────────────────────┐
│  HEADER (border-2 border-neon)  │ ← shadow-glow-sm
├─────────────────────────────────┤
│                                 │
│  BODY (bg-cyber-darker)         │ ← hover:shadow-glow
│                                 │
└─────────────────────────────────┘
```

### Grid Layouts
```
Desktop: grid grid-cols-3 gap-6
Mobile:  grid grid-cols-1 gap-6
```

---

## Interactive States

### Input Focus
```
Default:  border-2 border-cyber-light
Focus:    border-2 border-neon-blue + shadow-glow-blue-sm
```

### Button States
```
Default:   bg-neon-blue text-cyber-dark shadow-glow-blue
Hover:     bg-neon-green shadow-glow-green
Disabled:  bg-cyber-light text-cyber-text-dim (no shadow)
Loading:   [spinner] AUTHENTICATING...
```

### Error Messages
```
┌─────────────────────────────────────────┐
│ ⚠ Invalid credentials                  │ ← bg-red-950/50
│                                         │   border-red-500
└─────────────────────────────────────────┘   shadow-red
```

---

## Background Effects

### Grid Pattern (Body)
```css
background-image: 
  linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
background-size: 50px 50px;
```

### Animated Vertical Lines
```
|  (neon-blue)   ← animate-pulse
   |  (neon-pink)    ← animate-pulse delay-75
      |  (neon-green) ← animate-pulse delay-150
```

### Floating Particles
```
• • • ← Small dots with random positions
  •   ← animate-pulse with random delays
•   • ← opacity-20, bg-neon-blue
```

---

## Icon & Emoji Usage

```
Admin Icons:  ⬢ 📊 👥 📅 🚀
UPT Icons:    ⬡ 📝 ➕ 📋 📊
System Icons: ⚫ 🟢 🔵 ⚠ 🔒 ⬢
```

---

## Responsive Breakpoints

```
Mobile:     < 768px   → Single column, full-width cards
Tablet:     768-1024  → 2 columns
Desktop:    > 1024px  → 3 columns
```

---

## Class Combination Examples

### Glowing Card
```jsx
<div className="bg-cyber-darker border-2 border-neon-blue 
                rounded-lg p-6 shadow-glow-blue-sm 
                hover:shadow-glow-blue transition-all">
```

### Neon Button
```jsx
<button className="bg-neon-blue text-cyber-dark font-mono 
                   font-bold py-3 px-6 rounded 
                   shadow-glow-blue hover:bg-neon-green 
                   hover:shadow-glow-green transition-all 
                   duration-300 transform hover:scale-[1.02]">
```

### Terminal Text
```jsx
<p className="text-neon-blue font-mono text-sm">
  {'>'} SYSTEM MESSAGE
</p>
```

---

## Best Practices ✨

1. **Always pair neon colors with glow shadows**
2. **Use font-mono for all terminal/system text**
3. **Add transition-all duration-300 to interactive elements**
4. **Maintain color consistency**: Admin=Pink, UPT=Green, System=Blue
5. **Use uppercase for headers** (tracking-wider for emphasis)
6. **Include hover states** on all clickable elements
7. **Dark backgrounds** (cyber-dark/darker) for all panels
8. **Grid pattern** on page backgrounds for cyberpunk feel

---

**Ready to code in the cyberpunk aesthetic!** 🎮⚡🌟
