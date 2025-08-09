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
        <button @click="showOverview = true" class="btn btn-overview" title="View All Pages">
          <font-awesome-icon icon="th-large" />
        </button>
      </div>


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
    
    <!-- Page Switcher -->
    <PageSwitcher
      :pages="pages"
      :current-page="currentPage"
      @select-page="selectPage"
    />
    
    <!-- Page Overview Modal -->
    <div v-if="showOverview" class="page-overview-backdrop" @click="showOverview = false">
      <div class="page-overview" @click.stop>
        <div class="overview-header">
          <h3>All Pages</h3>
          <button @click="showOverview = false" class="close-btn">
            <font-awesome-icon icon="times" />
          </button>
        </div>
        <div class="overview-content">
          <div class="page-grid">
            <div
              v-for="(page, index) in pages"
              :key="page.id"
              class="page-card"
              :class="{ active: currentPage?.id === page.id }"
              @click="selectPageAndClose(page)"
            >
              <div class="page-card-header">
                <span class="page-card-number">{{ index + 1 }}</span>
                <button @click.stop="deletePage(page.id)" class="delete-btn">
                  <font-awesome-icon icon="times" />
                </button>
              </div>
              <div class="page-card-title">{{ page.title || 'Untitled Page' }}</div>
              <div class="page-card-preview">
                <span class="task-count">{{ getTaskCount(page.id) }} tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
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
import PageSwitcher from './components/PageSwitcher.vue'
import TaskCanvas from './components/TaskCanvas.vue'
import Archive from './components/Archive.vue'
import BottomNavigation from './components/BottomNavigation.vue'
import { getPriorityColor } from './utils/taskUtils'
import storage from './utils/storage'

const pages = ref([])
const showOverview = ref(false)
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
  // Note: TaskCanvas component handles finishing note editing internally
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

// Page overview helper methods
const selectPageAndClose = (page) => {
  selectPage(page)
  showOverview.value = false
}

const getTaskCount = (pageId) => {
  return tasks.value.filter(task => task.pageId === pageId).length
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

.btn-overview {
  background: #17a2b8;
  color: white;
}

.btn-overview:hover {
  background: #138496;
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
  padding-bottom: 20px; /* Minimal space for page switcher */
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
    padding-bottom: 20px; /* Minimal space for page switcher */
  }
  
  .floating-controls {
    position: fixed;
    bottom: 80px; /* Above page switcher */
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
    padding-bottom: 15px; /* Minimal space for smaller page switcher */
  }
  
  .floating-controls {
    bottom: 70px; /* Above page switcher */
    right: 15px;
  }
  
  .btn {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }
}

/* Page Overview Modal Styles */
.page-overview-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.page-overview {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.overview-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #333;
}

.overview-content {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.page-card {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.page-card:hover {
  border-color: #007bff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.2);
}

.page-card.active {
  border-color: #007bff;
  background: #f0f8ff;
}

.page-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.page-card-number {
  background: #007bff;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background: #f8d7da;
  color: #721c24;
}

.page-card-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-card-preview {
  color: #6c757d;
  font-size: 0.9rem;
}

.task-count {
  font-style: italic;
}
</style>
