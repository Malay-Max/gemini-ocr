import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<{ text: string; title: string; rawResponse: string; }> => {
    let rawResponseText = "No response from API.";
    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };

        const textPart = {
            text: "Extract all text from this image, including any handwritten text. Also, generate a concise, descriptive title (5 words or less) for the extracted text."
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

        rawResponseText = response.text;
        const jsonResponse = JSON.parse(rawResponseText);

        if (!jsonResponse.text || jsonResponse.text.trim() === "") {
            throw new Error("No text could be extracted from the image.");
        }
        
        // Format the raw response for pretty printing in the debug panel
        const formattedRawResponse = JSON.stringify(jsonResponse, null, 2);

        return {
            text: jsonResponse.text.trim(),
            title: (jsonResponse.title || "").trim() || "Untitled Extraction",
            rawResponse: formattedRawResponse
        };
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const formattedError = `Raw API Response:\n---\n${rawResponseText}\n---\nError Details:\n${error instanceof Error ? error.stack : String(error)}`;

        if (error instanceof SyntaxError) {
             throw new Error(`Failed to parse the response from the AI. The format was unexpected. \n\n${formattedError}`);
        }
        throw new Error(`Failed to extract text. The image might be unsupported or the API key may be invalid. \n\n${formattedError}`);
    }
};