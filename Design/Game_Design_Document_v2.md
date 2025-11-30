# Chillista - Game Design Document v2

## Overview
Chillista is a chill, coffee shop simulator game where players manage a coffee shop, brew drinks using multiple methods, and interact with diverse customers. The game features a relaxing atmosphere with 8-bit pixel art aesthetics and simple mechanics.

## Current Implementation Status

### Core Gameplay Systems

#### Brewing System
- **Three Brewing Methods**:
  - **AeroPress Coffee**: Grind → Add Water → Stir → Plunge → Serve
  - **Matcha**: Sift → Add Water → Whisk → Serve (requires Matcha Set upgrade)
  - **Espresso**: Grind → Tamp → Pull Shot → Steam Milk → Pour → Serve (requires Espresso Machine upgrade)
- **Bean Types**: Standard and Premium beans affect drink quality and pricing
- **Resource Consumption**: Tracks usage of beans, water, milk, matcha powder, cups, and filters
- **Quality System**: Drink quality affects customer satisfaction and earnings

#### Customer System
- **Customer Types**:
  - **Default**: Average customer with standard patience
  - **Student**: Impatient (70 patience) but appreciates encouragement
  - **Hipster**: Likes matcha and artisanal vibes (higher satisfaction from matcha), gives lower tips and higher reputation impact
  - **Tourist**:Patient (110% patience) and tips well, but rarer occurence
  - **Regular**: Very patient (120% patience), loyal customer, high reputation impact, occurs most often. Any customer that is not a critic or tourist can become a regular if the service is good and the right dialogue options are selected.
  - **Critic**: Low patience (50) but significant reputation impact (±5 rep)
- **Customer Attributes**:
  - Patience meter (decays over time)
  - Satisfaction meter (0-100, affects tips and reputation)
  - Dialogue preferences
  - Order preferences (coffee, matcha latte, espresso)
- **Patience Decay**: Customers lose patience over time, affected by weather and location
- **Customer Arrival**: Random arrival system based on weather conditions

#### Economy & Progression
- **Starting Cash**: $50.00
- **Earning System**: Base price + quality multiplier + patience bonus + tips
- **Reputation System**: 
  - Earned through good service and dialogue choices
  - Unlocks new locations (Park at 20 rep)
  - Affects customer behavior and special events
- **Daily Cycle**: 8:00 AM to 5:00 PM (540 minutes)
- **Day Summary**: Shows earnings, customers served, and tips earned

#### Inventory Management
- **Resources**:
  - Beans (Standard: 500g, Premium: 200g)
  - Matcha Powder (0g, must purchase)
  - Water (1000ml)
  - Milk (500ml)
  - Cups (50)
  - Filters (50)
- **Resource Tracking**: Usage tracking per customer (partially implemented)
- **Low Stock Warnings**: Visual indicators when resources are low
- **Shopping Suggestions**: Basic suggestions for restocking

#### Shop System
- **Purchasable Items**:
  - Standard Beans: $0.05/g (100g for $5)
  - Premium Beans: $0.10/g (100g for $10)
  - Matcha Powder: $0.20/g (50g for $10)
  - Milk: $0.02/ml (200ml for $4)
  - Water: $0.004/ml (500ml for $2)
  - Cups: $0.10/cup (50 pack for $5)
  - Filters: $0.05/filter (50 pack for $2.50)
- **Upgrades**:
  - Fast Grinder: $50 (instant grind, visual feedback)
  - Matcha Set: $100 (unlocks matcha brewing)
  - Espresso Machine: $250 (unlocks espresso brewing)
- **Decorations**:
  - Potted Plant: $20 (reduces customer patience decay by 20%)

#### Location System
- **Cart**: Starting location, standard gameplay
- **City Park**: Unlocked at 20 reputation, rush hour mode (customers more impatient)
- **Map Screen**: Navigation between locations
- **Shop**: Supply shop accessible from map

#### Weather System
- **Weather Types**: Sunny and Rainy
- **Effects**:
  - **Sunny**: 50% customer arrival rate, +20% customer patience
  - **Rainy**: 25% customer arrival rate, -20% customer patience
- **Visual Effects**: Rain overlay animation on rainy days
- **Randomization**: Weather randomly set each new day

#### Dialogue System
- **Customer-Specific Dialogue**: Each customer type has unique greetings and response options
- **Dialogue Choices**: Multiple conversation options with different effects
- **Effects**:
  - Reputation changes
  - Patience adjustments
  - Satisfaction changes
  - Tips
  - Upsell opportunities
  - Custom actions (refill offers, photo ops, music compliments)
- **Satisfaction Feedback**: Visual emoji indicators based on satisfaction level

#### UI/UX Features
- **8-Bit Aesthetic**: Pixel art visuals and VT323 font
- **HUD Elements**:
  - Player name display
  - Time display (12-hour format)
  - Cash display
  - Reputation display
  - Expandable inventory panel (Pantry)
  - Weather indicator
  - Customer info panel (patience and satisfaction meters)
