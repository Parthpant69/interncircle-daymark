'use strict';

const STORAGE_KEY = 'daymark.tasks.v1';
const messages = {
  all: ['No tasks yet', 'Add your first task above.'],
  active: ['No active tasks', 'Add a task or switch to All.'],
  done: ['No completed tasks', 'Check off a task to see it here.']
};

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-text');
const inputError = document.querySelector('#input-error');
const taskList = document.querySelector('#task-list');
const filters = document.querySelector('.filters');
const clearButton = document.querySelector('#clear-completed');
const remaining = document.querySelector('#remaining');
const storageNote = document.querySelector('#storage-note');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyDetail = document.querySelector('#empty-detail');
const percentage = document.querySelector('#percentage');
const progress = document.querySelector('#progress-bar');
const progressDetail = document.querySelector('#progress-detail');

let tasks = load();
let activeFilter = 'all';

function showStorageStatus(message, isError = false) {
  storageNote.textContent = message;
  storageNote.dataset.error = String(isError);
}

function load() {
  let saved;

  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    showStorageStatus('Device storage unavailable', true);
    return [];
  }

  if (saved === null) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error('Invalid task list');

    const ids = new Set();
    for (const task of parsed) {
      if (!task || typeof task.id !== 'string' || typeof task.text !== 'string' ||
          !task.text.trim() || typeof task.done !== 'boolean' || ids.has(task.id)) {
        throw new Error('Invalid saved task');
      }
      ids.add(task.id);
    }
    return parsed;
  } catch {
    showStorageStatus('Saved tasks could not be loaded', true);
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    showStorageStatus('Saves on this device');
  } catch {
    showStorageStatus('Changes could not be saved', true);
  }
}

function makeTaskRow(task) {
  const row = document.createElement('li');
  row.className = task.done ? 'task-row is-done' : 'task-row';
  row.dataset.id = task.id;

  const label = document.createElement('label');
  label.className = 'task-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.dataset.action = 'toggle';

  const text = document.createElement('span');
  text.textContent = task.text;
  label.append(checkbox, text);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete-task';
  remove.dataset.action = 'delete';
  remove.textContent = 'Delete';
  remove.setAttribute('aria-label', `Delete task: ${task.text}`);

  row.append(label, remove);
  return row;
}

function render() {
  const visible = tasks.filter(task => activeFilter === 'all' ||
    (activeFilter === 'done' ? task.done : !task.done));
  const rows = document.createDocumentFragment();
  visible.forEach(task => rows.append(makeTaskRow(task)));
  taskList.replaceChildren(rows);

  emptyState.hidden = visible.length > 0;
  [emptyTitle.textContent, emptyDetail.textContent] = messages[activeFilter];

  const completed = tasks.filter(task => task.done).length;
  const left = tasks.length - completed;
  remaining.textContent = `${left} ${left === 1 ? 'task' : 'tasks'} left`;
  clearButton.disabled = completed === 0;

  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  progress.value = percent;
  percentage.textContent = `${percent}%`;
  progressDetail.textContent = `${completed} of ${tasks.length} tasks completed`;

  for (const button of filters.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
  }
}

function setInputError(message = '') {
  inputError.textContent = message;
  inputError.hidden = !message;
  input.setAttribute('aria-invalid', String(Boolean(message)));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    setInputError('Enter a task before adding it.');
    input.focus();
    return;
  }

  const id = crypto.getRandomValues(new Uint32Array(4)).join('-');
  tasks.push({ id, text, done: false });
  if (activeFilter === 'done') activeFilter = 'all';
  input.value = '';
  setInputError();
  save();
  render();
  input.focus();
});

input.addEventListener('input', () => setInputError());

taskList.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;

  const row = control.closest('li');
  const task = tasks.find(item => item.id === row.dataset.id);
  if (!task) return;

  const action = control.dataset.action;
  const rowIndex = Array.from(taskList.children).indexOf(row);

  if (action === 'toggle') {
    task.done = control.checked;
  } else {
    tasks = tasks.filter(item => item.id !== task.id);
  }

  save();
  render();

  const sameRow = Array.from(taskList.children).find(item => item.dataset.id === task.id);
  const nextRow = sameRow ?? taskList.children[rowIndex] ?? taskList.lastElementChild;
  const nextControl = nextRow?.querySelector(`[data-action="${action}"]`);
  (nextControl ?? filters.querySelector('[aria-pressed="true"]')).focus();
});

filters.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  render();
});

clearButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.done);
  save();
  render();
  filters.querySelector('[aria-pressed="true"]').focus();
});

render();
