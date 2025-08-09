<template>
  <div
    class="task-card"
    :class="[`priority-${task.priority}`, { selected: isSelected }]"
    :style="{ 
      left: task.x + 'px', 
      top: task.y + 'px',
      backgroundColor: task.color || '#ffffff',
      transform: `rotate(${task.rotation || 0}deg)`,
      borderLeft: `4px solid ${getPriorityBorderColor(task.priority)}`,
      width: (task.width || 200) + 'px',
      height: (task.height || 100) + 'px'
    }"
    @mousedown="$emit('start-drag', $event, task)"
    @touchstart="$emit('start-drag', $event, task)"
    @click.stop="$emit('select', task)"
  >
    <button @click.stop="$emit('delete', task.id)" class="delete-task top-right">
      <font-awesome-icon icon="times" />
    </button>
    
    <div class="task-content">
      <textarea
        :value="task.content"
        class="task-textarea"
        placeholder="Enter your task..."
        @input="$emit('update-content', task.id, $event.target.value)"
      ></textarea>
      <div class="task-controls">
        <div class="priority-buttons">
          <button
            v-for="priority in priorityLevels"
            :key="priority"
            :class="['priority-btn', priority, { active: task.priority === priority }]"
            @click.stop="$emit('set-priority', task.id, priority)"
            :title="priorityLabels[priority]"
          >
            {{ priority.charAt(0).toUpperCase() }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="resize-handle bottom-right" @mousedown.stop="startResize($event)" @touchstart.stop="startResize($event)">
      <font-awesome-icon icon="grip-lines" />
    </div>
    <div class="rotate-handle top-left" @mousedown.stop="startRotate($event)" @touchstart.stop="startRotate($event)">
      <font-awesome-icon icon="rotate" />
    </div>
  </div>
</template>

<script setup>
import { priorityLevels, priorityLabels, getPriorityBorderColor } from '../utils/taskUtils'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'start-drag',
  'select',
  'update-content',
  'set-priority',
  'delete',
  'resize',
  'rotate'
])

// Helper function to get coordinates from mouse or touch event
const getEventCoordinates = (event) => {
  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  }
  return { x: event.clientX, y: event.clientY }
}

const startResize = (event) => {
  event.stopPropagation()
  
  const rect = event.target.getBoundingClientRect()
  const coords = getEventCoordinates(event)
  const startX = coords.x
  const startY = coords.y
  const startWidth = props.task.width || 200
  const startHeight = props.task.height || 100
  
  // Calculate initial offset from bottom-right corner
  const offsetX = startX - (rect.left + rect.width - 12) // 12 is handle size
  const offsetY = startY - (rect.top + rect.height - 12)
  
  const handleMove = (e) => {
    const moveCoords = getEventCoordinates(e)
    const newWidth = startWidth + (moveCoords.x - startX - offsetX)
    const newHeight = startHeight + (moveCoords.y - startY - offsetY)
    
    emit('resize', {
      taskId: props.task.id,
      width: Math.max(150, newWidth),
      height: Math.max(80, newHeight)
    })
  }
  
  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

const startRotate = (event) => {
  event.stopPropagation()
  
  const rect = event.target.closest('.task-card').getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const startRotation = props.task.rotation || 0
  
  // Calculate initial angle
  const coords = getEventCoordinates(event)
  const startAngle = Math.atan2(coords.y - centerY, coords.x - centerX) * 180 / Math.PI
  
  const handleMove = (e) => {
    const moveCoords = getEventCoordinates(e)
    const currentAngle = Math.atan2(moveCoords.y - centerY, moveCoords.x - centerX) * 180 / Math.PI
    const deltaAngle = currentAngle - startAngle
    const newRotation = startRotation + deltaAngle
    
    emit('rotate', {
      taskId: props.task.id,
      rotation: newRotation
    })
  }
  
  const handleEnd = () => {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}
</script>

<style scoped>
.task-card {
  position: absolute;
  width: 200px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: move;
  transition: box-shadow 0.2s;
  padding: 0.5rem;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.task-card.selected {
  box-shadow: 0 0 0 2px #007bff;
}

.task-content {
  height: calc(100% - 1rem);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 1.5rem;
  padding-top: 0.25rem;
}

.task-textarea {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  padding: 0;
  padding-right: 0.25rem;
  padding-bottom: 0.25rem;
  width: 100%;
  height: calc(100% - 30px);
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.task-controls {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 0.25rem;
}

.priority-buttons {
  display: flex;
  gap: 2px;
}

.priority-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  opacity: 0.6;
}

.priority-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.priority-btn.active {
  opacity: 1;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
  transform: scale(1.1);
}

.priority-btn.low {
  background-color: #90EE90;
  color: #2d5a2d;
}

.priority-btn.medium {
  background-color: #FFE4B5;
  color: #8b4513;
}

.priority-btn.high {
  background-color: #FFB6C1;
  color: #8b0000;
}

.priority-btn.urgent {
  background-color: #FF6B6B;
  color: white;
}

.delete-task {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.delete-task:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.resize-handle {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  cursor: se-resize;
  color: #999;
  z-index: 5;
  transition: color 0.2s;
}

.resize-handle:hover {
  color: #333;
}

.rotate-handle {
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  cursor: grab;
  color: #999;
  z-index: 5;
  transition: color 0.2s;
}

.rotate-handle:hover {
  color: #333;
}

.rotate-handle:active {
  cursor: grabbing;
}

.task-card.priority-low {
  border-left-color: #228B22 !important;
}

.task-card.priority-medium {
  border-left-color: #FF8C00 !important;
}

.task-card.priority-high {
  border-left-color: #DC143C !important;
}

.task-card.priority-urgent {
  border-left-color: #8B0000 !important;
  box-shadow: 0 2px 8px rgba(139, 0, 0, 0.3);
}

.task-card.priority-urgent.selected {
  box-shadow: 0 0 0 2px #8B0000, 0 2px 8px rgba(139, 0, 0, 0.3);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .task-card {
    min-width: 180px;
    min-height: 120px;
    touch-action: none;
  }
  
  .delete-task {
    width: 28px;
    height: 28px;
    font-size: 1.2rem;
    top: 0.5rem;
    right: 0.5rem;
  }
  
  .resize-handle {
    width: 20px;
    height: 20px;
    font-size: 1.2rem;
    bottom: 0.5rem;
    right: 0.5rem;
  }
  
  .rotate-handle {
    width: 20px;
    height: 20px;
    font-size: 1.2rem;
    top: 0.5rem;
    left: 0.5rem;
  }
  
  .priority-btn {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
  
  .task-textarea {
    font-size: 1rem;
    padding: 0.25rem;
  }
}

@media (max-width: 480px) {
  .task-card {
    min-width: 160px;
    min-height: 100px;
  }
  
  .delete-task {
    width: 32px;
    height: 32px;
    font-size: 1.4rem;
  }
  
  .resize-handle {
    width: 24px;
    height: 24px;
    font-size: 1.4rem;
  }
  
  .rotate-handle {
    width: 24px;
    height: 24px;
    font-size: 1.4rem;
  }
  
  .priority-btn {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  .task-textarea {
    font-size: 1.1rem;
  }
}
</style>