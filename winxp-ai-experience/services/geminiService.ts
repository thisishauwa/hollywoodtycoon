
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAIResponse = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful AI assistant living inside a Windows XP computer. Keep your tone retro, nostalgic, and helpful. Mention things like dial-up, floppy disks, or MSN messenger if appropriate, but focus on answering the user's query clearly.",
      },
    });
    return response.text || "Error: No response from system.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "The system encountered a fatal error (BSOD simulation avoided). Please try again.";
  }
};
