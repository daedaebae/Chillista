# Weather System - Test Plan v2

## Feature Overview
The weather system affects customer behavior, arrival rates, and overall gameplay atmosphere. Weather is randomly set each new day and persists throughout the day.

### Weather Types
- **Sunny**: Increased customer flow, happier customers
- **Rainy**: Decreased customer flow, less patient customers

### Implementation Details
- Weather is randomly determined on new game start (30% chance rainy, 70% sunny)
- Weather persists when loading saved games
- Weather resets randomly each new day
- Visual rain overlay appears on rainy days
- Weather affects customer arrival rate and patience values

## Test Cases

### Test 1: Weather Initialization (New Game)
**Objective**: Verify weather is set correctly when starting a new game

**Steps**:
1. Open the game in a browser
2. Enter a barista name and start a new game
3. Observe the game log and visual display

**Expected Results**:
- ✅ Weather message appears in game log:
  - Rainy: "It's a rainy day... Fewer customers, but cozy vibes." and "Customers seem less patient in the rain."
  - Sunny: "It's a sunny day! Perfect weather for coffee." and "Customers are in a great mood today!"
- ✅ Weather icon in HUD displays appropriate weather
- ✅ If rainy: Rain overlay animation visible on background (opacity ~0.3)
- ✅ If sunny: No overlay, normal background visible

**Success Criteria**: Weather is set and displayed correctly on new game start

---

### Test 2: Weather Persistence (Save/Load)
**Objective**: Verify weather state is preserved when saving and loading

**Steps**:
1. Start a new game
2. Note the current weather (check log messages)
3. Wait a few minutes of game time
4. Open settings menu and click "Save Game"
5. Refresh the page (F5)
6. Game should auto-load

**Expected Results**:
- ✅ Weather state is preserved (same weather as before save)
- ✅ Weather visual effects match saved state
- ✅ No duplicate weather messages on load (weather should not re-initialize)

**Success Criteria**: Weather persists correctly through save/load cycle

---

### Test 3: Rainy Day Effects - Customer Arrival Rate
**Objective**: Verify rainy days reduce customer arrival frequency

**Steps**:
1. Start a new game (or wait for rainy day)
2. If not rainy, wait for end of day and start new day until rainy
3. Note the time when first customer arrives
4. Wait 5-10 minutes of game time
5. Count how many customers arrive
6. Compare to sunny day behavior (if possible)

**Expected Results**:
- ✅ Customers arrive less frequently on rainy days
- ✅ Arrival rate feels noticeably slower (25% chance per minute vs 50% on sunny)
- ✅ Over 10 minutes, should see 2-3 customers on rainy vs 4-5 on sunny (approximate)

**Success Criteria**: Rainy days have measurably lower customer arrival rate

---

### Test 4: Rainy Day Effects - Customer Patience
**Objective**: Verify rainy days reduce customer patience values

**Steps**:
1. Get a rainy day (start new game or wait for new day)
2. Wait for a customer to arrive
3. Check the customer's patience value in the HUD
4. Note the customer type (regular, student, etc.)
5. Compare patience values to expected ranges:
   - Regular: ~120 (instead of ~150)
   - Student: ~56 (instead of ~70)
   - Tourist: ~96 (instead of ~120)
   - Default: ~80 (instead of ~100)

**Expected Results**:
- ✅ Customer patience values are 20% lower than base values
- ✅ Patience meter displays correct reduced value
- ✅ Customers lose patience faster (decay rate unchanged, but lower max)

**Success Criteria**: Rainy day customers have measurably lower patience

---

### Test 5: Sunny Day Effects - Customer Arrival Rate
**Objective**: Verify sunny days increase customer arrival frequency

**Steps**:
1. Start a new game (or wait for sunny day)
2. If not sunny, wait for end of day and start new day until sunny
3. Note the time when first customer arrives
4. Wait 5-10 minutes of game time
5. Count how many customers arrive

**Expected Results**:
- ✅ Customers arrive more frequently on sunny days
- ✅ Arrival rate feels noticeably faster (50% chance per minute vs 25% on rainy)
- ✅ Over 10 minutes, should see 4-5 customers on sunny vs 2-3 on rainy (approximate)

**Success Criteria**: Sunny days have measurably higher customer arrival rate

---

### Test 6: Sunny Day Effects - Customer Patience
**Objective**: Verify sunny days increase customer patience values

**Steps**:
1. Get a sunny day (start new game or wait for new day)
2. Wait for a customer to arrive
3. Check the customer's patience value in the HUD
4. Note the customer type
5. Compare patience values to expected ranges:
   - Regular: ~180 (instead of ~150)
   - Student: ~84 (instead of ~70)
   - Tourist: ~144 (instead of ~120)
   - Default: ~120 (instead of ~100)

