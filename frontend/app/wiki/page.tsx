"use client";
import { motion } from "framer-motion";
import { GraduationCap, Users, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

// В будущем этот массив придет из API (useEffect + fetch)
const universities = [
  {
    id: 1,
    name: "Белорусский государственный университет информатики и радиоэлектроники",
    shortName: "БГУИР",
    facultiesCount: 7,
    specialtiesCount: 35,
    type: "Государственный",
  },
  {
    id: 2,
    name: "Белорусский государственный университет",
    shortName: "БГУ",
    facultiesCount: 20,
    specialtiesCount: 80,
    type: "Государственный",
  },
];

export default function WikiPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <header className="mb-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            База знаний ВУЗов
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Выбирай университет, чтобы увидеть факультеты и актуальные баллы
          </p>
        </motion.div>
      </header>

      {/* Сетка Вузов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {universities.map((uni, index) => (
          <Link href={`/wiki/${uni.id}`} key={uni.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Декоративный фон при ховере */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:shadow-lg transition-all text-slate-400 group-hover:text-indigo-600">
                    <GraduationCap size={28} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                    {uni.type}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {uni.shortName}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-8 line-clamp-2 italic">
                  {uni.name}
                </p>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Факультетов</p>
                      <p className="text-sm font-bold text-slate-700">{uni.facultiesCount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Программ</p>
                      <p className="text-sm font-bold text-slate-700">{uni.specialtiesCount}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center text-indigo-600 font-bold text-sm gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Подробнее <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}