# Possible Features - BaristaSim

## Efficiency Improvements

### Code Architecture Refactoring
**Difficulty**: Medium | **Time**: 6-8 hours | **Priority**: High

Split the 1,881-line `Game.js` monolith into smaller, maintainable modules:
- `BrewingSystem.js` - Handle all brewing workflows (coffee, matcha, espresso)
- `CustomerSystem.js` - Customer generation, patience, interactions
- `EconomySystem.js` - Pricing, earnings, reputation calculations
- `InventorySystem.js` - Resource tracking and low stock logic

**Impact**: Improves code maintainability, testability, and developer experience. Makes future feature additions easier.

---

### Optimize Customer Generation & Dialogue
**Difficulty**: Low | **Time**: 2-3 hours | **Priority**: Medium

Improvements:
- Use configuration-based dialogue system instead of DIALOGUE_DATA.js
- Cache customer types and responses to reduce memory allocation
- Implement object pooling for customer objects

**Impact**: Reduces memory usage, improves dialogue consistency, easier to add new customer types.

---

### Brewing State Machine Optimization
**Difficulty**: Medium | **Time**: 4-5 hours | **Priority**: Medium

Implementation:
- Replace nested switch statements with a state machine pattern
- Use callback-based action handlers
- Create brewingRecipe system for cleaner workflow management

**Impact**: Cleaner code, easier to add new brewing methods, eliminates redundant condition checks.

---

### HUD Update Performance Optimization
**Difficulty**: Easy | **Time**: 1-2 hours | **Priority**: Low

Improvements:
- Only update changed values instead of full DOM reconstruction
- Use data attributes and CSS classes instead of innerHTML for inventory
- Implement debouncing for non-critical updates

**Impact**: Smoother UI performance, especially noticeable on lower-end devices.

---

## Gameplay Enhancements

### Customer Preferences & Repeat Mechanics
**Difficulty**: Easy | **Time**: 2-3 hours | **Priority**: High

Features:
- Track repeat customers and apply discount multipliers (5-10% loyalty bonus)
- Store customer preferences and satisfaction history
- Implement "fan club" system that unlocks at 50+ reputation
- Repeat customers remember previous interactions

**Impact**: Creates long-term engagement, makes relationship building meaningful, increases replay value.

---

### Dynamic Difficulty Through Day Progression
**Difficulty**: Easy | **Time**: 2-3 hours | **Priority**: High

Features:
- Increase customer arrival rate as day progresses (20% more in afternoon)
- Rush hour (12-2 PM) with 50% more impatient customers
- Mid-day weather changes (surprise rain)
- Boss customers at specific times
- Park location becomes busier on sunny days

**Impact**: Makes late-game more engaging, prevents gameplay from feeling repetitive, adds strategic planning.

---

### Brewing Quality Mini-Games
**Difficulty**: Medium | **Time**: 3-4 hours | **Priority**: Medium

Features:
- Add timing windows for each brewing step (click in green zone = bonus quality)
- Randomized quality modifiers based on technique
- Mistake consequences (over-steam milk = drink ruined, -$3 and -reputation)
- Visual feedback showing quality tier (good/great/perfect)

**Impact**: Increases player skill expression, makes brewing engaging rather than tedious, improves replayability.

---

### Unlock New Brewing Methods via Progression
**Difficulty**: Medium | **Time**: 3-4 hours | **Priority**: Medium

New drink types:
- **Drip Coffee** (Rep 5): Cheaper, faster, average satisfaction
- **Latte Art** (Rep 15): Medium cost, requires timing challenge, high satisfaction if perfect
- **Cold Brew** (Rep 25): Slow but high profit margin, patient customers love it
- **Seasonal Drinks** (Rep 40+): Winter spiced latte, summer iced coffee (3-4 variants)

**Impact**: Rewards progression, extends playtime, increases customer variety, makes reputation milestone feel meaningful.

---

### Customer Events & Multi-Day Stories
**Difficulty**: Medium | **Time**: 4-5 hours | **Priority**: Medium

Features:
- Multi-day customer storylines (track customer state across days)
- Story events: dating couple conflicts, job interview prep, proposal moments
- Achievement system: "Serve same customer 5 days" = "Ally" status (permanent discount)
- Dialogue branches that affect future visits
- Special events: customer orders double drink, group arrivals

**Impact**: Adds narrative depth, emotional investment, makes each customer feel unique and memorable.

---

### Combo System with Visual Feedback
**Difficulty**: Easy | **Time**: 2-3 hours | **Priority**: High

Features:
- Chain multiplier: Perfect service on 3+ customers = 1.25x tips for next customer
- Visible combo counter on screen (displays "3x Combo" when active)
- Screen glow and particle effects when combo active
- Break combo on mistakes: wrong drink, slow service, or customer leaves unhappy
- Combo achievements ("5x Combo Master", "10x Combo Legendary")

