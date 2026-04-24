import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Star, X, Check, RefreshCcw, ChevronRight, Play, Heart, Shield, BookOpen, Users, TrendingUp, LayoutDashboard, ArrowLeft, Award, User, Trophy, Target, Medal, Crown, Zap, Gift, Lock, Settings, Calendar, MoreHorizontal, CreditCard, Download, FileText, Plus, Globe, FilePlus, Save, Trash2, GripVertical, Type, Puzzle, Search, DownloadCloud, Volume2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CourseBuilderScreen from './CourseBuilder';
import { api, coursesApi, patientsApi } from './api/db';
import { RegistrationScreen } from './components/RegistrationScreen';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import LZString from 'lz-string';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_COURSE_METRICS = [
  { name: 'Ene', estudiantes: 45, completados: 12, ingresos: 450 },
  { name: 'Feb', estudiantes: 52, completados: 18, ingresos: 520 },
  { name: 'Mar', estudiantes: 68, completados: 24, ingresos: 680 },
  { name: 'Abr', estudiantes: 85, completados: 35, ingresos: 850 },
  { name: 'May', estudiantes: 110, completados: 48, ingresos: 1100 },
  { name: 'Jun', estudiantes: 145, completados: 65, ingresos: 1450 },
];

function ProfileView({ xp, streak, friends = [], name, onLogout }: { xp: number, streak: number, friends: any[], name?: string, onLogout: () => void }) {
  const safeFriends = Array.isArray(friends) ? friends : [];
  const safeName = typeof name === 'string' ? name : 'Estudiante';
  const username = safeName.toLowerCase().replace(/\s+/g, '') || 'estudiante';
  
  return (
    <div className="w-full max-w-2xl px-4 py-8 pb-32 md:pb-8 mx-auto flex flex-col gap-10">
      {/* Header Profile with Premium Feel */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full translate-x-16 -translate-y-16 blur-2xl"></div>
        
        <div className="relative group">
          <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white flex items-center justify-center text-7xl shadow-xl shadow-blue-900/5 group-hover:scale-105 transition-transform duration-500">
            {safeName[0]?.toUpperCase() || '🐘'}
          </div>
          <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl border-2 border-blue-50 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:shadow-lg transition-all shadow-md active:scale-90">
            <Settings size={22} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left pt-2">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-1">
            <h2 className="text-3xl font-black text-blue-950 tracking-tight">{safeName}</h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              Nivel {Math.floor(xp / 100) + 1}
            </span>
          </div>
          <p className="text-blue-800/50 font-bold mb-4">@{username}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-2 text-blue-800/60 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl">
              <Calendar size={18} className="text-blue-400" />
              <span>Enero 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-4">
          <h3 className="text-2xl font-black text-blue-950 tracking-tight">Estadísticas</h3>
          <TrendingUp size={24} className="text-blue-200" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Racha de días', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-200' },
            { label: 'Total XP', value: xp, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50', dot: 'bg-yellow-200' },
            { label: 'Liga actual', value: 'Plata', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-200' },
            { label: 'Finales liga', value: 'Top 3', icon: Medal, color: 'text-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-200' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border-2 border-blue-50 rounded-3xl p-6 relative overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
              <div className={cn("inline-flex p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
                <stat.icon size={32} className={stat.icon === Flame || stat.icon === Zap ? 'fill-current' : ''} strokeWidth={2.5} />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-black text-blue-950 mb-1">{stat.value}</div>
                <div className="text-xs font-black text-blue-800/40 uppercase tracking-widest">{stat.label}</div>
              </div>
              <div className={cn("absolute -bottom-2 -right-2 w-12 h-12 rounded-full blur-2xl opacity-50", stat.dot)}></div>
            </div>
          ))}
        </div>
      </section>

      {/* Friends Selection with Modern Design */}
      <section>
        <div className="flex justify-between items-end mb-6 px-4">
          <h3 className="text-2xl font-black text-blue-950 tracking-tight">Amigos</h3>
          <button className="text-blue-600 font-bold text-sm uppercase tracking-wider hover:text-blue-700 transition-colors flex items-center gap-2 group">
            Añadir <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="bg-white border-2 border-blue-50 rounded-[2.5rem] flex flex-col overflow-hidden shadow-sm">
          {safeFriends.length > 0 ? safeFriends.map((friend, index) => (
            <div 
              key={friend?.id || index} 
              className={cn(
                "p-5 flex gap-5 items-center hover:bg-blue-50/50 transition-colors cursor-pointer group",
                index !== safeFriends.length - 1 && "border-b-2 border-blue-50"
              )}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-white flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform duration-500">
                {friend?.avatar || '👤'}
              </div>
              <div className="flex-1">
                <h4 className="font-black text-lg text-blue-950 leading-tight mb-1">{friend?.name || 'Amigo'}</h4>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-blue-50 rounded-full overflow-hidden max-w-[100px]">
                    <div className="h-full bg-blue-400" style={{ width: `${Math.min(((friend?.xp || 0) / 3000) * 100, 100)}%` }}></div>
                  </div>
                  <span className="text-blue-800/40 text-xs font-black uppercase tracking-widest">{friend?.xp || 0} XP</span>
                </div>
              </div>
              <button className="p-3 text-blue-200 hover:text-blue-600 hover:bg-white rounded-xl transition-all">
                <MoreHorizontal size={24} />
              </button>
            </div>
          )) : (
            <div className="p-12 text-center text-blue-800/30 font-bold italic">
               Aún no tienes amigos agregados ✨
            </div>
          )}
        </div>
      </section>

      {/* Logout Option - New Row */}
      <button 
        onClick={onLogout}
        className="mt-4 w-full py-5 rounded-[2rem] border-2 border-red-50 text-red-500 font-black uppercase tracking-widest text-sm hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <ArrowLeft size={20} strokeWidth={3} /> Salir del perfil
      </button>
    </div>
  );
}

function AchievementsView({ quests, achievements }: { quests: any[], achievements: any[] }) {
  return (
    <div className="w-full max-w-2xl px-4 py-8 pb-24 md:pb-8 mx-auto flex flex-col gap-8">
      {/* Daily Quests */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <h2 className="text-2xl font-bold text-blue-950">Misiones del día</h2>
          <span className="text-blue-500 font-bold text-sm">Faltan 14h</span>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-5 flex flex-col gap-5">
          {quests.map(quest => (
            <div key={quest.id} className="flex items-center gap-4">
              <div className="text-4xl">{quest.icon}</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-2">{quest.title}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${(quest.current / quest.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-400 w-12 text-right">
                    {quest.current}/{quest.max}
                  </span>
                  <Gift size={24} className={quest.current >= quest.max ? "text-yellow-500" : "text-gray-300"} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-2xl font-bold text-blue-950 mb-4 px-2">Logros</h2>
        <div className="bg-white border-2 border-gray-200 rounded-3xl flex flex-col overflow-hidden">
          {achievements.map((achievement, index) => (
            <div 
              key={achievement.id} 
              className={cn(
                "p-5 flex gap-4 items-center",
                index !== achievements.length - 1 && "border-b-2 border-gray-100",
                achievement.completed ? "bg-yellow-50/30" : ""
              )}
            >
              <div className="relative">
                <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border-b-4", achievement.bg, achievement.borderColor)}>
                  {achievement.icon}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center font-bold text-xs text-gray-500 shadow-sm">
                  N{achievement.level}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{achievement.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{achievement.description}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", achievement.completed ? "bg-yellow-400" : "bg-blue-400")}
                      style={{ width: `${(achievement.current / achievement.max) * 100}%` }}
                    />
                  </div>
                  <span className={cn("text-sm font-bold w-12 text-right", achievement.completed ? "text-yellow-500" : "text-gray-400")}>
                    {achievement.current}/{achievement.max}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CourseMosaicView({ courses, onSelectCourse }: { courses: any[], onSelectCourse: (id: string) => void }) {
  return (
    <div className="w-full max-w-4xl px-6 py-8">
      <h2 className="text-2xl font-bold text-blue-950 mb-6">Tus Cursos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => course.status !== 'locked' && onSelectCourse(course.id)}
            className={cn(
              "text-left rounded-3xl p-6 border-2 transition-all relative overflow-hidden flex flex-col h-full",
              course.status === 'locked' ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-70" : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md active:scale-95"
            )}
          >
            <div className="flex justify-between items-start mb-4 w-full">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0", course.lightColor)}>
                {course.icon}
              </div>
              {course.status === 'current' && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ml-2">
                  En progreso
                </span>
              )}
              {course.status === 'completed' && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ml-2">
                  Completado
                </span>
              )}
              {course.status === 'available' && (
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shrink-0 ml-2">
                  Disponible
                </span>
              )}
            </div>
            <h3 className={cn("text-xl font-bold mb-2", course.status === 'locked' ? "text-gray-500" : "text-blue-950")}>
              {course.title}
            </h3>
            <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
              {course.description}
            </p>
            
            {/* Progress Bar */}
            {course.status !== 'locked' && (
              <div className="w-full mt-auto">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className={course.textColor}>Progreso</span>
                  <span className={course.textColor}>{course.progress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000", course.color)} 
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
            {course.status === 'locked' && (
              <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mt-auto pt-4 border-t border-gray-200 w-full">
                <Shield size={16} /> Bloqueado
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function CoursePathView({ courseId, courses, onBack, onStartLesson }: { courseId: string, courses: any[], onBack: () => void, onStartLesson: (blocks?: any[]) => void }) {
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  const course = courses.find(c => c.id === courseId) || courses[0];
  
  return (
    <>
      {/* Back button for path view */}
      <div className="w-full max-w-md px-6 pt-4 hidden md:block">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Volver a cursos
        </button>
      </div>

      {/* Mascot Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-6 mt-2 flex flex-col items-center text-center"
      >
        <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-100 relative mb-6">
          <p className="text-blue-800 font-medium text-lg">
            ¡Hola! Hoy es <span className="capitalize">{today}</span>. <br/> ¡Vamos a aprender!
          </p>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-b-2 border-r-2 border-blue-100 transform rotate-45"></div>
        </div>
        <div className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>🐘</div>
      </motion.div>

      {/* Path */}
      <div className="w-full max-w-md px-6 flex flex-col items-center gap-8 mt-4 relative">
        {/* SVG Path Line */}
        <div className="absolute top-0 bottom-0 w-4 bg-blue-100 rounded-full -z-10"></div>

        {course.lessons.map((lesson: any, index: number) => {
          const isCurrent = !lesson.completed && course.lessons[index - 1]?.completed !== false;
          const isLocked = !lesson.completed && !isCurrent;

          // Winding effect
          const offset = index % 2 === 0 ? 'translate-x-12' : '-translate-x-12';

          return (
            <motion.div 
              key={lesson.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn("relative flex flex-col items-center", offset)}
            >
              <button
                onClick={() => isCurrent && onStartLesson(lesson.blocks)}
                disabled={isLocked}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center border-b-8 transition-transform active:scale-95 active:border-b-0 active:translate-y-2",
                  lesson.completed ? "bg-blue-500 border-blue-700 text-white" :
                  isCurrent ? "bg-violet-500 border-violet-700 text-white ring-4 ring-violet-200 ring-offset-2" :
                  "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                )}
              >
                {lesson.completed ? <Check size={40} strokeWidth={3} /> : 
                 isCurrent ? <Play size={40} strokeWidth={3} className="ml-1 fill-white" /> : 
                 <Star size={40} strokeWidth={3} />}
              </button>
              
              {/* Floating Label for Current Lesson */}
              {isCurrent && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-12 bg-white px-4 py-2 rounded-xl shadow-sm border-2 border-violet-100 whitespace-nowrap z-10"
                >
                  <p className="text-violet-700 font-bold text-sm">Lección {lesson.id}</p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-violet-100 transform rotate-45"></div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

// 0. Splash Screen
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 h-[100dvh] bg-blue-500 flex flex-col items-center justify-center z-50 overflow-hidden">
      <motion.div
        initial={{ x: -150 }}
        animate={{ 
          x: 150, 
          y: [0, -20, 0, -20, 0, -20, 0],
          rotate: [0, 10, 0, -10, 0, 10, 0]
        }}
        transition={{ duration: 2.5, ease: "linear" }}
        className="text-9xl"
      >
        🐘
      </motion.div>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white text-3xl font-bold mt-8 tracking-wide"
      >
        ¡Allá vamos!
      </motion.h2>
    </div>
  );
}

// 0. Catalog Screen
function CatalogScreen({ catalogCourses, onBack, onEnterApp, onAddCourse }: { catalogCourses: any[], onBack: () => void, onEnterApp: () => void, onAddCourse: (course: any) => void }) {
  const [filter, setFilter] = useState<'todos' | 'libre' | 'supervisado'>('todos');

  const filteredCourses = catalogCourses.filter(course => 
    filter === 'todos' ? true : course.classification === filter
  );

  return (
    <div className="min-h-screen bg-blue-50 font-sans pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue-950 flex items-center gap-2">
              <Globe className="text-blue-500" /> Catálogo de Cursos
            </h1>
          </div>
          <button 
            onClick={onEnterApp}
            className="hidden md:block bg-blue-100 text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-blue-200 transition-colors"
          >
            Ir a mi cuenta
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-blue-950 mb-4">Descubre nuevas formas de aprender</h2>
          <p className="text-lg text-blue-800/80">
            Explora nuestra biblioteca de cursos diseñados para potenciar el desarrollo. 
            Encuentra recursos libres o sigue el plan de supervisión de tu profesional.
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => setFilter('todos')}
            className={cn("px-6 py-2 rounded-full font-bold transition-all", filter === 'todos' ? "bg-blue-600 text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50")}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('libre')}
            className={cn("px-6 py-2 rounded-full font-bold transition-all", filter === 'libre' ? "bg-blue-600 text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50")}
          >
            Libres
          </button>
          <button 
            onClick={() => setFilter('supervisado')}
            className={cn("px-6 py-2 rounded-full font-bold transition-all", filter === 'supervisado' ? "bg-blue-600 text-white shadow-md" : "bg-white text-blue-600 hover:bg-blue-50")}
          >
            Supervisados
          </button>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredCourses.map(course => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner", course.lightColor)}>
                  {course.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    course.classification === 'libre' ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"
                  )}>
                    {course.classification === 'libre' ? 'Libre' : 'Supervisado'}
                  </span>
                  {course.professionalName && (
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <User size={12} /> {course.professionalName}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-blue-950 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{course.description}</p>

              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Target size={18} className="text-blue-500" /> Objetivo Principal
                </h4>
                <p className="text-sm text-blue-800">{course.objective}</p>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Check size={18} className="text-emerald-500" /> Objetivos con el niño
                </h4>
                <ul className="space-y-2">
                  {course.childObjectives.map((obj, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => onAddCourse(course)}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]",
                  course.classification === 'libre' 
                    ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20" 
                    : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                )}
              >
                {course.classification === 'libre' ? 'Agregar a mi catálogo' : 'Solicitar Acceso'}
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

// 0. Landing Page
function LandingPage({ 
  catalogCourses,
  onEnterApp,
  onEnterRegister,
  onEnterPro, 
  onEnterCatalog,
  onEnterDemo,
}: { 
  catalogCourses: any[],
  onEnterApp: () => void,
  onEnterRegister: () => void,
  onEnterPro: () => void, 
  onEnterCatalog: () => void,
  onEnterDemo: () => void,
}) {
  const [modal, setModal] = useState<'none' | 'login' | 'contact'>('none');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) {
        setLoginError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
      } else {
        setModal('none');
        onEnterApp();
      }
    } catch {
      setLoginError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setContactSent(true);
    setContactLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans overflow-x-hidden selection:bg-blue-200">

      {/* Login Modal */}
      <AnimatePresence>
        {modal === 'login' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-950/50 backdrop-blur-sm"
              onClick={() => setModal('none')} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
                <div className="text-4xl mb-3">🐘</div>
                <h2 className="text-2xl font-extrabold">Bienvenido de vuelta</h2>
                <p className="text-blue-100 text-sm mt-1">Ingresá a tu cuenta de Fante</p>
              </div>
              <div className="p-8">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1.5">Correo electrónico</label>
                    <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-blue-950" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-900 mb-1.5">Contraseña</label>
                    <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-blue-950" />
                  </div>
                  {loginError && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
                      <X size={16} /> {loginError}
                    </div>
                  )}
                  <button type="submit" disabled={loginLoading}
                    className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                    {loginLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                    {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </button>
                </form>
                <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                  <p className="text-sm text-blue-800/60 mb-3">¿No tenés cuenta aún?</p>
                  <button onClick={() => { setModal('none'); onEnterRegister(); }}
                    className="text-blue-600 font-bold text-sm hover:underline">
                    Crear cuenta gratis →
                  </button>
                </div>
              </div>
              <button onClick={() => setModal('none')}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all">
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <AnimatePresence>
        {modal === 'contact' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-950/50 backdrop-blur-sm"
              onClick={() => { setModal('none'); setContactSent(false); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
                <div className="text-4xl mb-3">💬</div>
                <h2 className="text-2xl font-extrabold">Hablemos</h2>
                <p className="text-indigo-100 text-sm mt-1">Escribinos y te respondemos a la brevedad.</p>
              </div>
              <div className="p-8">
                {contactSent ? (
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-blue-950 mb-2">¡Mensaje enviado!</h3>
                    <p className="text-blue-800/60 mb-6">Gracias por escribirnos. Te responderemos a <strong>{contactForm.email}</strong> a la brevedad.</p>
                    <button onClick={() => { setModal('none'); setContactSent(false); setContactForm({ name: '', email: '', message: '' }); }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-1.5">Nombre *</label>
                        <input type="text" required value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="Tu nombre"
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-blue-950" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-1.5">Correo *</label>
                        <input type="email" required value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                          placeholder="tu@correo.com"
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-blue-950" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-1.5">Mensaje *</label>
                      <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Contanos en qué podemos ayudarte..."
                        className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-blue-950 resize-none" />
                    </div>
                    <button type="submit" disabled={contactLoading}
                      className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                      {contactLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                      {contactLoading ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                )}
              </div>
              <button onClick={() => { setModal('none'); setContactSent(false); }}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all">
                <X size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <span className="text-3xl">🐘</span> Fante
          </div>
          <div className="hidden md:flex items-center gap-8 text-blue-800 font-medium">
            <a href="#historia" className="hover:text-blue-600 transition-colors">Nuestra Historia</a>
            <a href="#familias" className="hover:text-blue-600 transition-colors">Para Familias</a>
            <a href="#profesionales" className="hover:text-blue-600 transition-colors">Para Profesionales</a>
            <a href="#catalogo" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Globe size={18} /> Catálogo
            </a>
            <div className="flex items-center gap-3">
              <button id="btn-iniciar-sesion" onClick={() => setModal('login')}
                className="text-blue-700 px-6 py-2 rounded-full font-bold border-2 border-blue-200 hover:bg-blue-50 transition-colors">
                Iniciar Sesión
              </button>
              <button id="btn-comenzar-gratis-nav" onClick={onEnterRegister}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700 transition-colors">
                Comenzar gratis
              </button>
            </div>
          </div>
          <div className="flex md:hidden gap-2">
            <button onClick={() => setModal('login')} className="text-blue-700 px-4 py-2 rounded-full font-bold border-2 border-blue-200 text-sm">Entrar</button>
            <button onClick={onEnterRegister} className="bg-indigo-600 text-white px-4 py-2 rounded-full font-bold text-sm">Registro</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-20 md:pt-16 md:pb-24 px-6 text-center max-w-5xl mx-auto flex flex-col items-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-7xl mb-6">🐘</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-extrabold text-blue-950 mb-6 tracking-tight leading-tight">
          Rutinas predecibles. <br className="hidden md:block" />
          <span className="text-blue-600">Aprendizaje real.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-blue-800/80 mb-8 max-w-3xl leading-relaxed">
          Una plataforma diseñada para niños con TEA y NEE. Transformamos el tiempo de pantalla en secuencias estructuradas que bajan la ansiedad y construyen habilidades, un día a la vez.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button id="btn-comenzar-gratis-hero" onClick={onEnterRegister}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold border-b-4 border-indigo-800 hover:bg-indigo-500 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-indigo-500/30">
            Comenzar gratis
          </button>
          <a href="#catalogo" className="bg-white text-blue-700 px-8 py-4 rounded-2xl text-lg font-bold border-2 border-blue-100 hover:bg-blue-50 transition-all inline-flex items-center justify-center">
            Ver catálogo de cursos
          </a>
        </motion.div>
      </section>

      {/* Nuestra Historia */}
      <section className="py-24 bg-white border-y border-blue-100" id="historia">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">
            <Heart size={18} /> Nuestra Historia
          </div>
          <h2 className="text-4xl font-bold text-blue-950 mb-8 leading-tight">Diseñada con amor para niños con NEE y TEA</h2>
          <div className="space-y-6 text-lg text-blue-800/80 leading-relaxed text-left bg-blue-50/50 p-8 md:p-12 rounded-3xl border border-blue-100">
            <p className="font-bold text-xl text-blue-900">Fante nació de Vicente.</p>
            <p>Vicente tiene TEA con retraso madurativo y lleva más de 325 días consecutivos estudiando en Duolingo sin que nadie se lo pida. Lo que descubrimos como familia no fue una aplicación educativa. Fue algo más específico: que Vicente, como muchos niños en el espectro, responde extraordinariamente bien a la previsibilidad, la secuencia visible y la recompensa inmediata.</p>
            <p>Lo que no encontramos fue una herramienta que nos permitiera crear ese tipo de contenido a medida: adaptado a su nivel, a sus terapias, a los objetivos que su psicopedagoga trabaja en el consultorio pero que necesitan repetición fuera de él.</p>
            <p className="font-bold text-blue-900">Entonces la construimos.</p>
            <p>Fante no es una solución para todo el espectro. Es una herramienta para un momento muy específico: el tiempo que estos niños ya pasan en el celular, que hoy mayormente se va a YouTube o a juegos. No peleamos contra eso. Lo aprovechamos.</p>
            <p className="font-medium text-blue-900">Esperamos que Fante sea un apoyo real para familias, psicopedagogos y equipos clínicos. No el centro de la terapia, sino el hilo que la conecta con el día a día del niño.</p>
          </div>
          <div className="mt-12 text-left">
            <h3 className="text-2xl font-bold text-blue-950 mb-6 text-center">Lo que aprendimos antes de construir Fante</h3>
            <div className="bg-white p-8 md:p-10 rounded-3xl border-2 border-blue-100 shadow-xl shadow-blue-900/5 relative">
              <div className="absolute -top-6 -left-6 text-6xl text-blue-200 font-serif">"</div>
              <div className="space-y-6 text-lg text-blue-900/80 leading-relaxed relative z-10 italic">
                <p>Hace poco más de un año le regalamos un celular a Vicente. Se puso muy feliz. Pero pronto el uso se descontroló. Cuando intentamos sacárselo, negociamos: le propusimos Duolingo. Se lo dijimos una sola vez. Desde ese día, cada mañana apenas se levanta, hace su lección. Van más de 325 días de racha. Hoy está en nivel 11 de inglés.</p>
                <p>Después notamos algo más. En nuestra iglesia existe un manual llamado Ven, Sígueme. Vicente lo tomó por su cuenta y empezó a estudiarlo solo, porque las fechas coincidían con lo que correspondía ese día.</p>
                <p className="font-bold text-blue-950">Nadie se lo pidió. La estructura lo llamó.</p>
              </div>
              <div className="mt-8 pt-6 border-t border-blue-50 text-right">
                <p className="font-bold text-blue-900">— Papá de Vicente, fundador de Fante</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Familias */}
      <section className="py-24 bg-white" id="familias">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">
                <Heart size={18} /> Para Familias
              </div>
              <h2 className="text-4xl font-bold text-blue-950 mb-6 leading-tight">El celular ya está en sus manos. <br/> Hagamos que ese tiempo valga.</h2>
              <p className="text-lg text-blue-800/70 mb-8">Fante utiliza mecánicas de gamificación comprobadas para mantener la motivación diaria, en un entorno visualmente calmado y predecible.</p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-2xl text-orange-600 shrink-0"><Flame size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-1">Rachas diarias</h4>
                    <p className="text-blue-800/70">El mismo principio que tiene a Vicente estudiando inglés 325 días seguidos.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shrink-0"><Shield size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-1">Sin cruces rojas</h4>
                    <p className="text-blue-800/70">Los errores no penalizan. Son una invitación a intentarlo de nuevo, con calma.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-violet-100 p-3 rounded-2xl text-violet-600 shrink-0"><Star size={24} /></div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900 mb-1">Siempre gratis para el alumno</h4>
                    <p className="text-blue-800/70">El aprendizaje del niño nunca va a estar detrás de un muro de pago.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 bg-blue-50 rounded-[3rem] p-8 relative overflow-hidden flex justify-center border-4 border-blue-100">
              <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden flex flex-col">
                <div className="bg-white p-4 flex justify-between items-center border-b border-gray-100">
                  <span className="text-2xl">🐘</span>
                  <span className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1"><Flame size={16}/> 325</span>
                </div>
                <div className="p-8 flex flex-col items-center gap-6 bg-blue-50/50 flex-1">
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 border-b-8 border-blue-700"><Check size={32} strokeWidth={3}/></div>
                  <div className="w-20 h-20 bg-violet-500 rounded-full flex items-center justify-center text-white ring-4 ring-violet-200 border-b-8 border-violet-700"><Play size={32} strokeWidth={3} className="ml-1"/></div>
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 border-b-8 border-gray-300"><Star size={32} strokeWidth={3}/></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Profesionales */}
      <section className="py-24 bg-blue-900 text-white" id="profesionales">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-800 text-blue-200 px-4 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">
              <BookOpen size={18} /> Para Profesionales
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Lo que trabajás en el consultorio <br/> necesita continuar en casa.</h2>
            <p className="text-xl text-blue-200 mb-8">Crea cursos personalizados, asigna tareas y monitorea el progreso de tus pacientes.</p>
            <button id="btn-acceder-profesional" onClick={onEnterPro}
              className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/50">
              Acceder como Profesional
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: LayoutDashboard, title: 'Creador de Cursos', desc: 'Diseñá lecciones con texto, imágenes, audio y preguntas. Sin saber programar.' },
              { icon: TrendingUp, title: 'Métricas', desc: 'Seguí la racha, las lecciones completadas y los errores frecuentes de cada paciente.' },
              { icon: Users, title: 'Comunidad', desc: 'Publicá tus cursos para que otras familias los usen o cloná material de otros profesionales.' },
            ].map((f, i) => (
              <div key={i} className="bg-blue-800/50 p-8 rounded-3xl border border-blue-700/50">
                <div className="bg-blue-700 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-200"><f.icon size={28} /></div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-blue-200 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catálogo */}
      <section className="py-24 bg-white border-y border-blue-100" id="catalogo">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">
              <Globe size={18} /> Catálogo
            </div>
            <h2 className="text-4xl font-bold text-blue-950 mb-6">Cursos listos para empezar</h2>
            <p className="text-xl text-blue-800/70">Explorá material creado por profesionales y familias.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {catalogCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="bg-white border-2 border-blue-100 rounded-3xl p-6 hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-900/5 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl", course.lightColor)}>{course.icon}</div>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{course.classification}</span>
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">{course.title}</h3>
                <p className="text-blue-800/70 mb-6 flex-1">{course.description}</p>
                <div className="pt-4 border-t border-blue-50 flex items-center justify-between">
                  <span className="font-bold text-blue-900">{course.price}</span>
                  <button onClick={onEnterCatalog} className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">Ver más <ChevronRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={onEnterCatalog} className="bg-white text-blue-700 px-8 py-4 rounded-2xl text-lg font-bold border-2 border-blue-200 hover:bg-blue-50 transition-all inline-flex items-center gap-2">
              Ver catálogo completo <ArrowLeft className="rotate-180" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-24 bg-blue-50" id="planes">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-blue-950 mb-6">Planes para profesionales</h2>
            <p className="text-xl text-blue-800/70"><span className="font-bold text-blue-600">Para los alumnos y sus familias, Fante siempre será gratuito.</span></p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-blue-100 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-blue-950 mb-2">Familiar</h3>
              <p className="text-blue-800/60 mb-6">Para padres que acompañan el aprendizaje en casa.</p>
              <div className="mb-8"><span className="text-5xl font-extrabold text-blue-950">Gratis</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Hasta 3 alumnos', 'Acceso a cursos públicos', 'Creación de cursos privados', 'Dashboard familiar básico'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-blue-900 font-medium">
                    <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Check size={16} strokeWidth={3} /></div>{f}
                  </li>
                ))}
              </ul>
              <button id="btn-comenzar-plan-familiar" onClick={onEnterRegister}
                className="w-full py-4 rounded-2xl font-bold text-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                Comenzar gratis
              </button>
            </div>
            <div className="bg-blue-600 rounded-[2rem] p-8 shadow-xl shadow-blue-600/20 border-2 border-blue-500 flex flex-col h-full md:-translate-y-4 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-sm">Más Elegido</div>
              <h3 className="text-2xl font-bold text-white mb-2">Profesional</h3>
              <p className="text-blue-100 mb-6">Para terapeutas y educadores independientes.</p>
              <div className="mb-8"><span className="text-5xl font-extrabold text-white">USD 19</span><span className="text-blue-200 font-medium">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Hasta 15 pacientes activos', 'Crear y publicar cursos', 'Métricas detalladas por paciente', 'Publicar en comunidad', 'Soporte prioritario', '30 días de prueba gratis'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-white font-medium">
                    <div className="bg-blue-500 p-1 rounded-full text-white"><Check size={16} strokeWidth={3} /></div>{f}
                  </li>
                ))}
              </ul>
              <button id="btn-prueba-profesional" onClick={onEnterRegister}
                className="w-full py-4 rounded-2xl font-bold text-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm">
                Comenzar prueba gratis
              </button>
            </div>
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-blue-100 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-blue-950 mb-2">Clínica</h3>
              <p className="text-blue-800/60 mb-6">Para instituciones y equipos de trabajo.</p>
              <div className="mb-8"><span className="text-5xl font-extrabold text-blue-950">USD 49</span><span className="text-blue-800/60 font-medium">/mes</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Hasta 5 profesionales', '25 pacientes por profesional', 'Dashboard institucional centralizado', 'Crear y publicar cursos', 'Soporte dedicado'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-blue-900 font-medium">
                    <div className="bg-blue-100 p-1 rounded-full text-blue-600"><Check size={16} strokeWidth={3} /></div>{f}
                  </li>
                ))}
              </ul>
              <button id="btn-contactar-ventas" onClick={() => setModal('contact')}
                className="w-full py-4 rounded-2xl font-bold text-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                Contactar ventas
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-blue-800/50 mt-8">Los precios están expresados en USD. Próximamente disponible el pago en pesos argentinos vía Mercado Pago.</p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-blue-50 text-center px-6">
        <h2 className="text-4xl font-bold text-blue-950 mb-4">¿Querés conocer a Fante?</h2>
        <p className="text-xl text-blue-800/80 mb-10 max-w-2xl mx-auto">Estamos en etapa de lanzamiento. Explorá la app ahora mismo con una sesión de prueba anónima, sin registrarte.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <button id="btn-explorar-fante" onClick={onEnterDemo}
            className="bg-blue-500 text-white px-10 py-5 rounded-2xl text-xl font-bold border-b-4 border-blue-700 hover:bg-blue-400 active:border-b-0 active:translate-y-1 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3">
            <Play size={22} className="fill-current" /> Explorar Fante →
          </button>
          <button id="btn-escribinos" onClick={() => setModal('contact')}
            className="bg-white text-blue-700 px-10 py-5 rounded-2xl text-xl font-bold border-2 border-blue-100 hover:bg-blue-50 transition-all">
            Escribinos
          </button>
        </div>
        <p className="text-sm text-blue-800/60 max-w-md mx-auto">Fante es un proyecto en construcción. Tu feedback en esta etapa es lo más valioso que podés darnos.</p>
      </section>
    </div>
  );
}


// 1. Home Screen (Path)
function HomeScreen({ 
  streak, 
  xp, 
  courses,
  catalogCourses,
  quests,
  achievements,
  friends,
  studentName,
  onStartLesson,
  onBack,
  onEnterCatalog
}: { 
  streak: number; 
  xp: number; 
  courses: any[];
  catalogCourses: any[];
  quests: any[];
  achievements: any[];
  friends: any[];
  studentName?: string;

  onStartLesson: (blocks?: any[]) => void;
  onBack: () => void;
  onEnterCatalog: () => void;
}) {
  const [activeTab, setActiveTab] = useState('cursos');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-blue-50 flex font-sans">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-blue-100 p-6 sticky top-0 h-[100dvh] shrink-0 z-20">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-3xl mb-12 px-4">
          <span className="text-4xl">🐘</span> Fante
        </div>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('cursos')}
            className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-lg", activeTab === 'cursos' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
          >
            <BookOpen size={28} /> Cursos
          </button>
          <button 
            onClick={() => setActiveTab('logros')}
            className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-lg", activeTab === 'logros' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
          >
            <Award size={28} /> Logros
          </button>
          <button 
            onClick={() => setActiveTab('perfil')}
            className={cn("flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-lg", activeTab === 'perfil' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50")}
          >
            <User size={28} /> Perfil
          </button>
          <button 
            onClick={onEnterCatalog}
            className="flex items-center gap-4 p-4 rounded-2xl font-bold transition-all text-lg text-gray-500 hover:bg-gray-50"
          >
            <Globe size={28} /> Catálogo
          </button>
        </nav>
        <div className="mt-auto">
          <button onClick={onBack} className="flex items-center gap-4 text-gray-400 hover:text-blue-600 p-4 rounded-2xl font-bold transition-colors w-full text-lg">
            <ArrowLeft size={28} /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pb-32 md:pb-12 relative overflow-x-hidden">
        {/* Header */}
        <header className="w-full max-w-2xl bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10 md:rounded-b-3xl md:mt-0 border-b border-blue-100 md:border-none">
          <div className="flex items-center gap-3">
            <button onClick={() => activeTab === 'cursos' && selectedCourseId ? setSelectedCourseId(null) : onBack()} className="md:hidden text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col">
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider hidden sm:block">
                {activeTab === 'cursos' ? (selectedCourseId ? 'Curso Actual' : 'Plataforma') : activeTab === 'logros' ? 'Tus Metas' : 'Perfil'}
              </span>
              <span className="text-lg sm:text-xl font-bold text-blue-950 truncate max-w-[140px] sm:max-w-xs">
                {activeTab === 'cursos' ? (selectedCourseId ? courses.find(c => c.id === selectedCourseId)?.title : 'Fante') : activeTab === 'logros' ? 'Logros y Misiones' : 'Mi Perfil'}
              </span>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 text-blue-500 font-bold bg-blue-50 px-3 py-1.5 rounded-full">
              <Star size={20} className="fill-blue-500" />
              <span className="text-lg">{xp}</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-500 font-bold bg-orange-50 px-3 py-1.5 rounded-full">
              <Flame size={20} className="fill-orange-500" />
              <span className="text-lg">{streak}</span>
            </div>
          </div>
        </header>

        {activeTab === 'cursos' ? (
          selectedCourseId ? (
            <CoursePathView 
              courseId={selectedCourseId} 
              courses={courses}
              onBack={() => setSelectedCourseId(null)} 
              onStartLesson={onStartLesson} 
            />
          ) : (
            <CourseMosaicView 
              courses={courses} 
              onSelectCourse={(id) => setSelectedCourseId(id)} 
            />
          )
        ) : activeTab === 'logros' ? (
          <AchievementsView 
            quests={quests.map(quest => {
              if (quest.id === 1) return { ...quest, current: Math.min(Math.floor(xp / 10), quest.max) };
              if (quest.id === 3) return { ...quest, current: Math.min(xp, quest.max) };
              return quest;
            })} 
            achievements={achievements.map(ach => {
              if (ach.id === 2) return { ...ach, current: Math.min(streak, ach.max), completed: streak >= ach.max };
              if (ach.id === 3) return { ...ach, current: Math.min(xp, ach.max), completed: xp >= ach.max };
              return ach;
            })} 
          />
        ) : activeTab === 'perfil' ? (
          <motion.div 
            key="perfil" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full"
          >
            <ProfileView 
              xp={xp} 
              streak={streak} 
              friends={friends} 
              name={studentName} 
              onLogout={() => {
                 localStorage.removeItem('fante_student_session');
                 onBack();
              }}
            />
          </motion.div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-blue-400 font-bold text-2xl mt-20">
            Próximamente...
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex justify-around p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <button 
          onClick={() => setActiveTab('cursos')}
          className={cn("flex flex-col items-center transition-colors", activeTab === 'cursos' ? "text-blue-600" : "text-gray-400")}
        >
          <BookOpen size={28} />
          <span className="text-xs font-bold mt-1">Cursos</span>
        </button>
        <button 
          onClick={() => setActiveTab('logros')}
          className={cn("flex flex-col items-center transition-colors", activeTab === 'logros' ? "text-blue-600" : "text-gray-400")}
        >
          <Award size={28} />
          <span className="text-xs font-bold mt-1">Logros</span>
        </button>
        <button 
          onClick={() => setActiveTab('perfil')}
          className={cn("flex flex-col items-center transition-colors", activeTab === 'perfil' ? "text-blue-600" : "text-gray-400")}
        >
          <User size={28} />
          <span className="text-xs font-bold mt-1">Perfil</span>
        </button>
        <button 
          onClick={onEnterCatalog}
          className="flex flex-col items-center transition-colors text-gray-400"
        >
          <Globe size={28} />
          <span className="text-xs font-bold mt-1">Catálogo</span>
        </button>
      </nav>
    </div>
  );
}

function LessonScreen({ 
  lessonBlocks,
  onClose, 
  onComplete 
}: { 
  lessonBlocks: any[];
  onClose: () => void; 
  onComplete: () => void;
}) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const mainRef = React.useRef<HTMLElement>(null);
  
  const block = lessonBlocks[currentBlockIndex];
  const progress = ((currentBlockIndex) / lessonBlocks.length) * 100;

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentBlockIndex]);

  const handleCheck = () => {
    if (block.type === 'info' || block.type === 'text' || block.type === 'image' || block.type === 'video' || block.type === 'audio') {
      handleNext();
      return;
    }

    if ((block.type === 'multiple_choice' || block.type === 'true_false') && selectedOption) {
      let isCorrect = false;
      if (block.content && block.content.correct_option_id) {
        isCorrect = block.content.correct_option_id === selectedOption;
      } else {
        const option = block.options?.find((o: any) => o.id === selectedOption);
        if (option?.isCorrect) isCorrect = true;
      }

      if (isCorrect) {
        setFeedbackState('correct');
      } else {
        setFeedbackState('incorrect');
      }
    }
  };

  const handleNext = () => {
    setFeedbackState('idle');
    setSelectedOption(null);
    if (currentBlockIndex < lessonBlocks.length - 1) {
      setCurrentBlockIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const today = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 h-[100dvh] bg-white flex flex-col font-sans z-50">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 shrink-0">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={28} strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${((currentBlockIndex + (feedbackState === 'correct' ? 1 : 0)) / lessonBlocks.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </header>

      {/* Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto p-6 flex flex-col max-w-2xl mx-auto w-full min-h-0">
        <div className="text-center mb-8 shrink-0">
          <p className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-1">{today}</p>
          <h2 className="text-2xl font-bold text-gray-800">Lección del día</h2>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentBlockIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* 1. MOCK SCHEMA: 'info' type */}
            {block.type === 'info' && (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-8">
                {block.contentType === 'image' && block.contentUrl ? (
                  <img src={block.contentUrl} alt="Contenido de la lección" className="max-w-full h-auto rounded-2xl shadow-md max-h-64 object-contain" />
                ) : block.contentType === 'video' && block.contentUrl ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md">
                     <iframe src={block.contentUrl.replace('watch?v=', 'embed/').split('&')[0]} title="Video" className="w-full h-full" allowFullScreen />
                  </div>
                ) : block.contentType === 'audio' && block.contentUrl ? (
                  <audio controls src={block.contentUrl} className="w-full max-w-md" />
                ) : (
                  <div className="text-9xl">{block.image}</div>
                )}
                <p className="text-2xl text-gray-700 font-medium leading-relaxed">
                  {block.content}
                </p>
              </div>
            )}

            {/* 2. NEW SCHEMA: Text */}
            {block.type === 'text' && (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6 px-4">
                 <div
                   className="text-2xl text-gray-700 font-medium leading-relaxed max-w-2xl text-left font-serif"
                   dangerouslySetInnerHTML={{ __html: block.content?.html || '' }}
                 />
              </div>
            )}

            {/* 3. NEW SCHEMA: Image */}
            {block.type === 'image' && (
              <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
                 <img src={block.content?.url} alt={block.content?.alt} className="max-w-full h-auto rounded-3xl shadow-xl border border-gray-100 max-h-[50vh] object-contain" />
                 {block.content?.caption && <p className="text-lg text-gray-500 font-medium">{block.content.caption}</p>}
              </div>
            )}

            {/* 4. NEW SCHEMA: Video */}
            {block.type === 'video' && (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-4">
                 <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                   <iframe src={(() => {
                      const url = block.content?.url || '';
                      const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                      if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0&rel=0`;
                      const vm = url.match(/vimeo\.com\/(\d+)/);
                      if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
                      return url;
                   })()} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                 </div>
                 {block.content?.caption && <p className="text-lg text-gray-500 font-medium text-center">{block.content.caption}</p>}
              </div>
            )}

            {/* 5. NEW SCHEMA: Audio */}
            {block.type === 'audio' && (
              <div className="flex flex-col items-center justify-center flex-1 w-full gap-8">
                 <div className="w-32 h-32 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center shadow-inner">
                   <Volume2 size={64} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800">{block.content?.title || 'Audio de aprendizaje'}</h3>
                 <div className="w-full max-w-md p-6 bg-gray-50 rounded-3xl border border-gray-200 shadow-sm">
                   <audio controls src={block.content?.url} className="w-full" />
                 </div>
              </div>
            )}

            {/* 6. MOCK & NEW SCHEMA: Multiple choice */}
            {(block.type === 'multiple_choice' || block.type === 'true_false') && (
              <div className="flex flex-col flex-1">
                {/* Mock media display legacy support */}
                {block.contentType === 'image' && block.contentUrl && (
                  <img src={block.contentUrl} alt="Contenido de apoyo" className="max-w-full h-auto rounded-2xl shadow-md max-h-48 object-contain mb-6 mx-auto" />
                )}
                {block.contentType === 'video' && block.contentUrl && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md mb-6">
                    <iframe src={block.contentUrl.replace('watch?v=', 'embed/').split('&')[0]} title="Video" className="w-full h-full" allowFullScreen />
                  </div>
                )}
                
                {/* Legacy text support */}
                {block.contentType === 'text' && block.content && typeof block.content === 'string' && (
                  <p className="text-lg text-gray-600 mb-6 text-center">{block.content}</p>
                )}
                
                <h3 className="text-2xl text-gray-800 font-bold mb-8">
                  {block.question || block.content?.question}
                </h3>
                <div className="flex flex-col gap-4">
                  {(block.options || block.content?.options)?.map((option: any) => (
                    <button
                      key={option.id}
                      onClick={() => feedbackState === 'idle' && setSelectedOption(option.id)}
                      disabled={feedbackState !== 'idle'}
                      className={cn(
                        "p-4 rounded-2xl border-2 text-left text-xl font-medium transition-all group",
                        selectedOption === option.id 
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md" 
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm",
                        feedbackState !== 'idle' && selectedOption !== option.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          selectedOption === option.id ? "border-blue-500 bg-blue-500" : "border-gray-300 group-hover:border-blue-300"
                        )}>
                           {selectedOption === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="flex-1">{option.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Action Area */}
      <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t-2 border-gray-100 max-w-2xl mx-auto w-full shrink-0">
        {feedbackState === 'idle' ? (
          <button
            onClick={handleCheck}
            disabled={block.type === 'multiple_choice' && !selectedOption}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-xl transition-all border-b-4 active:border-b-0 active:translate-y-1 shadow-md",
              (block.type !== 'multiple_choice' || selectedOption)
                ? "bg-blue-500 border-blue-700 text-white hover:bg-blue-400"
                : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed shadow-none"
            )}
          >
            {block.type !== 'multiple_choice' ? 'Siguiente' : 'Comprobar'}
          </button>
        ) : null}
      </div>

      {/* Feedback Bottom Sheet */}
      <AnimatePresence>
        {feedbackState !== 'idle' && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-4 z-50",
              feedbackState === 'correct' ? "bg-blue-100" : "bg-orange-100" // No red, soft orange for incorrect
            )}
          >
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🐘</div>
                <div>
                  <h4 className={cn(
                    "text-2xl font-bold mb-1",
                    feedbackState === 'correct' ? "text-blue-700" : "text-orange-700"
                  )}>
                    {feedbackState === 'correct' ? '¡Excelente!' : '¡Ups!'}
                  </h4>
                  <p className={cn(
                    "text-lg font-medium",
                    feedbackState === 'correct' ? "text-blue-600" : "text-orange-600"
                  )}>
                    {(() => {
                      if (block.content && block.content.options) {
                        return block.content.options.find((o: any) => o.id === selectedOption)?.feedback || null;
                      }
                      return block.options?.find((o: any) => o.id === selectedOption)?.feedback;
                    })()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={feedbackState === 'correct' ? handleNext : () => { setFeedbackState('idle'); setSelectedOption(null); }}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-xl transition-all border-b-4 active:border-b-0 active:translate-y-1",
                  feedbackState === 'correct' 
                    ? "bg-blue-500 border-blue-700 text-white hover:bg-blue-400"
                    : "bg-orange-500 border-orange-700 text-white hover:bg-orange-400"
                )}
              >
                {feedbackState === 'correct' ? 'Continuar' : 'Reintentar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 2.5 Streak Animation Screen
function StreakAnimationScreen({ streak, onFinish }: { streak: number, onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 h-[100dvh] bg-orange-500 flex flex-col items-center justify-center p-6 font-sans z-50 text-white text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <Flame size={140} className="fill-white text-white drop-shadow-lg" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold mb-4"
      >
        ¡Racha aumentada!
      </motion.h2>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-6xl font-extrabold flex items-center justify-center gap-6"
      >
        <span className="opacity-50 line-through">{streak - 1}</span>
        <ChevronRight size={48} className="opacity-70" />
        <motion.span
          initial={{ scale: 0.5, color: '#ffedd5' }}
          animate={{ scale: 1.2, color: '#ffffff' }}
          transition={{ delay: 1.5, type: "spring", bounce: 0.5 }}
          className="text-7xl"
        >
          {streak}
        </motion.span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-12 text-orange-100 text-xl font-medium"
      >
        ¡Mantén el fuego encendido!
      </motion.p>
    </div>
  );
}

// 3. Completion Screen
function CompletionScreen({ 
  onFinish, 
  streak 
}: { 
  onFinish: () => void;
  streak: number;
}) {
  return (
    <div className="fixed inset-0 h-[100dvh] bg-blue-500 flex flex-col items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] font-sans z-50 text-white text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        className="text-9xl mb-8"
      >
        🐘
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-bold mb-4"
      >
        ¡Lección Completada!
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-blue-100 mb-12 max-w-sm"
      >
        ¡Sos increíble! Fante está muy orgulloso de vos.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="flex gap-6 mb-12"
      >
        <div className="bg-white text-blue-600 p-6 rounded-3xl flex flex-col items-center min-w-[120px] shadow-lg">
          <Star size={40} className="fill-blue-500 text-blue-500 mb-2" />
          <span className="text-3xl font-bold">+10</span>
          <span className="text-sm font-medium uppercase tracking-wider opacity-70">XP</span>
        </div>
        <div className="bg-white text-orange-500 p-6 rounded-3xl flex flex-col items-center min-w-[120px] shadow-lg">
          <Flame size={40} className="fill-orange-500 text-orange-500 mb-2" />
          <span className="text-3xl font-bold">{streak}</span>
          <span className="text-sm font-medium uppercase tracking-wider opacity-70">Días</span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={onFinish}
        className="w-full max-w-sm py-4 bg-white text-blue-600 rounded-2xl font-bold text-xl border-b-4 border-blue-200 active:border-b-0 active:translate-y-1 transition-all"
      >
        Continuar
      </motion.button>
    </div>
  );
}

// --- PROFESSIONAL SCREENS ---

function ProLoginScreen({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-400 shadow-sm border-b-4 border-blue-100 active:border-b-0 active:translate-y-1 transition-all"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-blue-100 mt-4 sm:mt-0">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <LayoutDashboard size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-blue-950 mb-1">Portal Profesional</h2>
        <p className="text-center text-sm text-blue-600/70 mb-6">Ingresa a tu cuenta para gestionar tus pacientes y cursos.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-2">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all mt-2 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface Participant {
  id: string;
  name: string;
  age: number;
  slug: string;
  avatar: string;
  progress: number;
  lastActive: string;
  streak: number;
  course: string;
}

function ProDashboardScreen({ 
  onLogout, 
  onEnterCatalog,
  onSaveCourse
}: { 
  onLogout: () => void, 
  onEnterCatalog: () => void,
  onSaveCourse: (course: any) => void
}) {
  const [role, setRole] = useState<'gratis' | 'pro' | 'clinica' | 'admin'>('clinica');
  const [activeTab, setActiveTab] = useState<'pacientes' | 'cursos' | 'facturacion' | 'historial_facturas' | 'nuevo_curso_opciones' | 'crear_curso' | 'importar_curso' | 'resumen_clinica' | 'profesionales_clinica' | 'premium_upsell'>('resumen_clinica');
  
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p1', name: 'Lucas G.', age: 8, slug: 'lucas-g-123', avatar: 'L', progress: 75, lastActive: 'Hace 2 horas', streak: 12, course: 'Lectoescritura Inicial' },
    { id: 'p2', name: 'Sofía M.', age: 10, slug: 'sofia-m-456', avatar: 'S', progress: 40, lastActive: 'Ayer', streak: 3, course: 'Atención y Memoria' },
  ]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [newParticipant, setNewParticipant] = useState({ name: '', age: '' });
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const handleAddParticipant = () => {
    if (!newParticipant.name || !newParticipant.age) return;
    
    // Check limits based on role
    if (role === 'gratis' && participants.length >= 3) {
      alert('Has alcanzado el límite de 3 participantes en el plan Gratis.');
      return;
    }
    if (role === 'pro' && participants.length >= 25) {
      alert('Has alcanzado el límite de 25 participantes en el plan Pro.');
      return;
    }

    const slug = newParticipant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const newP: Participant = {
      id: `p${Date.now()}`,
      name: newParticipant.name,
      age: parseInt(newParticipant.age),
      slug,
      avatar: newParticipant.name[0].toUpperCase(),
      progress: 0,
      lastActive: 'Nunca',
      streak: 0,
      course: 'Sin asignar'
    };
    setParticipants([...participants, newP]);
    setNewParticipant({ name: '', age: '' });
    setShowAddParticipant(false);
  };

  const getParticipantUrl = (slug: string) => {
    return `${window.location.origin}/p/${slug}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Enlace copiado al portapapeles');
  };

  // Reset tab when role changes
  useEffect(() => {
    if (role === 'clinica') {
      setActiveTab('resumen_clinica');
    } else {
      setActiveTab('pacientes');
    }
  }, [role]);

  return (
    <div className="min-h-screen bg-blue-50 font-sans pb-24 md:pb-0 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100 p-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl mb-8">
          <span className="text-3xl">🐘</span> Fante {role === 'clinica' ? 'Clínica' : role === 'pro' ? 'Pro' : role === 'admin' ? 'Admin' : 'Gratis'}
        </div>
        
        <div className="mb-8">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Vista de demostración</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="gratis">Plan Gratis</option>
            <option value="pro">Plan Pro</option>
            <option value="clinica">Plan Clínica</option>
            <option value="admin">Administración Global</option>
          </select>
        </div>

        <nav className="flex-1 space-y-2">
          {role === 'clinica' ? (
            <>
              <button 
                onClick={() => setActiveTab('resumen_clinica')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  activeTab === 'resumen_clinica' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <LayoutDashboard size={20} />
                Resumen
              </button>
              <button 
                onClick={() => setActiveTab('profesionales_clinica')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  activeTab === 'profesionales_clinica' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Users size={20} />
                Profesionales
              </button>
              <button 
                onClick={() => setActiveTab('cursos')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  (activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <BookOpen size={20} />
                Cursos
              </button>
              <button 
                onClick={() => setActiveTab('facturacion')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  (activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <CreditCard size={20} />
                Facturación
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('pacientes')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  activeTab === 'pacientes' ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <Users size={20} />
                {role === 'gratis' ? 'Mis Hijos' : 'Mis Pacientes'}
              </button>
              <button 
                onClick={() => setActiveTab('cursos')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                  (activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <BookOpen size={20} />
                Mis Cursos
              </button>
              {role === 'gratis' ? (
                <button 
                  onClick={() => setActiveTab('premium_upsell')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                    activeTab === 'premium_upsell' ? "bg-orange-100 text-orange-700" : "text-orange-600 hover:bg-orange-50"
                  )}
                >
                  <Crown size={20} />
                  Mejorar a Pro
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab('facturacion')}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors",
                    (activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <CreditCard size={20} />
                  Facturación
                </button>
              )}
            </>
          )}
          <button 
            onClick={onEnterCatalog}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors text-gray-500 hover:bg-gray-50"
          >
            <Globe size={20} />
            Catálogo
          </button>
        </nav>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-colors mt-auto"
        >
          <ArrowLeft size={20} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">
              {role === 'clinica' ? 'Dashboard Clínica' : role === 'admin' ? 'Administración Global' : 'Hola, Dra. Martínez 👋'}
            </h1>
            <p className="text-blue-600/70 font-medium">
              {role === 'clinica' ? 'Resumen de tu equipo y pacientes' : role === 'admin' ? 'Vista general del sistema Fante' : 'Aquí tienes el resumen de hoy.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="gratis">Gratis</option>
                <option value="pro">Pro</option>
                <option value="clinica">Clínica</option>
                <option value="admin">Admin Global</option>
              </select>
            </div>
            <button className="w-12 h-12 bg-white rounded-full border-2 border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
              <span className="text-xl">🔔</span>
            </button>
            <div className="w-12 h-12 bg-blue-200 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-blue-700">
              M
            </div>
          </div>
        </header>

        {role !== 'clinica' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
              <div className="text-blue-500 mb-2"><Users size={24} /></div>
              <div className="text-2xl font-bold text-blue-950">24</div>
              <div className="text-sm text-blue-600/70 font-medium">Pacientes Activos</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
              <div className="text-violet-500 mb-2"><BookOpen size={24} /></div>
              <div className="text-2xl font-bold text-blue-950">8</div>
              <div className="text-sm text-blue-600/70 font-medium">Cursos Creados</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
              <div className="text-orange-500 mb-2"><Flame size={24} /></div>
              <div className="text-2xl font-bold text-blue-950">85%</div>
              <div className="text-sm text-blue-600/70 font-medium">Tasa de Retención</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
              <div className="text-green-500 mb-2"><Check size={24} /></div>
              <div className="text-2xl font-bold text-blue-950">12</div>
              <div className="text-sm text-blue-600/70 font-medium">Tareas Completadas Hoy</div>
            </div>
          </div>
        )}

        {activeTab === 'resumen_clinica' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Profesionales</p>
                  <p className="text-3xl font-black text-blue-950">12</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Heart size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Pacientes Totales</p>
                  <p className="text-3xl font-black text-blue-950">148</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                  <BookOpen size={28} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500">Cursos Activos</p>
                  <p className="text-3xl font-black text-blue-950">24</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-blue-50">
                <h3 className="text-lg font-bold text-blue-950">Pacientes por Profesional</h3>
              </div>
              <div className="divide-y divide-blue-50">
                {[
                  { name: 'Dra. Ana Silva', role: 'Psicopedagoga', patients: 32, max: 40, avatar: 'doctor1' },
                  { name: 'Lic. Marcos Paz', role: 'Fonoaudiólogo', patients: 28, max: 40, avatar: 'doctor2' },
                  { name: 'Psic. Laura Gómez', role: 'Psicóloga Infantil', patients: 45, max: 50, avatar: 'doctor3' },
                  { name: 'Prof. Carlos Ruiz', role: 'Educador Especial', patients: 15, max: 20, avatar: 'doctor4' },
                ].map((prof, i) => (
                  <div key={i} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-blue-50/30 transition-colors">
                    <div className="flex items-center gap-4 md:w-1/3">
                      <img src={`https://picsum.photos/seed/${prof.avatar}/100/100`} alt={prof.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-blue-950">{prof.name}</h4>
                        <p className="text-xs text-blue-600/70">{prof.role}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-gray-600">{prof.patients} pacientes</span>
                        <span className="text-gray-400">Capacidad: {prof.max}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", (prof.patients / prof.max) > 0.8 ? "bg-orange-500" : "bg-blue-500")} 
                          style={{ width: `${(prof.patients / prof.max) * 100}%` }} 
                        />
                      </div>
                    </div>
                    <div className="md:w-32 flex justify-end">
                      <button className="text-blue-600 font-bold text-sm hover:underline">Ver detalles</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'profesionales_clinica' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-950">Equipo de Profesionales</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
                <Plus size={20} /> <span className="hidden sm:inline">Nuevo Profesional</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50/50 border-b border-blue-100">
                      <th className="p-4 font-bold text-blue-900 text-sm">Profesional</th>
                      <th className="p-4 font-bold text-blue-900 text-sm">Especialidad</th>
                      <th className="p-4 font-bold text-blue-900 text-sm">Pacientes</th>
                      <th className="p-4 font-bold text-blue-900 text-sm">Estado</th>
                      <th className="p-4 font-bold text-blue-900 text-sm text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {[
                      { name: 'Dra. Ana Silva', role: 'Psicopedagoga', patients: 32, status: 'Activo', avatar: 'doctor1' },
                      { name: 'Lic. Marcos Paz', role: 'Fonoaudiólogo', patients: 28, status: 'Activo', avatar: 'doctor2' },
                      { name: 'Psic. Laura Gómez', role: 'Psicóloga Infantil', patients: 45, status: 'Activo', avatar: 'doctor3' },
                      { name: 'Prof. Carlos Ruiz', role: 'Educador Especial', patients: 15, status: 'Inactivo', avatar: 'doctor4' },
                    ].map((prof, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={`https://picsum.photos/seed/${prof.avatar}/100/100`} alt={prof.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" referrerPolicy="no-referrer" />
                            <span className="font-bold text-blue-950">{prof.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{prof.role}</td>
                        <td className="p-4 font-bold text-blue-900">{prof.patients}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-xs font-bold",
                            prof.status === 'Activo' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          )}>
                            {prof.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'premium_upsell' ? (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Crown size={48} />
            </div>
            <h2 className="text-3xl font-black text-blue-950 mb-4">Mejora a Fante Pro</h2>
            <p className="text-lg text-gray-600 mb-8">
              El plan gratis te permite tener hasta 3 pacientes. Desbloquea pacientes ilimitados, creación de cursos personalizados y reportes avanzados.
            </p>
            <div className="bg-white p-8 rounded-3xl border-2 border-orange-200 shadow-xl mb-8 text-left">
              <h3 className="font-bold text-xl text-blue-950 mb-6 border-b pb-4">Beneficios Pro</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700"><Check className="text-green-500" /> Pacientes ilimitados</li>
                <li className="flex items-center gap-3 text-gray-700"><Check className="text-green-500" /> Creador de cursos personalizados</li>
                <li className="flex items-center gap-3 text-gray-700"><Check className="text-green-500" /> Acceso a la comunidad de profesionales</li>
                <li className="flex items-center gap-3 text-gray-700"><Check className="text-green-500" /> Reportes de progreso detallados</li>
              </ul>
            </div>
            <button className="w-full md:w-auto px-12 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
              Actualizar por $29.99/mes
            </button>
          </div>
        ) : activeTab === 'pacientes' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-950">
                {role === 'gratis' ? 'Mis Hijos (Participantes)' : 'Pacientes'}
              </h2>
              <button 
                onClick={() => setShowAddParticipant(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Añadir
              </button>
            </div>

            {showAddParticipant && (
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-blue-950 mb-4">Nuevo Participante</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
                      placeholder="Ej. Lucas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Edad</label>
                    <input 
                      type="number" 
                      value={newParticipant.age}
                      onChange={(e) => setNewParticipant({...newParticipant, age: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none"
                      placeholder="Ej. 8"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setShowAddParticipant(false)}
                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddParticipant}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-blue-50">
                {participants.map((patient) => (
                  <div key={patient.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-blue-50/50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                        {patient.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-950">{patient.name}</h3>
                        <p className="text-sm text-blue-600/70 mb-1">{patient.age} años • {patient.lastActive}</p>
                        <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-md">
                          {patient.course}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold text-blue-900 mb-1">Progreso</span>
                        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${patient.progress}%` }} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedParticipant(selectedParticipant?.id === patient.id ? null : patient)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Globe size={16} /> Acceso
                        </button>
                        <ChevronRight className="text-gray-400" />
                      </div>
                    </div>

                    {/* Access Panel */}
                    {selectedParticipant?.id === patient.id && (
                      <div className="w-full mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-center">
                        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getParticipantUrl(patient.slug))}`} 
                            alt="QR Code" 
                            className="w-24 h-24"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <h4 className="font-bold text-blue-950 mb-2">Enlace de acceso directo</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            Comparte este enlace o escanea el código QR para que {patient.name} acceda directamente a sus cursos sin necesidad de contraseña.
                          </p>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              readOnly 
                              value={getParticipantUrl(patient.slug)}
                              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none"
                            />
                            <button 
                              onClick={() => copyToClipboard(getParticipantUrl(patient.slug))}
                              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {participants.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No hay participantes registrados aún.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'cursos' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-950">{role === 'gratis' ? 'Cursos Disponibles' : 'Tus Cursos'}</h2>
              {role !== 'gratis' && (
                <button 
                  onClick={() => setActiveTab('nuevo_curso_opciones')}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-200 transition-colors"
                >
                  + Nuevo Curso
                </button>
              )}
            </div>

            {role !== 'gratis' && (
              <>
                {/* Metrics Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-bold mb-1">Estudiantes Activos</div>
                    <div className="text-2xl font-bold text-blue-950">145</div>
                    <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><TrendingUp size={12}/> +24%</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-bold mb-1">Cursos Creados</div>
                    <div className="text-2xl font-bold text-blue-950">4</div>
                    <div className="text-xs text-gray-400 font-bold mt-1">En el catálogo</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-bold mb-1">Tasa de Finalización</div>
                    <div className="text-2xl font-bold text-blue-950">68%</div>
                    <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><TrendingUp size={12}/> +5%</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-gray-500 text-sm font-bold mb-1">Valoración Media</div>
                    <div className="text-2xl font-bold text-blue-950 flex items-center gap-1">4.8 <Star size={20} className="fill-yellow-400 text-yellow-400" /></div>
                    <div className="text-xs text-gray-400 font-bold mt-1">De 85 reseñas</div>
                  </div>
                </div>

                {/* Metrics Chart */}
                <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-950">Evolución de Estudiantes</h3>
                      <p className="text-sm text-gray-500">Crecimiento en tus cursos diseñados</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      <TrendingUp size={16} />
                      +24% este mes
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_COURSE_METRICS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEstudiantes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ color: '#1e3a8a', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="estudiantes" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEstudiantes)" name="Estudiantes Activos" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Lectoescritura Inicial', students: 12, modules: 5, color: 'bg-blue-500', author: 'Propio', date: 'Actualizado hoy' },
                { title: 'Matemáticas Divertidas', students: 8, modules: 4, color: 'bg-violet-500', author: 'Propio', date: '18 Mar 2026' },
                { title: 'Atención y Memoria', students: 15, modules: 6, color: 'bg-orange-500', author: 'Dra. Ana Silva', date: '10 Mar 2026' },
                { title: 'Habilidades Sociales', students: 5, modules: 3, color: 'bg-green-500', author: 'Lic. Marcos Paz', date: '05 Mar 2026' },
              ].map((course, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors cursor-pointer">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0", course.color)}>
                    <BookOpen size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-blue-950 text-lg leading-tight">{course.title}</h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap",
                        course.author === 'Propio' ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"
                      )}>
                        {course.author === 'Propio' ? 'Creación propia' : `Por ${course.author}`}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600/70 mb-2">{course.modules} módulos • {course.students} pacientes</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                      <Calendar size={12} />
                      {course.date}
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'facturacion' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-950">Facturación y Planes</h2>
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold hover:bg-blue-200 transition-colors">
                Actualizar Plan
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                  PLAN ACTUAL
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Crown size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-950">Pro Mensual</h3>
                    <p className="text-sm text-blue-600/70">Facturado cada mes</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-blue-950">$29.99</span>
                  <span className="text-gray-500 font-medium">/mes</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check size={18} className="text-green-500" /> Pacientes ilimitados
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check size={18} className="text-green-500" /> Cursos personalizados
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check size={18} className="text-green-500" /> Reportes avanzados
                  </li>
                </ul>
              </div>

              {/* Billing Details */}
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-500" />
                    Periodo de Facturación
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-blue-600/70 font-medium mb-1">Próximo cobro</p>
                    <p className="text-xl font-bold text-blue-950">15 de Abril, 2026</p>
                  </div>
                  
                  <h3 className="text-lg font-bold text-blue-950 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-500" />
                    Método de Pago
                  </h3>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-[10px] font-bold italic">
                        VISA
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">•••• 4242</p>
                        <p className="text-xs text-gray-500">Expira 12/28</p>
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm font-bold hover:underline">Editar</button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setActiveTab('historial_facturas')}
                  className="w-full mt-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Ver Historial de Facturas
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'historial_facturas' ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setActiveTab('facturacion')}
                className="p-2 bg-white rounded-full border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-blue-950">Historial de Facturas</h2>
            </div>
            
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-blue-50">
                {[
                  { id: 'INV-2026-003', date: '15 Mar 2026', amount: '$29.99', status: 'Pagado' },
                  { id: 'INV-2026-002', date: '15 Feb 2026', amount: '$29.99', status: 'Pagado' },
                  { id: 'INV-2026-001', date: '15 Ene 2026', amount: '$29.99', status: 'Pagado' },
                  { id: 'INV-2025-012', date: '15 Dic 2025', amount: '$29.99', status: 'Pagado' },
                ].map((invoice, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-950">{invoice.id}</h3>
                        <p className="text-sm text-blue-600/70">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-blue-950">{invoice.amount}</div>
                        <div className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                          <Check size={12} /> {invoice.status}
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'nuevo_curso_opciones' ? (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => setActiveTab('cursos')}
                className="p-2 bg-white rounded-full border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-2xl font-bold text-blue-950">Añadir Nuevo Curso</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
               <button onClick={() => setActiveTab('crear_curso')} className="p-10 bg-white border-2 border-dashed border-blue-300 rounded-3xl hover:bg-blue-50 hover:border-blue-500 flex flex-col items-center justify-center gap-4 transition-all group">
                 <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><FilePlus size={40}/></div>
                 <h3 className="text-2xl font-bold text-blue-950">Crear desde cero</h3>
                 <p className="text-blue-600/70 text-center">Diseña tu propio curso con módulos y actividades personalizadas para tus pacientes.</p>
               </button>
               <button onClick={() => setActiveTab('importar_curso')} className="p-10 bg-white border-2 border-blue-100 rounded-3xl hover:border-blue-500 hover:shadow-lg flex flex-col items-center justify-center gap-4 transition-all group">
                 <div className="w-20 h-20 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Globe size={40}/></div>
                 <h3 className="text-2xl font-bold text-blue-950">Importar de la comunidad</h3>
                 <p className="text-blue-600/70 text-center">Explora y adapta cursos creados por otros profesionales de la red Fante.</p>
               </button>
            </div>
          </div>
        ) : activeTab === 'crear_curso' ? (
          <CourseBuilderScreen 
            onBack={() => setActiveTab('nuevo_curso_opciones')} 
            onSave={(course) => {
              onSaveCourse(course);
              setActiveTab('cursos');
            }} 
          />
        ) : activeTab === 'importar_curso' ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('nuevo_curso_opciones')}
                  className="p-2 bg-white rounded-full border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-blue-950">Comunidad Fante</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Buscar cursos..." className="pl-12 pr-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 focus:outline-none w-full md:w-80 transition-colors shadow-sm" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'TDAH: Estrategias de Foco', author: 'Dra. Ana Silva', downloads: 1240, rating: 4.9, color: 'bg-orange-500' },
                { title: 'Dislexia Nivel 1', author: 'Lic. Marcos Paz', downloads: 850, rating: 4.8, color: 'bg-blue-500' },
                { title: 'Gestión de Emociones', author: 'Psic. Laura Gómez', downloads: 2100, rating: 5.0, color: 'bg-green-500' },
                { title: 'Matemáticas Visuales', author: 'Prof. Carlos Ruiz', downloads: 530, rating: 4.7, color: 'bg-violet-500' },
                { title: 'Estimulación Temprana', author: 'Dra. Elena Torres', downloads: 3200, rating: 4.9, color: 'bg-pink-500' },
                { title: 'Autismo: Rutinas Diarias', author: 'Lic. Martín Vega', downloads: 1800, rating: 4.9, color: 'bg-teal-500' },
              ].map((course, i) => (
                <div key={i} className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group">
                  <div className={`h-32 ${course.color} flex items-center justify-center relative overflow-hidden`}>
                    <BookOpen size={64} className="text-white opacity-20 transform group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-blue-950 text-lg mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-blue-600/70 mb-4">Por {course.author}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-xl">
                      <span className="flex items-center gap-1.5 font-medium"><DownloadCloud size={16} className="text-blue-500" /> {course.downloads}</span>
                      <span className="flex items-center gap-1.5 font-medium text-orange-600"><Star size={16} className="fill-orange-500 text-orange-500" /> {course.rating}</span>
                    </div>
                    <button className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                      <DownloadCloud size={18} /> Importar Curso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex justify-around p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-20">
        {role === 'clinica' ? (
          <>
            <button 
              onClick={() => setActiveTab('resumen_clinica')}
              className={cn(
                "flex flex-col items-center gap-1",
                activeTab === 'resumen_clinica' ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <LayoutDashboard size={24} className={activeTab === 'resumen_clinica' ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Resumen</span>
            </button>
            <button 
              onClick={() => setActiveTab('profesionales_clinica')}
              className={cn(
                "flex flex-col items-center gap-1",
                activeTab === 'profesionales_clinica' ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Users size={24} className={activeTab === 'profesionales_clinica' ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Equipo</span>
            </button>
            <button 
              onClick={() => setActiveTab('cursos')}
              className={cn(
                "flex flex-col items-center gap-1",
                (activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <BookOpen size={24} className={(activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cursos</span>
            </button>
            <button 
              onClick={() => setActiveTab('facturacion')}
              className={cn(
                "flex flex-col items-center gap-1",
                (activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <CreditCard size={24} className={(activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Facturación</span>
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setActiveTab('pacientes')}
              className={cn(
                "flex flex-col items-center gap-1",
                activeTab === 'pacientes' ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Users size={24} className={activeTab === 'pacientes' ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{role === 'gratis' ? 'Hijos' : 'Pacientes'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('cursos')}
              className={cn(
                "flex flex-col items-center gap-1",
                (activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <BookOpen size={24} className={(activeTab === 'cursos' || activeTab === 'nuevo_curso_opciones' || activeTab === 'crear_curso' || activeTab === 'importar_curso') ? "fill-blue-100" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cursos</span>
            </button>
            {role === 'gratis' ? (
              <button 
                onClick={() => setActiveTab('premium_upsell')}
                className={cn(
                  "flex flex-col items-center gap-1",
                  activeTab === 'premium_upsell' ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Crown size={24} className={activeTab === 'premium_upsell' ? "fill-orange-100" : ""} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Premium</span>
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('facturacion')}
                className={cn(
                  "flex flex-col items-center gap-1",
                  (activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "text-blue-500" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <CreditCard size={24} className={(activeTab === 'facturacion' || activeTab === 'historial_facturas') ? "fill-blue-100" : ""} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Facturación</span>
              </button>
            )}
          </>
        )}
        <button 
          onClick={onEnterCatalog}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
        >
          <Globe size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Catálogo</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-red-400 hover:text-red-600"
        >
          <ArrowLeft size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Salir</span>
        </button>
      </nav>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [screen, setScreen] = useState<'landing' | 'splash' | 'home' | 'lesson' | 'streak_animation' | 'completion' | 'pro_login' | 'pro_dashboard' | 'catalog' | 'registration' | 'admin_panel'>(() => {
    if (window.location.pathname.includes('/acceso/')) return 'splash';
    if (localStorage.getItem('fante_student_session')) return 'home';
    return (localStorage.getItem('fante_last_screen') as any) || 'landing';
  });

  const [selectedPlan, setSelectedPlan] = useState<string>(() => {
    return localStorage.getItem('fante_user_plan') || 'Familiar';
  });

  useEffect(() => {
    localStorage.setItem('fante_last_screen', screen);
    // If admin goes to admin panel, clear any student session so they don't conflict
    if (screen === 'admin_panel' || screen === 'pro_login' || screen === 'registration') {
      localStorage.removeItem('fante_student_session');
    }
  }, [screen]);

  useEffect(() => {
    localStorage.setItem('fante_user_plan', selectedPlan);
  }, [selectedPlan]);

  const [streak, setStreak] = useState(324); // Mock initial streak from PDF
  const [xp, setXp] = useState(1200);

  // States for live data
  const [courses, setCourses] = useState<any[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [lessonBlocks, setLessonBlocks] = useState<any[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Restaurar sesión de usuario (para admins/profesionales)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !window.location.pathname.includes('/acceso/')) {

          setSelectedPlan(session.user?.user_metadata?.plan || 'Familiar');
          setScreen('admin_panel');
        }

        const [c, cat, q, a, f, lb, dbCourses, dbPatients] = await Promise.all([
          api.getCourses(),
          api.getCatalogCourses(),
          api.getQuests(),
          api.getAchievements(),
          api.getFriends(),
          api.getLessonBlocks(),
          coursesApi.getAll().catch(() => []),
          patientsApi.getAll().catch(() => [])
        ]);
        let loadedCourses = c;
        let loadedLessonBlocks = lb;

        // Custom patient logic for Vicente
        const isAccessPath = window.location.pathname.includes('/acceso/');
        const savedStudentId = localStorage.getItem('fante_student_session');
        
        if (isAccessPath || savedStudentId) {
          let pId = savedStudentId;
          
          if (isAccessPath) {
            const pathParts = window.location.pathname.split('/');
            const accesoIndex = pathParts.indexOf('acceso');
            pId = pathParts[accesoIndex + 1];
            if (pId) localStorage.setItem('fante_student_session', pId);
          }

          // Cross-device synchronization bridge
          const urlParams = new URLSearchParams(window.location.search);
          const syncData = urlParams.get('sync');
          if (syncData) {
            try {
              const decompressed = LZString.decompressFromEncodedURIComponent(syncData);
              if (decompressed) {
                const payload = JSON.parse(decompressed);
                if (payload.patient) {
                  let pts = JSON.parse(localStorage.getItem('fante_patients') || '[]');
                  pts = pts.filter((p: any) => p.id !== payload.patient.id);
                  localStorage.setItem('fante_patients', JSON.stringify([...pts, payload.patient]));
                }
                if (payload.course) {
                  let crs = JSON.parse(localStorage.getItem('fante_courses_v2') || '[]');
                  crs = crs.filter((c: any) => c.id !== payload.course.id);
                  localStorage.setItem('fante_courses_v2', JSON.stringify([...crs, payload.course]));
                }
                // Clean the URL purely for aesthetics
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            } catch (e) {
              console.error("Error sincronizando curso a través de la URL", e);
            }
          }

          if (pId) {
            const pts = JSON.parse(localStorage.getItem('fante_patients') || '[]');
            const ptDb = dbPatients?.find((p: any) => p.id === pId);
            const ptLocal = pts.find((p: any) => p.id === pId);
            const ctxPatient = ptDb ? { ...ptDb, streak: ptLocal?.streak || 0, progress: ptDb.progress || ptLocal?.progress || 0 } : ptLocal;
            if (ctxPatient) {
              setCurrentStudent(ctxPatient);
              setStudentName(ctxPatient.name);
              setStreak(ctxPatient.streak || 0);
              setXp(ctxPatient.progress || 0);
              const assigned = (() => {
                 if (!ctxPatient.course || ctxPatient.course === 'Sin asignar') return [];
                 try {
                   const parsed = JSON.parse(ctxPatient.course);
                   return Array.isArray(parsed) ? parsed : [{ title: ctxPatient.course, hidden: false }];
                 } catch (e) {
                   return [{ title: ctxPatient.course, hidden: false }];
                 }
              })();
              
              const activeAssignments = assigned.filter((a: any) => !a.hidden);
              
              if (activeAssignments.length > 0) {
                const localCourses = JSON.parse(localStorage.getItem('fante_courses_v2') || '[]');
                
                const mappedCourses = activeAssignments.map((assignment: any) => {
                   const ptCourse = dbCourses.find((co: any) => co.title === assignment.title) || localCourses.find((co: any) => co.title === assignment.title);
                   if (ptCourse) {
                      const mappedLessons = ptCourse.weeks.flatMap((w: any) => w.lessons).map((l: any, i: number) => ({
                         id: l.day_number || (i + 1),
                         title: l.title,
                         completed: false,
                         blocks: l.blocks
                      }));
                      return {
                         id: ptCourse.id,
                         title: ptCourse.title,
                         description: ptCourse.description,
                         icon: '📖',
                         color: 'bg-blue-500',
                         textColor: 'text-blue-500',
                         lightColor: 'bg-blue-100',
                         progress: 0,
                         status: 'current',
                         lessons: mappedLessons
                      };
                   }
                   return null;
                }).filter(Boolean);
                
                const otherCourses = c.filter((old: any) => !mappedCourses.find((m: any) => m.id === old.id));
                loadedCourses = ([...mappedCourses, ...otherCourses] as any[]);
              }
            }
          }
        }




        if (q.length === 0) {
          q.push(
            { id: 1, title: 'Terminar 2 lecciones', current: 1, max: 2, icon: '🎯' },
            { id: 2, title: 'Practicar 15 minutos', current: 15, max: 15, icon: '⏱️' },
            { id: 3, title: 'Conseguir 50 XP', current: 10, max: 50, icon: '⚡' }
          );
        }
        if (a.length === 0) {
          a.push(
            { id: 1, title: 'Primera Lección', description: 'Completaste tu primera lección', current: 1, max: 1, level: 1, completed: true, bg: 'bg-yellow-100', borderColor: 'border-yellow-200', icon: '🌟' },
            { id: 2, title: 'Racha de Fuego', description: 'Mantén una racha de 3 días', current: 0, max: 3, level: 1, completed: false, bg: 'bg-orange-100', borderColor: 'border-orange-200', icon: '🔥' },
            { id: 3, title: 'Súper Estudiante', description: 'Consigue 500 XP', current: 10, max: 500, level: 1, completed: false, bg: 'bg-blue-100', borderColor: 'border-blue-200', icon: '👑' }
          );
        }
        if (f.length === 0) {
          f.push(
            { id: 1, name: 'Sofi M.', xp: 2450, avatar: '👩' },
            { id: 2, name: 'Lucas G.', xp: 1840, avatar: '👦' },
            { id: 3, name: 'Valen R.', xp: 1200, avatar: '👧' }
          );
        }
        if (cat.length === 0) {
          cat.push(
            { id: 1, title: 'Manejo de la Frustración', classification: 'libre', description: 'Aprende a respirar y calmarte', icon: '😌', lightColor: 'text-indigo-500 bg-indigo-100', price: 'Gratis', objective: 'Regulación emocional básica', childObjectives: ['Reconocer enojo', 'Respirar 3 veces'] },
            { id: 2, title: 'Habilidades Sociales II', classification: 'libre', description: 'Cómo invitar a jugar a un amigo', icon: '🤝', lightColor: 'text-green-500 bg-green-100', price: 'Gratis', objective: 'Interacción con pares', childObjectives: ['Acercarse', 'Saludar', 'Proponer juego'] },
            { id: 3, title: 'Atención Plena', classification: 'supervisado', description: 'Ejercicios de concentración', icon: '🧘', lightColor: 'text-violet-500 bg-violet-100', price: 'Premium', objective: 'Aumentar tiempo de atención', childObjectives: ['Fijar mirada', 'Seguir objeto'] }
          );
        }

        setCourses(loadedCourses);
        setCatalogCourses(cat);
        setQuests(q);
        setAchievements(a);
        setFriends(f);
        setLessonBlocks(loadedLessonBlocks);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStartLesson = (blocks?: any[]) => {
    if (blocks && blocks.length > 0) {
      setLessonBlocks(blocks);
    }
    setScreen('lesson');
  };

  const handleCompleteLesson = async () => {
    const newStreak = streak + 1;
    const newXp = xp + 10;
    setStreak(newStreak);
    setXp(newXp);
    
    if (currentStudent) {
       try {
         const updatedPatient = {
           ...currentStudent,
           progress: newXp,
           streak: newStreak,
           lastActive: 'Hoy'
         };
         setCurrentStudent(updatedPatient);
         await patientsApi.upsert(updatedPatient);
         
         const pts = JSON.parse(localStorage.getItem('fante_patients') || '[]');
         const newPts = pts.map((p: any) => p.id === updatedPatient.id ? updatedPatient : p);
         localStorage.setItem('fante_patients', JSON.stringify(newPts));
       } catch (error) {
         console.error('Error syncing progress:', error);
       }
    }
    setScreen('streak_animation');
  };

  const handleSaveCourse = async (course: any) => {
    try {
      const saved = await api.saveCourse(course);
      setCourses(prev => {
        const index = prev.findIndex(c => c.id === saved.id);
        if (index !== -1) {
          const newCourses = [...prev];
          newCourses[index] = saved;
          return newCourses;
        }
        return [...prev, saved];
      });
      setScreen('pro_dashboard');
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleFinishStreakAnimation = () => {
    setScreen('completion');
  };

  const handleFinish = () => {
    setScreen('home');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-blue-500 flex flex-col items-center justify-center z-50">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-8xl mb-8"
        >
          🐘
        </motion.div>
        <p className="text-white font-bold text-xl animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {screen === 'landing' && (
        <motion.div key="landing" exit={{ opacity: 0 }}>
          <LandingPage 
            catalogCourses={catalogCourses}
            onEnterApp={() => {
              // After login, session restore will route to admin_panel automatically
              setScreen('admin_panel');
            }}
            onEnterRegister={() => setScreen('registration')}
            onEnterPro={() => setScreen('pro_login')}
            onEnterCatalog={() => setScreen('catalog')}
            onEnterDemo={() => {
              // Anonymous demo: load a sample student name and go to splash → home
              setStudentName('Demo');
              setScreen('splash');
            }}
          />
        </motion.div>
      )}

      {screen === 'registration' && (
        <motion.div key="registration" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
          <div className="min-h-screen bg-blue-50 py-4 px-4 flex flex-col items-center">
            <button 
              onClick={() => setScreen('landing')}
              className="absolute top-4 left-4 flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={20} /> <span className="text-sm">Volver</span>
            </button>
            <RegistrationScreen 
              onRegisterSuccess={(plan) => {
                setSelectedPlan(plan);
                setScreen('admin_panel');
              }} 
            />
          </div>
        </motion.div>
      )}

      {screen === 'admin_panel' && (
        <motion.div key="admin_panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AdminPanel 
            plan={selectedPlan} 
            onBack={() => setScreen('landing')} 
          />
        </motion.div>
      )}

      {screen === 'catalog' && (
        <motion.div key="catalog" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <CatalogScreen 
            catalogCourses={catalogCourses}
            onBack={() => {
              if (localStorage.getItem('fante_student_session')) setScreen('home');
              else setScreen('landing');
            }}
            onEnterApp={() => setScreen('splash')}
            onAddCourse={async (course) => {
              if (!currentStudent) {
                alert("Debes iniciar sesión para agregar cursos.");
                setScreen('landing');
                return;
              }
              
              // Logic to add course to patient's assigned courses
              const currentCourses = (() => {
                if (!currentStudent.course || currentStudent.course === 'Sin asignar') return [];
                try { return JSON.parse(currentStudent.course); } catch (e) { return []; }
              })();
              
              if (currentCourses.find((c: any) => c.title === course.title)) {
                alert("Este curso ya está en tu catálogo.");
                return;
              }
              
              const updatedCourses = [...currentCourses, { title: course.title, hidden: false }];
              const updatedPatient = { ...currentStudent, course: JSON.stringify(updatedCourses) };
              
              try {
                await patientsApi.upsert(updatedPatient);
                setCurrentStudent(updatedPatient);
                // Also update local storage if necessary
                const pts = JSON.parse(localStorage.getItem('fante_patients') || '[]');
                localStorage.setItem('fante_patients', JSON.stringify(pts.map((p: any) => p.id === updatedPatient.id ? updatedPatient : p)));
                
                alert(`¡Curso "${course.title}" agregado a tu catálogo!`);
                setScreen('home');
              } catch (e) {
                console.error("Error adding course:", e);
              }
            }}
          />
        </motion.div>
      )}

      {screen === 'pro_login' && (
        <motion.div key="pro_login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <ProLoginScreen 
            onLogin={() => setScreen('pro_dashboard')} 
            onBack={() => setScreen('landing')} 
          />
        </motion.div>
      )}

      {screen === 'pro_dashboard' && (
        <motion.div key="pro_dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ProDashboardScreen 
            onLogout={() => setScreen('landing')} 
            onEnterCatalog={() => setScreen('catalog')}
            onSaveCourse={handleSaveCourse}
          />
        </motion.div>
      )}

      {screen === 'splash' && (
        <motion.div key="splash" exit={{ opacity: 0 }}>
          <SplashScreen onFinish={() => setScreen('home')} />
        </motion.div>
      )}

      {screen === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomeScreen 
            streak={streak} 
            xp={xp} 
            courses={courses}
            catalogCourses={catalogCourses}
            quests={quests}
            achievements={achievements}
            friends={friends}
            studentName={studentName}
            onStartLesson={handleStartLesson} 
            onBack={() => setScreen('landing')}
            onEnterCatalog={() => setScreen('catalog')}
          />
        </motion.div>
      )}
      
      {screen === 'lesson' && (
        <motion.div key="lesson" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
          <LessonScreen 
            lessonBlocks={lessonBlocks}
            onClose={() => setScreen('home')} 
            onComplete={handleCompleteLesson} 
          />
        </motion.div>
      )}

      {screen === 'streak_animation' && (
        <motion.div key="streak_animation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <StreakAnimationScreen 
            streak={streak} 
            onFinish={handleFinishStreakAnimation} 
          />
        </motion.div>
      )}

      {screen === 'completion' && (
        <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CompletionScreen 
            streak={streak} 
            onFinish={handleFinish} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
