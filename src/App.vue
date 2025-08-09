<template>
  <div class="app">
    <div class="main-container">
      <div class="floating-controls">
        <button @click="addNewPage" class="btn btn-primary" title="New Page">
          <font-awesome-icon icon="plus" />
        </button>
        <button @click="addNewTask" class="btn btn-secondary" :disabled="!currentPage" title="Add Task">
          <font-awesome-icon icon="check" />
        </button>
        <button @click="showArchive = true" class="btn btn-archive" title="View Archive">
          📁
        </button>
      </div>
      <BottomNavigation
        :pages="pages"
        :current-page="currentPage"
        @select-page="selectPage"
        @delete-page="deletePage"
        @add-page="addNewPage"
      />

      <TaskCanvas
        v-if="currentPage"
        :tasks="getTasksForCurrentPage()"
        :canvas-notes="getCanvasNotesForCurrentPage()"
        :current-page="currentPage"
        :selected-task="selectedTask"
        @start-drag="startDrag"
        @select-task="selectTask"
        @deselect-task="deselectTask"
        @update-task-content="updateTaskContent"
        @set-task-priority="setTaskPriority"
        @delete-task="deleteTask"
        @resize-task="resizeTask"
        @rotate-task="rotateTask"
        @add-canvas-note="addCanvasNote"
        @update-canvas-note="updateCanvasNote"
        @delete-canvas-note="deleteCanvasNote"
      />

      <div v-else class="empty-state">
        <h2>Welcome to Todo Planner</h2>
        <p>Create a new page to start organizing your tasks!</p>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNavigation
      :pages="pages"
      :current-page="currentPage"
      :tasks="tasks"
      @select-page="selectPage"
      @delete-page="deletePage"
      @add-page="addNewPage"
    />
    
    <!-- Archive Modal -->
    <Archive
      v-if="showArchive"
      :archived-notes="archivedNotes"
      :pages="pages"
      @close="showArchive = false"
      @restore-note="restoreCanvasNote"
      @permanently-delete="permanentlyDeleteNote"
      @clear-archive="clearArchive"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import BottomNavigation from './components/BottomNavigation.vue'
import TaskCanvas from './components/TaskCanvas.vue'
import Archive from './components/Archive.vue'
import { getPriorityColor } from './utils/taskUtils'
import storage from './utils/storage'

const pages = ref([])
const currentPage = ref(null)
const tasks = ref([])
const canvasNotes = ref([])
const archivedNotes = ref([])
const selectedTask = ref(null)
const showArchive = ref(false)

// Load data from localStorage
onMounted(() => {
  pages.value = storage.loadPages()
  tasks.value = storage.loadTasks()
  canvasNotes.value = storage.loadCanvasNotes()
  archivedNotes.value = storage.loadArchivedNotes()
  
  // Ensure backward compatibility for existing tasks without width/height
  tasks.value.forEach(task => {
    if (task.width === undefined) task.width = 200
    if (task.height === undefined) task.height = 100
  })
  
  if (pages.value.length > 0 && !currentPage.value) {
    currentPage.value = pages.value[0]
  }
})

const addNewPage = () => {
  const newPage = {
    id: uuidv4(),
    title: `Page ${pages.value.length + 1}`,
    createdAt: new Date().toISOString()
  }
  pages.value.push(newPage)
  currentPage.value = newPage
  storage.savePages(pages.value)
}

const deletePage = (pageId) => {
  if (confirm('Are you sure you want to delete this page and all its tasks?')) {
    pages.value = pages.value.filter(p => p.id !== pageId)
    tasks.value = tasks.value.filter(t => t.pageId !== pageId)
    
    if (currentPage.value?.id === pageId) {
      currentPage.value = pages.value.length > 0 ? pages.value[0] : null
    }
    
    storage.savePages(pages.value)
    storage.saveTasks(tasks.value)
  }
}

const selectPage = (page) => {
  currentPage.value = page
}

const addNewTask = () => {
  if (!currentPage.value) return
  
  const newTask = {
    id: uuidv4(),
    pageId: currentPage.value.id,
    content: '',
    x: Math.random() * 300 + 50,
    y: Math.random() * 200 + 50,
    width: 200,
    height: 100,
    priority: 'medium',
    color: getPriorityColor('medium'),
    rotation: Math.random() * 10 - 5,
    createdAt: new Date().toISOString()
  }
  
  tasks.value.push(newTask)
  storage.saveTasks(tasks.value)
}

const getTasksForCurrentPage = () => {
  if (!currentPage.value) return []
  return tasks.value.filter(task => task.pageId === currentPage.value.id)
}

