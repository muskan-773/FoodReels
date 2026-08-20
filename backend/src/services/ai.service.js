const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generates an attractive food description using Google Gemini.
 * @param {string} foodName   - Name of the food item
 * @param {string} [category] - Optional category/cuisine type
 * @returns {Promise<string>} - Generated description text
 */
async function generateFoodDescription(foodName, category = "") {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const categoryLine = category ? ` It is a ${category} dish.` : "";

    const prompt = `You are writing a short, appetizing description for a food reel on a social media app similar to Instagram Reels.

Food name: ${foodName}${categoryLine}

Write a natural, engaging food description of 1 to 3 sentences. 
Rules:
- Sound delicious and genuine
- Focus on taste, texture, aroma, or ingredients
- Do NOT use hashtags
- Do NOT use markdown formatting
- Do NOT add introductory phrases like "Here is a description:"
- Do NOT make fake health claims
- Maximum 3 sentences
- Output only the description text, nothing else`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (!text) {
        throw new Error("AI returned an empty response");
    }

    return text;
}

module.exports = { generateFoodDescription };
