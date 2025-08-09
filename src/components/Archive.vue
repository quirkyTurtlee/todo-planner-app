<template>
  <div class="archive-overlay" @click="$emit('close')">
    <div class="archive-modal" @click.stop>
      <div class="archive-header">
        <h2>📁 Archived Items</h2>
        <div class="archive-actions">
          <button 
            v-if="archivedNotes.length > 0" 
            @click="$emit('clear-archive')" 
            class="btn btn-danger"
          >
            Clear All
          </button>
          <button @click="$emit('close')" class="btn btn-secondary">
            ✕ Close
          </button>
        </div>
      </div>
      
      <div class="archive-content">
        <div v-if="archivedNotes.length === 0" class="empty-archive">
          <p>📭 No archived items yet</p>
          <small>Deleted notes and tasks will appear here</small>
        </div>
        
        <div v-else class="archived-notes-list">
          <div 
            v-for="note in archivedNotes" 
            :key="note.id" 
            class="archived-note"
          >
            <div class="note-content">
              <div class="item-header">
                <span class="item-type">{{ note.type === 'task' ? '📝 Task' : '📄 Note' }}</span>
                <span v-if="note.priority && note.type === 'task'" class="priority-badge" :class="`priority-${note.priority}`">
                  {{ getPriorityLabel(note.priority) }}
                </span>
              </div>
              <div class="note-text">{{ getItemText(note) }}</div>
              <div class="note-meta">
                <span class="page-info">Page: {{ getPageTitle(note.pageId) }}</span>
                <span class="archived-date">Archived: {{ formatDate(note.archivedAt) }}</span>
              </div>
            </div>
            
            <div class="note-actions">
              <button 
                @click="$emit('restore-note', note.id)" 
                class="btn btn-restore"
                :title="`Restore ${note.type}`"
              >
                ↩️ Restore
              </button>
              <button 
                @click="$emit('permanently-delete', note.id)" 
                class="btn btn-delete"
                title="Permanently delete"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PRIORITY_LABELS } from '../utils/constants.js'

const props = defineProps({
  archivedNotes: {
    type: Array,
    required: true
  },
  pages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'close',
  'restore-note',
  'permanently-delete',
  'clear-archive'
])

const getPageTitle = (pageId) => {
  const page = props.pages.find(p => p.id === pageId)
  return page ? page.title : 'Unknown Page'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getItemText = (item) => {
  if (item.type === 'task') {
    return item.text || 'Empty task'
  }
  return item.text || 'Empty note'
}

const getPriorityLabel = (priority) => {
  return PRIORITY_LABELS[priority] || priority
}
</script>

<style scoped>
.archive-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.archive-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.archive-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.archive-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.archive-actions {
  display: flex;
  gap: 0.5rem;
}

.archive-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.empty-archive {
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;
}

.empty-archive p {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.archived-notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.archived-note {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.note-content {
  flex: 1;
}

.note-text {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  word-break: break-word;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.item-type {
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
}

.priority-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-low {
  background: #d4edda;
  color: #155724;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-high {
  background: #f8d7da;
  color: #721c24;
}

.note-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #6c757d;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-restore {
  background: #28a745;
  color: white;
}

.btn-restore:hover {
  background: #218838;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .archive-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .archive-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .archive-actions {
    justify-content: center;
  }
  
  .archived-note {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .note-actions {
    justify-content: center;
  }
  
  .btn {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .archive-header h2 {
    font-size: 1.3rem;
  }
  
  .note-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>