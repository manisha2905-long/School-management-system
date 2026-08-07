/* ============================================
   SCHOOL MANAGEMENT SYSTEM - JAVASCRIPT
   
   This file handles ALL the logic for the app:
   - Local Storage operations (save, load, delete)
   - Dashboard statistics
   - CRUD operations for all modules
   - Dark mode toggle
   - Search and filter
   - CSV export
   - Toast notifications
   - Delete confirmations
   ============================================ */

// ===== LOCAL STORAGE HELPER FUNCTIONS =====
// These functions make it easy to save and load data

/**
 * Get data from Local Storage by key.
 * Returns an empty array if no data exists.
 */
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Save data to Local Storage.
 * Converts the array to a JSON string before saving.
 */
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Generate a unique ID for new records.
 * Uses the current timestamp + a random number.
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}


// ===== DARK MODE =====
// Toggle between light and dark themes

function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    // Check if dark mode was previously enabled
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        toggle.querySelector('.toggle-icon').textContent = '☀️';
        toggle.querySelector('.toggle-text').textContent = 'Light Mode';
    }

    // Listen for clicks on the toggle button
    toggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const darkModeOn = document.body.classList.contains('dark-mode');

        // Save preference to Local Storage
        localStorage.setItem('darkMode', darkModeOn);

        // Update button text and icon
        toggle.querySelector('.toggle-icon').textContent = darkModeOn ? '☀️' : '🌙';
        toggle.querySelector('.toggle-text').textContent = darkModeOn ? 'Light Mode' : 'Dark Mode';
    });
}


// ===== SIDEBAR TOGGLE (MOBILE) =====
// Show/hide sidebar on small screens

function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (!menuToggle || !sidebar) return;

    // Create an overlay element for when sidebar is open
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    // Toggle sidebar open/close
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });

    // Close sidebar when clicking the overlay
    overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });
}


// ===== DISPLAY CURRENT DATE =====
// Shows today's date in the header

function displayCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (!dateElement) return;

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}


// ===== TOAST NOTIFICATIONS =====
// Show small popup messages for feedback

function showToast(message, type = 'success') {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Remove toast after animation finishes (3 seconds)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ===== CONFIRMATION MODAL =====
// Ask user to confirm before deleting

/**
 * Show a confirmation dialog before performing an action.
 * @param {string} message - The confirmation message
 * @param {function} onConfirm - Callback function when user confirms
 */
function showConfirmation(message, onConfirm) {
    // Remove any existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">⚠️</div>
            <h3>Confirm Action</h3>
            <p>${message}</p>
            <div class="modal-actions">
                <button class="btn btn-danger" id="modalConfirm">Yes, Delete</button>
                <button class="btn btn-secondary" id="modalCancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Show with animation (small delay for CSS transition)
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // Handle confirm button
    document.getElementById('modalConfirm').addEventListener('click', function () {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
        onConfirm();
    });

    // Handle cancel button
    document.getElementById('modalCancel').addEventListener('click', function () {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });

    // Close when clicking outside the modal box
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
    });
}


// ===== CSV EXPORT =====
// Export table data to a downloadable CSV file

/**
 * Export an array of objects to a CSV file.
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Column headers
 * @param {string} filename - Name of the downloaded file
 */
