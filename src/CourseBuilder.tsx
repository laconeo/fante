import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Settings, X, Image as ImageIcon, CheckCircle2, Circle, Puzzle, Type, CheckSquare, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BuilderActivityType = 'info' | 'multiple_choice' | 'true_false';

export type BuilderContentType = 'text' | 'video' | 'audio' | 'image';

export interface BuilderOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface BuilderActivity {
  id: string;
  type: BuilderActivityType;
  title: string;
  contentType?: BuilderContentType;
  contentUrl?: string;
  content: string;
  image: string;
  question: string;
  options: BuilderOption[];
}

export interface BuilderModule {
  id: string;
  title: string;
  activities: BuilderActivity[];
}

export interface BuilderCourse {
  title: string;
  description: string;
  category: string;
  minAge: string;
  maxAge: string;
  coverImage?: string;
  modules: BuilderModule[];
}

interface SortableActivityItemProps {
  activity: BuilderActivity;
  moduleId: string;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

// Sortable Activity Item Component
const SortableActivityItem: React.FC<SortableActivityItemProps> = ({ 
  activity, 
  moduleId, 
  isEditing, 
  onEdit, 
  onDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const getActivityIcon = (type: BuilderActivityType) => {
    switch (type) {
      case 'info': return <Puzzle size={24} />;
      case 'multiple_choice': return <Type size={24} />;
      case 'true_false': return <CheckSquare size={24} />;
    }
  };

  const getActivityColor = (type: BuilderActivityType) => {
    switch (type) {
      case 'info': return "bg-violet-100 text-violet-600";
      case 'multiple_choice': return "bg-orange-100 text-orange-600";
      case 'true_false': return "bg-emerald-100 text-emerald-600";
    }
  };

  const getActivityLabel = (type: BuilderActivityType) => {
    switch (type) {
      case 'info': return "Información";
      case 'multiple_choice': return "Opción Múltiple";
      case 'true_false': return "Verdadero / Falso";
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "flex items-center gap-4 p-3 bg-white border-2 rounded-xl shadow-sm transition-colors group cursor-pointer relative",
        isEditing ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100 hover:border-blue-300",
        isDragging && "opacity-50 shadow-lg border-blue-400"
      )}
      onClick={onEdit}
    >
      <div {...attributes} {...listeners} className="p-2 -ml-2 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={20} />
      </div>
      
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
        getActivityColor(activity.type)
      )}>
        {getActivityIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-800 text-sm truncate px-2 py-1">{activity.title || 'Sin título'}</div>
        <p className="text-xs text-gray-500 px-2 mt-0.5">
          {getActivityLabel(activity.type)}
        </p>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-gray-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Eliminar actividad"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}

export default function CourseBuilderScreen({ onBack, onSave }: { onBack: () => void, onSave: (course: BuilderCourse) => void }) {
  const [course, setCourse] = useState<BuilderCourse>({
    title: '',
    description: '',
    category: 'Atención y Memoria',
    minAge: '',
    maxAge: '',
    modules: [
      {
        id: 'm1',
        title: 'Módulo 1: Introducción',
        activities: [
          {
            id: 'a1',
            type: 'info',
            title: 'Bienvenida',
            contentType: 'text',
            contentUrl: '',
            content: '¡Hola! Vamos a empezar a aprender.',
            image: '👋',
            question: '',
            options: []
          }
        ]
      }
    ]
  });

  const [editingActivity, setEditingActivity] = useState<{ moduleId: string, activityId: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, moduleId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCourse((prev) => {
        const moduleIndex = prev.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return prev;

        const newModules = [...prev.modules];
        const oldIndex = newModules[moduleIndex].activities.findIndex(a => a.id === active.id);
        const newIndex = newModules[moduleIndex].activities.findIndex(a => a.id === over.id);

        newModules[moduleIndex].activities = arrayMove(newModules[moduleIndex].activities, oldIndex, newIndex);

        return { ...prev, modules: newModules };
      });
    }
  };

  const validateCourse = () => {
    const newErrors: Record<string, string> = {};
    if (!course.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!course.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!course.minAge || !course.maxAge) newErrors.age = 'Rango de edad requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateCourse()) {
      onSave(course);
    } else {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const addModule = () => {
    const newModule: BuilderModule = {
      id: `m${Date.now()}`,
      title: `Módulo ${course.modules.length + 1}: Nuevo Módulo`,
      activities: []
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
  };

  const updateModuleTitle = (moduleId: string, title: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === moduleId ? { ...m, title } : m)
    });
  };

