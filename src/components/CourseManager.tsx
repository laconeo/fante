import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, X, Save, Upload, Download,
  ChevronDown, ChevronRight, BookOpen, FileText,
  Image as ImageIcon, HelpCircle, Type, Edit3, AlertCircle, CheckCircle2,
  Video, Music, Play, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
function uid() { return Math.random().toString(36).substr(2, 12); }

// ─── Types ───────────────────────────────────────────────────────────────────

export type BlockType = 'text' | 'image' | 'video' | 'audio' | 'multiple_choice';

export interface TextContent { html: string; }
export interface ImageContent { url: string; alt: string; caption: string; }
export interface VideoContent { url: string; caption: string; }
export interface AudioContent { url: string; title: string; }
export interface MCOption { id: string; text: string; feedback: string; }
export interface MCContent { question: string; correct_option_id: string; options: MCOption[]; }

export type AnyContent = TextContent | ImageContent | VideoContent | AudioContent | MCContent;

export interface Block {
  id: string;
  order: number;
  type: BlockType;
  content: AnyContent;
}

export interface Lesson {
  id: string;
  day_number: number;
  scheduled_date: string;
  title: string;
  subtitle: string;
  xp_reward: number;
  motivational_phrases: string[];
  blocks: Block[];
}

export interface Week {
  id: string;
  week_number: number;
  title: string;
  checkpoint: string | null;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  category: string;
  author_id: string;
  visibility: 'public' | 'private';
  target_age_min: number;
  target_age_max: number;
  schema_version: string;
  weeks: Week[];
}

// ─── Default constructors ─────────────────────────────────────────────────────

function newBlock(type: BlockType, order: number): Block {
  let content: AnyContent;
  if (type === 'text') content = { html: '' };
  else if (type === 'image') content = { url: '', alt: '', caption: '' };
  else if (type === 'video') content = { url: '', caption: '' };
  else if (type === 'audio') content = { url: '', title: '' };
  else content = { question: '', correct_option_id: '', options: [{ id: uid(), text: 'Opción A', feedback: '¡Correcto!' }, { id: uid(), text: 'Opción B', feedback: 'Intenta de nuevo.' }] };
  return { id: uid(), order, type, content };
}

function newLesson(dayNumber: number): Lesson {
  return {
    id: uid(), day_number: dayNumber, scheduled_date: '',
    title: `Lección ${dayNumber}`, subtitle: `Día ${dayNumber}`,
    xp_reward: 10, motivational_phrases: ['¡Muy bien!', '¡Sos increíble!'], blocks: []
  };
}

function newWeek(weekNumber: number): Week {
  return { id: uid(), week_number: weekNumber, title: `Semana ${weekNumber}`, checkpoint: null, lessons: [newLesson(1)] };
}

