const IS_PROD = import.meta.env.PROD;
const BASE_URL = 'http://localhost:3001';

// Initial data for localStorage fallback
const lsDB = {
  data: null as any,
  async init() {
    if (this.data) return this.data;
    const stored = localStorage.getItem('fante_db');
    if (stored) {
      this.data = JSON.parse(stored);
    } else {
      try {
        const response = await fetch('./db.json');
        this.data = await response.json();
        this.save();
      } catch (e) {
        console.error("Could not load initial db.json", e);
        this.data = {};
      }
    }
    return this.data;
  },
  save() {
    localStorage.setItem('fante_db', JSON.stringify(this.data));
  }
};

const callAPI = async (endpoint: string, options: RequestInit = {}) => {
  if (!IS_PROD) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, options);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("JSON Server not reachable, falling back to localStorage");
    }
  }

  const db = await lsDB.init();
  const key = endpoint.split('/')[1] as string;
  
  if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
    const body = JSON.parse(options.body as string);
    if (!db[key]) db[key] = [];
    const index = db[key].findIndex((item: any) => item.id === body.id);
    if (index !== -1) {
      db[key][index] = { ...db[key][index], ...body };
    } else {
      db[key].push(body);
    }
    lsDB.save();
    return body;
  }
  
  return db[key] || [];
};

export const api = {
  getCourses: () => callAPI('/courses'),
  getCatalogCourses: () => callAPI('/catalogCourses'),
  getQuests: () => callAPI('/quests'),
  getAchievements: () => callAPI('/achievements'),
  getFriends: () => callAPI('/friends'),
  getLessonBlocks: () => callAPI('/lessonBlocks'),
  
  saveCourse: (course: any) => {
    const method = course.id ? 'PUT' : 'POST';
    const id = course.id || `course_${Date.now()}`;
    const courseToSave = { ...course, id };
    
    return callAPI(course.id ? `/courses/${id}` : '/courses', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseToSave)
    });
  }
};
