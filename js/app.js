// TaskFlow - Modern Task Management Application
// Optimized with minimal, user-friendly animations

document.addEventListener('DOMContentLoaded', () => {
  // --- User Profile Management ---
  const user = JSON.parse(localStorage.getItem('taskflow_user') || 'null');
  if (!user || !user.name || !user.dob) {
    window.location.href = 'index.html';
    return;
  }

  // --- Application State ---
  const TASKS_KEY = 'taskflow_tasks';
  const FIRST_LOAD_KEY = 'taskflow_first_load';
  let tasks = [];
  let searchQuery = '';
  let activeTab = 'todo';
  let isAnimating = false;
  let isInitialLoad = true;

  // Load tasks from localStorage
  try {
    const stored = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    if (Array.isArray(stored)) tasks = stored;
  } catch (error) {
    console.error('Error loading tasks:', error);
    tasks = [];
  }

  // --- DOM Elements ---
  const appRoot = document.getElementById('app-root');
  const loadingSpinner = document.getElementById('loading-spinner');

  // --- Initialize Application ---
  showLoading();
  setTimeout(() => {
    hideLoading();
    renderApp();
    initializeKeyboardShortcuts();
    loadInitialData();
    isInitialLoad = false; // After first render, disable initial animations
  }, 800);

  // --- Initial Data Loading ---
  function loadInitialData() {
    if (!localStorage.getItem(FIRST_LOAD_KEY)) {
      showLoading();
      showNotification('Loading sample tasks... 📥', 'info');
      
      fetch('https://dummyjson.com/todos?limit=10')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (!data.todos || !Array.isArray(data.todos)) {
            throw new Error('Invalid data format from API');
          }
          
          const dummyTasks = data.todos.slice(0, 10).map((todo, index) => ({
            id: generateId(),
            title: todo.todo,
            stage: 'todo',
            priority: ['High', 'Medium', 'Low'][index % 3],
            lastModified: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
            description: `Sample task: ${todo.todo}`
          }));
          
          // Add some variety with different priorities
          const priorityDistribution = {
            High: dummyTasks.filter((_, i) => i % 3 === 0).length,
            Medium: dummyTasks.filter((_, i) => i % 3 === 1).length,
            Low: dummyTasks.filter((_, i) => i % 3 === 2).length
          };
          
          tasks = [...dummyTasks, ...tasks];
          saveTasks();
          localStorage.setItem(FIRST_LOAD_KEY, 'true');
          hideLoading();
          renderApp();
          
          // Show success notification with task count
          showNotification(`Loaded ${dummyTasks.length} sample tasks! 🎉`, 'success');
          
          console.log('Dummy data loaded successfully:', {
            totalTasks: dummyTasks.length,
            priorityDistribution,
            source: 'DummyJSON API'
          });
        })
        .catch(error => {
          console.error('Failed to load initial data:', error);
          hideLoading();
          
          // Fallback: Create some basic sample tasks if API fails
          const fallbackTasks = [
            { title: 'Complete project documentation', priority: 'High' },
            { title: 'Review code changes', priority: 'Medium' },
            { title: 'Schedule team meeting', priority: 'Medium' },
            { title: 'Update dependencies', priority: 'Low' },
            { title: 'Backup important files', priority: 'High' }
          ].map((task, index) => ({
            id: generateId(),
            title: task.title,
            stage: 'todo',
            priority: task.priority,
            lastModified: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
            description: `Sample task: ${task.title}`
          }));
          
          tasks = [...fallbackTasks, ...tasks];
          saveTasks();
          localStorage.setItem(FIRST_LOAD_KEY, 'true');
          renderApp();
          
          showNotification(`Created ${fallbackTasks.length} sample tasks (offline mode) 📝`, 'info');
        });
    }
  }

  // --- Main Render Function ---
  function renderApp() {
    const filteredTasks = getFilteredTasks();
    const stats = getTaskStats();

    appRoot.innerHTML = `
      ${renderHeader()}
      ${renderStats(stats)}
      ${renderSearchAndFilters()}
      ${renderTabNavigation()}
      ${renderTaskContent(filteredTasks)}
      ${renderFloatingActionButton()}
    `;

    attachEventListeners();
  }

  // --- Header Component ---
  function renderHeader() {
    return `
      <div class="glass-effect rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg ${isInitialLoad ? 'animate-slide-down' : ''}">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="relative">
              <img src="https://ui-avatars.com/api/?background=667eea&color=fff&name=${encodeURIComponent(user.name)}&size=80" 
                   alt="Avatar" 
                   class="w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg ring-2 sm:ring-4 ring-white">
              <div class="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div class="text-center sm:text-left">
              <h1 class="text-lg sm:text-2xl font-bold text-gray-800">Welcome, ${user.name}!</h1>
              <p class="text-sm sm:text-base text-gray-600">Let's get things done today</p>
              <div class="flex gap-2 mt-1">
                <button id="signout-btn" class="text-xs sm:text-sm text-red-500 hover:text-red-700 transition-colors duration-200">
                  Sign Out
                </button>
                <button id="reload-demo-btn" class="text-xs sm:text-sm text-blue-500 hover:text-blue-700 transition-colors duration-200">
                  Reload Demo Data
                </button>
              </div>
            </div>
          </div>
          <div class="flex gap-2 sm:gap-3">
            <button id="export-btn" class="glass-effect px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600">
              <span class="mr-1 sm:mr-2">📤</span>Export
            </button>
            <label class="glass-effect px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-200 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer">
              <span class="mr-1 sm:mr-2">📥</span>Import
              <input type="file" id="import-input" accept="application/json" class="hidden" />
            </label>
          </div>
        </div>
      </div>
    `;
  }

  // --- Stats Component ---
  function renderStats(stats) {
    return `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div class="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 text-center card-hover">
          <div class="text-xl sm:text-3xl font-bold text-blue-600">${stats.total}</div>
          <div class="text-xs sm:text-sm text-gray-600">Total Tasks</div>
        </div>
        <div class="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 text-center card-hover">
          <div class="text-xl sm:text-3xl font-bold text-orange-500">${stats.todo}</div>
          <div class="text-xs sm:text-sm text-gray-600">In Progress</div>
        </div>
        <div class="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 text-center card-hover">
          <div class="text-xl sm:text-3xl font-bold text-green-600">${stats.completed}</div>
          <div class="text-xs sm:text-sm text-gray-600">Completed</div>
        </div>
        <div class="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 text-center card-hover">
          <div class="text-xl sm:text-3xl font-bold text-gray-500">${stats.archived}</div>
          <div class="text-xs sm:text-sm text-gray-600">Archived</div>
        </div>
      </div>
    `;
  }

  // --- Search and Filters Component ---
  function renderSearchAndFilters() {
    return `
      <div class="glass-effect rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div class="flex flex-col gap-3 sm:gap-4">
          <div class="relative">
            <input id="search-input" 
                   type="text" 
                   placeholder="🔍 Search your tasks..." 
                   class="w-full pl-3 sm:pl-4 pr-10 sm:pr-12 py-2 sm:py-3 rounded-lg sm:rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                   value="${searchQuery}">
            <button id="clear-search" class="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 ${searchQuery ? '' : 'hidden'}">
              ✕
            </button>
          </div>
          <div class="flex gap-2">
            <select id="priority-filter" class="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base">
              <option value="">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  // --- Tab Navigation Component ---
  function renderTabNavigation() {
    const tabs = [
      { id: 'todo', label: 'To Do', icon: '📝', color: 'blue' },
      { id: 'completed', label: 'Completed', icon: '✅', color: 'green' },
      { id: 'archived', label: 'Archived', icon: '📦', color: 'gray' }
    ];

    return `
      <div class="glass-effect rounded-lg sm:rounded-xl p-2 mb-4 sm:mb-6">
        <div class="flex space-x-1">
          ${tabs.map(tab => `
            <button class="tab-btn flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg` 
                : 'text-gray-600 hover:bg-gray-100'
            }" data-tab="${tab.id}">
              <span class="text-sm sm:text-lg">${tab.icon}</span>
              <span class="hidden sm:inline">${tab.label}</span>
              <span class="bg-white bg-opacity-20 text-xs px-1 sm:px-2 py-0.5 rounded-full">
                ${getTasksByStage(tab.id).length}
              </span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- Task Content Component ---
  function renderTaskContent(filteredTasks) {
    const stageTasks = filteredTasks.filter(task => task.stage === activeTab);
    
    return `
      <div class="glass-effect rounded-lg sm:rounded-xl p-4 sm:p-6 min-h-80 sm:min-h-96">
        ${renderAddTaskForm()}
        <div class="space-y-3">
          ${stageTasks.length === 0 ? renderEmptyState() : ''}
          ${stageTasks.map((task, index) => renderTaskCard(task, index)).join('')}
        </div>
      </div>
    `;
  }

  // --- Add Task Form Component ---
  function renderAddTaskForm() {
    const placeholders = {
      todo: '✨ What needs to be done?',
      completed: '✨ Add a completed task',
      archived: '✨ Add a task to archive'
    };
    
    const buttonTexts = {
      todo: 'Add',
      completed: 'Add Completed',
      archived: 'Add to Archive'
    };
    
    const placeholder = placeholders[activeTab] || placeholders.todo;
    const buttonText = buttonTexts[activeTab] || buttonTexts.todo;
    
    return `
      <form id="add-task-form" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
        <div class="flex flex-col gap-3">
          <input id="new-task-input" 
                 type="text" 
                 placeholder="${placeholder}" 
                 class="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                 required>
          <div class="flex gap-2">
            <select id="priority-select" class="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base">
              <option value="Low">🟢 Low</option>
              <option value="Medium" selected>🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base">
              ${buttonText}
            </button>
          </div>
        </div>
      </form>
    `;
  }

  // --- Task Card Component ---
  function renderTaskCard(task, index) {
    const priorityClass = `priority-${task.priority.toLowerCase()}`;
    const priorityColor = task.priority === 'High' ? 'text-red-600' : 
                         task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600';
    
    return `
      <div class="task-item ${priorityClass} bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 mb-1 text-sm sm:text-base">${escapeHtml(task.title)}</h3>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <span class="${priorityColor} font-medium">
                ${task.priority === 'High' ? '🔴' : task.priority === 'Medium' ? '🟡' : '🟢'} 
                ${task.priority}
              </span>
              <span class="hidden sm:inline">•</span>
              <span>📅 ${formatTimestamp(task.lastModified)}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            ${renderTaskActions(task)}
          </div>
        </div>
      </div>
    `;
  }

  // --- Task Actions Component ---
  function renderTaskActions(task) {
    const actions = [];
    
    if (task.stage === 'todo') {
      actions.push(`
        <button class="action-btn bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="complete" data-id="${task.id}" title="Mark as Completed">
          ✓ Complete
        </button>
      `);
      actions.push(`
        <button class="action-btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="archive" data-id="${task.id}" title="Archive">
          📦 Archive
        </button>
      `);
    } else if (task.stage === 'completed') {
      actions.push(`
        <button class="action-btn bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="move-todo" data-id="${task.id}" title="Move to Todo">
          ↩ Undo
        </button>
      `);
      actions.push(`
        <button class="action-btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="archive" data-id="${task.id}" title="Archive">
          📦 Archive
        </button>
      `);
    } else if (task.stage === 'archived') {
      // Use the same as 'Complete' button from Todo stage (to move to Completed)
      actions.push(`
        <button class="action-btn bg-green-100 hover:bg-green-200 text-green-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="move-completed" data-id="${task.id}" title="Mark as Completed">
          ✓ Complete
        </button>
      `);
      // Use the same as 'Undo' button from Completed stage (to move to Todo)
      actions.push(`
        <button class="action-btn bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200" 
                data-action="move-todo" data-id="${task.id}" title="Move to Todo">
          ↩ Undo
        </button>
      `);
    }
    
    return actions.join('');
  }

  // --- Empty State Component ---
  function renderEmptyState() {
    const messages = {
      todo: { icon: '🎯', title: 'No tasks yet', subtitle: 'Add your first task to get started!' },
      completed: { icon: '🎉', title: 'No completed tasks', subtitle: 'Complete some tasks to see them here!' },
      archived: { icon: '📦', title: 'No archived tasks', subtitle: 'Archived tasks will appear here!' }
    };
    
    const message = messages[activeTab];
    
    return `
      <div class="text-center py-8 sm:py-12">
        <div class="text-4xl sm:text-6xl mb-3 sm:mb-4">${message.icon}</div>
        <h3 class="text-lg sm:text-xl font-semibold text-gray-600 mb-2">${message.title}</h3>
        <p class="text-sm sm:text-base text-gray-500">${message.subtitle}</p>
      </div>
    `;
  }

  // --- Floating Action Button ---
  function renderFloatingActionButton() {
    return `
      <button id="scroll-top-btn" class="floating-action bg-blue-600 hover:bg-blue-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>
    `;
  }

  // --- Event Listeners ---
  function attachEventListeners() {
    // Sign out
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
      signoutBtn.onclick = handleSignOut;
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.oninput = handleSearch;
    }

    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.onclick = clearSearch;
    }

    // Priority filter
    const priorityFilter = document.getElementById('priority-filter');
    if (priorityFilter) {
      priorityFilter.onchange = handlePriorityFilter;
    }

    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = () => handleTabChange(btn.getAttribute('data-tab'));
    });

    // Add task form
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
      addTaskForm.onsubmit = handleAddTask;
    }

    // Task actions
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.onclick = () => handleTaskAction(btn.getAttribute('data-action'), btn.getAttribute('data-id'));
    });

    // Export/Import
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.onclick = exportTasks;
    }

    const importInput = document.getElementById('import-input');
    if (importInput) {
      importInput.onchange = importTasks;
    }

    // Scroll to top
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
      scrollTopBtn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // Reload demo data
    const reloadDemoBtn = document.getElementById('reload-demo-btn');
    if (reloadDemoBtn) {
      reloadDemoBtn.onclick = reloadDemoData;
    }
  }

  // --- Event Handlers ---
  function handleSignOut() {
    showLoading();
    setTimeout(() => {
      localStorage.clear();
      window.location.href = 'index.html';
    }, 500);
  }

  function handleSearch(e) {
    searchQuery = e.target.value;
    renderApp();
  }

  function clearSearch() {
    searchQuery = '';
    document.getElementById('search-input').value = '';
    renderApp();
  }

  function handlePriorityFilter(e) {
    // Implementation for priority filtering can be added here
    renderApp();
  }

  function handleTabChange(tab) {
    if (isAnimating) return;
    
    activeTab = tab;
    isAnimating = true;
    
    // Simple tab change without excessive animation
    setTimeout(() => {
      renderApp();
      isAnimating = false;
    }, 100);
  }

  function handleAddTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById('new-task-input');
    const prioritySelect = document.getElementById('priority-select');
    
    const title = titleInput.value.trim();
    const priority = prioritySelect.value;
    
    if (!title) {
      titleInput.classList.add('ring-2', 'ring-red-500');
      setTimeout(() => titleInput.classList.remove('ring-2', 'ring-red-500'), 2000);
      return;
    }
    
    addTask(title, priority, activeTab);
    titleInput.value = '';
    titleInput.focus();
  }

  function handleTaskAction(action, taskId) {
    switch (action) {
      case 'complete':
        moveTask(taskId, 'completed');
        break;
      case 'archive':
        moveTask(taskId, 'archived');
        break;
      case 'move-todo':
        moveTask(taskId, 'todo');
        break;
      case 'move-completed':
        moveTask(taskId, 'completed');
        break;
    }
  }

  // --- Core Functions ---
  function addTask(title, priority = 'Medium', stage = 'todo') {
    const newTask = {
      id: generateId(),
      title,
      stage,
      priority,
      lastModified: new Date().toISOString(),
      description: `Task: ${title}`
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderApp();
    
    // Show context-aware success notification
    const stageNames = { todo: 'To Do', completed: 'Completed', archived: 'Archived' };
    showNotification(`Task added to ${stageNames[stage]}! ✨`, 'success');
  }

  function moveTask(id, newStage) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].stage = newStage;
      tasks[taskIndex].lastModified = new Date().toISOString();
      saveTasks();
      renderApp();
      
      const stageNames = { todo: 'To Do', completed: 'Completed', archived: 'Archived' };
      showNotification(`Task moved to ${stageNames[newStage]}! ✨`, 'success');
    }
  }

  // --- Utility Functions ---
  function getFilteredTasks() {
    let filtered = [...tasks];
    
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
  }

  function getTasksByStage(stage) {
    return tasks.filter(task => task.stage === stage);
  }

  function getTaskStats() {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.stage === 'todo').length,
      completed: tasks.filter(t => t.stage === 'completed').length,
      archived: tasks.filter(t => t.stage === 'archived').length
    };
  }

  function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }

  function formatTimestamp(iso) {
    const date = new Date(iso);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  }

  function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Loading Functions ---
  function showLoading() {
    loadingSpinner.classList.remove('hidden');
  }

  function hideLoading() {
    loadingSpinner.classList.add('hidden');
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // --- Export/Import Functions ---
  function exportTasks() {
    const dataStr = JSON.stringify({
      tasks,
      exportDate: new Date().toISOString(),
      user: user.name
    }, null, 2);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Tasks exported successfully! 📤', 'success');
  }

  function importTasks(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    showLoading();
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target.result);
        let importedTasks = [];
        
        // Handle different import formats
        if (Array.isArray(imported)) {
          importedTasks = imported;
        } else if (imported.tasks && Array.isArray(imported.tasks)) {
          importedTasks = imported.tasks;
        } else {
          throw new Error('Invalid format');
        }
        
        // Validate and clean imported tasks
        const validTasks = importedTasks.filter(task => 
          task && typeof task.title === 'string' && task.title.trim()
        ).map(task => ({
          id: task.id || generateId(),
          title: task.title.trim(),
          stage: ['todo', 'completed', 'archived'].includes(task.stage) ? task.stage : 'todo',
          priority: ['High', 'Medium', 'Low'].includes(task.priority) ? task.priority : 'Medium',
          lastModified: task.lastModified || new Date().toISOString(),
          description: task.description || `Imported task: ${task.title}`
        }));
        
        if (validTasks.length === 0) {
          throw new Error('No valid tasks found');
        }
        
        // Ask user about merge strategy
        const shouldReplace = confirm(
          `Found ${validTasks.length} valid tasks to import.\n\n` +
          'Click OK to REPLACE all current tasks, or Cancel to MERGE with existing tasks.'
        );
        
        if (shouldReplace) {
          tasks = validTasks;
        } else {
          // Merge tasks, avoiding duplicates by title
          const existingTitles = new Set(tasks.map(t => t.title.toLowerCase()));
          const newTasks = validTasks.filter(t => !existingTitles.has(t.title.toLowerCase()));
          tasks = [...newTasks, ...tasks];
        }
        
        saveTasks();
        hideLoading();
        renderApp();
        showNotification(`Successfully imported ${validTasks.length} tasks! 📥`, 'success');
        
      } catch (error) {
        hideLoading();
        console.error('Import error:', error);
        showNotification('Failed to import tasks. Please check the file format.', 'error');
      }
    };
    
    reader.onerror = () => {
      hideLoading();
      showNotification('Failed to read the file.', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  }

  // --- Keyboard Shortcuts ---
  function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Prevent shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      
      // Tab navigation shortcuts
      if (e.key === '1' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleTabChange('todo');
      } else if (e.key === '2' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleTabChange('completed');
      } else if (e.key === '3' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleTabChange('archived');
      }
      
      // Focus search
      if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
      
      // Quick add task (works on all tabs now)
      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const taskInput = document.getElementById('new-task-input');
        if (taskInput) {
          taskInput.focus();
        }
      }
      
      // Escape to clear search
      if (e.key === 'Escape') {
        if (searchQuery) {
          clearSearch();
        }
      }
      
      // Reload demo data
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        reloadDemoData();
      }
    });
  }

  // --- Responsive and Touch Interactions ---
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Horizontal swipe detection
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      const tabs = ['todo', 'completed', 'archived'];
      const currentIndex = tabs.indexOf(activeTab);
      
      if (diffX > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        handleTabChange(tabs[currentIndex + 1]);
      } else if (diffX < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        handleTabChange(tabs[currentIndex - 1]);
      }
    }
    
    touchStartX = 0;
    touchStartY = 0;
  });

  // --- Auto-save and Periodic Updates ---
  setInterval(() => {
    saveTasks();
  }, 30000); // Auto-save every 30 seconds

  // --- Window Events ---
  window.addEventListener('beforeunload', () => {
    saveTasks();
  });

  // Show keyboard shortcuts help
  const showKeyboardHelp = () => {
    const helpText = `
Keyboard Shortcuts:
• Ctrl/Cmd + 1: Switch to Todo tab
• Ctrl/Cmd + 2: Switch to Completed tab  
• Ctrl/Cmd + 3: Switch to Archived tab
• Ctrl/Cmd + F: Focus search
• Ctrl/Cmd + N: Add new task (any tab)
• Escape: Clear search
• Swipe left/right: Navigate tabs (mobile)
    `;
    alert(helpText);
  };

  // Add help button functionality (can be triggered by a help icon)
  window.showKeyboardHelp = showKeyboardHelp;

  // --- Reload Demo Data Function ---
  function reloadDemoData() {
    if (confirm('This will clear all current tasks and load fresh demo data. Continue?')) {
      // Clear existing data
      tasks = [];
      localStorage.removeItem(FIRST_LOAD_KEY);
      saveTasks();
      
      // Show loading and reload
      showLoading();
      showNotification('Reloading demo data... 🔄', 'info');
      
      setTimeout(() => {
        loadInitialData();
      }, 500);
    }
  }

  console.log('TaskFlow initialized successfully! 🚀');
  console.log('Use Ctrl/Cmd + H to see keyboard shortcuts');
});