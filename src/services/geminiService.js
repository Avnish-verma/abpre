import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("VITE_GEMINI_API_KEY is missing in .env.local");
}

const MODEL_NAME = "gemini-2.5-flash";

export const askDoubts = async (doubt, context = {}) => {
  if (!genAI) {
    return "AI Service is not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
      You are an expert tutor developed by avni & gemini.
      Context:
      - Video Title: ${context.videoTitle || 'N/A'}
      - Subject: ${context.subject || 'General'}
      - Time: ${context.currentTimestamp ? new Date(context.currentTimestamp * 1000).toISOString().substr(11, 8) : 'N/A'}

      Student Doubt: "${doubt}"

      Please provide a clear, concise, and helpful explanation suitable for a student.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("403")) {
        return "Error: API Key is invalid or expired. Please update your API key.";
    }
    return "Sorry, I am unable to answer right now. Please try again later.";
  }
};

/**
 * Generates study notes from text or an image.
 * @param {string} input - The text content or base64 image data.
 * @param {boolean} isImage - Flag to indicate if the input is an image.
 */
export const generateNotesFromAI = async (input, isImage = false) => {
    if (!genAI) {
        throw new Error("AI Service not configured");
    }

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        let promptParts = [];

        if (isImage) {
            const base64Data = input.includes('base64,') ? input.split('base64,')[1] : input;
            
            promptParts = [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "image/jpeg", 
                    },
                },
                { text: "Create concise and structured study notes from this image. Use headings, bullet points, and highlight key concepts." }
            ];
        } else {
            promptParts = [
                { text: `Create concise and structured study notes from the following text.\nUse headings, bullet points, and highlight key concepts.\n\nText:\n${input}` }
            ];
        }

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Notes Generation Error:", error);
        throw error;
    }
}

/**
 * Generates a quiz from text, image, or PDF content.
 * @param {string} input - The text content or base64 data.
 * @param {string} mimeType - The mime type of the file (e.g., 'image/png', 'application/pdf'). If null, assumes text.
 */
export const generateQuizFromAI = async (input, mimeType = null) => {
  if (!genAI) {
    throw new Error("AI Service not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    let promptParts = [];
    const quizPrompt = `
      Generate 20 multiple-choice questions (MCQs) based on the provided content.
      Return the output as a valid JSON array of objects.
      Each object should have these keys:
      - "question": string
      - "optionA": string
      - "optionB": string
      - "optionC": string
      - "optionD": string
      - "correct": string (must be one of "A", "B", "C", or "D")
      
      Output ONLY valid JSON. No markdown ticks.
    `;

    if (mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
        const base64Data = input.includes('base64,') ? input.split('base64,')[1] : input;
        promptParts = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
            { text: quizPrompt }
        ];
    } else {
        // Assume text input
        promptParts = [
            { text: `${quizPrompt}\n\nContent to generate quiz from:\n"${input}"` }
        ];
    }

    const result = await model.generateContent(promptParts);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    throw error;
  }
};