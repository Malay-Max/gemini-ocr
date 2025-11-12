
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<{ text: string; title: string }> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const textPart = {
            text: "Extract all text from this image, including any handwritten text. Then, generate a concise, descriptive title (5 words or less) for the extracted text. Provide the response as a JSON object with two keys: 'text' for the full extracted text and 'title' for the generated title."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: {
                            type: Type.STRING,
                            description: "The full extracted text from the image."
                        },
                        title: {
                            type: Type.STRING,
                            description: "A concise, descriptive title for the extracted text."
                        }
                    },
                    required: ["text", "title"]
                }
            }
        });

        const jsonResponse = JSON.parse(response.text);

        if (!jsonResponse.text || jsonResponse.text.trim() === "") {
            throw new Error("No text could be extracted from the image.");
        }
        
        return {
            text: jsonResponse.text.trim(),
            title: jsonResponse.title.trim() || "Untitled Extraction"
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the response from the AI. The format was unexpected.");
        }
        throw new Error("Failed to extract text. The image might be unsupported or the API key may be invalid.");
    }
};