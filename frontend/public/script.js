// User management
let currentUser = null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    applyTheme(currentTheme);
    updateThemeButton();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showTaskPage();
    } else {
        showLoginPage();
    }
    
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        register();
    });
    
    // Task form
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNewTask();
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

// Theme functions
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    updateThemeButton();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function updateThemeButton() {
    const themeButton = document.getElementById('themeToggle');
    if (currentTheme === 'dark') {
        themeButton.textContent = '☀️ Light Mode';
    } else {
        themeButton.textContent = '🌙 Dark Mode';
    }
}

// Page navigation
function showLoginPage() {
    hideAllPages();
    document.getElementById('loginPage').classList.add('active');
}

function showRegisterPage() {
    hideAllPages();
    document.getElementById('registerPage').classList.add('active');
}

function showTaskPage() {
    hideAllPages();
    document.getElementById('taskPage').classList.add('active');
    displayTasks();
    updateProgress();
    showMessage('Welcome back!', 'success');
}

function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
}

// Auth functions
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showTaskPage();
    } else {
        showMessage('Invalid username or password!', 'error');
    }
}

function register() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        showMessage('Username already exists!', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        password: password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    showLoginPage();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
    
    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// Show/hide auth pages
function showLogin() {
    showLoginPage();
}

function showRegister() {
    showRegisterPage();
}

// Task functions
function addNewTask() {
    if (!currentUser) return;
    
    const titleInput = document.getElementById('taskTitle');
    const deadlineInput = document.getElementById('taskDeadline');
    const title = titleInput.value.trim();
    
    if (title) {
        const newTask = {
            id: Date.now(),
            title: title,
            deadline: deadlineInput.value,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium',
            userId: currentUser.id
        };
        
        tasks.push(newTask);
        saveTasks();
        displayTasks();
        updateProgress();
        
        // Reset form
        titleInput.value = '';
        deadlineInput.value = '';
        titleInput.focus();
        
        showMessage('Task added successfully!', 'success');
    }
}

function displayTasks() {
    if (!currentUser) return;
    
    const list = document.getElementById('taskList');
    const userTasks = getUserTasks();
    const filteredTasks = getFilteredTasks(userTasks);

    if (filteredTasks.length === 0) {
        list.innerHTML = '<li class="empty-state">No tasks found. ' + 
            (currentFilter !== 'all' ? 'Try changing the filter.' : 'Add your first task above!') + '</li>';
        return;
    }

    list.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        list.appendChild(taskElement);
    });
}

function getUserTasks() {
    return tasks.filter(task => task.userId === currentUser.id);
}

function getFilteredTasks(userTasks) {
    return userTasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    
    // Add classes based on task status and priority
    if (task.completed) {
        li.classList.add('completed');
    }
    li.classList.add(`priority-${task.priority}`);
    
    // Check if task is overdue
    if (!task.completed && task.deadline && new Date(task.deadline) < new Date()) {
        li.classList.add('overdue');
    }

    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    
    const title = document.createElement('strong');
    title.textContent = task.title;
    
    const metaContainer = document.createElement('div');
    metaContainer.className = 'task-meta';
    
    // Deadline info
    const deadlineInfo = document.createElement('small');
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        deadlineInfo.textContent = 'Deadline: ' + deadlineDate.toLocaleString();
    } else {
        deadlineInfo.textContent = 'No deadline set';
    }
    
    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `priority-badge priority-${task.priority}-badge`;
    priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1) + ' Priority';
    
    // Status badge
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${task.completed ? 'completed' : 'pending'}`;
    statusBadge.textContent = task.completed ? 'Completed' : 'Pending';
    
    metaContainer.appendChild(deadlineInfo);
    metaContainer.appendChild(priorityBadge);
    metaContainer.appendChild(statusBadge);
    
    taskInfo.appendChild(title);
    taskInfo.appendChild(metaContainer);

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.onclick = () => toggleTaskComplete(task.id);
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editTask(task.id);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteTask(task.id);
    
    actions.appendChild(completeBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(taskInfo);
    li.appendChild(actions);
    
    return li;
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.userId === currentUser.id) {
        task.completed = !task.completed;
        saveTasks();
        displayTasks();
        updateProgress();
        showMessage(`Task marked as ${task.completed ? 'completed' : 'pending'}!`, 'success');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.userId !== currentUser.id) return;

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null) return;
    
    if (newTitle.trim() !== '') {
        task.title = newTitle.trim();
        
        const newDeadline = prompt('Edit deadline (YYYY-MM-DDTHH:MM):', task.deadline || '');
        if (newDeadline !== null) {
            task.deadline = newDeadline;
        }
        
        const newPriority = prompt('Edit priority (low/medium/high):', task.priority);
        if (newPriority && ['low', 'medium', 'high'].includes(newPriority.toLowerCase())) {
            task.priority = newPriority.toLowerCase();
        }
        
        saveTasks();
        displayTasks();
        showMessage('Task updated successfully!', 'success');
    }
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => !(t.id === taskId && t.userId === currentUser.id));
        saveTasks();
        displayTasks();
        updateProgress();
        showMessage('Task deleted successfully!', 'success');
    }
}

function filterTasks(type) {
    currentFilter = type;
    
    // Update active button
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const buttonId = type + 'Btn';
    document.getElementById(buttonId).classList.add('active');
    
    displayTasks();
}

function updateProgress() {
    if (!currentUser) return;
    
    const userTasks = getUserTasks();
    const totalTasks = userTasks.length;
    const completedTasks = userTasks.filter(task => task.completed).length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = progress + '%';
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function showMessage(message, type = 'success') {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.temp-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'temp-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? 'var(--success-color)' : 'var(--danger-color)'};
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        font-weight: 500;
    `;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}