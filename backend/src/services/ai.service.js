const { GoogleGenerativeAI } = require("@google/generative-ai");

// In-memory cache for recommendation queries to minimize API cost & latency
const recommendationCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCachedRecommendation(cacheKey) {
    const entry = recommendationCache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        recommendationCache.delete(cacheKey);
        return null;
    }
    return entry.data;
}

function setCachedRecommendation(cacheKey, data) {
    // Keep cache size bounded
    if (recommendationCache.size > 200) {
        const firstKey = recommendationCache.keys().next().value;
        recommendationCache.delete(firstKey);
    }
    recommendationCache.set(cacheKey, { timestamp: Date.now(), data });
}

/**
 * Initialize Gemini Model instance with fallback capability
 */
function getGeminiModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        return genAI.getGenerativeModel({ model: modelName });
    } catch (err) {
        console.error("Error creating Gemini model instance:", err.message);
        return null;
    }
}

/**
 * Generates an appetizing food description using Google Gemini or a curated fallback.
 */
async function generateFoodDescription(foodName, category = "") {
    const trimmedName = (foodName || "").trim();
    if (!trimmedName) {
        throw new Error("Food name is required for description generation");
    }

    const model = getGeminiModel();

    if (model) {
        try {
            const categoryLine = category ? ` Category / Cuisine: ${category}.` : "";
            const prompt = `You are an expert food critic and culinary writer creating a short, appetizing video caption for a food discovery reel.
Food item: "${trimmedName}"${categoryLine}

Rules:
1. Write 1 to 2 engaging, mouthwatering sentences focusing on textures, aromas, or key culinary highlights.
2. Do NOT use hashtags, emojis, quotes, or markdown.
3. Do NOT add conversational preambles like "Here is a caption:".
4. Output only the plain text description.`;

            const result = await model.generateContent(prompt);
            const text = result?.response?.text()?.trim();
            if (text && text.length > 5) {
                return text;
            }
        } catch (apiError) {
            console.warn("Gemini API call failed, using graceful description fallback:", apiError.message);
        }
    }

    // Graceful fallback when Gemini is unavailable or not configured
    const cleanCategory = (category || "").toLowerCase();
    if (cleanCategory.includes("dessert") || cleanCategory.includes("sweet") || cleanCategory.includes("cake")) {
        return `Decadent and freshly baked ${trimmedName}, crafted with rich textures and the perfect balance of sweetness.`;
    }
    if (cleanCategory.includes("spicy") || cleanCategory.includes("street")) {
        return `A bold, flavorful serving of ${trimmedName}, sizzling with aromatic spices and vibrant street-food flair.`;
    }
    if (cleanCategory.includes("italian") || cleanCategory.includes("pizza") || cleanCategory.includes("pasta")) {
        return `Artisanal ${trimmedName} prepared with authentic seasonings, rich melted notes, and heartwarming rustic flavor.`;
    }

    return `Delicious and freshly prepared ${trimmedName}, made to order with authentic ingredients and unforgettable flavors.`;
}

/**
 * Intelligent Food Recommendation Engine.
 * Matches natural-language cravings, dietary preferences, and user history against available database dishes.
 */
