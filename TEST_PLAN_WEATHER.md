# Weather Effects Feature - Test Plan

## Feature Overview
Weather now affects customer behavior:
- **Rainy Days**: Fewer customers arrive (25% chance vs 40% base), customers are less patient (20% reduction)
- **Sunny Days**: More customers arrive (50% chance vs 40% base), customers are more patient (20% increase)

## Simple Test Steps

### Test 1: Weather Initialization
1. Open the game in a browser
2. Enter your barista name and start
3. **Expected**: You should see a weather message in the game log (either "It's a rainy day..." or "It's a sunny day...")
4. **Expected**: If rainy, you should see rain animation overlay

### Test 2: Rainy Day Effects
1. If you get a rainy day (or wait for one), observe:
   - **Expected**: Game log shows "Fewer customers, but cozy vibes" and "Customers seem less patient in the rain"
   - **Expected**: Wait 2-3 minutes of game time - customers should arrive less frequently than normal
   - **Expected**: When a customer arrives, check their patience value in the HUD - it should be lower than normal (e.g., a regular customer might show ~120 instead of ~150)

### Test 3: Sunny Day Effects
1. If you get a sunny day (or start a new day to get one), observe:
   - **Expected**: Game log shows "Perfect weather for coffee!" and "Customers are in a great mood today!"
   - **Expected**: Wait 2-3 minutes of game time - customers should arrive more frequently than normal
   - **Expected**: When a customer arrives, check their patience value in the HUD - it should be higher than normal (e.g., a regular customer might show ~180 instead of ~150)

### Test 4: New Day Weather
1. Play until the day ends (5:00 PM)
2. Click "Start Next Day"
3. **Expected**: Weather should be randomly set again (rainy or sunny)
4. **Expected**: Appropriate weather messages appear in the log

## Quick Visual Check
- Rainy days: Look for animated rain overlay on the background
- Sunny days: No overlay, normal background

## Success Criteria
✅ Weather messages appear on game start
✅ Rainy days show visual rain effect
✅ Customer arrival rate feels different between weather types (subjective but noticeable over 5+ minutes)
✅ Customer patience values in HUD reflect weather modifiers
✅ Weather resets randomly each new day

