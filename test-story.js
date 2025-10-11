import fetch from 'node-fetch';

const characters = [
  { name: 'Luna the Explorer', trait: 'Wisdom' },
  { name: 'Rio the Nature Guide', trait: 'Creativity' },
  { name: 'Max the Safety Expert', trait: 'Courage' },
  { name: 'Zara the Tech Whiz', trait: 'Innovation' }
];

const testScenarios = [
  { emotion: 'happy', context: 'successfully completing a challenge' },
  { emotion: 'concerned', context: 'potential danger ahead' },
  { emotion: 'proud', context: 'teaching an important lesson' },
  { emotion: 'protective', context: 'warning about safety' },
  { emotion: 'surprised', context: 'unexpected discovery' },
  { emotion: 'teaching', context: 'explaining important concepts' },
  { emotion: 'thinking', context: 'solving a puzzle' },
  { emotion: 'neutral', context: 'starting a new adventure' }
];

async function generateStory(character, scenario) {
  try {
    const response = await fetch('http://localhost:5000/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interests: ['safety', scenario.context],
        character: character,
        decisions: []
      })
    });

    const data = await response.json();
    console.log(`\nTesting ${character.name} with ${scenario.emotion} expression:`);
    console.log('Context:', scenario.context);
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    console.log('Story Start:', data.story.substring(0, 100) + '...');
    console.log('Expression received:', data.expression || 'No expression returned');
    console.log('Expression matches scenario:', data.expression === scenario.emotion);
    console.log('----------------------------------------');
    return data;
  } catch (error) {
    console.error(`Error testing ${character.name} with ${scenario.emotion}:`, error);
    return null;
  }
}

async function testAllCharacterExpressions() {
  console.log('Starting comprehensive expression testing...\n');
  
  for (const character of characters) {
    console.log(`\n=== Testing ${character.name} ===`);
    for (const scenario of testScenarios) {
      await generateStory(character, scenario);
    }
  }

  console.log('\nTesting completed!');
}

testAllCharacterExpressions();