**Impact**: Creates tension and reward moments, increases engagement during gameplay, adds visual satisfaction.

---

### Resources Have Meaningful Impact
**Difficulty**: Medium | **Time**: 3-4 hours | **Priority**: Medium

Features:
- Premium beans visibly improve drink quality (customer satisfaction +15%)
- Water quality affects foam quality (affects espresso satisfaction)
- Bean freshness degrades over time (older beans = lower satisfaction)
- Seasonal inventory with limited-edition roasts
- Different bean origins have different flavor profiles

**Impact**: Adds strategic resource management layer, makes purchasing decisions meaningful, increases economic depth.

---

### Multi-Day Campaign Mode
**Difficulty**: Medium | **Time**: 3-4 hours | **Priority**: Low

Features:
- Week-long campaigns with specific goals ("Earn $500", "Serve 50 customers")
- Leaderboard system tracking best daily earnings per week
- Prestige/New Game+ system (reset progress for bonus multiplier)
- Multiple save slots for different strategies and playstyles
- Campaign completion rewards (cosmetics, achievements)

**Impact**: Increases replayability, gives long-term goals beyond single day, encourages experimentation.

---

### Expanded Visual & Audio Feedback
**Difficulty**: Easy | **Time**: 2-3 hours | **Priority**: Low

Features:
- Brewing-specific sound effects:
  - Grinder whirl sound (different for fast grinder)
  - Water pour splash
  - Steam hiss and milk whipping sound
- Customer mood animations:
  - Happy dance when served quickly
  - Impatient foot tap as patience decreases
  - Sad slouch when disappointed
- Drink quality visual indicators (color saturation/glow)
- Combo counter animation (scales up when extended)

**Impact**: Makes game feel more responsive and alive, improves audio atmosphere, better player feedback.

---

### Upgrade Synergies System
**Difficulty**: Medium | **Time**: 2-3 hours | **Priority**: Low

Features:
- Fast Grinder + Premium Beans = unlocks "Express Specialty" drinks (faster brewing)
- Espresso Machine + Matcha Set = unlock "Fusion" drink options
- Decorations unlock based on reputation milestones (achievement system)
- Decorations provide compound benefits (plant + cozy music = +20% customer patience)
- Equipment combos provide unique perks

**Impact**: Makes upgrade purchasing strategic, creates interesting synergies, rewards exploration.

---

## Implementation Priority Matrix

### Quick Wins (Highest Impact, Lowest Effort)
1. **Combo System with Visual Feedback** - 2-3 hrs, immediate engagement spike
2. **Customer Preferences & Repeat Mechanics** - 2-3 hrs, builds loyalty
3. **Dynamic Difficulty Through Day Progression** - 2-3 hrs, prevents staleness
4. **Expanded Visual & Audio Feedback** - 2-3 hrs, improves feel

### Medium Effort (High Impact)
5. **Brewing Quality Mini-Games** - 3-4 hrs, increases skill expression
6. **Unlock New Brewing Methods** - 3-4 hrs, extends playtime
7. **Customer Events & Stories** - 4-5 hrs, adds narrative depth
8. **Resources Have Meaningful Impact** - 3-4 hrs, deepens strategy

### Long-term Investments (Foundation)
9. **Code Architecture Refactoring** - 6-8 hrs, improves maintainability
10. **Brewing State Machine Optimization** - 4-5 hrs, enables future features
11. **Multi-Day Campaign Mode** - 3-4 hrs, extends game lifespan
12. **Upgrade Synergies System** - 2-3 hrs, increases strategy depth

### Polish (Lower Priority)
13. **Optimize Customer Generation & Dialogue** - 2-3 hrs, technical debt
14. **HUD Update Performance Optimization** - 1-2 hrs, performance polish

---

## Estimated Development Timeline

- **Week 1** (Full Sprint): Quick Wins + Brewing Mini-Games = ~10-15 hours
- **Week 2**: New Brewing Methods + Customer Stories = ~8-10 hours  
- **Week 3**: Code Refactoring + State Machine = ~10-12 hours
- **Week 4**: Campaign Mode + Synergies + Polish = ~8-10 hours

**Total**: 36-47 hours of development for complete feature set

---

## Recommended Starting Point

**Start with**: Combo System + Dynamic Difficulty + Repeat Customers

These three features can be implemented in parallel over 6-8 hours and will:
- Immediately improve engagement (combo provides instant feedback)
- Prevent gameplay staleness (dynamic difficulty)
- Create long-term retention (repeat customers = reasons to replay)

Then follow with Brewing Mini-Games for skill expression, making the core loop more engaging.
