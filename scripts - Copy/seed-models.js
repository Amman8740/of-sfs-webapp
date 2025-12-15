// Script to seed sample models data
// Run this with: node scripts/seed-models.js

const sampleModels = [
  {
    name: 'Elena Petrova',
    email: 'elena.petrova@example.com',
    displayPictureUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    onlyfansLink: 'https://onlyfans.com/elena_petrova',
    telegramLink: 'https://t.me/elena_petrova',
    username: 'elena_petrova',
    price: 200.00,
    fanCount: 8310,
    payoutPercentage: 70.00,
    subscriptionType: 'Paid',
    status: 'Active',
    language: 'English',
    timezone: 'GMT+5',
    isVerified: true
  },
  {
    name: 'Liam O\'Connell',
    email: 'liam.oconnell@example.com',
    displayPictureUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    onlyfansLink: 'https://onlyfans.com/liam_oconnell',
    telegramLink: 'https://t.me/liam_oconnell',
    username: 'liam_oconnell',
    price: 150.00,
    fanCount: 7821,
    payoutPercentage: 75.00,
    subscriptionType: 'Paid',
    status: 'Active',
    language: 'English',
    timezone: 'GMT+0',
    isVerified: true
  }
];

async function seedModels() {
  console.log('Seeding sample models...');
  
  for (const model of sampleModels) {
    try {
      const response = await fetch('http://localhost:3000/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(model),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created model: ${model.name}`);
      } else {
        console.error(`❌ Failed to create model ${model.name}:`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Error creating model ${model.name}:`, error.message);
    }
  }
  
  console.log('Seeding complete!');
}

// Only run if this script is executed directly
if (require.main === module) {
  seedModels();
}

module.exports = { seedModels, sampleModels };
