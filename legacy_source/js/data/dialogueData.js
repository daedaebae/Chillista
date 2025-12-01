const DIALOGUE_DATA = {
    student: {
        greeting: ["Hey, I'm in a rush.", "Do you have Wi-Fi?", "I need caffeine, stat.", "Got an exam in an hour!", "Is this place quiet enough to study?"],
        choices: [
            { text: "Study hard!", effect: { type: 'patience', value: 10, satisfaction: 5 }, response: "Thanks, I'm trying!" },
            { text: "Need a snack?", effect: { type: 'upsell', chance: 0.4, value: 3, satisfaction: 3 }, response: "Maybe a muffin..." },
            { text: "Quiet day?", effect: { type: 'reputation', value: 1, satisfaction: 2 }, response: "I hope so." },
            { text: "Free refill?", effect: { type: 'custom', action: 'refill_offer', satisfaction: 10 }, response: "Really? You're a lifesaver!" },
            { text: "Good luck!", effect: { type: 'patience', value: 15, satisfaction: 8 }, response: "Thanks! I'll need it." }
        ]
    },
    hipster: {
        greeting: ["Is this single origin?", "I only drink oat milk.", "Cool vibe here.", "Love the aesthetic.", "Do you roast your own beans?"],
        choices: [
            { text: "It's artisanal.", effect: { type: 'reputation', value: 2, satisfaction: 8 }, response: "Nice, I respect that." },
            { text: "Try the Matcha?", effect: { type: 'upsell', chance: 0.7, value: 5, satisfaction: 5 }, response: "Ooh, matcha sounds good." },
            { text: "Vinyl is better.", effect: { type: 'patience', value: 15, satisfaction: 12 }, response: "Finally, someone gets it." },
            { text: "Check out my playlist.", effect: { type: 'custom', action: 'music_compliment', satisfaction: 10 }, response: "This track is fire." },
            { text: "Locally sourced.", effect: { type: 'reputation', value: 3, satisfaction: 10 }, response: "That's what I like to hear!" }
        ]
    },
    tourist: {
        greeting: ["Wow, so cute!", "Where is the park?", "Can I take a photo?", "This is so charming!", "Is this a local favorite?"],
        choices: [
            { text: "Welcome!", effect: { type: 'tips', value: 2, satisfaction: 8 }, response: "You're so kind! Here's a tip." },
            { text: "Buy a souvenir?", effect: { type: 'upsell', chance: 0.5, value: 10, satisfaction: 4 }, response: "Oh, a mug? Sure!" },
            { text: "Park is nearby.", effect: { type: 'reputation', value: 1, satisfaction: 6 }, response: "Thanks for the info!" },
            { text: "Say cheese!", effect: { type: 'custom', action: 'photo_op', satisfaction: 12 }, response: "*Click* Perfect shot!" },
            { text: "Try our special!", effect: { type: 'upsell', chance: 0.6, value: 4, satisfaction: 5 }, response: "When in Rome, right?" }
        ]
    },
    regular: {
        greeting: ["The usual, please.", "Good to see you.", "How's business?", "Another day, another coffee.", "You know what I like."],
        choices: [
            { text: "On the house.", effect: { type: 'reputation', value: 5, satisfaction: 15 }, response: "You're the best! I'll tell everyone." },
            { text: "Try something new?", effect: { type: 'upsell', chance: 0.3, value: 4, satisfaction: 3 }, response: "I trust you. Surprise me." },
            { text: "Busy day.", effect: { type: 'patience', value: 20, satisfaction: 5 }, response: "Take your time, I'm good." },
            { text: "How's work?", effect: { type: 'patience', value: 10, satisfaction: 7 }, response: "Same old, same old. Thanks for asking!" }
        ]
    },
    critic: {
        greeting: ["Impress me.", "I'm writing a review.", "Is this sanitary?", "I've had better.", "Show me what you've got."],
        choices: [
            { text: "We use best beans.", effect: { type: 'reputation', value: 3, satisfaction: 5 }, response: "We shall see." },
            { text: "Complimentary water?", effect: { type: 'patience', value: 15, satisfaction: 3 }, response: "Hmph. Acceptable." },
            { text: "No photos please.", effect: { type: 'reputation', value: -2, satisfaction: -10 }, response: "Excuse me? I am a journalist!" },
            { text: "Fresh roasted today.", effect: { type: 'reputation', value: 4, satisfaction: 8 }, response: "Interesting. Continue." }
        ]
    },
    default: {
        greeting: ["Hello.", "One coffee.", "Nice weather.", "Good morning!", "Smells great in here."],
        choices: [
            { text: "How are you?", effect: { type: 'reputation', value: 1, satisfaction: 4 }, response: "I'm good, thanks." },
            { text: "Want a pastry?", effect: { type: 'upsell', chance: 0.3, value: 3, satisfaction: 2 }, response: "No thanks." },
            { text: "Nice outfit.", effect: { type: 'patience', value: 5, satisfaction: 6 }, response: "Oh, thank you!" },
            { text: "Beautiful day!", effect: { type: 'patience', value: 8, satisfaction: 5 }, response: "It really is!" }
        ]
    }
};

export default DIALOGUE_DATA;
