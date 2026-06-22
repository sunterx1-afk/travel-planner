import React, { useState, useEffect, useRef } from "react";
// 🚀 만들어둔 chatService 임포트
import { sendMessageToAi } from "../service/chatService"; 

interface MessageItem {
  role: "user" | "assistant";
  content: string;
}

interface TravelChatbotProps {
  currentPlanPlaces?: string[];
  currentDay?: number; // 💡 현재 사용자가 보고 있는 일차 (기본값 1일차)
}

// 💡 1. 여기서 currentDay를 구조 분해 할당으로 꺼내고, 기본값을 1로 줍니다.
export const TravelChatbot: React.FC<TravelChatbotProps> = ({ currentPlanPlaces = [], currentDay = 1 }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    { 
      role: "assistant", 
      content: "안녕하세요! UTrip AI 가이드입니다. 🗺️\n방금 추천받은 일정의 대중교통 노선, 버스비, 현지 날씨 팁 등 궁금한 점을 편하게 물어보세요!" 
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 💡 [추가] 챗봇 내부 헤더에 동적으로 일차를 띄워줄 상태 변수 정의 (초기값은 부모가 준 currentDay)
  const [displayDay, setDisplayDay] = useState<number>(currentDay);

  // 부모 탭이 클릭되어 바뀔 때도 동기화될 수 있도록 효과 추가
  useEffect(() => {
    setDisplayDay(currentDay);
  }, [currentDay]);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage;
    
    // 💡 [핵심] 유저가 친 텍스트 문장을 검사해서 헤더의 '일차 숫자'를 동적으로 가로챕니다!
    let targetDay = displayDay; 
    if (userMsg.includes("1일차") || userMsg.includes("첫째날")) {
      targetDay = 1;
      setDisplayDay(1);
    } else if (userMsg.includes("2일차") || userMsg.includes("둘째날")) {
      targetDay = 2;
      setDisplayDay(2);
    } else if (userMsg.includes("3일차") || userMsg.includes("셋째날")) {
      targetDay = 3;
      setDisplayDay(3);
    }

    setInputMessage(""); 
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // 💡 2. 감지된 targetDay를 sendMessageToAi의 세 번째 인자로 실어 서버로 전송합니다.
      const data = await sendMessageToAi(userMsg, currentPlanPlaces, targetDay);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("챗봇 통신 실패:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ AI 가이드가 일시적으로 길을 잃었어요. 잠시 후 다시 질문해 주세요!" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 둥근 플로팅 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-700 transition-transform active:scale-95"
      >
        {isOpen ? <span className="text-xl font-bold">✕</span> : <span className="text-2xl">💬</span>}
      </button>

      {/* 챗봇 대화창 모달 */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          {/* 상단바 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {/* 💡 고정된 currentDay 대신 동적으로 변하는 displayDay를 렌더링하도록 수정 완료 */}
              <h3 className="font-semibold text-sm">UTrip AI 가이드 ({displayDay}일차)</h3>
            </div>
            {/* 💡 백엔드 기종 변경에 맞게 Llama 3.1로 텍스트 문구 갱신 */}
            <span className="text-xs opacity-75">Llama 3.1 Connected</span>
          </div>

          {/* 대화 메시지 영역 */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* 로딩 표시 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-400 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1 shadow-sm">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:0.2s]">●</span>
                  <span className="animate-bounce [animation-delay:0.4s]">●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 하단 입력 폼 */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              placeholder="예: 방금 경로 버스비 알려줘"
              className="flex-1 p-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:bg-gray-300"
            >
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
};