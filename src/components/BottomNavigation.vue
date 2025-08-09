<template>
  <nav class="bottom-navigation">
    <div class="nav-content">
      <!-- Left Arrow -->
      <button 
        class="nav-arrow left-arrow"
        :disabled="!canGoPrevious"
        @click="goToPreviousPage"
        title="Previous Page"
      >
        <font-awesome-icon icon="chevron-left" />
      </button>
      
      <!-- Current Page Info -->
      <div class="current-page-info">
        <div class="page-indicator">
          <span class="page-number">{{ currentPageIndex + 1 }}</span>
          <span class="page-separator">/</span>
          <span class="total-pages">{{ pages.length }}</span>
        </div>
        <div class="page-title">{{ currentPage?.title || 'Untitled Page' }}</div>
      </div>
      
      <!-- Right Arrow -->
      <button 
        class="nav-arrow right-arrow"
        :disabled="!canGoNext"
        @click="goToNextPage"
        title="Next Page"
      >
        <font-awesome-icon icon="chevron-right" />
      </button>
      
      <!-- Page Overview Button -->
      <button 
        class="overview-btn"
        @click="showOverview = !showOverview"
        title="View All Pages"
      >
        <font-awesome-icon icon="th-large" />
      </button>
      
      <!-- Add Page Button -->
      <button @click="$emit('add-page')" class="add-page-btn" title="Add New Page">
        <font-awesome-icon icon="plus" />
      </button>
    </div>
    
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
                <button @click.stop="$emit('delete-page', page.id)" class="delete-btn">
                  <font-awesome-icon icon="times" />
                </button>
              </div>
              <div class="page-card-title">{{ page.title || 'Untitled Page' }}</div>
              <div class="page-card-preview">
                <!-- Simple preview showing task count -->
                <span class="task-count">{{ getTaskCount(page.id) }} tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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
  'select-page',
  'delete-page',
  'add-page'
])

const showOverview = ref(false)

// Computed properties
const currentPageIndex = computed(() => {
  if (!props.currentPage) return -1
  return props.pages.findIndex(page => page.id === props.currentPage.id)
})

const canGoPrevious = computed(() => {
  return currentPageIndex.value > 0
})

const canGoNext = computed(() => {
  return currentPageIndex.value < props.pages.length - 1
})

// Methods
const goToPreviousPage = () => {
  if (canGoPrevious.value) {
    const previousPage = props.pages[currentPageIndex.value - 1]
    emit('select-page', previousPage)
  }
}

const goToNextPage = () => {
  if (canGoNext.value) {
    const nextPage = props.pages[currentPageIndex.value + 1]
    emit('select-page', nextPage)
  }
}

const selectPageAndClose = (page) => {
  emit('select-page', page)
  showOverview.value = false
}

const getTaskCount = (pageId) => {
  return props.tasks.filter(task => task.pageId === pageId).length
}
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 2px solid #dee2e6;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  z-index: 100;
  height: 80px;
  backdrop-filter: blur(10px);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  gap: 2rem;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-arrow {
  width: 48px;
  height: 48px;
  border: 2px solid #6c757d;
  border-radius: 50%;
  background: white;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-arrow:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #f8f9fa;
}

.current-page-info {
  flex: 1;
  text-align: center;
  max-width: 300px;
}

.page-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  font-family: 'Georgia', serif;
}

.page-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  min-width: 2rem;
  text-align: center;
}

.page-separator {
  font-size: 1.2rem;
  color: #6c757d;
}

.total-pages {
  font-size: 1.2rem;
  color: #6c757d;
  min-width: 2rem;
  text-align: center;
}

.page-title {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
}

.overview-btn,
.add-page-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #28a745;
  border-radius: 50%;
  background: white;
  color: #28a745;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.overview-btn {
  border-color: #ffc107;
  color: #ffc107;
}

.overview-btn:hover {
  background: #ffc107;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255,193,7,0.3);
}

.add-page-btn:hover {
  background: #28a745;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(40,167,69,0.3);
}

/* Page Overview Modal */
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
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  max-width: 800px;
  max-height: 80vh;
  width: 100%;
  overflow: hidden;
  animation: modalSlideUp 0.3s ease;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  font-family: 'Georgia', serif;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.overview-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: 60vh;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.page-card {
  border: 2px solid #dee2e6;
  border-radius: 12px;
  padding: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 120px;
}

.page-card:hover {
  border-color: #007bff;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,123,255,0.2);
}

.page-card.active {
  border-color: #007bff;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
}

.page-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.page-card-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  opacity: 0.7;
}

.delete-btn:hover {
  background: #dc3545;
  color: white;
  opacity: 1;
  transform: scale(1.1);
}

.page-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-card-preview {
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
}

.task-count {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .bottom-navigation {
    height: 70px;
  }
  
  .nav-content {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }
  
  .nav-arrow,
  .overview-btn,
  .add-page-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .page-number {
    font-size: 1.2rem;
  }
  
  .page-title {
    font-size: 0.9rem;
  }
  
  .page-overview {
    margin: 1rem;
    max-height: 90vh;
  }
  
  .overview-header {
    padding: 1rem;
  }
  
  .overview-content {
    padding: 1rem;
  }
  
  .page-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .bottom-navigation {
    height: 60px;
  }
  
  .nav-content {
    padding: 0.5rem;
    gap: 0.75rem;
  }
  
  .nav-arrow,
  .overview-btn,
  .add-page-btn {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
  
  .page-number {
    font-size: 1rem;
  }
  
  .total-pages,
  .page-separator {
    font-size: 1rem;
  }
  
  .page-title {
    font-size: 0.8rem;
  }
  
  .current-page-info {
    max-width: 200px;
  }
}
</style>