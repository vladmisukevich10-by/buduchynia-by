"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquare, Book, Map, Calculator, Settings } from "lucide-react";

const navItems = [
  { name: "Навигатор", href: "/", icon: MessageSquare },
  { name: "Вики-база", href: "/wiki", icon: Book },
  { name: "Карта вузов", href: "/map", icon: Map },
  { name: "CRI Калькулятор", href: "/calc", icon: Calculator },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-white border-r border-slate-100 flex flex-col p-4 gap-2">
      <div className="mb-8 px-4 py-2">
        <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Будучыня.BY
        </span>
      </div>

      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive ? "text-indigo-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
            `}>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-indigo-50 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon size={20} />
              {item.name}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}