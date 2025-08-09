<template>
  <div class="workspace">
    <div class="page-canvas" @click="handleCanvasClick" @dblclick="handleCanvasDoubleClick"
    @touchend="handleCanvasTouchEnd">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :is-selected="selectedTask?.id === task.id"
        @start-drag="$emit('start-drag', $event, task)"
        @select="$emit('select-task', task)"
        @update-content="(taskId, content) => $emit('update-task-content', taskId, content)"
        @set-priority="(taskId, priority) => $emit('set-task-priority', taskId, priority)"
        @delete="$emit('delete-task', $event)"
        @resize="$emit('resize-task', $event)"
        @rotate="$emit('rotate-task', $event)"
      />
      
      <!-- Canvas Text Notes -->
      <div
        v-for="note in canvasNotes"
        :key="note.id"
        class="canvas-note"
        :style="{ left: note.x + 'px', top: note.y + 'px' }"
        @click.stop="selectNote(note.id)"
        @dblclick.stop="startEditingNote(note.id)"
      >
        <div v-if="editingNoteId !== note.id" class="note-display">
          {{ note.text }}
          <button
            v-if="selectedNoteId === note.id"
            class="delete-note"
            @click.stop="$emit('delete-canvas-note', note.id)"
          >
            ×
          </button>
        </div>
        <input
          v-else
          :ref="el => { if (el && editingNoteId === note.id && noteInput) noteInput.value = el }"
          v-model="editingText"
          class="note-input"
          @blur="finishEditing"
          @keydown.enter="finishEditing"
          @keydown.escape="cancelEditing"
          @click.stop
        />
      </div>
    </div>
    <div v-if="tasks.length === 0" class="empty-state">
      <h2>{{ currentPage?.title || 'Current Page' }}</h2>
      <p>Click "Add Task" to start organizing your tasks!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Object,
    default: null
  },
  selectedTask: {
    type: Object,
    default: null
  },
  canvasNotes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'start-drag',
  'select-task',
  'deselect-task',
  'update-task-content',
  'set-task-priority',
  'delete-task',
  'resize-task',
  'rotate-task',
  'add-canvas-note',
  'update-canvas-note',
  'delete-canvas-note'
])

// Canvas notes functionality
const selectedNoteId = ref(null)
const editingNoteId = ref(null)
const editingText = ref('')
const noteInput = ref(null)

// Watch for task selection to finish note editing
watch(() => props.selectedTask, (newTask) => {
  if (newTask && editingNoteId.value) {
    finishEditing()
  }
})

const handleCanvasClick = () => {
  // Finish editing any note when clicking on empty space
  if (editingNoteId.value) {
    finishEditing()
  }
  // Deselect task and note
  emit('deselect-task')
  selectedNoteId.value = null
}

const handleCanvasDoubleClick = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  const newNote = {
    id: Date.now(),
    x,
    y,
    text: '',
    pageId: props.currentPage?.id
  }
  
  emit('add-canvas-note', newNote)
  
  nextTick(() => {
    startEditingNote(newNote.id)
  })
}

const selectNote = (noteId) => {
  // Finish editing current note if any
  if (editingNoteId.value && editingNoteId.value !== noteId) {
    finishEditing()
  }
  selectedNoteId.value = noteId
}

const startEditingNote = (noteId) => {
  const note = props.canvasNotes.find(n => n.id === noteId)
  if (note) {
    editingNoteId.value = noteId
    editingText.value = note.text
    selectedNoteId.value = noteId
    
    nextTick(() => {
      if (noteInput.value) {
        noteInput.value.focus()
      }
    })
  }
}

const finishEditing = () => {
  if (editingNoteId.value) {
    emit('update-canvas-note', editingNoteId.value, editingText.value)
    editingNoteId.value = null
    editingText.value = ''
  }
}

const cancelEditing = () => {
  editingNoteId.value = null
  editingText.value = ''
}

// Touch handling for mobile devices
let lastTouchTime = 0
let lastTouchX = 0
let lastTouchY = 0

const handleCanvasTouchEnd = (event) => {
  const currentTime = new Date().getTime()
  const tapLength = currentTime - lastTouchTime
  const touch = event.changedTouches[0]
  const touchX = touch.clientX
  const touchY = touch.clientY
  
  // Check if it's a double tap (within 300ms and close proximity)
  if (tapLength < 300 && tapLength > 0) {
    const distance = Math.sqrt(
      Math.pow(touchX - lastTouchX, 2) + Math.pow(touchY - lastTouchY, 2)
    )
    
    if (distance < 50) { // Within 50px radius
      // Prevent default behavior and simulate double click
      event.preventDefault()
      
      const rect = event.currentTarget.getBoundingClientRect()
      const x = touchX - rect.left
      const y = touchY - rect.top
      
      const newNote = {
        id: Date.now(),
        x,
        y,
        text: '',
        pageId: props.currentPage?.id
      }
      
      emit('add-canvas-note', newNote)
      
      nextTick(() => {
        startEditingNote(newNote.id)
      })
      
      return
    }
  }
  
  lastTouchTime = currentTime
  lastTouchX = touchX
  lastTouchY = touchY
}
</script>

<style scoped>
.workspace {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.page-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(#e0e0e0 1px, transparent 1px),
    linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
  background-size: 20px 20px;
  cursor: default;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  text-align: center;
  height: 100%;
}

.empty-state h2 {
  margin-bottom: 0.5rem;
  color: #333;
}

.canvas-note {
  position: absolute;
  min-width: 100px;
  z-index: 10;
}

.note-display {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s;
}

.note-display:hover {
  background: rgba(255, 255, 255, 0.95);
}

.note-input {
  background: white;
  border: 2px solid #007bff;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  min-width: 100px;
  outline: none;
}

.delete-note {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.delete-note:hover {
  background: #c82333;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-canvas {
    background-size: 15px 15px;
    touch-action: none;
  }
  
  .canvas-note {
    min-width: 120px;
  }
  
  .note-display {
    padding: 12px;
    font-size: 16px;
    min-height: 40px;
  }
  
  .note-input {
    padding: 12px;
    font-size: 16px;
    min-width: 120px;
    min-height: 40px;
  }
  
  .delete-note {
    width: 28px;
    height: 28px;
    font-size: 16px;
    top: -10px;
    right: -10px;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state h2 {
    font-size: 1.5rem;
  }
  
  .empty-state p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-canvas {
    background-size: 12px 12px;
  }
  
  .canvas-note {
    min-width: 100px;
  }
  
  .note-display {
    padding: 10px;
    font-size: 14px;
    min-height: 36px;
  }
  
  .note-input {
    padding: 10px;
    font-size: 14px;
    min-width: 100px;
    min-height: 36px;
  }
  
  .delete-note {
    width: 24px;
    height: 24px;
    font-size: 14px;
    top: -8px;
    right: -8px;
  }
  
  .empty-state {
    padding: 1.5rem 0.5rem;
  }
  
  .empty-state h2 {
    font-size: 1.3rem;
  }
  
  .empty-state p {
    font-size: 0.9rem;
  }
}
</style>