const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const themeCheckbox = document.getElementById('themeCheckbox');

// Load Data
chrome.storage.sync.get(['tasks', 'theme'], (result) => {
  if (result.theme === 'dark') {
    document.body.classList.add('dark-theme');
    themeCheckbox.checked = true;
  }
  (result.tasks || []).forEach(t => addTaskToDOM(t.text, t.completed));
});

// Real Toggle Switch Logic
themeCheckbox.addEventListener('change', () => {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  chrome.storage.sync.set({ theme: isDark ? 'dark' : 'light' });
});

// Add Task
addBtn.addEventListener('click', () => {
  if (input.value.trim()) {
    addTaskToDOM(input.value, false);
    saveTasks();
    input.value = '';
  }
});

function addTaskToDOM(text, completed) {
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="task-text ${completed ? 'completed' : ''}">${text}</span>
    <button class="delete-btn">×</button>
  `;
  li.querySelector('.task-text').addEventListener('click', () => {
    li.querySelector('.task-text').classList.toggle('completed');
    saveTasks();
  });
  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.remove();
    saveTasks();
  });
  list.appendChild(li);
}

function saveTasks() {
  const tasks = Array.from(document.querySelectorAll('li')).map(li => ({
    text: li.querySelector('.task-text').textContent,
    completed: li.querySelector('.task-text').classList.contains('completed')
  }));
  chrome.storage.sync.set({ tasks });
}

// Download as .txt
downloadBtn.addEventListener('click', () => {
  const tasks = Array.from(document.querySelectorAll('li')).map(li => {
    const status = li.querySelector('.task-text').classList.contains('completed') ? '[DONE] ' : '[ ] ';
    return status + li.querySelector('.task-text').textContent;
  });
  
  const blob = new Blob([tasks.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-tasks.txt';
  a.click();
});

clearBtn.addEventListener('click', () => {
  list.innerHTML = '';
  chrome.storage.sync.set({ tasks: [] });
});