document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    loadSettings();
    loadTasks();
    loadMoodEntries();
    loadHabits();
    updateOverview();
    updateStatistics();
}

// TASK MANAGEMENT
const taskForm = document.getElementById('task-form');
const taskTable = document.getElementById('task-table');
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

taskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTask();
});

function addTask() {
    const taskName = document.getElementById('task-name').value;
    const category = document.getElementById('category').value;
    const priority = document.getElementById('priority').value;
    const deadline = document.getElementById('deadline').value;

    const task = { name: taskName, category, priority, deadline, completed: false };
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskForm.reset();
    loadTasks();
    updateOverview();
    updateStatistics();
}

function loadTasks() {
    taskTable.innerHTML = `
        <tr>
            <th>Done</th>
            <th>Task</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Deadline</th>
            <th>Delete</th>
        </tr>
    `;

    tasks.forEach((task, index) => {
        const row = taskTable.insertRow();
        const cellDone = row.insertCell(0);
        const cellName = row.insertCell(1);
        const cellCategory = row.insertCell(2);
        const cellPriority = row.insertCell(3);
        const cellDeadline = row.insertCell(4);
        const cellDelete = row.insertCell(5);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(index));
        cellDone.appendChild(checkbox);

        cellName.textContent = task.name;
        if (task.completed) {
            cellName.classList.add('completed');
        }

        cellCategory.textContent = task.category;
        cellPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        cellPriority.classList.add(`${task.priority}-priority`);
        cellDeadline.textContent = task.deadline;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => deleteTask(index));
        cellDelete.appendChild(deleteButton);
    });
}

function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    updateOverview();
    updateStatistics();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    updateOverview();
    updateStatistics();
}

// MOOD TRACKER
const moodForm = document.getElementById('mood-form');
const moodTable = document.getElementById('mood-table');
let moodEntries = JSON.parse(localStorage.getItem('moodEntries')) || [];

moodForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addMoodEntry();
});

function addMoodEntry() {
    const mood = document.getElementById('mood').value;
    const notes = document.getElementById('notes').value;
    const date = new Date().toLocaleDateString();

    const moodEntry = { date, mood, notes };

    moodEntries = moodEntries.filter(entry => entry.date !== date);
    moodEntries.push(moodEntry);
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    moodForm.reset();
    loadMoodEntries();
    updateOverview();
    updateStatistics();
}

function loadMoodEntries() {
    moodTable.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Mood</th>
            <th>Notes</th>
            <th>Delete</th>
        </tr>
    `;

    moodEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    moodEntries.forEach((entry, index) => {
        const row = moodTable.insertRow();
        const cellDate = row.insertCell(0);
        const cellMood = row.insertCell(1);
        const cellNotes = row.insertCell(2);
        const cellDelete = row.insertCell(3);

        cellDate.textContent = entry.date;
        cellMood.textContent = entry.mood;
        cellNotes.textContent = entry.notes;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', () => deleteMoodEntry(index));
        cellDelete.appendChild(deleteButton);
    });
}

function deleteMoodEntry(index) {
    moodEntries.splice(index, 1);
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
    loadMoodEntries();
    updateOverview();
    updateStatistics();
}

// HABIT TRACKER
const habitCheckboxes = document.querySelectorAll('.habit-checkbox');
let habits = JSON.parse(localStorage.getItem('habits')) || {};

habitCheckboxes.forEach(checkbox => {
    const habitName = checkbox.dataset.habit;
    checkbox.checked = habits[habitName] || false;
    checkbox.addEventListener('change', () => {
        habits[habitName] = checkbox.checked;
        localStorage.setItem('habits', JSON.stringify(habits));
    });
});

function loadHabits() {
    habitCheckboxes.forEach(checkbox => {
        const habitName = checkbox.dataset.habit;
        checkbox.checked = habits[habitName] || false;
    });
}

// OVERVIEW AND STATISTICS
function updateOverview() {
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(task => task.completed).length;

    document.getElementById('tasks-completed').textContent = tasksCompleted;
    document.getElementById('total-tasks').textContent = totalTasks;

    const tasksProgress = document.getElementById('tasks-progress');
    tasksProgress.max = totalTasks;
    tasksProgress.value = tasksCompleted;

    const today = new Date().toLocaleDateString();
    const todayMood = moodEntries.find(entry => entry.date === today);

    const currentMoodEl = document.getElementById('current-mood');
    if (todayMood) {
        currentMoodEl.textContent = todayMood.mood;
    } else {
        currentMoodEl.textContent = 'No mood logged today.';
    }
}

function updateStatistics() {
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(task => task.completed).length;

    document.getElementById('stats-tasks-completed').textContent = tasksCompleted;
    document.getElementById('stats-total-tasks').textContent = totalTasks;

    const statsTasksProgress = document.getElementById('stats-tasks-progress');
    statsTasksProgress.max = totalTasks;
    statsTasksProgress.value = tasksCompleted;

    let moodTrendsText = 'Mood Over the Past Week:\n\n';
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toLocaleDateString();

        const entry = moodEntries.find(entry => entry.date === dateString);
        const moodText = entry ? entry.mood : 'No Data';
        moodTrendsText += `${dateString}: ${moodText}\n`;
    }
    document.getElementById('mood-trends').textContent = moodTrendsText;
}

// SETTINGS
const settingsForm = document.getElementById('settings-form');
settingsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    applySettings();
});

function applySettings() {
    const theme = document.getElementById('theme').value;
    const fontSize = document.getElementById('font-size').value;

    if (theme === 'light') {
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.color = '#000000';
    } else {
        document.body.style.backgroundColor = '#121212';
        document.body.style.color = '#E0E0E0';
    }

    if (fontSize === 'small') {
        document.body.style.fontSize = '14px';
    } else if (fontSize === 'large') {
        document.body.style.fontSize = '18px';
    } else {
        document.body.style.fontSize = '16px';
    }

    const settings = { theme, fontSize };
    localStorage.setItem('settings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (settings) {
        document.getElementById('theme').value = settings.theme;
        document.getElementById('font-size').value = settings.fontSize;
        applySettings();
    } else {
        document.getElementById('theme').value = 'dark';
        document.getElementById('font-size').value = 'default';
        applySettings();
    }
}
