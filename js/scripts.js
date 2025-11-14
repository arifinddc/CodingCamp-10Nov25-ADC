// js/scripts.js

// --- Konfigurasi Awal ---
const TASK_STORAGE_KEY = 'taskListData';
let tasks = []; // Array untuk menyimpan objek tugas

// --- Elemen DOM ---
const taskList = document.getElementById('task-list');
const addTaskForm = document.getElementById('add-task-form');
const newTaskText = document.getElementById('new-task-text');
const newTaskDate = document.getElementById('new-task-date');
const deleteAllBtn = document.getElementById('delete-all-btn');
const searchInput = document.getElementById('search-input');
const filterBtn = document.getElementById('filter-btn');

const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const progressPercentEl = document.getElementById('progress-percent');
const noTasksRow = document.getElementById('no-tasks-row');

const sortTaskBtn = document.getElementById('sort-task');
const sortDateBtn = document.getElementById('sort-date');

let sortConfig = { key: 'id', direction: 'asc' }; // Konfigurasi default: berdasarkan ID, menaik

// --- Fungsi Penyimpanan Data ---

/**
 * Memuat tugas dari Local Storage.
 */
function loadTasks() {
    const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        // Jika Local Storage kosong, inisialisasi dengan array kosong
        tasks = []; 
    }
    renderTasks();
    updateStats();
}

/**
 * Menyimpan array tugas ke Local Storage.
 */
function saveTasks() {
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    updateStats();
}

// --- Fungsi Utilitas ---

/**
 * Mengubah format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY
 * @param {string} dateString - Tanggal dalam format YYYY-MM-DD.
 * @returns {string} Tanggal dalam format DD/MM/YYYY.
 */
function formatDate(dateString) {
    if (!dateString) return 'No Date';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// --- Fungsi Rendering dan Statistik ---

/**
 * Mengupdate statistik di bagian atas dashboard.
 */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    progressPercentEl.textContent = `${progress}%`;
}

/**
 * Membuat baris (tr) untuk sebuah tugas.
 * @param {object} task - Objek tugas.
 * @returns {HTMLTableRowElement} Elemen baris tabel.
 */
function createTaskRow(task) {
    const row = document.createElement('tr');
    row.id = `task-${task.id}`;
    row.className = 'border-b hover:bg-gray-50 transition duration-150';

    const statusColor = task.completed ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';

    row.innerHTML = `
        <td class="py-3 px-4 flex items-center space-x-3">
            <input type="checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} 
                   class="h-5 w-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500 cursor-pointer task-checkbox">
            <span class="text-gray-700 ${task.completed ? 'line-through text-gray-400' : ''}">${task.text}</span>
        </td>
        <td class="py-3 px-4 text-gray-500">${formatDate(task.dueDate)}</td>
        <td class="py-3 px-4">
            <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                ${task.completed ? 'Completed' : 'Pending'}
            </span>
        </td>
        <td class="py-3 px-4 text-center">
            <button data-id="${task.id}" class="text-red-500 hover:text-red-700 transition duration-150 delete-btn" title="Delete Task">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </td>
    `;
    return row;
}

/**
 * Merender daftar tugas yang sudah difilter/diurutkan ke DOM.
 * @param {Array<object>} [filteredTasks=tasks] - Daftar tugas untuk ditampilkan.
 */
function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = ''; // Kosongkan daftar

    if (filteredTasks.length === 0) {
        // Tampilkan baris "No tasks found" jika tidak ada tugas
        noTasksRow.style.display = 'table-row';
        taskList.appendChild(noTasksRow);
    } else {
        noTasksRow.style.display = 'none'; // Sembunyikan jika ada tugas
        
        filteredTasks.forEach(task => {
            taskList.appendChild(createTaskRow(task));
        });
    }
}

// --- Fungsi Manajemen Tugas ---

/**
 * Menambahkan tugas baru.
 * @param {Event} e - Objek event form submit.
 */
function addTask(e) {
    e.preventDefault();

    const text = newTaskText.value.trim();
    const dueDate = newTaskDate.value;

    if (text === '') return;

    const newTask = {
        id: Date.now(), // ID unik sederhana
        text: text,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask); // Tambahkan ke awal
    saveTasks();
    
    newTaskText.value = '';
    newTaskDate.value = '';

    renderTasks();
}

/**
 * Menghapus tugas berdasarkan ID.
 * @param {number} id - ID tugas.
 */
function deleteTask(id) {
    const taskRow = document.getElementById(`task-${id}`);
    if (taskRow) {
        // Beri animasi sebelum dihapus
        taskRow.classList.add('deleting');
        
        // Hapus dari array dan simpan setelah animasi selesai
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 500); // Durasi harus sesuai dengan CSS .deleting transition
    }
}

/**
 * Mengubah status completed/uncompleted tugas.
 * @param {number} id - ID tugas.
 * @param {boolean} isCompleted - Status baru.
 */
function toggleTaskStatus(id, isCompleted) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        tasks[taskIndex].completed = isCompleted;
        saveTasks();
        renderTasks(applyFiltersAndSearch()); // Render ulang untuk update tampilan baris
    }
}

