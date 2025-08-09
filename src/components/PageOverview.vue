<template>
  <div v-if="show" class="page-overview-backdrop" @click="$emit('close')">
    <div class="page-overview" @click.stop>
      <div class="overview-header">
        <h3>All Pages</h3>
        <button @click="$emit('close')" class="close-btn">
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
            @click="selectPage(page)"
          >
            <div class="page-card-header">
              <span class="page-card-number">{{ index + 1 }}</span>
              <button @click.stop="$emit('delete-page', page.id)" class="delete-btn">
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
</template>

<script setup>
import { countTasksByPageId } from '../utils/helpers'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pages: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Object,
    default: null
  },
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'select-page',
  'delete-page'
])

const selectPage = (page) => {
  emit('select-page', page)
  emit('close')
}

const getTaskCount = (pageId) => {
  return countTasksByPageId(props.tasks, pageId)
}
</script>

<style scoped>
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

.overview-content {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
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

/* Component-specific styles */
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