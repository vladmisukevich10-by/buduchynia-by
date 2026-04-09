"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

// Добавляем описание типов для TypeScript
interface Message {
  text: string;
  isBot: boolean;
}

export default function NavigatorChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Привет! Я твой личный образовательный навигатор. Спроси меня о поступлении, проходных баллах или факультетах!",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ID студента (захардкожен для тестов)
  const CURRENT_STUDENT_ID = 1;

  // Автоскролл к последнему сообщению
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Обработчик отправки формы
  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Отправляем запрос на твой FastAPI бэкенд
      const response = await fetch("http://127.0.0.1:8000/ask_navigator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: CURRENT_STUDENT_ID,
          question: userMessage.text,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { text: data.answer, isBot: true }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "❌ Ошибка сервера: " + (data.detail || "Неизвестно"), isBot: true },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "🔌 Нет связи с сервером. Проверь, запущен ли FastAPI (uvicorn).", isBot: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-[#eef2ff] min-h-screen flex justify-center items-center font-sans text-gray-800 p-4">
      <div className="w-full max-w-2xl bg-white h-[90vh] rounded-3xl shadow-xl flex flex-col overflow-hidden border border-indigo-50">
        
        {/* Шапка */}
        <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#818cf8] flex items-center justify-center text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Будучыня.BY</h1>
              <p className="text-xs text-[#818cf8] font-medium">AI-Навигатор онлайн</p>
            </div>
          </div>
          <div className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ID: {CURRENT_STUDENT_ID}
          </div>
        </header>

        {/* Окно сообщений */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#eef2ff]/30 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 animate-fade-in-up ${!msg.isBot && "flex-row-reverse"}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-1 ${msg.isBot ? "bg-[#818cf8]" : "bg-gray-800"}`}>
                {msg.isBot ? "🤖" : "👤"}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${msg.isBot ? "bg-white border border-gray-100 rounded-tl-none" : "bg-gray-800 text-white rounded-tr-none"}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Индикатор загрузки "Бот печатает..." */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-[#818cf8] flex-shrink-0 flex items-center justify-center text-white mt-1">🤖</div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 h-12 text-[#818cf8]">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {/* Поле ввода */}
        <footer className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={sendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напиши свой вопрос..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-2 focus:ring-[#818cf8] focus:border-transparent block py-3 pl-5 pr-14 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="absolute right-1 top-1 bottom-1 aspect-square bg-[#818cf8] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-full transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}