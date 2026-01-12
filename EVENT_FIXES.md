# Event System Issues - Diagnosis & Fixes

## Problems Identified

### 1. Actor Lifecycle Events Not Fully Persisted ❌
**Issue**: Actor `skill` and `salary` changes from lifecycle events (marriage, scandal, awards) are NOT being saved to database
**Location**: `App.tsx` lines 475-480
**Current**: Only saves `reputation`, `status`, `tier`, `gossip`
**Missing**: `skill`, `salary`, `age`

### 2. Event Sorting in Variety ❌  
**Issue**: Events not sorted chronologically in MagazineWindow
**Location**: `components/MagazineWindow.tsx` lines 37-56
**Current**: No sorting by year/month/created_at
**Fix**: Add proper sort by year DESC, month DESC, created_at DESC

### 3. Production Events Show Wrong Phase ❌
**Issue**: Production events say "entered Marketing" when film is already Released
**Root Cause**: Events use `movie.status` AFTER it has changed
**Location**: `App.tsx` lines 653-662
**Fix**: Generate events BEFORE changing phase, or use previous phase in message

### 4. Events Not Including All Required Fields
**Issue**: Some events missing month/year when created
**Fix**: Ensure ALL event creation includes `month: clock.month, year: clock.year`

## Fixes to Apply

### Fix 1: Update Actor Persistence (App.tsx)
```typescript
// Line 475-480: Add skill, salary, age to updates
await supabase.from("actors").update({
    reputation: actor.reputation,
    status: actor.status,
    tier: actor.tier,
    skill: actor.skill,
    salary: actor.salary,
    age: actor.age,
    gossip: actor.gossip
}).eq("id", actor.id);

// Line 465-470: Add to change detection
return (
    oldActor.reputation !== newActor.reputation || 
    oldActor.status !== newActor.status ||
    oldActor.tier !== newActor.tier ||
    oldActor.skill !== newActor.skill ||
    oldActor.salary !== newActor.salary ||
    oldActor.age !== newActor.age ||
    JSON.stringify(oldActor.gossip) !== JSON.stringify(newActor.gossip)
);
```

### Fix 2: Sort Events Chronologically (MagazineWindow.tsx)
```typescript
// After line 50, add sorting:
filtered = filtered.sort((a, b) => {
  // Sort by year first (most recent first)
  if (state.year !== (b.month ? state.year : 0)) {
    return state.year - (b.month ? state.year : 0);
  }
  // Then by month (most recent first)
  if (a.month !== b.month) {
    return (b.month || 0) - (a.month || 0);
  }
  // Finally by id (newer ids are higher)
  return b.id.localeCompare(a.id);
});
```

### Fix 3: Fix Production Phase Events (App.tsx)
```typescript
// Line 655: Store old status BEFORE changing it
const previousPhase = movie.status;

// Then after phase change:
if (phaseChanged && !released) {
  newEvents.push({
    id: `phase-${movie.id}-${clock.month}`,
    month: clock.month,
    year: clock.year, // ADD THIS
    type: "INFO",
    message: `"${movie.title}" has completed ${previousPhase} and entered ${movie.status} phase.`,
    read: false,
  });
}
```

## Implementation Priority
1. **URGENT**: Fix actor persistence (skill, salary, age)
2. **URGENT**: Sort events chronologically
3. **HIGH**: Fix production phase messages
