import { PRIORITY_LEVELS, PRIORITY_LABELS } from './constants'

export const priorityLevels = PRIORITY_LEVELS
export const priorityLabels = PRIORITY_LABELS

export const getPriorityColor = (priority) => {
  const colors = {
    low: '#90EE90',    // Light green
    medium: '#FFE4B5', // Light orange
    high: '#FFB6C1',   // Light red
    urgent: '#FF6B6B'  // Bright red
  }
  return colors[priority] || '#ffffff'
}

export const getPriorityBorderColor = (priority) => {
  const borderColors = {
    low: '#228B22',     // Forest green
    medium: '#FF8C00',  // Dark orange
    high: '#DC143C',    // Crimson
    urgent: '#8B0000'   // Dark red
  }
  return borderColors[priority] || '#ddd'
}

export const createNewTask = (pageId, x = null, y = null) => {
  // This function is not used in the refactored version since uuid is imported in App.vue
  // Kept for potential future use
  return {
    id: crypto.randomUUID(),
    pageId,
    content: '',
    x: x ?? Math.random() * 300 + 50,
    y: y ?? Math.random() * 200 + 50,
    priority: 'medium',
    color: getPriorityColor('medium'),
    rotation: Math.random() * 10 - 5,
    createdAt: new Date().toISOString()
  }
}

export const updateTaskPriority = (task, priority) => {
  return {
    ...task,
    priority,
    color: getPriorityColor(priority)
  }
}