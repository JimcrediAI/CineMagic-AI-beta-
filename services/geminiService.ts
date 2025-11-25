import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CinematicFilter, FILTERS } from '../types';

// Use gemini-2.5-flash-image for image editing/generation as requested (Nano banana)
const IMAGE_MODEL = 'gemini-2.5-flash-image'; 
// Use gemini-3-pro-preview for chat and prompt enhancement
const CHAT_MODEL = 'gemini-3-pro-preview';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCinematicImage = async (
  base64Source: string,
  filterId: CinematicFilter,
  userInstructions: string = "",
  base64Reference?: string | null
): Promise<string> => {
  const ai = getClient();
  const filter = FILTERS.find(f => f.id === filterId);
  
  if (!filter) throw new Error("Invalid filter selected");

  // Remove data URL prefix
  const cleanSource = base64Source.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  // Construct the prompt
  let prompt = `Transform this image into a hyper-realistic, ultra-detailed, cinematic movie shot in 16:9 aspect ratio.
  Ensure the output looks like it was filmed with an ARRI camera. Enhance details and resolution significantly (x2 upscale equivalent).
  
  CRITICAL UPSCALE INSTRUCTIONS: 
  - Maximize image clarity and sharpness.
  - Refine line definitions and facial features with high precision.
  - DO NOT deform characters or objects; maintain structural integrity strictly.
  - Re-stylize the image to obtain the maximum possible clarity and sharpness.
  `;

  // Filter Logic vs Custom Reference Logic
  if (filterId === CinematicFilter.CUSTOM_GRADIENT && base64Reference) {
      prompt += `\nCRITICAL INSTRUCTION: Analyze the color palette, lighting, and mood of the SECOND image provided (the reference). Apply that exact color grading and style to the FIRST image (the source).`;
  } else {
      prompt += `\nStyle Base: ${filter.name}. \nTechnical Details: ${filter.promptModifier}`;
  }

  // User Instructions Logic
  if (userInstructions && userInstructions.trim().length > 0) {
      prompt += `\n\nDIRECTOR'S SPECIFIC INSTRUCTIONS: ${userInstructions}. \nEnsure these instructions take precedence over the base style.`;
  } else {
      prompt += `\n\nNo specific user instructions provided. Generate a creative variation based on the style definition.`;
  }

  const parts: any[] = [
    {
      inlineData: {
        mimeType: 'image/png',
        data: cleanSource
      }
    }
  ];

  // Add reference image if applicable
  if (filterId === CinematicFilter.CUSTOM_GRADIENT && base64Reference) {
     const cleanRef = base64Reference.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
     parts.push({
        inlineData: {
            mimeType: 'image/png',
            data: cleanRef
        }
     });
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        }
      }
    });

    // Extract image from response
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated in the response");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const enhanceCinematicPrompt = async (details: {
  character: string;
  clothing: string;
  action: string;
  setting: string;
}): Promise<string> => {
  const ai = getClient();
  
  const systemPrompt = `You are a world-class Director of Photography and Prompt Engineer for high-end AI image generators. 
  Your task is to take brief descriptions of a scene and rewrite them into a cohesive, professional cinematic prompt.
  Focus on lighting (chiaroscuro, rim lighting, etc.), texture (8k, highly detailed), camera angles, and mood.
  Keep the result under 80 words. Strictly describe the visual output.`;

  const userMessage = `Create a cinematic prompt based on these details:
  - Character: ${details.character}
  - Clothing: ${details.clothing}
  - Action: ${details.action}
  - Setting: ${details.setting}`;

  try {
    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    return "";
  }
};

let chatSession: Chat | null = null;

export const sendMessageToChatbot = async (message: string): Promise<string> => {
  const ai = getClient();
  
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: CHAT_MODEL,
      config: {
        systemInstruction: "You are CineBot, an AI assistant specialized in filmmaking, photography, and the technical aspects of cinema cameras like ARRI. You help users understand visual effects and cinematography.",
      },
    });
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    return response.text || "I couldn't generate a text response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};