function exportToCSV(data, headers, filename) {
    if (data.length === 0) {
        showToast('No data to export!', 'error');
        return;
    }

    // Build CSV string
    let csv = headers.join(',') + '\n';
    data.forEach(function (row) {
        const values = headers.map(function (header) {
            const key = header.toLowerCase().replace(/\s+/g, '');
            // Find the matching key in the object (case insensitive)
            const matchingKey = Object.keys(row).find(function (k) {
                return k.toLowerCase().replace(/\s+/g, '') === key;
            });
            const value = matchingKey ? row[matchingKey] : '';
            // Wrap in quotes if value contains commas
            return '"' + String(value).replace(/"/g, '""') + '"';
        });
        csv += values.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    showToast('CSV exported successfully!');
}


// ================================================
// ===== DASHBOARD MODULE =====
// Updates the dashboard statistics and tables
// ================================================

function initDashboard() {
    // Only run on the dashboard page
    if (!document.getElementById('dashboardCards')) return;

    // Count total students
    const students = getData('students');
    const totalStudentsEl = document.getElementById('totalStudents');
    if (totalStudentsEl) {
        totalStudentsEl.textContent = students.length;
    }

    // Count total teachers
    const teachers = getData('teachers');
    const totalTeachersEl = document.getElementById('totalTeachers');
    if (totalTeachersEl) {
        totalTeachersEl.textContent = teachers.length;
    }

    // Calculate attendance percentage
    const attendance = getData('attendance');
    const attendancePercentEl = document.getElementById('attendancePercent');
    if (attendancePercentEl) {
        if (attendance.length > 0) {
            const present = attendance.filter(function (a) { return a.status === 'Present'; }).length;
            const percentage = Math.round((present / attendance.length) * 100);
            attendancePercentEl.textContent = percentage + '%';
        } else {
            attendancePercentEl.textContent = '0%';
        }
    }

    // Calculate total fees collected
    const fees = getData('fees');
    const feesCollectedEl = document.getElementById('feesCollected');
    if (feesCollectedEl) {
        const paidFees = fees.filter(function (f) { return f.status === 'Paid'; });
        const total = paidFees.reduce(function (sum, f) { return sum + parseFloat(f.amount || 0); }, 0);
        feesCollectedEl.textContent = '₹' + total.toLocaleString();
    }

    // Count upcoming exams
    const exams = getData('exams');
    const upcomingExamsEl = document.getElementById('upcomingExams');
    if (upcomingExamsEl) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = exams.filter(function (e) { return e.date >= today; });
        upcomingExamsEl.textContent = upcoming.length;
    }

    // Populate recent students table (last 5)
    const recentStudentsBody = document.getElementById('recentStudentsBody');
    const noStudentsMsg = document.getElementById('noStudentsMsg');
    const recentStudentsTable = document.getElementById('recentStudentsTable');

    if (recentStudentsBody) {
        if (students.length === 0) {
            recentStudentsTable.style.display = 'none';
            noStudentsMsg.classList.add('show');
        } else {
            recentStudentsTable.style.display = 'table';
            noStudentsMsg.classList.remove('show');
            // Show the last 5 students (most recently added)
            const recent = students.slice(-5).reverse();
            recentStudentsBody.innerHTML = recent.map(function (s) {
                return `
                    <tr>
                        <td>${s.studentId}</td>
                        <td>${s.name}</td>
                        <td>${s.className}</td>
                        <td>${s.age}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Populate upcoming exams table
    const upcomingExamsBody = document.getElementById('upcomingExamsBody');
    const noExamsMsg = document.getElementById('noExamsMsg');
    const upcomingExamsTable = document.getElementById('upcomingExamsTable');

    if (upcomingExamsBody) {
        const today = new Date().toISOString().split('T')[0];
        const upcomingList = exams.filter(function (e) { return e.date >= today; }).slice(0, 5);

        if (upcomingList.length === 0) {
            upcomingExamsTable.style.display = 'none';
            noExamsMsg.classList.add('show');
        } else {
            upcomingExamsTable.style.display = 'table';
            noExamsMsg.classList.remove('show');
            upcomingExamsBody.innerHTML = upcomingList.map(function (e) {
                return `
                    <tr>
                        <td>${e.examName}</td>
                        <td>${e.subject}</td>
                        <td>${e.date}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}


// ================================================
// ===== STUDENTS MODULE =====
// Add, display, search, delete students
// ================================================

function initStudents() {
    const form = document.getElementById('studentForm');
    if (!form) return; // Only run on students page

    // Load and display existing students
    renderStudents();

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent page reload

        // Get form values
        const studentId = document.getElementById('studentId').value.trim();
        const name = document.getElementById('studentName').value.trim();
        const className = document.getElementById('studentClass').value.trim();
        const age = document.getElementById('studentAge').value.trim();

        // Validate inputs (check for empty fields)
        let isValid = true;

        if (!studentId) { showFieldError('studentId'); isValid = false; }
        else { clearFieldError('studentId'); }

        if (!name) { showFieldError('studentName'); isValid = false; }
        else { clearFieldError('studentName'); }

        if (!className) { showFieldError('studentClass'); isValid = false; }
        else { clearFieldError('studentClass'); }

        if (!age) { showFieldError('studentAge'); isValid = false; }
        else { clearFieldError('studentAge'); }

        if (!isValid) return;

        // Create student object
        const student = {
            id: generateId(),
            studentId: studentId,
            name: name,
            className: className,
            age: age
        };

        // Save to Local Storage
        const students = getData('students');
        students.push(student);
        saveData('students', students);

        // Reset form and update table
        form.reset();
        renderStudents();
        showToast('Student added successfully!');
    });

    // Search functionality
    const searchInput = document.getElementById('studentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderStudents(this.value);
        });
    }

    // CSV Export
    const exportBtn = document.getElementById('exportStudents');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const students = getData('students');
            exportToCSV(students, ['StudentId', 'Name', 'ClassName', 'Age'], 'students.csv');
        });
    }
}