async function recommendFoods({ query = "", dietaryPreferences = [], cuisine = "", userLikedFoods = [], availableFoods = [] }) {
    if (!availableFoods || availableFoods.length === 0) {
        return {
            recommendations: [],
            aiGenerated: false,
            summary: "No food items are currently available in the catalog."
        };
    }

    const normalizedQuery = (query || "").trim().toLowerCase();
    const normalizedCuisine = (cuisine || "").trim().toLowerCase();
    const cleanDietary = Array.isArray(dietaryPreferences) ? dietaryPreferences.map(d => d.trim().toLowerCase()) : [];

    // Cache key for performance
    const cacheKey = JSON.stringify({ q: normalizedQuery, c: normalizedCuisine, d: cleanDietary, count: availableFoods.length });
    const cached = getCachedRecommendation(cacheKey);
    if (cached) {
        return cached;
    }

    const model = getGeminiModel();

    if (model && (normalizedQuery || normalizedCuisine || cleanDietary.length > 0)) {
        try {
            // Prepare a compact digest of real database foods to send to Gemini
            const foodCatalogDigest = availableFoods.slice(0, 30).map(f => ({
                id: f._id.toString(),
                name: f.name,
                description: f.description || "",
                cuisine: f.cuisine || "General",
                dietaryTags: f.dietaryTags || [],
                likes: f.likeCount || 0,
                restaurant: f.foodPartner?.name || "Partner Kitchen"
            }));

            const prompt = `You are a culinary sommelier and recommendation engine for FoodReels.
User request:
- Cravings / Search query: "${normalizedQuery || 'Any delicious recommendation'}"
- Dietary preferences: ${cleanDietary.length > 0 ? cleanDietary.join(', ') : 'None specified'}
- Preferred cuisine: "${normalizedCuisine || 'Any'}"

Available foods catalog (ONLY choose from these real items):
${JSON.stringify(foodCatalogDigest, null, 2)}

Instructions:
1. Select the top matching foods (up to 6) from the provided catalog that best satisfy the user's craving and dietary constraints.
2. For each recommendation, provide:
   - "foodId": exact id string matching the catalog
   - "matchScore": integer percentage from 60 to 99
   - "reason": concise 1-sentence reason why this dish matches the craving
   - "pairing": short 2-3 word pairing suggestion (e.g. "Chilled Lemon Iced Tea")
3. Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "summary": "Brief 1-sentence conversational summary of why these dishes were chosen",
  "recommendations": [
    {
      "foodId": "...",
      "matchScore": 95,
      "reason": "...",
      "pairing": "..."
    }
  ]
}`;

            const result = await model.generateContent(prompt);
            const responseText = result?.response?.text()?.trim();

            if (responseText) {
                // Strip markdown code fences if model enclosed in ```json ... ```
                const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
                const parsed = JSON.parse(cleanJson);

                if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
                    // Re-hydrate recommendations with actual DB food objects
                    const foodMap = new Map(availableFoods.map(f => [f._id.toString(), f]));
                    const hydrated = [];

                    for (const rec of parsed.recommendations) {
                        const original = foodMap.get(rec.foodId);
                        if (original) {
                            hydrated.push({
                                ...original.toObject ? original.toObject() : original,
                                matchScore: rec.matchScore || 90,
                                recommendationReason: rec.reason || "Handpicked for your craving",
                                suggestedPairing: rec.pairing || ""
                            });
                        }
                    }

                    if (hydrated.length > 0) {
                        const resultPayload = {
                            recommendations: hydrated,
                            aiGenerated: true,
                            summary: parsed.summary || "Curated by FoodReels AI Sommelier based on your taste profile."
                        };
                        setCachedRecommendation(cacheKey, resultPayload);
                        return resultPayload;
                    }
                }
            }
        } catch (err) {
            console.warn("Gemini recommendation error, switching to algorithmic matcher:", err.message);
        }
    }

    // High quality Algorithmic / Heuristic Matcher Fallback
    const scoredFoods = availableFoods.map(food => {
        let score = 50; // base score
        const reasons = [];

        const foodName = (food.name || "").toLowerCase();
        const foodDesc = (food.description || "").toLowerCase();
        const foodCuisine = (food.cuisine || "").toLowerCase();
        const foodTags = (food.dietaryTags || []).map(t => t.toLowerCase());

        // 1. Dietary constraints check
        if (cleanDietary.length > 0) {
            let matchedDiet = 0;
            for (const diet of cleanDietary) {
                if (foodTags.includes(diet) || foodDesc.includes(diet) || foodName.includes(diet)) {
                    matchedDiet++;
                }
            }
            if (matchedDiet > 0) {
                score += matchedDiet * 25;
                reasons.push(`Matches dietary filter (${cleanDietary.join(', ')})`);
            }
        }

        // 2. Cuisine match
        if (normalizedCuisine && (foodCuisine.includes(normalizedCuisine) || foodDesc.includes(normalizedCuisine))) {
            score += 30;
            reasons.push(`Authentic ${food.cuisine || normalizedCuisine} dish`);
        }

        // 3. Query keyword match
        if (normalizedQuery) {
            const keywords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
            let keywordMatches = 0;
            for (const word of keywords) {
                if (foodName.includes(word)) {
                    score += 25;
                    keywordMatches++;
                } else if (foodDesc.includes(word)) {
                    score += 15;
                    keywordMatches++;
                } else if (foodTags.includes(word)) {
                    score += 20;
                    keywordMatches++;
                }
            }
            if (keywordMatches > 0) {
                reasons.push(`Contains flavor notes matching "${normalizedQuery}"`);
            }
        }

        // 4. Popularity boost (likes)
        const likes = food.likeCount || 0;
        if (likes > 0) {
            score += Math.min(20, Math.floor(likes * 2));
            if (likes >= 5 && reasons.length === 0) {
                reasons.push(`Community favorite with ${likes} likes`);
            }
        }

        // Default reason if empty
        if (reasons.length === 0) {
            reasons.push(food.cuisine && food.cuisine !== 'General' ? `Popular pick from ${food.cuisine} menu` : "Top recommended reel on FoodReels");
        }

        return {
            ...food.toObject ? food.toObject() : food,
            matchScore: Math.min(98, score),
            recommendationReason: reasons[0],
            suggestedPairing: "Crispy Garlic Bread & Sparkling Citrus"
        };
    });

    // Sort by descending score
    scoredFoods.sort((a, b) => b.matchScore - a.matchScore);
    const topMatches = scoredFoods.slice(0, 8);

    const resultPayload = {
        recommendations: topMatches,
        aiGenerated: false,
        summary: normalizedQuery
            ? `Curated ${topMatches.length} dishes matching "${normalizedQuery}".`
            : "Trending culinary recommendations selected for you."
    };

    setCachedRecommendation(cacheKey, resultPayload);
    return resultPayload;
}

module.exports = {
    generateFoodDescription,
    recommendFoods
};
