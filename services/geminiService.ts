
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
  
  CRITICAL IDENTITY INSTRUCTION (PRIORITY #1):
  - You MUST preserve the facial identity and body structure of the person in the source image with 100% accuracy.
  - The final image MUST use the exact face from the source image. Do NOT generate a random person. 
  - Do not alter the facial features, bone structure, or likeness.
  - The goal is to keep the person exactly as they are but upgrade the lighting, camera quality, and environment around them.

  CRITICAL UPSCALE & STYLE INSTRUCTIONS: 
  - Ensure the output looks like it was filmed with an ARRI camera. 
  - Enhance details and resolution significantly (x2 upscale equivalent).
  - Maximize image clarity, sharpness, and texture definition.
  - Refine line definitions and facial features with high precision without deforming them.
  - Re-stylize the image to obtain the maximum possible clarity and sharpness.
  - Apply "High-Frequency Detail Enhancement" to make every texture, pore, and edge crystal clear.
  - Ensure the final image is ultra-sharp, in focus, and free of any blur or softness.
  - Micro-contrast should be optimized for a hyper-realistic look.
  `;

  // Filter Logic vs Custom Reference Logic
  if (filterId === CinematicFilter.CUSTOM_GRADIENT && base64Reference) {
      prompt += `\nCRITICAL COLOR INSTRUCTION: Analyze the color palette, lighting, and mood of the SECOND image provided (the reference). Apply that exact color grading and style to the FIRST image (the source).`;
  } else {
      prompt += `\nStyle Base: ${filter.name}. \nTechnical Details: ${filter.promptModifier}`;
  }

  // User Instructions Logic
  if (userInstructions && userInstructions.trim().length > 0) {
      prompt += `\n\nDIRECTOR'S SPECIFIC INSTRUCTIONS: ${userInstructions}. \nEnsure these instructions take precedence over the base style regarding the scene, action, and clothing, BUT NEVER compromise the facial identity of the source.`;
  } else {
      prompt += `\n\nNo specific user instructions provided. Generate a creative variation based on the style definition while keeping the source character.`;
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
  
  const MANDATORY_PREFIX = "Ultra detailed and hyper realistic cinematic shot filmed by an ARRI camera";
  const IDENTITY_CONSTRAINT = "Maintain 100% facial identity and character consistency with the source reference image";

  const systemPrompt = `You are a world-class Director of Photography. 
  Your task is to take brief descriptions and rewrite them into a cohesive, professional cinematic prompt description.
  
  Instructions:
  1. Describe the camera angle (e.g., low angle, wide shot, close-up).
  2. Describe the scene development, lighting (chiaroscuro, rim lighting), and mood.
  3. Describe the texture (8k, highly detailed).
  4. DO NOT include the phrase "${MANDATORY_PREFIX}" or "${IDENTITY_CONSTRAINT}" in your output, as they will be added automatically.
  5. Keep the result under 80 words.`;

  const userMessage = `Create a cinematic description based on these details:
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
    
    const generatedText = response.text?.trim() || "";
    // Combine mandatory prefix, identity constraint, and the AI generated description
    return `${MANDATORY_PREFIX}. ${IDENTITY_CONSTRAINT}. ${generatedText}`;

  } catch (error) {
    console.error("Prompt Enhancement Error:", error);
    return `${MANDATORY_PREFIX}. ${IDENTITY_CONSTRAINT}. Highly detailed cinematic scene.`;
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
