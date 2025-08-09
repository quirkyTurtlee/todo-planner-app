<template>
  <div class="page-switcher">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pages: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-page'
])

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
</script>

<style scoped>
.page-switcher {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 25px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 100;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  gap: 1rem;
  max-width: 400px;
  min-width: 300px;
}

.nav-arrow {
  width: 36px;
  height: 36px;
  border: 2px solid #6c757d;
  border-radius: 50%;
  background: white;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
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
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
  min-width: 1.5rem;
  text-align: center;
}

.page-separator {
  font-size: 1rem;
  color: #6c757d;
}

.total-pages {
  font-size: 1rem;
  color: #6c757d;
  min-width: 1.5rem;
  text-align: center;
}

.page-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: italic;
  max-width: 200px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .page-switcher {
    bottom: 15px;
    padding: 0.5rem 1rem;
    min-width: 250px;
    max-width: 300px;
  }
  
  .nav-arrow {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
  
  .page-number {
    font-size: 1.1rem;
  }
  
  .page-title {
    font-size: 0.8rem;
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .page-switcher {
    bottom: 10px;
    padding: 0.4rem 0.8rem;
    min-width: 220px;
    max-width: 280px;
  }
  
  .nav-arrow {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
  
  .page-number {
    font-size: 1rem;
  }
  
  .page-title {
    font-size: 0.75rem;
    max-width: 120px;
  }
}
</style>