"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Globe, Users, Calendar, ShieldCheck, Home, ChevronDown } from "lucide-react";
import Link from "next/link";

// Временные данные (позже заменим на запрос к FastAPI)
const UNI_DATA = {
  id: 1,
  shortName: "БГУИР",
  fullName: "Белорусский государственный университет информатики и радиоэлектроники",
  founded: "1964",
  students: "15 000+",
  location: "Минск, ул. П. Бровки, 6",
  website: "bsuir.by",
  coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop", // Красивое фото универа
  history: "Ведущий вуз Республики Беларусь в области информационных технологий, радиотехники, электроники и телекоммуникаций. БГУИР сегодня — это крупный учебно-научно-инновационный комплекс. Университет славится своими лабораториями, созданными совместно с мировыми IT-гигантами.",
  facilities: { military: true, dorms: true },
  faculties: [
    {
      id: "fksis",
      name: "Факультет компьютерных систем и сетей (ФКСиС)",
      specialties: [
        { name: "Программная инженерия", budget: 395, paid: 340, code: "6-05-0611-01" },
        { name: "Информатика и технологии программирования", budget: 391, paid: 335, code: "6-05-0611-04" }
      ]
    },
    {
      id: "fitu",
      name: "Факультет информационных технологий и управления (ФИТУ)",
      specialties: [
        { name: "Информационные системы и технологии", budget: 370, paid: 310, code: "6-05-0611-03" },
        { name: "Искусственный интеллект", budget: 385, paid: 320, code: "6-05-0612-01" }
      ]
    }
  ]
};

export default function UniversityDetailPage() {
  const { id } = useParams();
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(UNI_DATA.faculties[0].id);

  const toggleFaculty = (facId: string) => {
    setExpandedFaculty(expandedFaculty === facId ? null : facId);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Навигация (Sticky) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/wiki" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
            <ChevronLeft size={20} /> Назад к списку
          </Link>
          <a href={`https://${UNI_DATA.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors">
            <Globe size={16} /> {UNI_DATA.website}
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Шапка с фото (Hero Section) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-[400px] rounded-[3rem] overflow-hidden shadow-sm mb-12"
        >
          <img src={UNI_DATA.coverImage} alt={UNI_DATA.shortName} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-10 text-white w-full">
            <div className="flex gap-4 mb-4">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <MapPin size={16} /> {UNI_DATA.location}
              </span>
            </div>
            <h1 className="text-5xl font-black mb-2">{UNI_DATA.shortName}</h1>
            <p className="text-xl text-slate-200 max-w-2xl">{UNI_DATA.fullName}</p>
          </div>
        </motion.div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Левая колонка: Информация */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 text-slate-900">Краткие факты</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-slate-600"><Calendar className="text-indigo-500" size={24}/> <span>Основан в <strong>{UNI_DATA.founded}</strong></span></li>
                <li className="flex items-center gap-4 text-slate-600"><Users className="text-indigo-500" size={24}/> <span><strong>{UNI_DATA.students}</strong> студентов</span></li>
                <li className="flex items-center gap-4 text-slate-600">
                  <ShieldCheck className={UNI_DATA.facilities.military ? "text-emerald-500" : "text-slate-300"} size={24}/> 
                  <span>Военная кафедра: <strong>{UNI_DATA.facilities.military ? "Есть" : "Нет"}</strong></span>
                </li>
                <li className="flex items-center gap-4 text-slate-600">
                  <Home className={UNI_DATA.facilities.dorms ? "text-emerald-500" : "text-slate-300"} size={24}/> 
                  <span>Общежитие: <strong>{UNI_DATA.facilities.dorms ? "Всем иногородним" : "Ограничено"}</strong></span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 text-slate-900">История и статус</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {UNI_DATA.history}
              </p>
            </div>
          </div>

          {/* Правая колонка: Факультеты и специальности */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Факультеты и проходные баллы</h2>
            
            {UNI_DATA.faculties.map((faculty) => (
              <div key={faculty.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* Заголовок факультета (Кликабельный) */}
                <button 
                  onClick={() => toggleFaculty(faculty.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <h3 className="text-xl font-bold text-slate-800 pr-4">{faculty.name}</h3>
                  <motion.div animate={{ rotate: expandedFaculty === faculty.id ? 180 : 0 }}>
                    <ChevronDown className="text-slate-400" />
                  </motion.div>
                </button>

                {/* Раскрывающийся список специальностей */}
                <AnimatePresence>
                  {expandedFaculty === faculty.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 border-t border-slate-50 space-y-3 bg-slate-50/50">
                        {faculty.specialties.map((spec, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-bold text-slate-900 text-lg">{spec.name}</p>
                              <p className="text-xs text-slate-400 font-mono mt-1">Код: {spec.code}</p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                              <div className="bg-indigo-50 px-4 py-2 rounded-xl text-center flex-1 sm:flex-none">
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Бюджет</p>
                                <p className="text-indigo-700 font-black text-xl">{spec.budget}</p>
                              </div>
                              <div className="bg-slate-50 px-4 py-2 rounded-xl text-center flex-1 sm:flex-none">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Платно</p>
                                <p className="text-slate-700 font-black text-xl">{spec.paid}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}