- **Dark Mode**: Unlocked after serving 3 customers, toggleable theme
- **UI Scaling**: Adjustable from 75% to 150%
- **Diegetic Menus**: Settings presented as in-world coffee menu
- **Screen Management**: Multiple screens (cart, map, shop, park, summary)

#### Audio System
- **Background Music**: Lo-fi playlist with multiple tracks
- **Music Controls**: Toggle, volume control, next track
- **Sound Effects**: Action sounds, success chimes, error sounds
- **SFX Volume**: Separate volume control

#### Save System
- **Auto-Save**: Every 30 seconds (when menu is closed)
- **Manual Save**: Available in settings menu
- **Save Data**: Stored in LocalStorage
- **Reset Function**: Confirmation modal before resetting progress

#### Random Events
- **Butterfingers**: Drop a cup (-1 cup)
- **Spill**: Spill milk (-50ml milk)
- **Grinder Jam**: Pay $5 to fix or waste 10 minutes

### Technical Implementation

#### Architecture
- **Stack**: Vanilla HTML/CSS/JavaScript (ES6 modules)
- **State Management**: Centralized `game.state` object
- **Module Structure**:
  - `Game.js`: Main game logic and state management
  - `DialogueSystem.js`: Dialogue display and management
  - `AudioSystem.js`: Music and sound effect handling
- **Persistence**: LocalStorage for save data
- **No External Dependencies**: Pure vanilla JS implementation

#### Code Organization
- `/js/main.js`: Entry point
- `/js/modules/`: Core game modules
- `/js/data/`: Data files (dialogue data)
- `/css/`: Stylesheet
- `/assets/`: Images, audio files

## Planned Features & Improvements


### Immediate Priorities (Phase 3)

#### Recipe Expansion
- **Latte Art**: Visual quality indicator for espresso drinks
- **Seasonal Drinks**: Special recipes available during certain times/seasons
- **Custom Recipes**: Player-created drink combinations
- **Drink Quality Tiers**: More granular quality system (poor/fair/good/excellent)

#### Staff Management
- **Hire Help**: 
  - Hire baristas to serve customers automatically
  - Manage staff schedules
  - Staff performance affects reputation
- **Training System**: Improve staff efficiency over time
- **Multi-Location Management**: Manage multiple carts/locations

#### Customization
- **Cart Decoration**: 
  - More decoration options (lights, signs, furniture)
  - Decoration effects on customer mood
  - Themed decoration sets
- **Cart Upgrades**: 
  - Larger cart capacity
  - Better equipment placement
  - Visual customization options

#### Events & Special Occasions
- **Festivals**: Special events with increased customer flow
- **Rush Hours**: Scheduled busy periods
- **Special Customers**: 
  - Celebrity visits
  - Food critic reviews
  - Regular customer milestones
- **Weather Events**: 
  - Storms (very low customer flow)
  - Perfect weather days (bonus reputation)
  - Seasonal weather patterns

#### Advanced Systems
- **Achievement System**: Unlock achievements for milestones
- **Statistics Tracking**: 
  - Lifetime statistics
  - Best day records
  - Customer relationship history
- **Social Features**: 
  - Share daily summaries
  - Compare stats with friends
- **Tutorial System**: 
  - Interactive tutorial for new players
  - Tips and hints system
  - Advanced technique guides

## Design Principles

### Core Philosophy
- **Chill & Relaxing**: Game should feel stress-free and cozy
- **Simple but Deep**: Easy to learn, room for mastery
- **Player Agency**: Meaningful choices affect outcomes
- **Visual Feedback**: Clear indicators for all game states

### UX Guidelines
- **Accessibility**: UI scaling, clear visual indicators
- **Mobile-Friendly**: Responsive design for all screen sizes
- **Diegetic Design**: UI elements feel part of the game world
- **Feedback**: Every action should have clear visual/audio feedback

### Technical Guidelines
- **Performance**: Smooth 60fps gameplay
- **Compatibility**: Works on modern browsers
- **Maintainability**: Clean, modular code structure
- **Extensibility**: Easy to add new features and content

## Known Issues & Technical Debt

### Current Limitations
- Resource usage tracking is partially implemented
- Shopping suggestions are basic (hardcoded thresholds)
- Inventory display shows incorrect keys (coffee_beans vs beans_standard)
- Some customer types have limited dialogue variety
- Weather system only has two states (sunny/rainy)

### Areas for Refactoring
- Consolidate inventory key naming
- Improve resource tracking data structure
- Enhance error handling and edge cases
- Optimize save/load performance
- Add input validation for all user actions

## Version History

### v2.0 (Current)
- Added weather system with visual effects
- Implemented satisfaction meter system
- Added dark mode unlock system
- Enhanced dialogue system with customer-specific responses
- Improved inventory management UI
- Added resource usage tracking foundation
- Multiple brewing methods (coffee, matcha, espresso)
- Location system (cart, park, shop)
- Random events system

### v1.0 (Resolved)
- Basic brewing system
- Customer system
- Economy and reputation
- Save/load system
- Audio system

