import { supabase } from '../lib/supabase';

// ─── Patients ───────────────────────────────────────────────────────────────
export const patientsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    // Map snake_case from DB to camelCase for the UI
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      age: p.age,
      birthDate: p.birth_date,
      email: p.email,
      avatar: p.avatar,
      progress: p.progress ?? 0,
      lastActive: p.last_active ?? 'Nunca',
      course: p.course ?? 'Sin asignar',
    }));
  },

  upsert: async (patient: any) => {
    const { error } = await supabase.from('patients').upsert({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      birth_date: patient.birthDate,
      email: patient.email,
      avatar: patient.avatar,
      progress: patient.progress ?? 0,
      last_active: patient.lastActive ?? 'Recién añadido',
      course: patient.course ?? 'Sin asignar',
    });
    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Courses (full schema with weeks/lessons/blocks) ────────────────────────
export const coursesApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      cover_image_url: c.cover_image_url,
      category: c.category,
      author_id: c.author_id,
      visibility: c.visibility,
      target_age_min: c.target_age_min,
      target_age_max: c.target_age_max,
      schema_version: c.schema_version,
      weeks: c.weeks ?? [],
    }));
  },

  upsert: async (course: any) => {
    const { error } = await supabase.from('courses').upsert({
      id: course.id,
      title: course.title,
      description: course.description,
      cover_image_url: course.cover_image_url,
      category: course.category,
      author_id: course.author_id,
      visibility: course.visibility,
      target_age_min: course.target_age_min,
      target_age_max: course.target_age_max,
      schema_version: course.schema_version,
      weeks: course.weeks ?? [],
    });
    if (error) throw error;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Legacy API (kept for backward compatibility with App.tsx) ───────────────
export const api = {
  getCourses: async () => {
    const { data, error } = await supabase.from('user_courses').select('*');
    if (error) {
      console.warn('user_courses table not found, returning empty array');
      return [];
    }
    return data ?? [];
  },

  getCatalogCourses: async () => {
    const { data, error } = await supabase.from('catalog_courses').select('*');
    if (error) {
      console.warn('catalog_courses not found');
      return [];
    }
    return data ?? [];
  },

  getQuests: async () => {
    const { data, error } = await supabase.from('quests').select('*');
    if (error) return [];
    return data ?? [];
  },

  getAchievements: async () => {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error) return [];
    return data ?? [];
  },

  getFriends: async () => {
    const { data, error } = await supabase.from('friends').select('*');
    if (error) return [];
    return data ?? [];
  },

  getLessonBlocks: async () => {
    const { data, error } = await supabase.from('lesson_blocks').select('*');
    if (error) return [];
    return data ?? [];
  },

  saveCourse: async (course: any) => {
    const id = course.id || `course_${Date.now()}`;
    const courseToSave = { ...course, id };
    const { data, error } = await supabase
      .from('user_courses')
      .upsert(courseToSave)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