**Expected Results**:
- ✅ Customer patience values are 20% higher than base values
- ✅ Patience meter displays correct increased value
- ✅ Customers are more patient overall

**Success Criteria**: Sunny day customers have measurably higher patience

---

### Test 7: Weather Reset on New Day
**Objective**: Verify weather resets randomly each new day

**Steps**:
1. Play through a full day (until 5:00 PM)
2. Note the current weather
3. Click "Start Next Day" on summary screen
4. Observe the new day's weather
5. Repeat 3-4 times to see weather variation

**Expected Results**:
- ✅ Weather changes randomly each new day
- ✅ Weather messages appear in log for new day
- ✅ Visual effects update correctly (rain overlay appears/disappears)
- ✅ Weather icon updates in HUD
- ✅ Both sunny and rainy days should appear over multiple days

**Success Criteria**: Weather resets randomly and correctly each new day

---

### Test 8: Weather Visual Effects
**Objective**: Verify rain overlay animation and visual feedback

**Steps**:
1. Start a new game or wait for rainy day
2. Observe the visual display
3. Check the weather overlay element

**Expected Results**:
- ✅ Rain overlay is visible on rainy days (opacity ~0.3)
- ✅ Overlay covers the background appropriately
- ✅ No overlay on sunny days (opacity 0 or hidden)
- ✅ Weather icon in HUD shows appropriate weather symbol
- ✅ Visual effects don't interfere with gameplay elements

**Success Criteria**: Weather visual effects display correctly and don't obstruct gameplay

---

### Test 9: Weather Impact on Gameplay Balance
**Objective**: Verify weather creates meaningful gameplay variation

**Steps**:
1. Play a full day on rainy weather
2. Note: earnings, customers served, reputation gained
3. Play a full day on sunny weather
4. Compare the two days

**Expected Results**:
- ✅ Rainy days: Lower earnings (fewer customers, lower tips from impatient customers)
- ✅ Sunny days: Higher earnings (more customers, higher tips from patient customers)
- ✅ Weather creates meaningful strategic variation
- ✅ Both weather types are playable and enjoyable

**Success Criteria**: Weather meaningfully affects gameplay outcomes

---

### Test 10: Edge Cases and Error Handling
**Objective**: Verify system handles edge cases gracefully

**Steps**:
1. Test with invalid weather state (if possible via console)
2. Test rapid day transitions
3. Test save/load during weather transitions
4. Test with weather state missing from save data

**Expected Results**:
- ✅ System defaults to 'sunny' if weather state is invalid
- ✅ No crashes or errors in console
- ✅ Game continues to function normally
- ✅ Weather state is always valid

**Success Criteria**: System handles edge cases without breaking

---

## Visual Checklist

### Rainy Day
- [ ] Rain overlay visible on background
- [ ] Weather icon shows rain/cloud symbol
- [ ] Game log shows rainy day messages
- [ ] Customer patience values are reduced
- [ ] Fewer customers arrive

### Sunny Day
- [ ] No rain overlay
- [ ] Weather icon shows sun symbol
- [ ] Game log shows sunny day messages
- [ ] Customer patience values are increased
- [ ] More customers arrive

## Success Criteria Summary

✅ Weather initializes correctly on new game  
✅ Weather persists through save/load  
✅ Rainy days reduce customer arrival rate (25% vs 50%)  
✅ Rainy days reduce customer patience (20% reduction)  
✅ Sunny days increase customer arrival rate (50% vs 25%)  
✅ Sunny days increase customer patience (20% increase)  
✅ Weather resets randomly each new day  
✅ Visual effects display correctly  
✅ Weather creates meaningful gameplay variation  
✅ System handles edge cases gracefully  

## Known Issues

### Current Limitations
- Weather only has two states (sunny/rainy)
- No weather transitions during the day
- Weather probability is hardcoded (30% rainy, 70% sunny)
- No seasonal weather patterns
- Weather doesn't affect brewing mechanics (could add "cold brew on hot days" feature)

### Future Enhancements
- Add cloudy weather state
- Add weather transitions during the day
- Seasonal weather patterns
- Weather-specific customer types
- Weather affects brewing quality (e.g., humidity affects coffee)

## Test Environment

### Recommended Setup
- Modern browser (Chrome, Firefox, Safari, Edge)
- Console open for error checking
- Timer or stopwatch for measuring customer arrival rates
- Note-taking for comparing different weather days

### Test Duration
- Individual tests: 5-15 minutes each
- Full test suite: 1-2 hours
- Regression testing: 30 minutes

## Notes

- Customer arrival rates are probabilistic, so exact counts may vary
- Patience values are calculated with 20% modifier, so exact values may have rounding differences
- Weather effects are subtle but should be noticeable over extended play
- Visual rain overlay may need adjustment based on background image

