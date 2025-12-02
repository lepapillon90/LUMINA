import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Ensure API key is available
const ai = new GoogleGenAI({ apiKey });

export const getStylistAdvice = async (userMessage: string, context: string): Promise<string> => {
  if (!apiKey) {
    return "죄송합니다. 현재 스타일링 연결이 원활하지 않습니다 (API Key 확인 필요).";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context about the shop products: ${context}. User says: ${userMessage}`,
      config: {
        systemInstruction: `당신은 악세서리 브랜드 '루미나(LUMINA)'의 AI 퍼스널 스타일리스트 '루미'입니다.
        당신의 말투는 우아하고, 친절하며, 세련된 한국어를 사용합니다 (존댓말 사용).
        제공된 상품 컨텍스트를 바탕으로 고객의 상황에 맞는 제품을 추천해주세요.
        답변은 300자 이내로 간결하게 작성하고, 이모지를 적절히 사용하여 감성을 더해주세요.
        만약 고객이 결제 방식에 대해 묻는다면, 현재는 '무통장 입금'만 가능하다고 안내해주세요.`,
        temperature: 0.7,
      }
    });

    return response.text || "스타일링을 생각하는 중이에요. 잠시 후 다시 물어봐주시겠어요?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "지금은 패션 요청이 너무 많아 잠시 쉬고 있어요! 나중에 다시 시도해주세요.";
  }
};