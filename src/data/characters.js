
export const CHARACTER_ROSTER = [
    {
        id: 'alice',
        name: 'Alice',
        age: 24,
        bio: 'A graphic design student who loves sketching in cafes. Always looking for inspiration.',
        traits: ['Creative', 'Patient'],
        preferences: { drink: 'Matcha Latte', milk: 'Oat' },
        basePatience: 25,
        tippingBehavior: 'generous'
    },
    {
        id: 'bob',
        name: 'Bob',
        age: 45,
        bio: 'A busy contractor who needs his caffeine fix to keep up with tight deadlines.',
        traits: ['Busy', 'Direct'],
        preferences: { drink: 'Espresso', milk: 'Whole' },
        basePatience: 15,
        tippingBehavior: 'standard'
    },
    {
        id: 'charlie',
        name: 'Charlie',
        age: 19,
        bio: 'An aspiring influencer. Needs the drink to look good for the \'gram.',
        traits: ['Trendy', 'Impatient'],
        preferences: { drink: 'Matcha Latte', milk: 'Soy' },
        basePatience: 18,
        tippingBehavior: 'erratic'
    },
    {
        id: 'dana',
        name: 'Dana',
        age: 32,
        bio: 'A software engineer working remotely. Appreciates a quiet corner and good wifi.',
        traits: ['Focused', 'Techie'],
        preferences: { drink: 'Coffee', milk: 'Almond' },
        basePatience: 30,
        tippingBehavior: 'standard'
    },
    {
        id: 'eve',
        name: 'Eve',
        age: 28,
        bio: 'A local yoga instructor. specific about her health and wellness routine.',
        traits: ['Health-Conscious', 'Friendly'],
        preferences: { drink: 'Matcha Latte', milk: 'Almond' },
        basePatience: 22,
        tippingBehavior: 'generous'
    },
    {
        id: 'frank',
        name: 'Frank',
        age: 65,
        bio: 'Retired history teacher. Comes for the routine and a bit of conversation.',
        traits: ['Chatty', 'Loyal'],
        preferences: { drink: 'Coffee', milk: 'Whole' },
        basePatience: 40,
        tippingBehavior: 'standard'
    }
];

export const getCharacterByName = (name) => CHARACTER_ROSTER.find(c => c.name === name);