/**
 * Render the students table, optionally filtered by search term.
 */
function renderStudents(searchTerm) {
    const tbody = document.getElementById('studentsTableBody');
    const emptyMsg = document.getElementById('studentsEmpty');
    if (!tbody) return;

    let students = getData('students');

    // Filter by search term if provided
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        students = students.filter(function (s) {
            return s.name.toLowerCase().includes(term) ||
                   s.studentId.toLowerCase().includes(term) ||
                   s.className.toLowerCase().includes(term);
        });
    }

    // Show empty message if no students
    if (students.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    // Build table rows
    tbody.innerHTML = students.map(function (s) {
        return `
            <tr>
                <td>${s.studentId}</td>
                <td>${s.name}</td>
                <td>${s.className}</td>
                <td>${s.age}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Delete a student after confirmation.
 */
function deleteStudent(id) {
    showConfirmation('Are you sure you want to delete this student?', function () {
        let students = getData('students');
        students = students.filter(function (s) { return s.id !== id; });
        saveData('students', students);
        renderStudents();
        showToast('Student deleted.');
    });
}

// ===== FORM VALIDATION HELPERS =====

function showFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.add('error');
        const errorText = input.parentElement.querySelector('.error-text');
        if (errorText) errorText.classList.add('show');
    }
}

function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.remove('error');
        const errorText = input.parentElement.querySelector('.error-text');
        if (errorText) errorText.classList.remove('show');
    }
}


// ================================================
// ===== ATTENDANCE MODULE =====
// Mark students present/absent and save records
// ================================================

function initAttendance() {
    const attendanceTableBody = document.getElementById('attendanceTableBody');
    if (!attendanceTableBody) return; // Only run on attendance page

    renderAttendance();

    // Save attendance button
    const saveBtn = document.getElementById('saveAttendance');
    if (saveBtn) {
        saveBtn.addEventListener('click', function () {
            saveAttendanceRecords();
        });
    }

    // Date filter
    const dateFilter = document.getElementById('attendanceDate');
    if (dateFilter) {
        // Set default to today
        dateFilter.value = new Date().toISOString().split('T')[0];
        dateFilter.addEventListener('change', function () {
            renderAttendance();
        });
    }
}

/**
 * Render the attendance table showing all students with their status.
 */
function renderAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    const emptyMsg = document.getElementById('attendanceEmpty');
    if (!tbody) return;

    const students = getData('students');
    const attendance = getData('attendance');
    const dateInput = document.getElementById('attendanceDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    if (students.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        updateAttendanceStats();
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    // Build table rows with attendance status buttons
    tbody.innerHTML = students.map(function (s) {
        // Check if attendance already recorded for this student on this date
        const record = attendance.find(function (a) {
            return a.studentId === s.id && a.date === selectedDate;
        });
        const status = record ? record.status : 'Not Marked';

        return `
            <tr>
                <td>${s.studentId}</td>
                <td>${s.name}</td>
                <td>${s.className}</td>
                <td>
                    ${status === 'Present' 
                        ? '<span class="badge badge-present">✅ Present</span>' 
                        : status === 'Absent'
                        ? '<span class="badge badge-absent">❌ Absent</span>'
                        : '<span class="badge" style="background:var(--bg-tertiary);color:var(--text-muted)">— Not Marked</span>'}
                </td>
                <td>
                    <div class="attendance-actions">
                        <button class="btn btn-success btn-sm" onclick="markAttendance('${s.id}', 'Present')">
                            ✅ Present
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="markAttendance('${s.id}', 'Absent')">
                            ❌ Absent
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updateAttendanceStats();
}

/**
 * Mark a student as Present or Absent.
 */
function markAttendance(studentId, status) {
    const attendance = getData('attendance');
    const dateInput = document.getElementById('attendanceDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    // Check if a record already exists for this student on this date
    const existingIndex = attendance.findIndex(function (a) {
        return a.studentId === studentId && a.date === selectedDate;
    });

    if (existingIndex >= 0) {
        // Update existing record
        attendance[existingIndex].status = status;
    } else {
        // Create new record
        attendance.push({
            id: generateId(),
            studentId: studentId,
            date: selectedDate,
            status: status
        });
    }

    saveData('attendance', attendance);
    renderAttendance();
    showToast(`Marked as ${status}`);
}

/**
 * Save all unmarked students as Absent by default.
 */
function saveAttendanceRecords() {
    const students = getData('students');
    const attendance = getData('attendance');
    const dateInput = document.getElementById('attendanceDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    let newRecords = 0;

    students.forEach(function (s) {
        const exists = attendance.find(function (a) {
            return a.studentId === s.id && a.date === selectedDate;
        });

        if (!exists) {
            // Mark unmarked students as Absent
            attendance.push({
                id: generateId(),
                studentId: s.id,
                date: selectedDate,
                status: 'Absent'
            });
            newRecords++;
        }
    });

    saveData('attendance', attendance);
    renderAttendance();

    if (newRecords > 0) {
        showToast(`Attendance saved! ${newRecords} unmarked student(s) marked as Absent.`);
    } else {
        showToast('All attendance records are already saved.');
    }
}

/**
 * Update the attendance statistics bar.
 */
function updateAttendanceStats() {
    const attendance = getData('attendance');
    const dateInput = document.getElementById('attendanceDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    // Filter attendance for selected date
    const todayRecords = attendance.filter(function (a) { return a.date === selectedDate; });
    const present = todayRecords.filter(function (a) { return a.status === 'Present'; }).length;
    const absent = todayRecords.filter(function (a) { return a.status === 'Absent'; }).length;

    const presentEl = document.getElementById('presentCount');
    const absentEl = document.getElementById('absentCount');
    const totalEl = document.getElementById('totalMarked');

    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (totalEl) totalEl.textContent = todayRecords.length;
}


// ================================================
// ===== FEES MODULE =====
// Add, display, and delete fee records
// ================================================

function initFees() {
    const form = document.getElementById('feeForm');
    if (!form) return; // Only run on fees page

    renderFees();

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('feeName').value.trim();
        const amount = document.getElementById('feeAmount').value.trim();
        const status = document.getElementById('feeStatus').value;

        // Validate inputs
        let isValid = true;

        if (!name) { showFieldError('feeName'); isValid = false; }
        else { clearFieldError('feeName'); }

        if (!amount || parseFloat(amount) <= 0) { showFieldError('feeAmount'); isValid = false; }
        else { clearFieldError('feeAmount'); }

        if (!isValid) return;

        // Create fee record
        const fee = {
            id: generateId(),
            name: name,
            amount: amount,
            status: status
        };

        // Save to Local Storage
        const fees = getData('fees');
        fees.push(fee);
        saveData('fees', fees);

        form.reset();
        renderFees();
        showToast('Fee record added!');
    });

    // CSV Export
    const exportBtn = document.getElementById('exportFees');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const fees = getData('fees');
            exportToCSV(fees, ['Name', 'Amount', 'Status'], 'fees.csv');
        });
    }
}

