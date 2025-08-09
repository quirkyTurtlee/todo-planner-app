// Shared constants across the application

// Priority levels and labels
export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent']

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium', 
  high: 'High',
  urgent: 'Urgent'
}

// Task default dimensions
export const TASK_DEFAULTS = {
  width: 200,
  height: 100,
  priority: 'medium'
}

// Canvas note defaults
export const CANVAS_NOTE_DEFAULTS = {
  text: 'New note',
  fontSize: 14
}

// UI constants
export const Z_INDEX = {
  modal: 1000,
  floating: 100,
  task: 10,
  note: 5
}

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024
}