  const deleteModule = (moduleId: string) => {
    setCourse({
      ...course,
      modules: course.modules.filter(m => m.id !== moduleId)
    });
  };

  const addActivity = (moduleId: string) => {
    const newActivity: BuilderActivity = {
      id: `a${Date.now()}`,
      type: 'info',
      title: 'Nueva Actividad',
      contentType: 'text',
      contentUrl: '',
      content: '',
      image: '🌟',
      question: '',
      options: [
        { id: `o${Date.now()}_1`, text: 'Opción 1', isCorrect: true, feedback: '¡Correcto!' },
        { id: `o${Date.now()}_2`, text: 'Opción 2', isCorrect: false, feedback: 'Intenta de nuevo.' }
      ]
    };
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === moduleId ? { ...m, activities: [...m.activities, newActivity] } : m)
    });
    setEditingActivity({ moduleId, activityId: newActivity.id });
  };

  const updateActivity = (moduleId: string, activityId: string, updates: Partial<BuilderActivity>) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === moduleId ? {
        ...m,
        activities: m.activities.map(a => a.id === activityId ? { ...a, ...updates } : a)
      } : m)
    });
  };

  const deleteActivity = (moduleId: string, activityId: string) => {
    setCourse({
      ...course,
      modules: course.modules.map(m => m.id === moduleId ? {
        ...m,
        activities: m.activities.filter(a => a.id !== activityId)
      } : m)
    });
    if (editingActivity?.activityId === activityId) {
      setEditingActivity(null);
    }
  };

  const handleTypeChange = (moduleId: string, activityId: string, newType: BuilderActivityType) => {
    let updates: Partial<BuilderActivity> = { type: newType };
    
    // Reset options based on type
    if (newType === 'true_false') {
      updates.options = [
        { id: `o${Date.now()}_1`, text: 'Verdadero', isCorrect: true, feedback: '¡Correcto!' },
        { id: `o${Date.now()}_2`, text: 'Falso', isCorrect: false, feedback: 'Incorrecto.' }
      ];
    } else if (newType === 'multiple_choice') {
      updates.options = [
        { id: `o${Date.now()}_1`, text: 'Opción 1', isCorrect: true, feedback: '¡Correcto!' },
        { id: `o${Date.now()}_2`, text: 'Opción 2', isCorrect: false, feedback: 'Intenta de nuevo.' }
      ];
    }
    
    updateActivity(moduleId, activityId, updates);
  };

  const activeModule = editingActivity ? course.modules.find(m => m.id === editingActivity.moduleId) : null;
  const activeActivity = activeModule ? activeModule.activities.find(a => a.id === editingActivity.activityId) : null;

  return (
    <div className="pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 bg-white rounded-full border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-blue-950">Crear Curso</h2>
            <p className="text-sm text-blue-600/70">Diseña el contenido y la estructura de tu curso</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Save size={20} /> Guardar Curso
        </button>
      </div>
      
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Metadata */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm sticky top-6">
            <h3 className="font-bold text-blue-950 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-blue-500" />
              Detalles del Curso
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Título <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={course.title}
                  onChange={e => {
                    setCourse({...course, title: e.target.value});
                    if (errors.title) setErrors({...errors, title: ''});
                  }}
                  placeholder="Ej. Estimulación Cognitiva" 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors",
                    errors.title ? "border-red-300 focus:border-red-500 bg-red-50" : "border-blue-50 focus:border-blue-500"
                  )} 
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Descripción <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4} 
                  value={course.description}
                  onChange={e => {
                    setCourse({...course, description: e.target.value});
                    if (errors.description) setErrors({...errors, description: ''});
                  }}
                  placeholder="Describe el objetivo del curso..." 
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors resize-none",
                    errors.description ? "border-red-300 focus:border-red-500 bg-red-50" : "border-blue-50 focus:border-blue-500"
                  )} 
                />
                {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.description}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Categoría</label>
                <select 
                  value={course.category}
                  onChange={e => setCourse({...course, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-50 focus:border-blue-500 focus:outline-none bg-white transition-colors"
                >
                  <option>Atención y Memoria</option>
                  <option>Lectoescritura</option>
                  <option>Matemáticas</option>
                  <option>Habilidades Sociales</option>
                  <option>Funciones Ejecutivas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-2">Edad Recomendada <span className="text-red-500">*</span></label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number" 
                    value={course.minAge}
                    onChange={e => {
                      setCourse({...course, minAge: e.target.value});
                      if (errors.age) setErrors({...errors, age: ''});
                    }}
                    placeholder="Min" 
                    min="1"
                    max="99"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors",
                      errors.age ? "border-red-300 focus:border-red-500 bg-red-50" : "border-blue-50 focus:border-blue-500"
                    )} 
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input 
                    type="number" 
                    value={course.maxAge}
                    onChange={e => {
                      setCourse({...course, maxAge: e.target.value});
                      if (errors.age) setErrors({...errors, age: ''});
                    }}
                    placeholder="Max" 
                    min="1"
                    max="99"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors",
                      errors.age ? "border-red-300 focus:border-red-500 bg-red-50" : "border-blue-50 focus:border-blue-500"
                    )} 
                  />
                </div>
                {errors.age && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.age}</p>}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right: Builder */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-blue-950 text-xl">Estructura del Curso</h3>
                <p className="text-sm text-gray-500">Añade módulos y actividades arrastrándolas para ordenarlas.</p>
              </div>
              <button 
                onClick={addModule}
                className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-xl transition-colors hover:bg-blue-100"
              >
                <Plus size={18} /> Añadir Módulo
              </button>
            </div>
            
            {course.modules.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <Puzzle size={48} className="mx-auto text-gray-300 mb-4" />
                <h4 className="text-gray-500 font-bold mb-2">Este curso aún no tiene contenido</h4>
                <button 
                  onClick={addModule}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Añade el primer módulo
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {course.modules.map((module, index) => (
                  <div key={module.id} className="border-2 border-blue-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-blue-50/50 p-4 flex items-center justify-between border-b border-blue-100">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <input 
                          type="text" 
                          value={module.title}
                          onChange={e => updateModuleTitle(module.id, e.target.value)}
                          placeholder="Título del módulo"
                          className="font-bold text-blue-950 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full max-w-md" 
                        />
                      </div>
                      <button 
                        onClick={() => deleteModule(module.id)}
                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar módulo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="p-4 bg-gray-50/30">
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, module.id)}
                      >
                        <SortableContext 
                          items={module.activities.map(a => a.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {module.activities.map(activity => (
                              <SortableActivityItem 
                                key={activity.id}
                                activity={activity}
                                moduleId={module.id}
                                isEditing={editingActivity?.activityId === activity.id}
                                onEdit={() => setEditingActivity({ moduleId: module.id, activityId: activity.id })}
                                onDelete={() => deleteActivity(module.id, activity.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      <button 
                        onClick={() => addActivity(module.id)}
                        className="w-full py-4 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold text-sm hover:bg-blue-50 hover:border-blue-400 transition-colors flex items-center justify-center gap-2 mt-4"
                      >
                        <Plus size={18} /> Añadir Actividad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Activity Editor Modal/Slide-over */}
      <AnimatePresence>
        {editingActivity && activeActivity && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingActivity(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
                <h3 className="font-bold text-blue-950 text-xl flex items-center gap-2">
                  <Settings size={24} className="text-blue-600" />
                  Editar Actividad
                </h3>
                <button 
                  onClick={() => setEditingActivity(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Título de la Actividad</label>
                  <input 
                    type="text" 
                    value={activeActivity.title}
                    onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { title: e.target.value })}
                    placeholder="Ej. Juego de Memoria"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors font-medium" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Actividad</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleTypeChange(editingActivity.moduleId, activeActivity.id, 'info')}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center",
                        activeActivity.type === 'info' ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm" : "border-gray-200 hover:border-violet-200 text-gray-500"
                      )}
                    >
                      <Puzzle size={24} />
                      <span className="font-bold text-xs">Info</span>
                    </button>
                    <button 
                      onClick={() => handleTypeChange(editingActivity.moduleId, activeActivity.id, 'multiple_choice')}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center",
                        activeActivity.type === 'multiple_choice' ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm" : "border-gray-200 hover:border-orange-200 text-gray-500"
                      )}
                    >
                      <Type size={24} />
                      <span className="font-bold text-xs">Opciones</span>
                    </button>
                    <button 
                      onClick={() => handleTypeChange(editingActivity.moduleId, activeActivity.id, 'true_false')}
                      className={cn(
                        "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-center",
                        activeActivity.type === 'true_false' ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-gray-200 hover:border-emerald-200 text-gray-500"
                      )}
                    >
                      <CheckSquare size={24} />
                      <span className="font-bold text-xs">V / F</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100 w-full" />

                {activeActivity.type === 'info' ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Emoji / Icono</label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl shadow-inner">
                          {activeActivity.image || '✨'}
                        </div>
                        <input 
                          type="text" 
                          value={activeActivity.image}
                          onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { image: e.target.value })}
                          placeholder="Pega un emoji aquí" 
                          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-xl" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Contenido Multimedia</label>
                      <select
                        value={activeActivity.contentType || 'text'}
                        onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { contentType: e.target.value as BuilderContentType })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors mb-4 bg-white"
                      >
                        <option value="text">Texto</option>
                        <option value="image">Imagen (URL)</option>
                        <option value="video">Video (YouTube/Vimeo URL)</option>
                        <option value="audio">Audio (URL)</option>
                      </select>

                      {(activeActivity.contentType === 'text' || !activeActivity.contentType) ? (
                        <textarea 
                          rows={6} 
                          value={activeActivity.content}
                          onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { content: e.target.value })}
                          placeholder="Escribe el texto informativo aquí..." 
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none leading-relaxed" 
                        />
                      ) : (
                        <input
                          type="url"
                          value={activeActivity.contentUrl || ''}
                          onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { contentUrl: e.target.value })}
                          placeholder={`Pega aquí la URL del ${activeActivity.contentType === 'image' ? 'imagen' : activeActivity.contentType === 'video' ? 'video' : 'audio'}...`}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Contenido de Apoyo (Opcional)</label>
                      <select
                        value={activeActivity.contentType || 'text'}
                        onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { contentType: e.target.value as BuilderContentType })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors mb-4 bg-white"
                      >
                        <option value="text">Ninguno / Texto</option>
                        <option value="image">Imagen (URL)</option>
                        <option value="video">Video (YouTube/Vimeo URL)</option>
                        <option value="audio">Audio (URL)</option>
                      </select>

                      {(activeActivity.contentType === 'text' || !activeActivity.contentType) ? (
                        <textarea 
                          rows={3} 
                          value={activeActivity.content || ''}
                          onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { content: e.target.value })}
                          placeholder="Escribe el texto de apoyo aquí (opcional)..." 
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none leading-relaxed mb-4" 
                        />
                      ) : (
                        <input
                          type="url"
                          value={activeActivity.contentUrl || ''}
                          onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { contentUrl: e.target.value })}
                          placeholder={`Pega aquí la URL del ${activeActivity.contentType === 'image' ? 'imagen' : activeActivity.contentType === 'video' ? 'video' : 'audio'}...`}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors mb-4"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Pregunta</label>
                      <textarea 
                        rows={3} 
                        value={activeActivity.question}
                        onChange={e => updateActivity(editingActivity.moduleId, activeActivity.id, { question: e.target.value })}
                        placeholder="Escribe la pregunta aquí..." 
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none font-medium text-lg" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-bold text-gray-700">Opciones de Respuesta</label>
                        <span className="text-xs text-gray-500">Marca la correcta</span>
                      </div>
                      
                      <div className="space-y-4">
                        {activeActivity.options.map((option, index) => (
                          <div key={option.id} className={cn(
                            "p-4 border-2 rounded-xl space-y-3 relative group transition-colors",
                            option.isCorrect ? "border-green-200 bg-green-50/30" : "border-gray-200"
                          )}>
                            {activeActivity.type !== 'true_false' && (
                              <button 
                                onClick={() => {
                                  const newOptions = activeActivity.options.filter(o => o.id !== option.id);
                                  updateActivity(editingActivity.moduleId, activeActivity.id, { options: newOptions });
                                }}
                                className="absolute -top-3 -right-3 bg-white text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full shadow-sm border border-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <X size={14} />
                              </button>
                            )}
                            
                            <div className="flex items-start gap-3">
                              <button 
                                onClick={() => {
                                  const newOptions = activeActivity.options.map(o => ({ ...o, isCorrect: o.id === option.id }));
                                  updateActivity(editingActivity.moduleId, activeActivity.id, { options: newOptions });
                                }}
                                className={cn(
                                  "shrink-0 mt-1 transition-colors",
                                  option.isCorrect ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                                )}
                              >
                                {option.isCorrect ? <CheckCircle2 size={24} className="fill-green-100" /> : <Circle size={24} />}
                              </button>
                              <div className="flex-1 space-y-2">
                                <input 
                                  type="text" 
                                  value={option.text}
                                  onChange={e => {
                                    const newOptions = activeActivity.options.map(o => o.id === option.id ? { ...o, text: e.target.value } : o);
                                    updateActivity(editingActivity.moduleId, activeActivity.id, { options: newOptions });
                                  }}
                                  disabled={activeActivity.type === 'true_false'}
                                  placeholder={`Opción ${index + 1}`} 
                                  className={cn(
                                    "w-full font-bold text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1",
                                    activeActivity.type === 'true_false' && "bg-transparent"
                                  )} 
                                />
                                <input 
                                  type="text" 
                                  value={option.feedback}
                                  onChange={e => {
                                    const newOptions = activeActivity.options.map(o => o.id === option.id ? { ...o, feedback: e.target.value } : o);
                                    updateActivity(editingActivity.moduleId, activeActivity.id, { options: newOptions });
                                  }}
                                  placeholder="Mensaje de feedback (ej. ¡Muy bien!)" 
                                  className="w-full text-sm text-gray-600 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-3 py-2 bg-white/50 border border-gray-100" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {activeActivity.type === 'multiple_choice' && (
                          <button 
                            onClick={() => {
                              const newOption: BuilderOption = {
                                id: `o${Date.now()}`,
                                text: '',
                                isCorrect: activeActivity.options.length === 0,
                                feedback: ''
                              };
                              updateActivity(editingActivity.moduleId, activeActivity.id, { options: [...activeActivity.options, newOption] });
                            }}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus size={18} /> Añadir Opción
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={() => setEditingActivity(null)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg active:translate-y-0.5"
                >
                  Listo
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
