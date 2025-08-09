// Common utility functions used across components

/**
 * Filter tasks by page ID
 * @param {Array} tasks - Array of tasks
 * @param {string} pageId - Page ID to filter by
 * @returns {Array} Filtered tasks
 */
export const getTasksByPageId = (tasks, pageId) => {
  if (!pageId) return []
  return tasks.filter(task => task.pageId === pageId)
}

/**
 * Filter canvas notes by page ID
 * @param {Array} notes - Array of canvas notes
 * @param {string} pageId - Page ID to filter by
 * @returns {Array} Filtered notes
 */
export const getNotesByPageId = (notes, pageId) => {
  if (!pageId) return []
  return notes.filter(note => note.pageId === pageId)
}

/**
 * Count tasks for a specific page
 * @param {Array} tasks - Array of tasks
 * @param {string} pageId - Page ID to count tasks for
 * @returns {number} Number of tasks
 */
export const countTasksByPageId = (tasks, pageId) => {
  return getTasksByPageId(tasks, pageId).length
}

/**
 * Generate random position within bounds
 * @param {number} maxX - Maximum X coordinate
 * @param {number} maxY - Maximum Y coordinate
 * @param {number} minX - Minimum X coordinate (default: 50)
 * @param {number} minY - Minimum Y coordinate (default: 50)
 * @returns {Object} Object with x and y coordinates
 */
export const generateRandomPosition = (maxX = 300, maxY = 200, minX = 50, minY = 50) => {
  return {
    x: Math.random() * maxX + minX,
    y: Math.random() * maxY + minY
  }
}

/**
 * Generate random rotation angle
 * @param {number} maxAngle - Maximum rotation angle (default: 10)
 * @returns {number} Random rotation angle between -maxAngle and +maxAngle
 */
export const generateRandomRotation = (maxAngle = 10) => {
  return Math.random() * (maxAngle * 2) - maxAngle
}

/**
 * Find item by ID in array
 * @param {Array} items - Array to search in
 * @param {string} id - ID to search for
 * @returns {Object|undefined} Found item or undefined
 */
export const findById = (items, id) => {
  return items.find(item => item.id === id)
}

/**
 * Remove item by ID from array
 * @param {Array} items - Array to remove from
 * @param {string} id - ID of item to remove
 * @returns {Array} New array without the item
 */
export const removeById = (items, id) => {
  return items.filter(item => item.id !== id)
}

/**
 * Update item in array by ID
 * @param {Array} items - Array to update
 * @param {string} id - ID of item to update
 * @param {Object} updates - Object with properties to update
 * @returns {Array} New array with updated item
 */
export const updateById = (items, id, updates) => {
  return items.map(item => 
    item.id === id ? { ...item, ...updates } : item
  )
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Check if click is outside element
 * @param {Event} event - Click event
 * @param {Element} element - Element to check against
 * @returns {boolean} True if click is outside element
 */
export const isClickOutside = (event, element) => {
  return element && !element.contains(event.target)
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}