// ── Build a detailed prompt from user inputs ──────────────────
const buildItineraryPrompt = (inputs) => {
  const { destination, days, budget, travelers, interests, travel_style } =
    inputs;

  return `You are an expert travel planner. Create a detailed day-wise travel itinerary.
TRIP DETAILS:
- Destination: ${destination}
- Duration: ${days} days
- Total Budget: ₹${budget} INR for ${travelers} traveler(s)
- Travel Style: ${travel_style}
- Interests: ${interests.join(", ")}
REQUIREMENTS:
1. Create exactly ${days} days of activities
2. Each day must have 4-6 activities
3. Activities should be time-slotted from morning to evening
4. Include realistic cost estimates in Indian Rupees
5. Include practical travel tips for each activity
6. Activities must match the interests provided
7. Total costs across all activities must stay within the budget of ₹${budget}
8. Include food recommendations for breakfast, lunch, dinner each day
RESPOND WITH ONLY VALID JSON IN THIS EXACT STRUCTURE:
{
  "title": "Trip title here",
  "total_estimated_cost": 0,
  "days": [
    {
      "day_number": 1,
      "theme": "Theme for this day",
      "summary": "Brief summary of the day",
      "total_day_cost": 0,
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "description": "Detailed description",
          "category": "sightseeing",
          "location": "Specific location name",
          "estimated_cost": 0,
          "duration_minutes": 90,
          "tips": "Practical tip for this activity",
          "sort_order": 1
        }
      ]
    }
  ]
}
Category must be one of: sightseeing, food, adventure, transport, accommodation, shopping, relaxation, culture
Respond ONLY with the JSON object. No extra text before or after.`;
};

// ── Main function — generates itinerary using Gemini REST API ──
const generateItinerary = async (inputs) => {
  const prompt = buildItineraryPrompt(inputs);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  // Extract text from Gemini's response structure
  const rawText = data.candidates[0].content.parts[0].text;

  // Strip markdown fences if present
  const cleaned = rawText
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return parsed;
};

module.exports = { generateItinerary };
