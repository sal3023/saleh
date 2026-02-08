
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIStory, StoryMode, BlogData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = (text: string) => {
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("فشل في تحليل البيانات الذكية.");
  }
};

export const generateAIStory = async (prompt: string, mode: StoryMode): Promise<AIStory> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // استخدام برو لتحليل مالي أفضل
    contents: `أنشئ قصة أطفال عن: "${prompt}". 
    أنتج JSON يضم: (title, moralOrLesson, scenes, monetization, youtubeData).
    monetization يجب أن تقترح منتجات أفلييت للأطفال وتقدير للأرباح.
    youtubeData يجب أن تحتوي على كلمات مفتاحية ذات CPM عالي.`,
    config: {
      systemInstruction: "أنت خبير في صناعة المحتوى الربحي على يوتيوب وبلوجر. هدفك إنتاج محتوى يتصدر النتائج ويجذب المعلنين.",
      responseMimeType: "application/json"
    }
  });
  
  const data = safeJsonParse(response.text);
  return { ...data, id: Date.now().toString(), mode };
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: `High-end 3D animation style, Disney/Pixar look, 8k resolution, masterpiece: ${prompt}` }] }],
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : "";
};

export const generateSceneAudio = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `اقرأ بأسلوب حكواتي دافئ ومحترف: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateTrendingAIBlog = async (): Promise<BlogData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "أنشئ مقال بلوجر احترافي بـ SEO قوي حول قصص الأطفال والتربية.",
    config: { responseMimeType: "application/json" }
  });
  return safeJsonParse(response.text);
};
