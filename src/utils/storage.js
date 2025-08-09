const STORAGE_KEYS = {
  PAGES: 'todo-pages',
  TASKS: 'todo-tasks',
  CANVAS_NOTES: 'todo-canvas-notes',
  ARCHIVED_NOTES: 'todo-archived-notes'
}

export const storage = {
  savePages(pages) {
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages))
  },

  loadPages() {
    const saved = localStorage.getItem(STORAGE_KEYS.PAGES)
    return saved ? JSON.parse(saved) : []
  },

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
  },

  loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS)
    return saved ? JSON.parse(saved) : []
  },

  saveCanvasNotes(canvasNotes) {
    localStorage.setItem(STORAGE_KEYS.CANVAS_NOTES, JSON.stringify(canvasNotes))
  },

  loadCanvasNotes() {
    const saved = localStorage.getItem(STORAGE_KEYS.CANVAS_NOTES)
    return saved ? JSON.parse(saved) : []
  },

  saveArchivedNotes(archivedNotes) {
    localStorage.setItem(STORAGE_KEYS.ARCHIVED_NOTES, JSON.stringify(archivedNotes))
  },

  loadArchivedNotes() {
    const saved = localStorage.getItem(STORAGE_KEYS.ARCHIVED_NOTES)
    return saved ? JSON.parse(saved) : []
  },

  clearAll() {
    localStorage.removeItem(STORAGE_KEYS.PAGES)
    localStorage.removeItem(STORAGE_KEYS.TASKS)
    localStorage.removeItem(STORAGE_KEYS.CANVAS_NOTES)
    localStorage.removeItem(STORAGE_KEYS.ARCHIVED_NOTES)
  }
}

export default storage