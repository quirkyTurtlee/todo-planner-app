<template>
  <aside class="sidebar">
    <h3>Pages</h3>
    <div class="page-list">
      <div
        v-for="page in pages"
        :key="page.id"
        class="page-item"
        :class="{ active: currentPage?.id === page.id }"
        @click="$emit('select-page', page)"
      >
        <span class="page-title">{{ page.title || 'Untitled Page' }}</span>
        <button @click.stop="$emit('delete-page', page.id)" class="delete-btn">
          <font-awesome-icon icon="times" />
        </button>
      </div>
    </div>
    <button @click="$emit('add-page')" class="btn btn-primary add-page-btn">
      New Page
    </button>
  </aside>
</template>

<script setup>
defineProps({
  pages: {
    type: Array,
    required: true
  },
  currentPage: {
    type: Object,
    default: null
  }
})

defineEmits([
  'select-page',
  'delete-page',
  'add-page'
])
</script>

<style scoped>
.sidebar {
  width: 180px;
  background: white;
  border-right: 1px solid #dee2e6;
  padding: 0.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.page-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.page-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-item:hover {
  background: #f8f9fa;
}

.page-item.active {
  background: #007bff;
  color: white;
}

.page-title {
  flex: 1;
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(0,0,0,0.1);
}

.add-page-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.4rem;
  border: none;
  border-radius: 3px;
  background: #007bff;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.add-page-btn:hover {
  background: #0056b3;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 150px;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .page-list {
    flex-direction: row;
    gap: 0.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
  }
  
  .page-item {
    min-width: 120px;
    white-space: nowrap;
  }
  
  .page-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .add-page-btn {
    min-width: 100px;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 0.25rem;
    max-height: 120px;
  }
  
  .sidebar h3 {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
  
  .page-item {
    padding: 0.3rem 0.4rem;
    min-width: 100px;
  }
  
  .delete-btn {
    width: 16px;
    height: 16px;
    font-size: 0.7rem;
  }
}
</style>