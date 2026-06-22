// src/service/chatService.ts

import api from "./axios";


export const sendMessageToAi = async (message: string, currentPlanPlaces: string[], day: number) => {
  // 💡 세 번째 인자로 받은 day를 백엔드로 함께 전송합니다.
  const response = await api.post('/api/ai/chat', {
    message,
    currentPlanPlaces,
    day 
  });
  return response.data; // { reply: "..." }
};