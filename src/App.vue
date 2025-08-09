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
        @start-drag-note="startDragNote"
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
    <PageOverview
      :show="showOverview"
      :pages="pages"
      :current-page="currentPage"
      :tasks="tasks"
      @close="showOverview = false"
      @select-page="selectPage"
      @delete-page="deletePage"
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
import PageSwitcher from './components/PageSwitcher.vue'
import TaskCanvas from './components/TaskCanvas.vue'
import Archive from './components/Archive.vue'
import PageOverview from './components/PageOverview.vue'
import { getPriorityColor } from './utils/taskUtils'
import { TASK_DEFAULTS } from './utils/constants'
import { getTasksByPageId, getNotesByPageId, generateRandomPosition, generateRandomRotation, findById, updateById, removeById } from './utils/helpers'
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
  
  const position = generateRandomPosition()
  const newTask = {
    id: uuidv4(),
    pageId: currentPage.value.id,
    content: '',
    x: position.x,
    y: position.y,
    width: TASK_DEFAULTS.width,
    height: TASK_DEFAULTS.height,
    priority: TASK_DEFAULTS.priority,
    color: getPriorityColor(TASK_DEFAULTS.priority),
    rotation: generateRandomRotation(),
    createdAt: new Date().toISOString()
  }
  
  tasks.value.push(newTask)
  storage.saveTasks(tasks.value)
}

const getTasksForCurrentPage = () => {
  return getTasksByPageId(tasks.value, currentPage.value?.id)
}

const getCanvasNotesForCurrentPage = () => {
  return getNotesByPageId(canvasNotes.value, currentPage.value?.id)
}

const selectTask = (task) => {
  selectedTask.value = task
  // Note: TaskCanvas component handles finishing note editing internally
}

const deselectTask = () => {
  selectedTask.value = null
}

const updateTaskContent = (taskId, content) => {
  const task = findById(tasks.value, taskId)
  if (task) {
    tasks.value = updateById(tasks.value, taskId, { content })
    storage.saveTasks(tasks.value)
  }
}

const setTaskPriority = (taskId, priority) => {
  const task = findById(tasks.value, taskId)
  if (task) {
    tasks.value = updateById(tasks.value, taskId, { 
      priority, 
      color: getPriorityColor(priority) 
    })
    storage.saveTasks(tasks.value)
  }
}

const deleteTask = (taskId) => {
  const taskToDelete = findById(tasks.value, taskId)
  if (taskToDelete) {
    // Check if task has meaningful content (not empty or just whitespace)
    const hasContent = taskToDelete.content && taskToDelete.content.trim().length > 0
    
    if (hasContent) {
      // Add timestamp when archived and convert task to note format
      const archivedNote = {
        id: taskToDelete.id,
        pageId: taskToDelete.pageId,
        text: taskToDelete.content,
        x: taskToDelete.x,
        y: taskToDelete.y,
        priority: taskToDelete.priority,
        color: taskToDelete.color,
        rotation: taskToDelete.rotation,
        createdAt: taskToDelete.createdAt,
        archivedAt: new Date().toISOString(),
        type: 'task' // Mark as archived task
      }
      archivedNotes.value.push(archivedNote)
      storage.saveArchivedNotes(archivedNotes.value)
    }
    
    // Remove from active tasks regardless of content
    tasks.value = removeById(tasks.value, taskId)
    if (selectedTask.value?.id === taskId) {
      selectedTask.value = null
    }
    storage.saveTasks(tasks.value)
  }
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

const startDragNote = (event, note) => {
  const dragOffset = { x: 0, y: 0 }
  dragOffset.x = event.clientX - note.x
  dragOffset.y = event.clientY - note.y
  
  const handleMouseMove = (e) => {
    note.x = e.clientX - dragOffset.x
    note.y = e.clientY - dragOffset.y
  }
  
  const handleMouseUp = () => {
    storage.saveCanvasNotes(canvasNotes.value)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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
        archivedAt: new Date().toISOString(),
        type: 'note' // Mark as archived note
      }
      archivedNotes.value.push(archivedNote)
      storage.saveArchivedNotes(archivedNotes.value)
    }
    
    // Remove from active notes regardless of content
    canvasNotes.value = canvasNotes.value.filter(n => n.id !== noteId)
    storage.saveCanvasNotes(canvasNotes.value)
  }
}

const restoreCanvasNote = (itemId) => {
  const itemToRestore = archivedNotes.value.find(n => n.id === itemId)
  if (itemToRestore) {
    // Remove archived timestamp and type when restoring
    const { archivedAt, type, ...restoredItem } = itemToRestore
    
    if (type === 'task') {
      // Restore as task - convert back from note format
      const restoredTask = {
        id: restoredItem.id,
        pageId: restoredItem.pageId,
        content: restoredItem.text,
        x: restoredItem.x,
        y: restoredItem.y,
        width: TASK_DEFAULTS.width,
        height: TASK_DEFAULTS.height,
        priority: restoredItem.priority,
        color: restoredItem.color,
        rotation: restoredItem.rotation,
        createdAt: restoredItem.createdAt
      }
      tasks.value.push(restoredTask)
      storage.saveTasks(tasks.value)
    } else {
      // Restore as note
      canvasNotes.value.push(restoredItem)
      storage.saveCanvasNotes(canvasNotes.value)
    }
    
    // Remove from archive
    archivedNotes.value = archivedNotes.value.filter(n => n.id !== itemId)
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


</style>