/**
 * Render the fees table and calculate totals.
 */
function renderFees() {
    const tbody = document.getElementById('feesTableBody');
    const emptyMsg = document.getElementById('feesEmpty');
    if (!tbody) return;

    const fees = getData('fees');

    if (fees.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        updateFeesStats();
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    tbody.innerHTML = fees.map(function (f) {
        const badgeClass = f.status === 'Paid' ? 'badge-paid' : 'badge-unpaid';
        const badgeText = f.status === 'Paid' ? '✅ Paid' : '⏳ Unpaid';

        return `
            <tr>
                <td>${f.name}</td>
                <td>₹${parseFloat(f.amount).toLocaleString()}</td>
                <td><span class="badge ${badgeClass}">${badgeText}</span></td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteFee('${f.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    updateFeesStats();
}

/**
 * Update fees statistics (total collected and pending).
 */
function updateFeesStats() {
    const fees = getData('fees');
    const paid = fees.filter(function (f) { return f.status === 'Paid'; });
    const unpaid = fees.filter(function (f) { return f.status === 'Unpaid'; });

    const totalPaid = paid.reduce(function (sum, f) { return sum + parseFloat(f.amount || 0); }, 0);
    const totalUnpaid = unpaid.reduce(function (sum, f) { return sum + parseFloat(f.amount || 0); }, 0);

    const paidEl = document.getElementById('totalPaid');
    const unpaidEl = document.getElementById('totalUnpaid');
    const totalRecordsEl = document.getElementById('totalFeeRecords');

    if (paidEl) paidEl.textContent = '₹' + totalPaid.toLocaleString();
    if (unpaidEl) unpaidEl.textContent = '₹' + totalUnpaid.toLocaleString();
    if (totalRecordsEl) totalRecordsEl.textContent = fees.length;
}

/**
 * Delete a fee record after confirmation.
 */
function deleteFee(id) {
    showConfirmation('Are you sure you want to delete this fee record?', function () {
        let fees = getData('fees');
        fees = fees.filter(function (f) { return f.id !== id; });
        saveData('fees', fees);
        renderFees();
        showToast('Fee record deleted.');
    });
}


// ================================================
// ===== EXAMS MODULE =====
// Add, display, and delete exam schedules
// ================================================

function initExams() {
    const form = document.getElementById('examForm');
    if (!form) return; // Only run on exams page

    renderExams();

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const examName = document.getElementById('examName').value.trim();
        const subject = document.getElementById('examSubject').value.trim();
        const date = document.getElementById('examDate').value;

        // Validate inputs
        let isValid = true;

        if (!examName) { showFieldError('examName'); isValid = false; }
        else { clearFieldError('examName'); }

        if (!subject) { showFieldError('examSubject'); isValid = false; }
        else { clearFieldError('examSubject'); }

        if (!date) { showFieldError('examDate'); isValid = false; }
        else { clearFieldError('examDate'); }

        if (!isValid) return;

        // Create exam object
        const exam = {
            id: generateId(),
            examName: examName,
            subject: subject,
            date: date
        };

        // Save to Local Storage
        const exams = getData('exams');
        exams.push(exam);
        saveData('exams', exams);

        form.reset();
        renderExams();
        showToast('Exam added successfully!');
    });

    // CSV Export
    const exportBtn = document.getElementById('exportExams');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const exams = getData('exams');
            exportToCSV(exams, ['ExamName', 'Subject', 'Date'], 'exams.csv');
        });
    }
}

/**
 * Render the exams table.
 */
function renderExams() {
    const tbody = document.getElementById('examsTableBody');
    const emptyMsg = document.getElementById('examsEmpty');
    if (!tbody) return;

    const exams = getData('exams');

    if (exams.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    // Sort exams by date (nearest first)
    exams.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

    const today = new Date().toISOString().split('T')[0];

    tbody.innerHTML = exams.map(function (e) {
        const isPast = e.date < today;
        return `
            <tr style="${isPast ? 'opacity: 0.5;' : ''}">
                <td>${e.examName}</td>
                <td>${e.subject}</td>
                <td>${e.date}${isPast ? ' <span style="color:var(--text-muted);font-size:0.75rem;">(Past)</span>' : ''}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteExam('${e.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Delete an exam after confirmation.
 */
function deleteExam(id) {
    showConfirmation('Are you sure you want to delete this exam?', function () {
        let exams = getData('exams');
        exams = exams.filter(function (e) { return e.id !== id; });
        saveData('exams', exams);
        renderExams();
        showToast('Exam deleted.');
    });
}


// ================================================
// ===== TEACHERS MODULE =====
// Add, display, search, and delete teachers
// ================================================

function initTeachers() {
    const form = document.getElementById('teacherForm');
    if (!form) return; // Only run on teachers page

    renderTeachers();

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('teacherName').value.trim();
        const subject = document.getElementById('teacherSubject').value.trim();
        const contact = document.getElementById('teacherContact').value.trim();

        // Validate inputs
        let isValid = true;

        if (!name) { showFieldError('teacherName'); isValid = false; }
        else { clearFieldError('teacherName'); }

        if (!subject) { showFieldError('teacherSubject'); isValid = false; }
        else { clearFieldError('teacherSubject'); }

        if (!contact) { showFieldError('teacherContact'); isValid = false; }
        else { clearFieldError('teacherContact'); }

        if (!isValid) return;

        // Create teacher object
        const teacher = {
            id: generateId(),
            name: name,
            subject: subject,
            contact: contact
        };

        // Save to Local Storage
        const teachers = getData('teachers');
        teachers.push(teacher);
        saveData('teachers', teachers);

        form.reset();
        renderTeachers();
        showToast('Teacher added successfully!');
    });

    // Search functionality
    const searchInput = document.getElementById('teacherSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderTeachers(this.value);
        });
    }

    // CSV Export
    const exportBtn = document.getElementById('exportTeachers');
    if (exportBtn) {
        exportBtn.addEventListener('click', function () {
            const teachers = getData('teachers');
            exportToCSV(teachers, ['Name', 'Subject', 'Contact'], 'teachers.csv');
        });
    }
}

/**
 * Render the teachers table, optionally filtered by search.
 */
function renderTeachers(searchTerm) {
    const tbody = document.getElementById('teachersTableBody');
    const emptyMsg = document.getElementById('teachersEmpty');
    if (!tbody) return;

    let teachers = getData('teachers');

    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        teachers = teachers.filter(function (t) {
            return t.name.toLowerCase().includes(term) ||
                   t.subject.toLowerCase().includes(term);
        });
    }

    if (teachers.length === 0) {
        tbody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    tbody.innerHTML = teachers.map(function (t) {
        return `
            <tr>
                <td>${t.name}</td>
                <td>${t.subject}</td>
                <td>${t.contact}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteTeacher('${t.id}')">
                        🗑️ Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Delete a teacher after confirmation.
 */
function deleteTeacher(id) {
    showConfirmation('Are you sure you want to delete this teacher?', function () {
        let teachers = getData('teachers');
        teachers = teachers.filter(function (t) { return t.id !== id; });
        saveData('teachers', teachers);
        renderTeachers();
        showToast('Teacher deleted.');
    });
}


// ================================================
// ===== INITIALIZATION =====
// Run when the page loads
// ================================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize common features on every page
    initDarkMode();
    initSidebar();
    displayCurrentDate();

    // Initialize the module for the current page
    initDashboard();
    initStudents();
    initAttendance();
    initFees();
    initExams();
    initTeachers();
});
