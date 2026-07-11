
import { GoogleGenAI, Type } from "@google/genai";

// Lazily constructed so a missing API key fails inside the try/catch below
// instead of throwing at module load and crashing the whole app.
let ai: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export const getCareerAdvice = async (role: string, query: string) => {
  try {
    const response = await getClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is a ${role}. Question: ${query}. Provide professional career advice in a friendly, encouraging tone. Keep it under 150 words.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    // Property .text is string | undefined, handle it safely
    return response.text || "I'm having trouble thinking right now. Please try again later!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble thinking right now. Please try again later!";
  }
};

export const summarizeStory = async (content: string) => {
  try {
    const response = await getClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize this success story in one impactful sentence: ${content}`,
    });
    // Property .text is string | undefined, handle it safely
    return response.text || "A powerful journey of growth and achievement.";
  } catch (error) {
    return "A powerful journey of growth and achievement.";
  }
};

export const getSmartReplies = async (lastMessage: string) => {
  try {
    const response = await getClient().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this message received from a networking contact: "${lastMessage}", provide 3 short, professional "Smart Reply" suggestions (max 10 words each). Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // Ensure response.text is trimmed and non-empty before parsing JSON
    const text = response.text?.trim();
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    return ["Sounds good!", "Thanks for sharing.", "Let's talk soon."];
  }
};
