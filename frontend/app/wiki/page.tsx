"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface University {
  id: number;
  name: string;
  short_name: string;
  description: string;
  logo_url: string | null;
}

export default function WikiPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/universities");
        if (!response.ok) throw new Error("Ошибка при загрузке данных");
        const data = await response.json();
        setUniversities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium italic">Загружаем базу знаний...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
          <p className="text-red-500 font-bold mb-2">Упс! Что-то пошло не так</p>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase">
              Вики-база вузов
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-6 mb-4">
              Твой путь начинается здесь
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Полная информация о проходных баллах, специальностях и возможностях обучения в Беларуси.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {universities.map((uni) => (
            <Link href={`/wiki/${uni.id}`} key={uni.id}>
              <motion.div
                whileHover={{ y: -5 }}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                      <GraduationCap className="text-slate-400 group-hover:text-indigo-600" size={32} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors flex items-center gap-1 uppercase tracking-widest">
                      Подробнее <ArrowRight size={14} />
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-2">{uni.short_name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                    {uni.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}