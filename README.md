# Chillista

A cozy 8-bit coffee cart simulation game where you brew coffee, chat with customers, and build your reputation.

![Chillista Screenshot](assets/pixel_cafe_bg.png)

## Features

- **Mobile Friendly**: Fully responsive design for playing on the go
- **Dynamic Interface**: Smooth animations and interactive elements
- **Cozy Gameplay**: Manage your coffee cart from 8 AM to 5 PM
- **Multiple Brewing Methods**: AeroPress coffee, Matcha, and Espresso
- **Customer Interactions**: Engage with diverse customer types through dialogue choices
- **Reputation System**: Build your reputation to unlock new locations
- **Music Playlist**: Relaxing lo-fi tracks with manual track skipping
- **Upgrades**: Purchase equipment and decorations to improve your cart
- **Save System**: Auto-saves your progress every 30 seconds

## Live Demo
Play the game online: [https://daedaebae.github.io/Chillista/](https://daedaebae.github.io/Chillista/)

## How to Run Locally

Due to browser CORS policies, you need to run a local server instead of opening the HTML file directly.

### Option 1: Use Python's built-in server
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 2: Use Node.js http-server
```bash
npx http-server -p 8000 -c-1
```
Then open http://localhost:8000 in your browser.

## How to Play

1. Start the local server (see above)
2. Open http://localhost:8000 in your browser
3. Enter your barista name
4. Serve customers by brewing their orders
5. Talk to customers to build relationships and earn tips
6. Visit the shop to buy supplies and upgrades
7. Unlock new locations as your reputation grows

## Brewing Controls

### Coffee (AeroPress)
1. **Grind** - Grind coffee beans
2. **Water** - Add hot water
3. **Stir** - Mix the coffee
4. **Plunge** - Press down the plunger
5. **Serve** - Serve to customer

### Matcha
1. **Sift** - Sift matcha powder
2. **Water** - Add hot water
3. **Whisk** - Whisk to perfection
4. **Serve** - Serve to customer

### Espresso (Requires upgrade)
1. **Grind** - Grind espresso beans
2. **Tamp** - Tamp the grounds
3. **Pull** - Pull the espresso shot
4. **Steam** - Steam milk (optional)
5. **Pour** - Pour milk for latte art
6. **Serve** - Serve to customer

## Customer Types

- **Student**: Impatient but appreciates encouragement
- **Hipster**: Loves artisanal coffee and good vibes
- **Tourist**: Patient and tips well
- **Regular**: Loyal customer with high patience
- **Critic**: Hard to please but boosts reputation significantly
- **Default**: Average customer

## Settings

- Music toggle and volume control
- SFX volume control
- Next track button to skip songs
- Fullscreen mode
- Save/Reset game progress
- Floating Map button for easy navigation

## Technologies Used

- Pure HTML5, CSS3, and JavaScript
- Web Audio API for music and sound effects
- LocalStorage for game saves
- Pixel art aesthetic with 8-bit style

## Credits

Created with ❤️ as a cozy coffee brewing experience.

## License

This project is open source and available for personal use and modification.
