import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faPlus, 
  faCheck, 
  faTimes, 
  faGripLines, 
  faRotate,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faThLarge
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(faPlus, faCheck, faTimes, faGripLines, faRotate, faTrash, faChevronLeft, faChevronRight, faThLarge)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
