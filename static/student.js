// Local Database Management
let students = JSON.parse(localStorage.getItem('student_records')) || [];
let editIndex = null;

// DOM Elements References
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const studentNameInput = document.getElementById('studentName');
const studentEmailInput = document.getElementById('studentEmail');
const studentGradeInput = document.getElementById('studentGrade');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentTableBody = document.getElementById('studentTableBody');
const searchBar = document.getElementById('searchBar');
const sortSelect = document.getElementById('sortSelect');

// Save to LocalStorage helper
function saveToLocalStorage() {
    localStorage.setItem('student_records', JSON.stringify(students));
}

// Render Table Records dynamically with search and filters applied
function renderRecords(filteredStudents = students) {
    studentTableBody.innerHTML = '';
    
    if (filteredStudents.length === 0) {
        studentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#a0aec0;">No student records found.</td></tr>`;
        return;
    }

    filteredStudents.forEach((student, index) => {
        // Finding the actual index in the main list for accurate editing/deletion
        const actualIndex = students.indexOf(student);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(student.id)}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td><strong>${student.grade}</strong></td>
            <td>
                <button class="btn-edit" onclick="editRecord(${actualIndex})">Edit</button>
                <button class="btn-delete" onclick="deleteRecord(${actualIndex})">Delete</button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });
}

// Create & Update Handler
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = studentIdInput.value.trim();
    const name = studentNameInput.value.trim();
    const email = studentEmailInput.value.trim();
    const grade = parseFloat(studentGradeInput.value);

    // Custom Validation Handling
    if (!id || !name || !email || isNaN(grade)) {
        alert("Exception Note: Input validation failed. All fields are required.");
        return;
    }

    // Check for duplicate ID if we're creating a fresh record
    if (editIndex === null && students.some(s => s.id.toLowerCase() === id.toLowerCase())) {
        alert("Exception Note: Unique Constraint Violated. Student ID already exists.");
        return;
    }

    const studentData = { id, name, email, grade };

    if (editIndex === null) {
        // CREATE OPERATION
        students.push(studentData);
    } else {
        // UPDATE OPERATION
        students[editIndex] = studentData;
        editIndex = null;
        submitBtn.textContent = "Save Record";
        cancelBtn.classList.add('hidden');
        studentIdInput.disabled = false;
    }

    saveToLocalStorage();
    studentForm.reset();
    applyFilters();
});

// Setup Form for Editing
window.editRecord = function(index) {
    editIndex = index;
    const student = students[index];

    studentIdInput.value = student.id;
    studentIdInput.disabled = true; // Protect unique primary key ID from change
    studentNameInput.value = student.name;
    studentEmailInput.value = student.email;
    studentGradeInput.value = student.grade;

    submitBtn.textContent = "Update Record";
    cancelBtn.classList.remove('hidden');
};

// Cancel active updates
cancelBtn.addEventListener('click', () => {
    editIndex = null;
    studentForm.reset();
    studentIdInput.disabled = false;
    submitBtn.textContent = "Save Record";
    cancelBtn.classList.add('hidden');
});

// DELETE OPERATION
window.deleteRecord = function(index) {
    if (confirm("Are you sure you want to permanently delete this student record?")) {
        students.splice(index, 1);
        saveToLocalStorage();
        applyFilters();
    }
};

// SEARCH, FILTER, AND SORT ACTIONS
function applyFilters() {
    let output = [...students];
    const searchQuery = searchBar.value.toLowerCase().trim();
    const sortValue = sortSelect.value;

    // Searching implementation
    if (searchQuery) {
        output = output.filter(student => 
            student.name.toLowerCase().includes(searchQuery) || 
            student.id.toLowerCase().includes(searchQuery)
        );
    }

    // Sorting implementation
    if (sortValue === 'name') {
        output.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === 'grade') {
        output.sort((a, b) => b.grade - a.grade);
    }

    renderRecords(output);
}

// Event Listeners for search & sort
searchBar.addEventListener('input', applyFilters);
sortSelect.addEventListener('change', applyFilters);

// Anti XSS Injection string sanitization
function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Initial Boot Loading
renderRecords();