/**
 * Menghapus semua tugas.
 */
function deleteAllTasks() {
    if (tasks.length === 0) {
        alert("Tidak ada tugas untuk dihapus.");
        return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus SEMUA tugas? Tindakan ini tidak dapat dibatalkan.")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
}

// --- Fungsi Pencarian, Filter, dan Sorting ---

/**
 * Menerapkan pencarian dan filter status.
 * @param {string} [searchTerm=searchInput.value.toLowerCase()] - Kata kunci pencarian.
 * @param {string} [filterStatus='all'] - 'all', 'completed', atau 'pending'.
 * @returns {Array<object>} Array tugas yang telah difilter dan dicari.
 */
function applyFiltersAndSearch(searchTerm = searchInput.value.toLowerCase(), filterStatus = filterBtn.dataset.status || 'all') {
    let result = tasks;

    // 1. Pencarian
    if (searchTerm) {
        result = result.filter(task => 
            task.text.toLowerCase().includes(searchTerm)
        );
    }

    // 2. Filter Status
    if (filterStatus === 'completed') {
        result = result.filter(task => task.completed);
    } else if (filterStatus === 'pending') {
        result = result.filter(task => !task.completed);
    }
    
    // 3. Sorting
    result = sortTasks(result, sortConfig.key, sortConfig.direction);

    return result;
}

/**
 * Mengurutkan array tugas.
 * @param {Array<object>} arr - Array tugas.
 * @param {string} key - Kunci untuk mengurutkan ('text', 'dueDate', 'id').
 * @param {string} direction - Arah pengurutan ('asc' atau 'desc').
 * @returns {Array<object>} Array tugas yang telah diurutkan.
 */
function sortTasks(arr, key, direction) {
    return arr.sort((a, b) => {
        let valA = a[key] || '';
        let valB = b[key] || '';

        // Untuk tanggal, pastikan perbandingan string berjalan benar (YYYY-MM-DD)
        if (key === 'dueDate') {
            valA = valA.replace(/-/g, '');
            valB = valB.replace(/-/g, '');
        } 
        
        // Untuk teks, gunakan perbandingan string case-insensitive
        if (key === 'text') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Menangani klik pada header kolom untuk sorting.
 * @param {string} key - Kunci untuk mengurutkan.
 */
function handleSortClick(key) {
    if (sortConfig.key === key) {
        // Ganti arah jika kunci yang sama diklik
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Ganti kunci dan set arah ke 'asc'
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }
    
    const filteredAndSorted = applyFiltersAndSearch();
    renderTasks(filteredAndSorted);
}


/**
 * Menangani klik tombol filter (toggle status filter).
 */
function handleFilterClick() {
    let currentStatus = filterBtn.dataset.status || 'all';
    let newStatus = 'all';
    
    // Logika siklus filter: all -> completed -> pending -> all
    if (currentStatus === 'all') {
        newStatus = 'completed';
        filterBtn.textContent = 'FILTER: Completed';
        filterBtn.classList.remove('border');
        filterBtn.classList.add('bg-green-500', 'text-white');
    } else if (currentStatus === 'completed') {
        newStatus = 'pending';
        filterBtn.textContent = 'FILTER: Pending';
        filterBtn.classList.remove('bg-green-500', 'text-white');
        filterBtn.classList.add('bg-yellow-500', 'text-white');
    } else if (currentStatus === 'pending') {
        newStatus = 'all';
        filterBtn.textContent = 'FILTER';
        filterBtn.classList.remove('bg-yellow-500', 'text-white');
        filterBtn.classList.add('border');
    }

    filterBtn.dataset.status = newStatus;
    
    const filteredAndSorted = applyFiltersAndSearch();
    renderTasks(filteredAndSorted);
}


// --- Event Listeners ---

// 1. Tambah Tugas
addTaskForm.addEventListener('submit', addTask);

// 2. Hapus Semua Tugas
deleteAllBtn.addEventListener('click', deleteAllTasks);

// 3. Toggle Status dan Hapus Tugas Individual (Delegasi Event)
taskList.addEventListener('click', (e) => {
    const target = e.target;
    const id = parseInt(target.dataset.id || target.closest('button, input[type="checkbox"]').dataset.id);

    if (!id) return;

    if (target.classList.contains('task-checkbox') || target.closest('.task-checkbox')) {
        const checkbox = target.classList.contains('task-checkbox') ? target : target.closest('.task-checkbox');
        toggleTaskStatus(id, checkbox.checked);
    } else if (target.classList.contains('delete-btn') || target.closest('.delete-btn')) {
        deleteTask(id);
    }
});

// 4. Pencarian
searchInput.addEventListener('input', () => {
    const filteredAndSorted = applyFiltersAndSearch();
    renderTasks(filteredAndSorted);
});

// 5. Sorting
sortTaskBtn.addEventListener('click', () => handleSortClick('text'));
sortDateBtn.addEventListener('click', () => handleSortClick('dueDate'));

// 6. Filter
filterBtn.addEventListener('click', handleFilterClick);


// --- Inisialisasi Aplikasi ---
document.addEventListener('DOMContentLoaded', loadTasks);