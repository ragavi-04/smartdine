const Groq = require('groq-sdk');
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is not set in .env file');
}
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
const generateRecommendation = async (userQuery, restaurants) => {
  try {
    const restaurantData = restaurants.map(r => ({
      name: r.name,
      cuisine: r.cuisine.join(', '),
      price: r.priceRange,
      specialty: r.specialtyDishes.join(', '),
      ambiance: r.ambiance,
      rating: r.rating
    }));
    const prompt = `You are a friendly food recommendation assistant.
User Query: "${userQuery}"
Available Restaurants:
${JSON.stringify(restaurantData, null, 2)}
Recommend the TOP 3 restaurants that match the user's needs. For each, explain why it's perfect, mention price and a must-try dish.
Format:
**[Restaurant Name]**
Why it's perfect: [explanation]
Price: [price] | Must-try: [dish]
Rating: [rating]/5
Be conversational and enthusiastic!`;
    console.log('🤖 Calling Groq API...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Free and very fast!
      temperature: 0.7,
      max_tokens: 1024,
    });
    const text = chatCompletion.choices[0]?.message?.content || '';
    console.log('✅ Groq response received');
    return text;
  } catch (error) {
    console.error('❌ Groq API Error:', error.message);
    throw new Error(`Groq API error: ${error.message}`);
  }
};
const generateSurprise = async (restaurant) => {
  try {
    const prompt = `Generate an exciting 2-3 sentence pitch for this restaurant that makes someone want to visit NOW:
Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisine.join(', ')}
Specialty: ${restaurant.specialtyDishes.join(', ')}
Be playful and use craving-inducing food words!`;
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
      max_tokens: 200,
    });
    const text = chatCompletion.choices[0]?.message?.content || '';
    return {
      restaurant,
      pitch: text
    };
  } catch (error) {
    console.error('❌ Groq Surprise Error:', error.message);
    throw new Error(`Failed to generate surprise: ${error.message}`);
  }
};
module.exports = {
  generateRecommendation,
  generateSurprise
};