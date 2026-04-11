"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, MapPin, Globe, Users, Calendar, ShieldCheck, Home, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface Specialty {
  name: string;
  code: string;
  budget_score: number;
  paid_score: number;
}

interface Faculty {
  id: number;
  name: string;
  specialties: Specialty[];
}

interface UniversityDetail {
  id: number;
  name: string;
  short_name: string;
  history: string;
  cover_image: string;
  website: string;
  address: string;
  founded_year: number;
  has_military_faculty: boolean;
  has_dormitory: boolean;
  faculties: Faculty[];
}

export default function UniversityDetailPage() {
  const { id } = useParams();
  const [uni, setUni] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaculty, setExpandedFaculty] = useState<number | null>(null);

  useEffect(() => {
    const fetchUniDetail = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/universities/${id}`);
        if (!response.ok) throw new Error("Вуз не найден");
        const data = await response.json();
        setUni(data);
        if (data.faculties.length > 0) setExpandedFaculty(data.faculties[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUniDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!uni) return <div className="text-center mt-20 font-bold">Университет не найден</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/wiki" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors">
            <ChevronLeft size={20} /> Назад к списку
          </Link>
          <a href={`https://${uni.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors">
            <Globe size={16} /> {uni.website}
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full h-[400px] rounded-[3rem] overflow-hidden shadow-sm mb-12">
          <img src={uni.cover_image} alt={uni.short_name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-10 text-white w-full">
            <div className="flex gap-4 mb-4">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <MapPin size={16} /> {uni.address}
              </span>
            </div>
            <h1 className="text-5xl font-black mb-2">{uni.short_name}</h1>
            <p className="text-xl text-slate-200 max-w-2xl">{uni.name}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-6 text-slate-900">Краткие факты</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-slate-600"><Calendar className="text-indigo-500" size={24}/> <span>Основан в <strong>{uni.founded_year}</strong></span></li>
                <li className="flex items-center gap-4 text-slate-600"><Users className="text-indigo-500" size={24}/> <span>Ведущий вуз</span></li>
                <li className="flex items-center gap-4 text-slate-600"><ShieldCheck className={uni.has_military_faculty ? "text-emerald-500" : "text-slate-300"} size={24}/> <span>Военная кафедра: <strong>{uni.has_military_faculty ? "Есть" : "Нет"}</strong></span></li>
                <li className="flex items-center gap-4 text-slate-600"><Home className={uni.has_dormitory ? "text-emerald-500" : "text-slate-300"} size={24}/> <span>Общежитие: <strong>{uni.has_dormitory ? "Да" : "Нет"}</strong></span></li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 text-slate-900">История</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{uni.history}</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Факультеты</h2>
            {uni.faculties.map((faculty) => (
              <div key={faculty.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setExpandedFaculty(expandedFaculty === faculty.id ? null : faculty.id)} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                  <h3 className="text-xl font-bold text-slate-800 pr-4">{faculty.name}</h3>
                  <motion.div animate={{ rotate: expandedFaculty === faculty.id ? 180 : 0 }}><ChevronDown className="text-slate-400" /></motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaculty === faculty.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
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
                                <p className="text-indigo-700 font-black text-xl">{spec.budget_score}</p>
                              </div>
                              <div className="bg-slate-50 px-4 py-2 rounded-xl text-center flex-1 sm:flex-none">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Платно</p>
                                <p className="text-slate-700 font-black text-xl">{spec.paid_score}</p>
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