function newCourse(): Course {
  return {
    id: uid(), title: '', description: '', cover_image_url: '', category: 'religion',
    author_id: '', visibility: 'public', target_age_min: 6, target_age_max: 12,
    schema_version: '1.0', weeks: [newWeek(1)]
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const BlockEditor: React.FC<{ block: Block; onChange: (b: Block) => void; onDelete: () => void }> = ({ block, onChange, onDelete }) => {
  const labelMap: Record<BlockType, string> = {
    text: 'Texto', image: 'Imagen', video: 'Video', audio: 'Audio', multiple_choice: 'Pregunta'
  };
  const iconMap: Record<BlockType, React.ReactNode> = {
    text: <Type size={16} />,
    image: <ImageIcon size={16} />,
    video: <Video size={16} />,
    audio: <Music size={16} />,
    multiple_choice: <HelpCircle size={16} />
  };
  const colorMap: Record<BlockType, string> = {
    text: 'bg-blue-100 text-blue-600',
    image: 'bg-violet-100 text-violet-600',
    video: 'bg-rose-100 text-rose-600',
    audio: 'bg-amber-100 text-amber-600',
    multiple_choice: 'bg-orange-100 text-orange-600'
  };

  const mc = block.content as MCContent;
  const img = block.content as ImageContent;
  const txt = block.content as TextContent;
  const vid = block.content as VideoContent;
  const aud = block.content as AudioContent;

  // Helper to parse YouTube/Vimeo embed URLs
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url; // assume direct embed-compatible URL
  };

  return (
    <div className="border-2 border-gray-100 rounded-2xl p-4 bg-white hover:border-blue-200 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold', colorMap[block.type])}>
          {iconMap[block.type]} {labelMap[block.type]}
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all p-1 rounded-lg hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>

      {block.type === 'text' && (
        <textarea
          rows={4} placeholder="<p>Escribe el contenido HTML aquí...</p>"
          value={txt.html}
          onChange={e => onChange({ ...block, content: { html: e.target.value } })}
          className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm font-mono resize-none transition-all"
        />
      )}

      {block.type === 'image' && (
        <div className="space-y-2">
          <input type="url" placeholder="URL de la imagen" value={img.url} onChange={e => onChange({ ...block, content: { ...img, url: e.target.value } })} className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm transition-all" />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Texto alt" value={img.alt} onChange={e => onChange({ ...block, content: { ...img, alt: e.target.value } })} className="px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm transition-all" />
            <input type="text" placeholder="Pie de foto" value={img.caption} onChange={e => onChange({ ...block, content: { ...img, caption: e.target.value } })} className="px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white outline-none text-sm transition-all" />
          </div>
          {img.url && <img src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-xl border border-gray-100 mt-2" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
        </div>
      )}

      {block.type === 'video' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center shrink-0">
              <Play size={14} className="text-rose-600" />
            </div>
            <input
              type="url"
              placeholder="URL del video (YouTube, Vimeo o enlace directo)"
              value={vid.url}
              onChange={e => onChange({ ...block, content: { ...vid, url: e.target.value } })}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-rose-400 focus:bg-white outline-none text-sm transition-all"
            />
          </div>
          <input
            type="text"
            placeholder="Título o descripción del video (opcional)"
            value={vid.caption}
            onChange={e => onChange({ ...block, content: { ...vid, caption: e.target.value } })}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-rose-400 focus:bg-white outline-none text-sm transition-all"
          />
          {vid.url && (
            <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 bg-black aspect-video">
              <iframe
                src={getEmbedUrl(vid.url)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={vid.caption || 'Video'}
              />
            </div>
          )}
        </div>
      )}

      {block.type === 'audio' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <Volume2 size={14} className="text-amber-600" />
            </div>
            <input
              type="url"
              placeholder="URL del audio (MP3, WAV, OGG o enlace directo)"
              value={aud.url}
              onChange={e => onChange({ ...block, content: { ...aud, url: e.target.value } })}
              className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-amber-400 focus:bg-white outline-none text-sm transition-all"
            />
          </div>
          <input
            type="text"
            placeholder="Título del audio (ej. Canción del Creador)"
            value={aud.title}
            onChange={e => onChange({ ...block, content: { ...aud, title: e.target.value } })}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-amber-400 focus:bg-white outline-none text-sm transition-all"
          />
          {aud.url && (
            <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-2">{aud.title || 'Reproductor de audio'}</p>
              <audio controls className="w-full" src={aud.url}>
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          )}
        </div>
      )}

      {block.type === 'multiple_choice' && (
        <div className="space-y-3">
          <textarea
            rows={2}
            placeholder="Escribe la pregunta aquí..."
            value={mc.question}
            onChange={e => onChange({ ...block, content: { ...mc, question: e.target.value } })}
            className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-medium resize-none transition-all"
          />

          {!mc.correct_option_id && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-bold">
              <span>⚠️</span> Seleccioná cuál es la respuesta correcta tocando el botón verde de cada opción.
            </div>
          )}

          <div className="space-y-2">
            {mc.options.map((opt, i) => {
              const isCorrect = mc.correct_option_id === opt.id;
              return (
                <div
                  key={opt.id}
                  className={cn(
                    'rounded-2xl border-2 p-3 transition-all',
                    isCorrect
                      ? 'border-green-400 bg-green-50 shadow-sm shadow-green-100'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  )}
                >
                  {/* Option header: letter + correct toggle */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0',
                      isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    )}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({ ...block, content: { ...mc, correct_option_id: isCorrect ? '' : opt.id } })}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                        isCorrect
                          ? 'bg-green-500 text-white border-green-500 shadow-sm'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-green-400 hover:text-green-600 hover:bg-green-50'
                      )}
                    >
                      <CheckCircle2 size={13} />
                      {isCorrect ? '✓ Respuesta correcta' : 'Marcar como correcta'}
                    </button>
                    {mc.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onChange({
                          ...block,
                          content: {
                            ...mc,
                            options: mc.options.filter(o => o.id !== opt.id),
                            correct_option_id: mc.correct_option_id === opt.id ? '' : mc.correct_option_id
                          }
                        })}
                        className="ml-auto text-red-300 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Option text + feedback */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Texto de la opción</label>
                      <input
                        type="text"
                        placeholder={`Opción ${String.fromCharCode(65 + i)}...`}
                        value={opt.text}
                        onChange={e => onChange({
                          ...block,
                          content: { ...mc, options: mc.options.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o) }
                        })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Mensaje de feedback</label>
                      <input
                        type="text"
                        placeholder={isCorrect ? '¡Muy bien! 🎉' : 'Intenta de nuevo...'}
                        value={opt.feedback}
                        onChange={e => onChange({
                          ...block,
                          content: { ...mc, options: mc.options.map(o => o.id === opt.id ? { ...o, feedback: e.target.value } : o) }
                        })}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                const id = uid();
                onChange({ ...block, content: { ...mc, options: [...mc.options, { id, text: '', feedback: '' }] } });
              }}
              className="w-full py-2.5 border-2 border-dashed border-orange-200 text-orange-500 rounded-2xl text-xs font-bold hover:bg-orange-50 hover:border-orange-400 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Agregar opción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const LessonEditor: React.FC<{ lesson: Lesson; onChange: (l: Lesson) => void; onDelete: () => void }> = ({ lesson, onChange, onDelete }) => {
  const [open, setOpen] = useState(false);

  const updateBlock = (idx: number, b: Block) => {
    const blocks = [...lesson.blocks];
    blocks[idx] = b;
    onChange({ ...lesson, blocks });
  };

  const deleteBlock = (idx: number) => {
    onChange({ ...lesson, blocks: lesson.blocks.filter((_, i) => i !== idx) });
  };

  const addBlock = (type: BlockType) => {
    const b = newBlock(type, lesson.blocks.length);
    onChange({ ...lesson, blocks: [...lesson.blocks, b] });
  };

  return (
    <div className="border border-blue-100 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-50/40 transition-colors" onClick={() => setOpen(p => !p)}>
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black shrink-0">{lesson.day_number}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-blue-950 text-sm truncate">{lesson.title || 'Lección sin título'}</p>
          <p className="text-xs text-gray-400">{lesson.blocks.length} bloques · {lesson.xp_reward} XP</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-red-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all">
            <Trash2 size={15} />
          </button>
          {open ? <ChevronDown size={18} className="text-blue-400" /> : <ChevronRight size={18} className="text-gray-300" />}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-blue-50">
            <div className="p-5 space-y-5 bg-gray-50/30">
              {/* Lesson meta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                  <input type="text" value={lesson.title} onChange={e => onChange({ ...lesson, title: e.target.value })} className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm font-medium transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Subtítulo</label>
                  <input type="text" value={lesson.subtitle} onChange={e => onChange({ ...lesson, subtitle: e.target.value })} className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Fecha programada</label>
                  <input type="date" value={lesson.scheduled_date} onChange={e => onChange({ ...lesson, scheduled_date: e.target.value })} className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">XP Recompensa</label>
                  <input type="number" value={lesson.xp_reward} onChange={e => onChange({ ...lesson, xp_reward: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Frases motivacionales (una por línea)</label>
                <textarea rows={3} value={lesson.motivational_phrases.join('\n')} onChange={e => onChange({ ...lesson, motivational_phrases: e.target.value.split('\n') })} className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm resize-none transition-all" />
              </div>

              {/* Blocks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Bloques de Contenido</p>
                </div>
                <div className="space-y-3">
                  {lesson.blocks.map((block, idx) => (
                    <BlockEditor key={block.id} block={block} onChange={b => updateBlock(idx, b)} onDelete={() => deleteBlock(idx)} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {([
                    { type: 'text', label: '+ Texto', color: 'border-blue-200 text-blue-600 hover:bg-blue-50' },
                    { type: 'image', label: '+ Imagen', color: 'border-violet-200 text-violet-600 hover:bg-violet-50' },
                    { type: 'video', label: '+ Video', color: 'border-rose-200 text-rose-600 hover:bg-rose-50' },
                    { type: 'audio', label: '+ Audio', color: 'border-amber-200 text-amber-600 hover:bg-amber-50' },
                    { type: 'multiple_choice', label: '+ Pregunta', color: 'border-orange-200 text-orange-600 hover:bg-orange-50' },
                  ] as { type: BlockType; label: string; color: string }[]).map(({ type, label, color }) => (
                    <button key={type} onClick={() => addBlock(type)} className={cn('px-4 py-2 border border-dashed rounded-xl text-xs font-bold transition-colors', color)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WeekEditor: React.FC<{ week: Week; onChange: (w: Week) => void; onDelete: () => void }> = ({ week, onChange, onDelete }) => {
  const [open, setOpen] = useState(true);

  const updateLesson = (idx: number, l: Lesson) => {
    const lessons = [...week.lessons];
    lessons[idx] = l;
    onChange({ ...week, lessons });
  };

  const deleteLesson = (idx: number) => onChange({ ...week, lessons: week.lessons.filter((_, i) => i !== idx) });
  const addLesson = () => onChange({ ...week, lessons: [...week.lessons, newLesson(week.lessons.length + 1)] });

  return (
    <div className="border-2 border-blue-100 rounded-3xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-5 bg-blue-50/50 cursor-pointer" onClick={() => setOpen(p => !p)}>
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0">{week.week_number}</div>
        <input type="text" value={week.title} onChange={e => { e.stopPropagation(); onChange({ ...week, title: e.target.value }); }} onClick={e => e.stopPropagation()} placeholder="Título de la semana" className="flex-1 bg-transparent font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg px-2 py-1" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-gray-400">{week.lessons.length} lecciones</span>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-red-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all">
            <Trash2 size={16} />
          </button>
          {open ? <ChevronDown size={18} className="text-blue-400" /> : <ChevronRight size={18} className="text-gray-300" />}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-5 space-y-3">
              <div className="mb-3">
                <label className="block text-xs font-bold text-gray-500 mb-1">Checkpoint (opcional)</label>
                <input type="text" placeholder="Ej. Repaso de la semana" value={week.checkpoint || ''} onChange={e => onChange({ ...week, checkpoint: e.target.value || null })} className="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm transition-all" />
              </div>
              {week.lessons.map((lesson, idx) => (
                <LessonEditor key={lesson.id} lesson={lesson} onChange={l => updateLesson(idx, l)} onDelete={() => deleteLesson(idx)} />
              ))}
              <button onClick={addLesson} className="w-full py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-500 font-bold text-sm hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Agregar Lección
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface CourseManagerProps {
  initialCourse?: Course;
  onSave: (course: Course) => void;
  onBack: () => void;
}

export const CourseEditor: React.FC<CourseManagerProps> = ({ initialCourse, onSave, onBack }) => {
  const [course, setCourse] = useState<Course>(initialCourse ?? newCourse());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'structure'>('info');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!course.title.trim()) e.title = 'El título es obligatorio';
    if (!course.description.trim()) e.description = 'La descripción es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(course);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateWeek = (idx: number, w: Week) => {
    const weeks = [...course.weeks];
    weeks[idx] = w;
    setCourse({ ...course, weeks });
  };

  const addWeek = () => setCourse({ ...course, weeks: [...course.weeks, newWeek(course.weeks.length + 1)] });
  const deleteWeek = (idx: number) => setCourse({ ...course, weeks: course.weeks.filter((_, i) => i !== idx) });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-blue-950">{initialCourse ? 'Editar Curso' : 'Nuevo Curso'}</h1>
          <p className="text-sm text-blue-800/60">Diseña el contenido educativo siguiendo la estructura de semanas y lecciones.</p>
        </div>
        <button onClick={handleSave} className={cn('flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg', saved ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20')}>
          {saved ? <><CheckCircle2 size={18} /> Guardado</> : <><Save size={18} /> Guardar Curso</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-blue-50 p-1 rounded-2xl mb-6 w-fit">
        {(['info', 'structure'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn('px-5 py-2.5 rounded-xl font-bold text-sm transition-all', activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-600')}>
            {tab === 'info' ? '📋 Información' : '📚 Contenido'}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white rounded-[2rem] border border-blue-100 shadow-sm p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-blue-900 mb-2">Título del curso *</label>
              <input type="text" value={course.title} onChange={e => { setCourse({ ...course, title: e.target.value }); setErrors({ ...errors, title: '' }); }} placeholder="Ej. Ven, Sígueme — Semana 1" className={cn('w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 font-medium text-blue-950 outline-none transition-all', errors.title ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-blue-400 focus:bg-white')} />
              {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-blue-900 mb-2">Descripción *</label>
              <textarea rows={3} value={course.description} onChange={e => { setCourse({ ...course, description: e.target.value }); setErrors({ ...errors, description: '' }); }} placeholder="Describe el objetivo del curso..." className={cn('w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 font-medium text-blue-950 outline-none transition-all resize-none', errors.description ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-blue-400 focus:bg-white')} />
              {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Categoría</label>
              <select value={course.category} onChange={e => setCourse({ ...course, category: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-400 outline-none font-medium text-blue-950 appearance-none transition-all">
                <option value="religion">Religión</option>
                <option value="lenguaje">Lenguaje</option>
                <option value="matematicas">Matemáticas</option>
                <option value="cognitivo">Cognitivo</option>
                <option value="social">Social</option>
                <option value="psicomotricidad">Psicomotricidad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Visibilidad</label>
              <select value={course.visibility} onChange={e => setCourse({ ...course, visibility: e.target.value as 'public' | 'private' })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-400 outline-none font-medium text-blue-950 appearance-none transition-all">
                <option value="public">Público</option>
                <option value="private">Privado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Edad mínima</label>
              <input type="number" value={course.target_age_min} onChange={e => setCourse({ ...course, target_age_min: parseInt(e.target.value) || 0 })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-400 outline-none font-medium text-blue-950 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-blue-900 mb-2">Edad máxima</label>
              <input type="number" value={course.target_age_max} onChange={e => setCourse({ ...course, target_age_max: parseInt(e.target.value) || 0 })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-400 outline-none font-medium text-blue-950 transition-all" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-blue-900 mb-2">URL de portada (opcional)</label>
              <input type="url" value={course.cover_image_url} onChange={e => setCourse({ ...course, cover_image_url: e.target.value })} placeholder="https://..." className="w-full px-5 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-400 outline-none font-medium text-blue-950 transition-all" />
              {course.cover_image_url && <img src={course.cover_image_url} alt="Portada" className="mt-3 h-32 w-full object-cover rounded-2xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'structure' && (
        <div className="space-y-4">
          {course.weeks.map((week, idx) => (
            <WeekEditor key={week.id} week={week} onChange={w => updateWeek(idx, w)} onDelete={() => deleteWeek(idx)} />
          ))}
          <button onClick={addWeek} className="w-full py-4 border-2 border-dashed border-blue-200 rounded-3xl text-blue-500 font-bold hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> Agregar Semana
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Course List (management screen) ─────────────────────────────────────────

interface CourseListProps {
  courses: Course[];
  onNew: () => void;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onImport: (course: Course) => void;
  onExport: (course: Course) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, onNew, onEdit, onDelete, onImport, onExport }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        // Sanity check
        if (!data.title || !data.weeks) throw new Error('Formato inválido: falta "title" o "weeks".');
        // Ensure id
        if (!data.id) data.id = uid();
        onImport(data as Course);
        setImportError('');
      } catch (err: unknown) {
        setImportError((err as Error).message || 'JSON inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const categoryLabel: Record<string, string> = {
    religion: 'Religión', lenguaje: 'Lenguaje', matematicas: 'Matemáticas',
    cognitivo: 'Cognitivo', social: 'Social', psicomotricidad: 'Psicomotricidad'
  };

  const categoryColor: Record<string, string> = {
    religion: 'bg-purple-100 text-purple-700', lenguaje: 'bg-blue-100 text-blue-700',
    matematicas: 'bg-orange-100 text-orange-700', cognitivo: 'bg-teal-100 text-teal-700',
    social: 'bg-emerald-100 text-emerald-700', psicomotricidad: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-950 mb-1">Biblioteca de Cursos</h1>
          <p className="text-blue-800/60 font-medium">Crea, edita e importa cursos en formato JSON.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-50 hover:border-blue-300 transition-all">
            <Upload size={18} /> Importar JSON
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileImport} />
          <button onClick={onNew} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={18} /> Nuevo Curso
          </button>
        </div>
      </div>

      {importError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <p className="font-bold text-sm">Error al importar</p>
            <p className="text-sm">{importError}</p>
          </div>
          <button onClick={() => setImportError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={18} /></button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-blue-100 p-20 text-center">
          <BookOpen size={48} className="mx-auto text-blue-200 mb-4" />
          <h3 className="text-xl font-bold text-blue-950 mb-2">No hay cursos</h3>
          <p className="text-gray-400 mb-6">Crea tu primer curso o importa uno desde un archivo JSON.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => fileRef.current?.click()} className="px-5 py-3 bg-white border-2 border-blue-200 text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all">
              <Upload size={16} className="inline mr-2" />Importar JSON
            </button>
            <button onClick={onNew} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              + Crear Curso
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map(course => {
            const totalLessons = course.weeks.reduce((s, w) => s + w.lessons.length, 0);
            return (
              <div key={course.id} className="bg-white border border-blue-100 rounded-3xl overflow-hidden hover:shadow-lg transition-all group flex flex-col">
                {course.cover_image_url ? (
                  <img src={course.cover_image_url} alt={course.title} className="h-36 w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="h-36 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-5xl">📚</div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold', categoryColor[course.category] || 'bg-gray-100 text-gray-600')}>
                      {categoryLabel[course.category] || course.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{course.target_age_min}–{course.target_age_max} años</span>
                  </div>

                  <h3 className="font-extrabold text-blue-950 mb-1 leading-tight line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 flex-1 mb-4">{course.description}</p>

                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4">
                    <span><span className="text-blue-950">{course.weeks.length}</span> semanas</span>
                    <span><span className="text-blue-950">{totalLessons}</span> lecciones</span>
                    <span className={cn('ml-auto px-2 py-0.5 rounded-full text-xs', course.visibility === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {course.visibility === 'public' ? '🌐 Público' : '🔒 Privado'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-blue-50">
                    <button onClick={() => onEdit(course)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors">
                      <Edit3 size={15} /> Editar
                    </button>
                    <button onClick={() => onExport(course)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-50 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                      <Download size={15} />
                    </button>
                    <button onClick={() => onDelete(course.id)} className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 hover:text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
