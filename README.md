# Todo Planner App

A clean and intuitive todo planning application built with Vue.js 3 and the Composition API. This app provides a notepad-like experience where users can create and organize tasks on virtual pages with complete freedom.

## Features

### 📝 Notepad-like Experience
- **Free-form task placement**: Drag and drop tasks anywhere on the page
- **Visual customization**: Each task card can have its own background color
- **Natural interaction**: Click anywhere to add tasks, drag to reposition

### 📋 Pages System
- **Multiple pages**: Create separate pages for different projects or categories
- **Page management**: Add, delete, and switch between pages easily
- **Persistent storage**: All data is saved to browser's localStorage

### 🎨 Clean Design
- **Minimal interface**: Simple, uncluttered design that focuses on your content
- **Grid background**: Subtle grid pattern mimics real notepad paper
- **Responsive layout**: Works well on different screen sizes

### 🎯 Task Management
- **Rich text editing**: Each task is a textarea for flexible content
- **Color coding**: Assign colors to tasks for visual organization
- **Easy deletion**: Remove tasks with a simple click
- **Selection system**: Click to select and highlight tasks

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd todo-planner-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Pages
1. Click the "New Page" button in the header
2. Pages are automatically created with sequential naming
3. Click on any page in the sidebar to switch to it

### Adding Tasks
1. Select a page from the sidebar
2. Click "Add Task" to create a new task card
3. Tasks appear at random positions on the page

### Managing Tasks
- **Move**: Click and drag any task card to reposition it
- **Edit**: Click inside a task to edit its content
- **Color**: Use the color picker to change a task's background
- **Delete**: Click the × button on a task to remove it

### Data Persistence
- All pages and tasks are automatically saved to browser storage
- Data persists even after closing the browser
- Clear browser data to reset the app

## Technical Details

### Built With
- **Vue.js 3** - Progressive JavaScript framework
- **Composition API** - Modern Vue.js reactivity system
- **Vite** - Fast build tool and development server
- **@vueuse/core** - Vue composition utilities
- **UUID** - For generating unique identifiers

### Project Structure
```
todo-planner-app/
├── src/
│   ├── App.vue          # Main application component
│   ├── style.css        # Global styles
│   └── main.js          # Application entry point
├── public/              # Static assets
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Customization
The app is designed to be easily customizable:
- Modify colors in the CSS variables
- Adjust grid size in the background pattern
- Change task card dimensions
- Add new task properties

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

Built with ❤️ using Vue.js 3 and the Composition API.
