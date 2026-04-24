import React, { useState, useEffect, useCallback } from 'react';
import { CourseList, CourseEditor, type Course as FullCourse } from './CourseManager';
import { patientsApi, coursesApi } from '../api/db';
import { supabase } from '../lib/supabase';

import { 
  ArrowLeft, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Bell, 
  Search,
  Calendar,
  ChevronRight,
  ShieldCheck,
  X,
  Plus,
  Info,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Copy,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LZString from 'lz-string';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const today = new Date();
  const birth = new Date(birthDateString);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

type Patient = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  progress: number;
  lastActive: string;
  course: string;
  email?: string;
  birthDate?: string;
  sex?: 'Masculino' | 'Femenino' | 'Otro';
  hasDiagnosis?: boolean;
  created_at?: string;
};




type Props = {
  plan: string;
  onBack: () => void;
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
};

export const AdminPanel: React.FC<Props> = ({ plan, onBack }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pacientes' | 'contenido' | 'analiticas'>('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [wizardStep, setWizardStep] = useState(0);
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAssigningCourse, setIsAssigningCourse] = useState(false);
  const [courseView, setCourseView] = useState<'list' | 'edit' | 'new'>('list');
  const [editingCourse, setEditingCourse] = useState<FullCourse | null>(null);
  const [editForm, setEditForm] = useState({ name: '', birthDate: '', email: '', sex: '' as '' | 'Masculino' | 'Femenino' | 'Otro', hasDiagnosis: false });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [fullCourses, setFullCourses] = useState<FullCourse[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [newPatient, setNewPatient] = useState({ name: '', birthDate: '', email: '', sex: '' as '' | 'Masculino' | 'Femenino' | 'Otro', hasDiagnosis: false });
  const [searchQuery, setSearchQuery] = useState('');

  // Load from Supabase on mount, fall back to localStorage cache
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [dbPatients, dbCourses] = await Promise.all([
        patientsApi.getAll(),
        coursesApi.getAll(),
      ]);
      setPatients(dbPatients);
      setFullCourses(dbCourses);
      // Update localStorage cache
      localStorage.setItem('fante_patients', JSON.stringify(dbPatients));
      localStorage.setItem('fante_courses_v2', JSON.stringify(dbCourses));
    } catch (err) {
      console.error('Error loading from Supabase, falling back to localStorage', err);
      // Fallback to localStorage cache
      const cachedPatients = localStorage.getItem('fante_patients');
      const cachedCourses = localStorage.getItem('fante_courses_v2');
      if (cachedPatients) {
        try { setPatients(JSON.parse(cachedPatients)); } catch (e) { /* ignore */ }
      }
      if (cachedCourses) {
        try { setFullCourses(JSON.parse(cachedCourses)); } catch (e) { /* ignore */ }
      }
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fante_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('fante_courses_v2', JSON.stringify(fullCourses));
  }, [fullCourses]);

  useEffect(() => {
    // Check if user has seen wizard
    const seenWizard = localStorage.getItem('fante_wizard_seen');
    if (!seenWizard) setShowWizard(true);
    addToast('¡Bienvenido a Fante Pro!', 'success');
    loadData();
  }, []);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleFinishWizard = () => {
    localStorage.setItem('fante_wizard_seen', 'true');
    setShowWizard(false);
    addToast('¡Excelente! Ya puedes comenzar a usar Fante.', 'success');
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.birthDate) {
      addToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    const patientAge = calculateAge(newPatient.birthDate);
    const patient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPatient.name,
      age: patientAge,
      birthDate: newPatient.birthDate,
      email: newPatient.email,
      sex: newPatient.sex || undefined,
      hasDiagnosis: newPatient.hasDiagnosis,
      avatar: newPatient.name.charAt(0).toUpperCase(),
      progress: 0,
      lastActive: 'Recién añadido',
      course: 'Sin asignar'
    };

    // Optimistic UI update
    setPatients(prev => [...prev, patient]);
    setIsAddingPatient(false);
    setNewPatient({ name: '', birthDate: '', email: '', sex: '', hasDiagnosis: false });

    try {
      await patientsApi.upsert(patient);
      // Update local cache
      const updated = [...patients, patient];
      localStorage.setItem('fante_patients', JSON.stringify(updated));
      addToast('Paciente guardado en la base de datos ✓', 'success');
    } catch (err) {
      console.error('Error saving patient to Supabase:', err);
      addToast('Paciente guardado localmente (sin conexión a la base).', 'info');
    }
  };

  const handleEditPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name || !editForm.birthDate) {
      addToast('Por favor completa los campos obligatorios.', 'error');
      return;
    }

    if (selectedPatient) {
      const newAge = calculateAge(editForm.birthDate);
      const updatedPatient: Patient = {
        ...selectedPatient,
        name: editForm.name,
        birthDate: editForm.birthDate,
        age: newAge,
        email: editForm.email,
        sex: editForm.sex || undefined,
        hasDiagnosis: editForm.hasDiagnosis,
        avatar: editForm.name.charAt(0).toUpperCase()
      };

      setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);
      setIsEditingProfile(false);

      try {
        await patientsApi.upsert(updatedPatient);
        localStorage.setItem('fante_patients', JSON.stringify(
          patients.map(p => p.id === selectedPatient.id ? updatedPatient : p)
        ));
        addToast('Perfil actualizado en la base de datos ✓', 'success');
      } catch (err) {
        console.error('Error updating patient:', err);
        addToast('Perfil actualizado localmente (sin conexión a la base).', 'info');
      }
    }
  };

  const deletePatient = async (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedPatient?.id === id) setSelectedPatient(null);
    try {
      await patientsApi.delete(id);
      addToast('Paciente eliminado de la base de datos.', 'info');
    } catch (err) {
      console.error('Error deleting patient:', err);
      addToast('Paciente eliminado localmente.', 'info');
    }
  };

  const parseAssignedCourses = (courseStr?: string) => {
    if (!courseStr || courseStr === 'Sin asignar') return [];
    try {
      const parsed = JSON.parse(courseStr);
      if (Array.isArray(parsed)) return parsed as {title: string, hidden: boolean}[];
    } catch (e) {
      return [{ title: courseStr, hidden: false }];
    }
    return [];
  };

  const toggleCourseAssignment = async (courseTitle: string, action: 'toggle' | 'toggle_hidden') => {
    if (selectedPatient) {
      const courses = parseAssignedCourses(selectedPatient.course);
      const existingIdx = courses.findIndex(c => c.title === courseTitle);

      if (action === 'toggle') {
        if (existingIdx >= 0) {
          courses.splice(existingIdx, 1);
        } else {
          courses.push({ title: courseTitle, hidden: false });
        }
      } else if (action === 'toggle_hidden') {
        if (existingIdx >= 0) {
          courses[existingIdx].hidden = !courses[existingIdx].hidden;
        }
      }

      const newCourseStr = courses.length > 0 ? JSON.stringify(courses) : 'Sin asignar';
      const updatedPatient = { ...selectedPatient, course: newCourseStr };
      
      setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updatedPatient : p));
      setSelectedPatient(updatedPatient);

      try {
        await patientsApi.upsert(updatedPatient);
        if (action === 'toggle' && existingIdx < 0) {
           addToast(`Curso "${courseTitle}" asignado en la base ✓`, 'success');
        }
      } catch (err) {
        console.error('Error assigning course:', err);
        if (action === 'toggle' && existingIdx < 0) {
           addToast(`Curso "${courseTitle}" asignado localmente.`, 'info');
        }
      }
    }
  };

  const wizardSteps = [
    {
      title: '¡Te damos la bienvenida a Fante!',
      description: 'Fante es una plataforma diseñada para crear y gestionar cursos a medida para tus alumnos o pacientes.',
      icon: '🐘'
    },
    {
      title: 'Gestiona tus Alumnos',
      description: 'Carga a tus alumnos o pacientes y asígnales cursos específicos para que aprendan habilidades a su ritmo.',
      icon: '👥'
    },
    {
      title: 'Cursos Personalizados',
      description: 'Crea contenido estructurado (texto, imágenes, videos) y diseña lecciones interactivas para potenciar el aprendizaje.',
      icon: '📚'
    },
    {
      title: 'Todo listo',
      description: 'Comienza ahora configurando tu primer paciente en la sección de "Pacientes".',
      icon: '🚀'
    }
  ];

  const renderDashboard = () => (
    <div className="p-8 max-w-6xl w-full mx-auto">
      {/* Welcome Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-blue-950 mb-2">¡Bienvenido al Panel {plan}!</h1>
        <p className="text-blue-800/60 font-medium">Aquí tienes un resumen de lo que está pasando hoy en Fante.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Pacientes', value: patients.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Lecciones Hoy', value: patients.filter(p => p.lastActive === 'Hoy').length.toString(), icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-100' },
          { label: 'Progreso Medio', value: patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + (p.progress || 0), 0) / patients.length) + '%' : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: 'Cursos Activos', value: fullCourses.length.toString(), icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</div>
            <div className="text-3xl font-extrabold text-blue-950">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-blue-50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-blue-950 flex items-center gap-2">
              <Calendar size={22} className="text-blue-500" /> Actividad Reciente
            </h3>
            <button className="text-blue-600 font-bold text-sm hover:underline">Ver todo</button>
          </div>
          {patients.length > 0 ? (
            <div className="py-6 space-y-6">
              {(() => {
                const allActivities = patients.flatMap(p => [
                  ...(p.lastActive && p.lastActive !== 'Nunca' ? [{ title: `Lección completada por ${p.name}`, date: p.lastActive, sortIdx: 0, color: 'bg-orange-500' }] : []),
                  ...((() => {
                    try {
                      const courses = JSON.parse(p.course);
                      return courses.length > 0 ? [{ title: `${p.name} asignado a ${courses.length} curso${courses.length > 1 ? 's' : ''}`, date: 'Activo', sortIdx: 1, color: 'bg-blue-500' }] : [];
                    } catch { return []; }
                  })()),
                  { title: `Perfil de ${p.name} creado`, date: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Activo', sortIdx: 2, color: 'bg-emerald-500' }
                ]).sort((a, b) => a.sortIdx - b.sortIdx).slice(0, 6);

                return allActivities.map((activity, i, arr) => (
                  <div key={i} className="flex gap-4">
                    <div className="relative">
                      <div className={cn("w-3 h-3 rounded-full mt-1.5 outline outline-4 outline-white shadow-sm z-10 relative", activity.color)}></div>
                      {i < arr.length - 1 && <div className="absolute top-4 left-1.5 w-0.5 h-full bg-gray-100 -ml-px"></div>}
                    </div>
                    <div className="pb-4">
                      <h4 className="text-sm font-bold text-blue-950">{activity.title}</h4>
                      <p className="text-xs text-gray-400 font-medium">{activity.date}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h4 className="text-lg font-bold text-blue-950 mb-2">Tu panel está listo</h4>
              <p className="text-gray-400 max-w-xs mx-auto">Comienza añadiendo a tu primer paciente para ver sus métricas en tiempo real.</p>
              <button 
                onClick={() => setActiveTab('pacientes')}
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                + Añadir Paciente
              </button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-3xl"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Nivel {plan}</h3>
            <p className="text-blue-100 leading-relaxed">
              Gracias por confiar en Fante. Estás usando el plan diseñado para potenciar tu práctica profesional.
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <button 
              onClick={() => setShowWizard(true)}
              className="w-full py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Repetir Tutorial <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPacientes = () => {
    const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-8 max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 mb-2">Gestión de Pacientes</h1>
            <p className="text-blue-800/60 font-medium">Administra tus alumnos y realiza el seguimiento de su progreso.</p>
          </div>
          <button 
            onClick={() => setIsAddingPatient(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Añadir Paciente
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-blue-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-blue-50 bg-blue-50/30 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar pacientes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-blue-100 focus:border-blue-500 rounded-xl outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-500 bg-white border border-blue-100 rounded-lg transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>

          {patients.length > 0 ? (
            <div className="divide-y divide-blue-50">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-blue-50/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-extrabold text-xl">
                      {patient.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-blue-950">{patient.name}</h4>
                      <p className="text-sm text-blue-800/60 font-medium">
                        {patient.age} años {patient.email ? `• ${patient.email}` : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Última actividad</div>
                      <div className="text-sm font-bold text-blue-950">{patient.lastActive}</div>
                    </div>
                    
                    <div className="w-px h-10 bg-blue-50 hidden md:block"></div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                      >
                        Ver Perfil
                      </button>
                      <button 
                        onClick={() => deletePatient(patient.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-gray-400 font-medium">No se encontraron pacientes que coincidan con tu búsqueda.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center border-2 border-dashed border-blue-200 mx-auto mb-6">
                <Users size={32} className="text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-2">No tienes pacientes registrados</h3>
              <p className="text-gray-400 max-w-sm mx-auto mb-8">
                Agrega a tu primer paciente para asignarle cursos y comenzar el seguimiento de sus habilidades.
              </p>
              <button 
                onClick={() => setIsAddingPatient(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                + Añadir mi primer paciente
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContenido = () => {
    // If editing or creating a course, show the full-featured CourseEditor
    if (courseView === 'edit' && editingCourse) {
      return (
        <div className="p-8 max-w-5xl w-full mx-auto">
          <CourseEditor
            initialCourse={editingCourse}
            onSave={async (course) => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                const courseWithAuthor = { ...course, author_id: user?.id || course.author_id || 'anonymous' };
                await coursesApi.upsert(courseWithAuthor);
                // Refresh list from Supabase
                const updated = await coursesApi.getAll();
                setFullCourses(updated);
                localStorage.setItem('fante_courses_v2', JSON.stringify(updated));
                addToast(`Curso "${course.title}" guardado en la base de datos ✓`, 'success');
              } catch (err: any) {
                console.error('Error saving course:', err);
                // Fallback: update local state only
                setFullCourses(prev => prev.map(c => c.id === course.id ? course : c));
                localStorage.setItem('fante_courses_v2', JSON.stringify(
                  fullCourses.map(c => c.id === course.id ? course : c)
                ));
                addToast(`Error al guardar en la base: ${err?.message || 'desconocido'}. Guardado localmente.`, 'error');
              }
              setCourseView('list');
              setEditingCourse(null);
            }}
            onBack={() => { setCourseView('list'); setEditingCourse(null); }}
          />
        </div>
      );
    }

    if (courseView === 'new') {
      const blankCourse: FullCourse = {
        id: Math.random().toString(36).substr(2, 12),
        title: '', description: '', cover_image_url: '', category: 'educacion',
        author_id: '', visibility: 'public', target_age_min: 6, target_age_max: 18,
        schema_version: '1.0', weeks: []
      };
      return (
        <div className="p-8 max-w-5xl w-full mx-auto">
          <CourseEditor
            initialCourse={blankCourse}
            onSave={async (course) => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                const courseWithAuthor = { ...course, author_id: user?.id || 'anonymous' };
                await coursesApi.upsert(courseWithAuthor);
                const updated = await coursesApi.getAll();
                setFullCourses(updated);
                localStorage.setItem('fante_courses_v2', JSON.stringify(updated));
                addToast(`Curso "${course.title}" creado y guardado en la base de datos ✓`, 'success');
              } catch (err: any) {
                console.error('Error creating course:', err);
                setFullCourses(prev => [...prev, course]);
                localStorage.setItem('fante_courses_v2', JSON.stringify([...fullCourses, course]));
                addToast(`Error al guardar en la base: ${err?.message || 'desconocido'}. Guardado localmente.`, 'error');
              }
              setCourseView('list');
            }}
            onBack={() => setCourseView('list')}
          />
        </div>
      );
    }

    // Default: list view using CourseList from CourseManager
    return (
      <div className="p-8 max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-950 mb-2">Biblioteca de Cursos</h1>
            <p className="text-blue-800/60 font-medium">
              {fullCourses.length} curso{fullCourses.length !== 1 ? 's' : ''} guardado{fullCourses.length !== 1 ? 's' : ''} en la base de datos.
            </p>
          </div>
          <button
            onClick={() => setCourseView('new')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
          >
            <Plus size={20} /> Crear Nuevo Curso
          </button>
        </div>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <CourseList
            courses={fullCourses}
            onEdit={(course) => { setEditingCourse(course); setCourseView('edit'); }}
            onDelete={async (id) => {
              setFullCourses(prev => prev.filter(c => c.id !== id));
              try {
                await coursesApi.delete(id);
                addToast('Curso eliminado de la base de datos.', 'info');
              } catch (err) {
                console.error('Error deleting course:', err);
                addToast('Curso eliminado localmente.', 'info');
              }
            }}
            onNew={() => setCourseView('new')}
            onImport={async (course) => {
              try {
                await coursesApi.upsert(course);
                const updated = await coursesApi.getAll();
                setFullCourses(updated);
                localStorage.setItem('fante_courses_v2', JSON.stringify(updated));
                addToast(`Curso "${course.title}" importado y guardado ✓`, 'success');
              } catch (err) {
                setFullCourses(prev => [...prev, course]);
                addToast('Curso importado localmente.', 'info');
              }
            }}
            onExport={(course) => {
              const blob = new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${course.title.replace(/\s+/g, '_')}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        )}
      </div>
    );
  };

  const renderPerfilPaciente = (patient: Patient) => (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <button 
        onClick={() => setSelectedPatient(null)}
        className="flex items-center gap-2 text-blue-600 font-bold mb-8 hover:text-blue-800 transition-colors group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <ArrowLeft size={18} />
        </div>
        Volver a la lista
      </button>

      {/* Profile Header — full width, only its natural height */}
      <div className="bg-white rounded-[2.5rem] p-7 border border-blue-100 shadow-sm relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full translate-x-24 -translate-y-24 blur-3xl opacity-50"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/20 shrink-0">
            {patient.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-2xl font-extrabold text-blue-950">{patient.name}</h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200">Activo</span>
              {(patient as any).hasDiagnosis && (
                <span className="px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-bold uppercase tracking-widest border border-violet-200">Con diagnóstico</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-blue-800/60 font-medium text-sm">
              <span className="flex items-center gap-1.5"><Calendar size={13}/> {patient.age} años</span>
              {(patient as any).sex && <span className="px-2 py-0.5 bg-blue-50 rounded-lg font-bold text-xs">{(patient as any).sex}</span>}
              {patient.email && <span className="text-xs">📧 {patient.email}</span>}
              <span className="text-blue-300 text-xs">ID: {patient.id.slice(0,8)}…</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditForm({ name: selectedPatient.name, birthDate: selectedPatient.birthDate || '', email: selectedPatient.email || '', sex: (selectedPatient as any).sex || '', hasDiagnosis: (selectedPatient as any).hasDiagnosis || false });
              setIsEditingProfile(true);
            }}
            className="shrink-0 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 text-sm"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats + Courses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid — immediately below header */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3"><TrendingUp size={18} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso</p>
              <p className="text-2xl font-black text-blue-950">{patient.progress || 0}%</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3"><BookOpen size={18} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cursos</p>
              <p className="text-2xl font-black text-blue-950">{parseAssignedCourses(patient.course).length}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3"><CheckCircle2 size={18} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Racha</p>
              <p className="text-2xl font-black text-blue-950">{(patient as any).streak || 0}d</p>
            </div>
          </div>

          {/* Assigned Courses */}
          <div className="bg-white rounded-[2rem] p-8 border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-blue-950">Cursos Asignados</h3>
              <button onClick={() => setIsAssigningCourse(true)} className="text-blue-600 font-bold text-sm hover:underline">+ Asignar nuevo</button>
            </div>
            {(() => {
              const assigned = parseAssignedCourses(patient.course);
              if (assigned.length === 0) return (
                <div className="p-10 text-center border-2 border-dashed border-blue-100 rounded-2xl">
                  <p className="text-gray-400 font-medium mb-4">No tiene cursos asignados todavía.</p>
                  <button onClick={() => setIsAssigningCourse(true)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors">Asignar primer curso</button>
                </div>
              );
              return (
                <div className="space-y-4">
                  {assigned.map((courseItem) => {
                    const fullCourse = fullCourses.find(fc => fc.title === courseItem.title);
                    const lessonCount = (fullCourse as any)?.lessons?.length || 0;
                    const progress = patient.progress || 0;
                    return (
                      <div key={courseItem.title} className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                              {courseItem.hidden ? <Lock size={18} className="text-blue-400" /> : <BookOpen size={18} />}
                            </div>
                            <div>
                              <h4 className={cn('font-bold text-sm', courseItem.hidden ? 'text-gray-400 line-through' : 'text-blue-950')}>{courseItem.title}</h4>
                              <p className="text-xs text-blue-800/50 font-medium flex flex-wrap gap-x-2">
                                <span>{courseItem.hidden ? 'Oculto al alumno' : 'En curso'}</span>
                                <span>· Último acceso: {patient.lastActive}</span>
                                {lessonCount > 0 && <span>· {lessonCount} lecciones</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => toggleCourseAssignment(courseItem.title, 'toggle_hidden')} className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white text-gray-500 transition-colors border border-transparent hover:border-gray-200">
                              {courseItem.hidden ? 'Mostrar' : 'Ocultar'}
                            </button>
                            <button onClick={() => toggleCourseAssignment(courseItem.title, 'toggle')} className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors">
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                        {!courseItem.hidden && (
                          <div>
                            <div className="flex justify-between text-xs font-bold text-blue-800/40 mb-1.5">
                              <span>Progreso</span><span className="text-blue-600">{progress}%</span>
                            </div>
                            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right Column: Acceso Rápido + Activity */}
        <div className="space-y-6">
          {/* Acceso Rápido */}
          {(() => {
            let syncPayload = '';
            try { syncPayload = LZString.compressToEncodedURIComponent(JSON.stringify({ patient })); } catch {}
            const appBaseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
            const shareUrl = `${appBaseUrl}/acceso/${patient.id}?sync=${syncPayload}`;
            return (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-10 -translate-y-10 blur-xl"></div>
                <h3 className="text-base font-bold mb-1 flex items-center gap-2 relative z-10"><QrCode size={18} /> Acceso Rápido</h3>
                <p className="text-blue-100 text-xs mb-4 relative z-10">Sin contraseña para {patient.name.split(' ')[0]}</p>
                <div className="bg-white p-2 rounded-2xl mb-4 flex justify-center relative z-10">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl)}&color=1e40af&bgcolor=ffffff`} alt="QR" className="w-28 h-28 rounded-xl" />
                </div>
                <div className="space-y-2 relative z-10">
                  <button onClick={() => window.open(shareUrl, '_blank')} className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 text-sm shadow-md">
                    <ExternalLink size={16} /> Abrir Panel
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { const msg = `¡Hola! Aquí tienes el acceso de ${patient.name} en Fante: ${shareUrl}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'); }}
                      className="flex-1 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-all flex items-center justify-center gap-1.5 text-sm"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </button>
                    <button
                      onClick={() => { const ta = document.createElement('textarea'); ta.value = shareUrl; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); addToast('Link copiado en memoria', 'success'); } catch { navigator.clipboard.writeText(shareUrl).then(() => addToast('Link copiado en memoria', 'success')); } document.body.removeChild(ta); }}
                      className="p-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center justify-center group"
                      title="Copiar Enlace"
                    >
                      <Copy size={16} className="group-active:scale-90 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Actividad Reciente */}
          <div className="bg-white rounded-[2rem] p-6 border border-blue-100 shadow-sm">
            <h3 className="text-lg font-bold text-blue-950 mb-5">Actividad Reciente</h3>
            <div className="space-y-4">
              {[
                ...(patient.lastActive && patient.lastActive !== 'Nunca' && patient.lastActive !== 'Recién añadido' ? [{ title: 'Última lección completada', date: patient.lastActive, color: 'bg-orange-500' }] : []),
                ...((() => { try { const c = JSON.parse(patient.course); return c.length > 0 ? [{ title: `Asignado a ${c.length} curso${c.length > 1 ? 's' : ''}`, date: 'Activo', color: 'bg-blue-500' }] : []; } catch { return []; } })()),
                { title: 'Perfil creado', date: (patient as any).created_at ? new Date((patient as any).created_at).toLocaleDateString() : 'En el registro inicial', color: 'bg-emerald-500' },
              ].map((activity, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="relative">
                    <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 outline outline-4 outline-white shadow-sm z-10 relative', activity.color)}></div>
                    {i < arr.length - 1 && <div className="absolute top-4 left-1 w-0.5 h-full bg-gray-100"></div>}
                  </div>
                  <div className="pb-3">
                    <h4 className="text-sm font-bold text-blue-950">{activity.title}</h4>
                    <p className="text-xs text-gray-400 font-medium">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50/50 flex font-sans">
      {/* Toast System */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className={cn(
                "pointer-events-auto p-4 rounded-2xl shadow-lg border flex items-start gap-3 min-w-[300px] max-w-sm",
                toast.type === 'success' ? "bg-white border-emerald-100 text-emerald-800" :
                toast.type === 'error' ? "bg-white border-red-100 text-red-800" :
                "bg-white border-blue-100 text-blue-800"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                toast.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                toast.type === 'error' ? "bg-red-100 text-red-600" :
                "bg-blue-100 text-blue-600"
              )}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : 
                 toast.type === 'error' ? <X size={18} /> : <Info size={18} />}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm font-bold">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors pt-1">
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Onboarding Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-950/60 backdrop-blur-sm"
              onClick={() => {}} // Block clicking outside
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="h-2 bg-gray-100 w-full flex">
                {wizardSteps.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-full transition-all duration-500", 
                      i <= wizardStep ? "bg-blue-600" : "bg-transparent"
                    )}
                    style={{ width: `${100 / wizardSteps.length}%` }}
                  />
                ))}
              </div>

              <div className="p-8 sm:p-12 text-center">
                <div className="text-7xl mb-8 animate-bounce" style={{ animationDuration: '3s' }}>
                  {wizardSteps[wizardStep].icon}
                </div>
                <h2 className="text-3xl font-extrabold text-blue-950 mb-4">
                  {wizardSteps[wizardStep].title}
                </h2>
                <p className="text-lg text-blue-800/60 font-medium leading-relaxed max-w-lg mx-auto">
                  {wizardSteps[wizardStep].description}
                </p>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                  {wizardStep > 0 && (
                    <button 
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="w-full sm:w-auto px-8 py-4 text-blue-600 font-bold hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      Anterior
                    </button>
                  )}
                  {wizardStep < wizardSteps.length - 1 ? (
                    <button 
                      onClick={() => setWizardStep(prev => prev + 1)}
                      className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button 
                      onClick={handleFinishWizard}
                      className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                      Comenzar ahora
                    </button>
                  )}
                </div>

                <button 
                  onClick={handleFinishWizard}
                  className="mt-6 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors uppercase tracking-widest"
                >
                  No mostrar más
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-blue-100 p-6 sticky top-0 h-screen shrink-0">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl mb-12 px-2">
          <span className="text-3xl font-normal">🐘</span> Fante Pro
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl font-bold transition-all transform active:scale-95",
              activeTab === 'dashboard' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={22} /> Panel
          </button>
          <button 
            onClick={() => {
              setActiveTab('pacientes');
              setSelectedPatient(null);
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl font-bold transition-all transform active:scale-95",
              activeTab === 'pacientes' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Users size={22} /> Pacientes
          </button>
          <button 
            onClick={() => setActiveTab('contenido')}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl font-bold transition-all transform active:scale-95",
              activeTab === 'contenido' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <BookOpen size={22} /> Contenido
          </button>
          <button 
            onClick={() => setActiveTab('analiticas')}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl font-bold transition-all transform active:scale-95",
              activeTab === 'analiticas' ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <TrendingUp size={22} /> Analíticas
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl font-bold transition-all">
            <Settings size={22} /> Ajustes
          </button>
          <button 
            onClick={onBack}
            className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-50 rounded-xl font-bold transition-all"
          >
            <ArrowLeft size={22} /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-blue-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar pacientes, cursos..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-sm font-medium"
              />
            </div>
            <button className="md:hidden p-2 text-gray-500 hover:text-blue-600">
              <Users size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full font-bold text-sm border border-blue-100">
              <ShieldCheck size={16} />
              {plan}
            </div>
            <button className="p-2 text-gray-400 hover:text-blue-500 relative">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-xl cursor-pointer hover:scale-105 transition-transform">
              👤
            </div>
          </div>
        </header>

        <div className="flex-1">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'pacientes' && (
            selectedPatient ? renderPerfilPaciente(selectedPatient) : renderPacientes()
          )}
          {activeTab === 'contenido' && courseView === 'list' && (
            <CourseList
              courses={fullCourses}
              onNew={() => { setEditingCourse(null); setCourseView('new'); }}
              onEdit={c => { setEditingCourse(c); setCourseView('edit'); }}
              onDelete={async id => {
                setFullCourses(prev => prev.filter(c => c.id !== id));
                try {
                  await coursesApi.delete(id);
                  addToast('Curso eliminado de la base de datos.', 'info');
                } catch (err) {
                  console.error('Error deleting course:', err);
                  addToast('Curso eliminado localmente.', 'info');
                }
              }}
              onImport={async c => {
                const updated = [...fullCourses.filter(x => x.id !== c.id), c];
                setFullCourses(updated);
                localStorage.setItem('fante_courses_v2', JSON.stringify(updated));
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  await coursesApi.upsert({ ...c, author_id: user?.id || 'anonymous' });
                  addToast('Curso importado y guardado en la base ✓', 'success');
                } catch (err) {
                  addToast('Curso importado localmente.', 'info');
                }
              }}
              onExport={c => {
                const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `${c.title.replace(/\s+/g, '_')}.json`; a.click();
                URL.revokeObjectURL(url);
              }}
            />
          )}
          {activeTab === 'contenido' && (courseView === 'edit' || courseView === 'new') && (
            <CourseEditor
              initialCourse={editingCourse ?? undefined}
              onBack={() => setCourseView('list')}
              onSave={async saved => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  const courseWithAuthor = { ...saved, author_id: user?.id || saved.author_id || 'anonymous' };
                  await coursesApi.upsert(courseWithAuthor);
                  const refreshed = await coursesApi.getAll();
                  setFullCourses(refreshed);
                  localStorage.setItem('fante_courses_v2', JSON.stringify(refreshed));
                  addToast(courseView === 'edit' ? 'Curso actualizado en la base ✓' : 'Curso creado y guardado ✓', 'success');
                } catch (err: any) {
                  console.error('Error saving course:', err);
                  setFullCourses(prev => {
                    const exists = prev.find(c => c.id === saved.id);
                    const next = exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
                    localStorage.setItem('fante_courses_v2', JSON.stringify(next));
                    return next;
                  });
                  addToast(`Error en la base: ${err?.message || 'desconocido'}. Guardado localmente.`, 'error');
                }
                setCourseView('list');
                setEditingCourse(null);
              }}
            />
          )}
          {activeTab === 'analiticas' && (
            <div className="flex flex-col items-center justify-center p-20 text-center opacity-50">
              <div className="text-6xl mb-6">🚧</div>
              <h2 className="text-2xl font-bold text-blue-950 mb-2">Sección en Construcción</h2>
              <p className="text-gray-500">Estamos trabajando para traerte esta funcionalidad muy pronto.</p>
            </div>
          )}
        </div>

        {/* Add Patient Modal */}
        <AnimatePresence>
          {isAddingPatient && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"
                onClick={() => setIsAddingPatient(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold text-blue-950">Añadir Paciente</h2>
                    <button 
                      onClick={() => setIsAddingPatient(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAddPatient} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">Nombre completo *</label>
                      <input 
                        type="text" 
                        required
                        value={newPatient.name}
                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                        placeholder="Ej. Lucas García"
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">Fecha de nacimiento *</label>
                        <input 
                          type="date" 
                          required
                          value={newPatient.birthDate}
                          onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">Sexo</label>
                        <select
                          value={newPatient.sex}
                          onChange={(e) => setNewPatient({ ...newPatient, sex: e.target.value as any })}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                        >
                          <option value="">No especificado</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">Correo (opcional)</label>
                      <input 
                        type="email" 
                        value={newPatient.email}
                        onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                        placeholder="padre@correo.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-blue-900">¿Tiene diagnóstico?</p>
                        <p className="text-xs text-gray-400 font-medium">Indica si el paciente posee un diagnóstico clínico</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewPatient({ ...newPatient, hasDiagnosis: !newPatient.hasDiagnosis })}
                        className={cn(
                          "relative w-12 h-6 rounded-full transition-all duration-300",
                          newPatient.hasDiagnosis ? "bg-blue-600" : "bg-gray-300"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300",
                          newPatient.hasDiagnosis ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsAddingPatient(false)}
                        className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                      >
                        Guardar Paciente
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Patient Modal */}
        <AnimatePresence>
          {isEditingProfile && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"
                onClick={() => setIsEditingProfile(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-extrabold text-blue-950">Editar Perfil</h2>
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleEditPatient} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">Nombre completo *</label>
                      <input 
                        type="text" required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Ej. Lucas García"
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">Fecha de nacimiento *</label>
                        <input 
                          type="date" required
                          value={editForm.birthDate}
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-2">Sexo</label>
                        <select
                          value={editForm.sex}
                          onChange={(e) => setEditForm({ ...editForm, sex: e.target.value as any })}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                        >
                          <option value="">No especificado</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Femenino">Femenino</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">Correo (opcional)</label>
                      <input 
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="padre@correo.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold text-blue-900">¿Tiene diagnóstico?</p>
                        <p className="text-xs text-gray-400 font-medium">Indica si el paciente posee un diagnóstico clínico</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, hasDiagnosis: !editForm.hasDiagnosis })}
                        className={cn("relative w-12 h-6 rounded-full transition-all duration-300", editForm.hasDiagnosis ? "bg-blue-600" : "bg-gray-300")}
                      >
                        <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300", editForm.hasDiagnosis ? "left-7" : "left-1")} />
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                        Cancelar
                      </button>
                      <button type="submit" className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Assign Course Modal */}
        <AnimatePresence>
          {isAssigningCourse && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"
                onClick={() => setIsAssigningCourse(false)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-extrabold text-blue-950">Asignar Curso</h2>
                      <p className="text-sm text-gray-500 font-medium">Elige un curso para {selectedPatient?.name}</p>
                    </div>
                    <button 
                      onClick={() => setIsAssigningCourse(false)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {fullCourses.length === 0 ? (
                      <div className="py-10 text-center text-gray-400">
                        <p className="font-medium mb-2">No hay cursos disponibles.</p>
                        <p className="text-sm">Ve a la sección de <strong>Contenido</strong> para crear cursos.</p>
                      </div>
                    ) : fullCourses.map(course => (
                      <button 
                        key={course.id}
                        onClick={() => toggleCourseAssignment(course.title, 'toggle')}
                        className={cn(
                          "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left group",
                          parseAssignedCourses(selectedPatient?.course).some(c => c.title === course.title)
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "bg-gray-50 border-transparent hover:border-blue-200"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0",
                          parseAssignedCourses(selectedPatient?.course).some(c => c.title === course.title) ? "bg-white/20" : "bg-white"
                        )}>
                          {course.cover_image_url ? <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover rounded-2xl" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} /> : '📚'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{course.title}</h4>
                          <p className={cn(
                            "text-sm line-clamp-1",
                            parseAssignedCourses(selectedPatient?.course).some(c => c.title === course.title) ? "text-blue-100" : "text-gray-500"
                          )}>
                            {course.description}
                          </p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                          parseAssignedCourses(selectedPatient?.course).some(c => c.title === course.title) 
                            ? "bg-white text-blue-600 border-white" 
                            : "bg-white border-gray-200 group-hover:border-blue-400"
                        )}>
                          {parseAssignedCourses(selectedPatient?.course).some(c => c.title === course.title) ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={() => setIsAssigningCourse(false)}
                      className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