const getCanvasNotesForCurrentPage = () => {
  if (!currentPage.value) return []
  return canvasNotes.value.filter(note => note.pageId === currentPage.value.id)
}

const selectTask = (task) => {
  selectedTask.value = task
}

const deselectTask = () => {
  selectedTask.value = null
}

const updateTaskContent = (taskId, content) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.content = content
    storage.saveTasks(tasks.value)
  }
}

const setTaskPriority = (taskId, priority) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.priority = priority
    task.color = getPriorityColor(priority)
    storage.saveTasks(tasks.value)
  }
}

const deleteTask = (taskId) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
  if (selectedTask.value?.id === taskId) {
    selectedTask.value = null
  }
  storage.saveTasks(tasks.value)
}

const startDrag = (event, task) => {
  selectedTask.value = task
  
  const dragOffset = { x: 0, y: 0 }
  const rect = event.target.getBoundingClientRect()
  dragOffset.x = event.clientX - task.x
  dragOffset.y = event.clientY - task.y
  
  const handleMouseMove = (e) => {
    task.x = e.clientX - dragOffset.x
    task.y = e.clientY - dragOffset.y
  }
  
  const handleMouseUp = () => {
    storage.saveTasks(tasks.value)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const resizeTask = ({ taskId, width, height }) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.width = width
    task.height = height
    storage.saveTasks(tasks.value)
  }
}

const rotateTask = ({ taskId, rotation }) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.rotation = rotation
    storage.saveTasks(tasks.value)
  }
}

// Canvas notes functions
const addCanvasNote = (note) => {
  canvasNotes.value.push(note)
  storage.saveCanvasNotes(canvasNotes.value)
}

const updateCanvasNote = (noteId, text) => {
  const note = canvasNotes.value.find(n => n.id === noteId)
  if (note) {
    note.text = text
    storage.saveCanvasNotes(canvasNotes.value)
  }
}

const deleteCanvasNote = (noteId) => {
  const noteToArchive = canvasNotes.value.find(n => n.id === noteId)
  if (noteToArchive) {
    // Check if note has meaningful content (not empty or just whitespace)
    const hasContent = noteToArchive.text && noteToArchive.text.trim().length > 0
    
    if (hasContent) {
      // Add timestamp when archived
      const archivedNote = {
        ...noteToArchive,
        archivedAt: new Date().toISOString()
      }
      archivedNotes.value.push(archivedNote)
      storage.saveArchivedNotes(archivedNotes.value)
    }
    
    // Remove from active notes regardless of content
    canvasNotes.value = canvasNotes.value.filter(n => n.id !== noteId)
    storage.saveCanvasNotes(canvasNotes.value)
  }
}

const restoreCanvasNote = (noteId) => {
  const noteToRestore = archivedNotes.value.find(n => n.id === noteId)
  if (noteToRestore) {
    // Remove archived timestamp when restoring
    const { archivedAt, ...restoredNote } = noteToRestore
    canvasNotes.value.push(restoredNote)
    archivedNotes.value = archivedNotes.value.filter(n => n.id !== noteId)
    
    storage.saveCanvasNotes(canvasNotes.value)
    storage.saveArchivedNotes(archivedNotes.value)
  }
}

const permanentlyDeleteNote = (noteId) => {
  if (confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) {
    archivedNotes.value = archivedNotes.value.filter(n => n.id !== noteId)
    storage.saveArchivedNotes(archivedNotes.value)
  }
}

const clearArchive = () => {
  if (confirm('Are you sure you want to permanently delete all archived notes? This action cannot be undone.')) {
    archivedNotes.value = []
    storage.saveArchivedNotes(archivedNotes.value)
  }
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.floating-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 0.5rem;
  z-index: 1000;
}

.btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
  transform: scale(1.1);
}

.btn-archive {
  background: #ffc107;
  color: #212529;
  font-size: 1.2rem;
}

.btn-archive:hover {
  background: #e0a800;
  transform: scale(1.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding-bottom: 120px; /* Space for bottom navigation */
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  text-align: center;
}

.empty-state h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding-bottom: 100px; /* Adjusted for mobile bottom nav */
  }
  
  .floating-controls {
    position: fixed;
    bottom: 120px; /* Above bottom navigation */
    right: 20px;
    top: auto;
    flex-direction: column;
  }
  
  .btn {
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding-bottom: 80px; /* Adjusted for smaller mobile bottom nav */
  }
  
  .floating-controls {
    bottom: 100px; /* Above bottom navigation */
    right: 15px;
  }
  
  .btn {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }
}
</style>
