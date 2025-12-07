import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Ensure API key is available

export const getStylistAdvice = async (userMessage: string, context: string): Promise<string> => {
  if (!apiKey) {
    console.error("[MY_LOG] Gemini API Key가 설정되지 않았습니다.");
    return "죄송합니다. 현재 스타일링 연결이 원활하지 않습니다 (API Key 확인 필요).";
  }

  try {
    console.log("[MY_LOG] Gemini API 호출 시작 - API Key 존재:", !!apiKey);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 사용 가능한 모델 목록을 순서대로 시도
    // 최신 모델부터 시도 (v1 API 사용)
    const modelNames = [
      'gemini-1.5-flash',      // 가장 일반적인 모델
      'gemini-1.5-pro',        // Pro 버전
      'gemini-pro',            // 기본 Pro 모델
      'gemini-2.0-flash-exp',  // 실험적 최신 모델
      'models/gemini-1.5-flash', // models/ 접두사 포함
      'models/gemini-1.5-pro',   // models/ 접두사 포함
    ];
    
    const finalModelNames = modelNames;
    
    const systemInstruction = `당신은 악세서리 브랜드 '루미나(LUMINA)'의 AI 퍼스널 스타일리스트 '루미'입니다.
        
        [역할]
        - 당신의 말투는 우아하고, 친절하며, 세련된 한국어를 사용합니다 (비즈니스 캐주얼 존댓말).
        - 고객의 요청(TPO, 스타일, 선호 소재 등)을 분석하여 가장 적합한 상품을 골라주세요.
        - 추천할 상품이 없다면 솔직하게 말하고 비슷한 다른 스타일을 제안하세요.

        [데이터 활용 가이드]
        - 제공된 상품 목록에는 [이름, 가격, 카테고리, 소재, 태그] 정보가 포함되어 있습니다.
        - 고객이 '금'이나 '골드'를 찾으면 '소재: 14k Gold' 또는 '태그: Gold'가 포함된 상품을 우선 추천하세요.
        - 구체적인 상품 추천 시, 상품명을 정확하게 언급해주세요 (예: "고객님께는 '엘레강스 펄 이어링'이 잘 어울리실 것 같아요.").

        답변은 300자 이내로 읽기 편하게 작성하고, 이모지를 적절히(💎, ✨ 등) 사용하여 감성을 더해주세요.`;

    const prompt = `Context about the shop products:\n${context}\n\nUser says: ${userMessage}`;
    
    // 모델을 순서대로 시도
    let lastError: any = null;
    for (const modelName of finalModelNames) {
      try {
        // 모델 이름에서 'models/' 접두사 제거 (있는 경우)
        const cleanModelName = modelName.replace(/^models\//, '');
        console.log(`[MY_LOG] Gemini API 모델 시도: ${cleanModelName}`);
        
        const model = genAI.getGenerativeModel({ 
          model: cleanModelName,
          systemInstruction: systemInstruction
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`[MY_LOG] Gemini API 응답 성공 (모델: ${cleanModelName})`);
        return text || "스타일링을 생각하는 중이에요. 잠시 후 다시 물어봐주시겠어요?";
      } catch (modelError: any) {
        console.warn(`[MY_LOG] 모델 ${modelName} 실패:`, modelError?.message);
        lastError = modelError;
        // 404 오류가 아니면 즉시 중단 (권한 문제 등)
        if (modelError?.status !== 404 && modelError?.status !== 400) {
          throw modelError;
        }
        // 404/400 오류면 다음 모델 시도
        continue;
      }
    }
    
    // 모든 모델이 실패한 경우
    throw lastError || new Error('모든 모델 시도 실패');
  } catch (error: any) {
    console.error("[MY_LOG] Gemini Error 상세:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusText: error?.statusText,
      stack: error?.stack,
      fullError: error
    });
    
    const errorMessage = error?.message || error?.toString() || "알 수 없는 오류";
    const errorCode = error?.code || error?.status || '';
    
    // 더 구체적인 에러 메시지 제공
    if (errorCode === 400 || errorMessage.includes('API_KEY') || errorMessage.includes('INVALID_ARGUMENT')) {
      return "API 키 설정에 문제가 있습니다. 관리자에게 문의해주세요.";
    } else if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return "요청이 너무 많아 잠시 대기 중입니다. 잠시 후 다시 시도해주세요.";
    } else if (errorCode === 503 || errorMessage.includes('SERVICE_UNAVAILABLE')) {
      return "서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.";
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      return "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.";
    } else if (errorMessage.includes('PERMISSION_DENIED') || errorCode === 403) {
      return "API 접근 권한이 없습니다. 관리자에게 문의해주세요.";
    }
    
    return `지금은 패션 요청 처리 중 문제가 발생했어요. 나중에 다시 시도해주세요. (오류 코드: ${errorCode || 'N/A'})`;
  }
};