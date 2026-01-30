// admin.js - Handles Admin Dashboard Logic

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    
    // Initial loads
    fetchEventsDropdown(); // For Event CRUD
    loadEventsForRegistrationDropdown(); // For Registration View
    viewStudents(); // For Student CRUD
    fetchAdmins(); // For Admin CRUD
    
    // Setup Listeners
    setupEventForms();
    setupStudentForms();
    setupAdminForms();
    setupRegistrationView();
});

// --- UTILITIES ---
function showToast(message, isError) {
    const toastEl = document.getElementById('toastMessage');
    const toastBody = document.getElementById('toastBody');
    if (!toastEl || !toastBody) return;

    if (isError) {
        toastEl.classList.remove('text-bg-success');
        toastEl.classList.add('text-bg-danger');
    } else {
        toastEl.classList.remove('text-bg-danger');
        toastEl.classList.add('text-bg-success');
    }

    toastBody.textContent = message;
    // Assuming Bootstrap is loaded
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// --- 1. NAVIGATION & UI TOGGLES ---
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const sectionTitle = document.getElementById('sectionTitle');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const target = button.getAttribute('data-section');
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(target).classList.add('active');

            if(sectionTitle) sectionTitle.innerText = button.innerText.trim();
            
            // Reset sub-forms when switching main sections
            showEventForm(null); 
        });
    });
}

// --- 2. EVENT MANAGEMENT LOGIC ---

// Toggle visibility of specific event forms
const eventForms = ['add-event-form', 'update-event-form', 'delete-event-form', 'view-event-form'];

function showEventForm(formId) {
    eventForms.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === formId) {
            el.classList.add('show');
            el.style.display = 'block';
        } else {
            el.classList.remove('show');
            el.style.display = 'none';
        }
    });
}

// Global functions for HTML onclick attributes (if used)
window.toggleAddEventForm = () => showEventForm(document.getElementById('add-event-form').style.display === 'block' ? null : 'add-event-form');
window.toggleUpdateEventForm = () => showEventForm(document.getElementById('update-event-form').style.display === 'block' ? null : 'update-event-form');
window.toggleDeleteEventForm = () => showEventForm(document.getElementById('delete-event-form').style.display === 'block' ? null : 'delete-event-form');
window.toggleViewEventForm = () => showEventForm(document.getElementById('view-event-form').style.display === 'block' ? null : 'view-event-form');

function setupEventForms() {
    // Add Event
    const addForm = document.getElementById("eventForm");
    if(addForm) {
        addForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const eventData = {
                eventName: document.getElementById("eventName").value,
                eventDate: document.getElementById("eventDate").value,
                eventTime: document.getElementById("eventTime").value,
                eventPlace: document.getElementById("eventPlace").value,
                eventDescription: document.getElementById("eventDescription").value,
                eventImage: document.getElementById("eventImage").value
            };

            fetch("/api/events/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData)
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to add event");
                return response.json();
            })
            .then(data => {
                showToast("Event added successfully: " + data.eventName);
                addForm.reset();
                showEventForm(null);
                fetchEventsDropdown();
                loadEventsForRegistrationDropdown();
            })
            .catch(error => {
                console.error("Error:", error);
                showToast("Error adding event", true);
            });
        });
    }

    // Update Event Selector
    const updateSelect = document.getElementById("updateEventSelect");
    if(updateSelect) {
        updateSelect.addEventListener("change", async (e) => {
            const eventId = e.target.value;
            if (!eventId) return;
            try {
                const res = await fetch(`/api/events/${eventId}`);
                if (!res.ok) throw new Error('Failed to fetch event details');
                const data = await res.json();

                document.getElementById("updateEventName").value = data.eventName || "";
                document.getElementById("updateEventDate").value = data.eventDate || "";
                document.getElementById("updateEventTime").value = data.eventTime || "";
                document.getElementById("updateEventPlace").value = data.eventPlace || "";
                document.getElementById("updateEventDescription").value = data.eventDescription || "";
                document.getElementById("updateEventImage").value = data.eventImage || "";
            } catch (error) {
                console.error("Error:", error);
                showToast("Error loading event details", true);
            }
        });
    }

    // Update Form Submit
    const updateForm = document.getElementById("updateForm");
    if(updateForm) {
        updateForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const eventId = document.getElementById("updateEventSelect").value;
            if (!eventId) {
                showToast("Please select an event to update", true);
                return;
            }

            const payload = {
                eventName: document.getElementById("updateEventName").value,
                eventDate: document.getElementById("updateEventDate").value,
                eventTime: document.getElementById("updateEventTime").value,
                eventPlace: document.getElementById("updateEventPlace").value,
                eventDescription: document.getElementById("updateEventDescription").value,
                eventImage: document.getElementById("updateEventImage").value
            };

            try {
                const response = await fetch(`/api/events/update/${eventId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error("Failed to update event");
                showToast("Event updated successfully");
                fetchEventsDropdown();
                showEventForm(null);
            } catch (error) {
                showToast("Error updating event", true);
            }
        });
    }

    // Delete Form Submit
    const deleteForm = document.getElementById("deleteForm");
    if(deleteForm) {
        deleteForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const eventId = document.getElementById("deleteEventSelect").value;
            if (!eventId) {
                showToast("Please select an event to delete", true);
                return;
            }
            if (confirm("Are you sure you want to delete this event?")) {
                try {
                    const res = await fetch(`/api/events/delete/${eventId}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete event");
                    showToast("Event deleted successfully");
                    fetchEventsDropdown();
                    showEventForm(null);
                } catch (error) {
                    showToast("Error deleting event", true);
                }
            }
        });
    }
}

async function fetchEventsDropdown() {
    try {
        const res = await fetch("/api/events/all");
        if (!res.ok) throw new Error('Failed to fetch events');
        const events = await res.json();

        // Update dropdowns for Update/Delete sections
        const updateSel = document.getElementById("updateEventSelect");
        const deleteSel = document.getElementById("deleteEventSelect");
        
        if (updateSel) updateSel.innerHTML = `<option value="" disabled selected>Select an event</option>`;
        if (deleteSel) deleteSel.innerHTML = `<option value="" disabled selected>Select an event</option>`;
        
        const tbody = document.getElementById("eventsTableBody");
        if (tbody) tbody.innerHTML = "";

        events.forEach(event => {
            const opt = new Option(event.eventName, event.eventId);
            if(updateSel) updateSel.appendChild(opt.cloneNode(true));
            if(deleteSel) deleteSel.appendChild(opt.cloneNode(true));

            if(tbody) {
                tbody.innerHTML += `
                  <tr>
                    <td>${event.eventName}</td>
                    <td>${event.eventDate}</td>
                    <td>${event.eventTime}</td>
                    <td>${event.eventPlace}</td>
                    <td>${event.eventDescription}</td>
                  </tr>`;
            }
        });
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// --- 3. STUDENT MANAGEMENT LOGIC ---

// Expose these to window so onclick="showsection(...)" works
window.showStudentSection = function(sectionId) {
    const sections = ['addStudentForm', 'updateStudentForm', 'deleteStudentForm', 'viewStudentSection'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });

    if (sectionId === 'updateStudentForm' || sectionId === 'deleteStudentForm') {
        populateStudentDropdowns();
    }
    if (sectionId === 'viewStudentSection') {
        viewStudents();
    }
};

window.submitStudent = function(e, action) {
    e.preventDefault();
    let regId, data, url, method;

    if (action === 'add') {
        data = {
            registrationId: document.getElementById("addRegId").value,
            email: document.getElementById("addEmail").value,
            password: document.getElementById("addPassword").value
        };
        url = '/students/add';
        method = 'POST';
    } 
    else if (action === 'update') {
        regId = document.getElementById("updateRegId").value;
        data = {
            registrationId: regId,
            email: document.getElementById("updateEmail").value,
            password: document.getElementById("updatePassword").value
        };
        url = `/students/update/${regId}`;
        method = 'PUT';
    } 
    else if (action === 'delete') {
        regId = document.getElementById("deleteRegId").value;
        url = `/students/delete/${regId}`;
        method = 'DELETE';
        data = null;
    }

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: method !== 'DELETE' ? JSON.stringify(data) : null
    })
    .then(res => res.text())
    .then(msg => {
        showToast(msg, false);
        const form = document.querySelector(`#${action}StudentForm form`);
        if(form) form.reset();
        viewStudents();
        populateStudentDropdowns();
    })
    .catch(err => {
        console.error(err);
        showToast("Error: " + err.message, true);
    });
};

function setupStudentForms() {
    // Search listener
    const searchInput = document.getElementById('studentSearch');
    if(searchInput) {
        searchInput.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            const rows = document.querySelector("#studentTable tbody").getElementsByTagName('tr');
            Array.from(rows).forEach(row => {
                const regId = row.getElementsByTagName('td')[0].textContent.toLowerCase();
                const email = row.getElementsByTagName('td')[1].textContent.toLowerCase();
                row.style.display = (regId.includes(filter) || email.includes(filter)) ? "" : "none";
            });
        });
    }

    // Auto-fill update fields when dropdown changes
    const updateSelect = document.getElementById('updateSelect');
    if(updateSelect) {
        updateSelect.addEventListener('change', function() {
            const selectedId = this.value;
            if (!selectedId) return;
            fetch(`/students/${selectedId}`)
            .then(res => res.json())
            .then(student => {
                document.getElementById("updateRegId").value = student.registrationId;
                document.getElementById("updateEmail").value = student.email;
                document.getElementById("updatePassword").value = student.password;
            });
        });
    }
}

function viewStudents() {
    fetch("/students/all")
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector("#studentTable tbody");
            if(tbody) {
                tbody.innerHTML = "";
                data.forEach(s => {
                    tbody.innerHTML += `
                    <tr>
                    <td>${s.registrationId}</td>
                    <td>${s.email}</td>
                    <td>${s.password}</td>
                    </tr>`;
                });
            }
        });
}

function populateStudentDropdowns() {
    fetch("/students/all")
        .then(res => res.json())
        .then(data => {
            const updateDropdown = document.getElementById('updateSelect');
            const deleteDropdown = document.getElementById('deleteRegId');

            if(updateDropdown) {
                updateDropdown.innerHTML = `<option value="" disabled selected>Select a student</option>`;
                data.forEach(s => updateDropdown.innerHTML += `<option value="${s.registrationId}">${s.registrationId} - ${s.email}</option>`);
            }
            if(deleteDropdown) {
                deleteDropdown.innerHTML = `<option value="" disabled selected>Select a student</option>`;
                data.forEach(s => deleteDropdown.innerHTML += `<option value="${s.registrationId}">${s.registrationId} - ${s.email}</option>`);
            }
        });
}


// --- 4. ADMIN ACCOUNT MANAGEMENT ---

// Expose to window for onclick buttons
window.showAdminSection = function(type) {
    const ids = ['addForm', 'editForm', 'deleteAForm', 'viewAdminsSection'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('d-none');
    });

    if (type === 'add') document.getElementById('addForm').classList.remove('d-none');
    else if (type === 'edit') document.getElementById('editForm').classList.remove('d-none');
    else if (type === 'delete') document.getElementById('deleteAForm').classList.remove('d-none');
    else if (type === 'viewAdmins') {
        document.getElementById('viewAdminsSection').classList.remove('d-none');
        fetchAdmins();
    }
};

function setupAdminForms() {
    const addBtn = document.getElementById('addAdminBtn'); 
    // Assuming buttons or forms exist with ids like addAdminForm, etc.
    // Based on provided code, the forms have submit buttons with `onclick` or listeners need to be added manually
    
    // Add Admin Form
    const addAdminForm = document.getElementById("addAdminFormElement"); // You might need to add this ID to your HTML form tag
    if (document.querySelector("#addForm button")) {
         // Binding via the provided code structure
         document.querySelector("#addForm button").addEventListener("click", addAdmin);
    }
    if (document.querySelector("#editForm button")) {
         document.querySelector("#editForm button").addEventListener("click", editAdmin);
    }
    if (document.querySelector("#deleteAForm button")) {
         document.querySelector("#deleteAForm button").addEventListener("click", deleteAdmin);
    }
}

function fetchAdmins() {
    fetch('/api/admins')
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#adminTable tbody');
            if(tbody) {
                tbody.innerHTML = '';
                data.forEach(admin => {
                    tbody.innerHTML += `<tr><td>${admin.userId}</td><td>${admin.name}</td><td>${admin.department}</td></tr>`;
                });
            }
            populateAdminDropdowns(data);
        });
}

function populateAdminDropdowns(admins) {
    const editDropdown = document.getElementById("editUserIdDropdown");
    const deleteDropdown = document.getElementById("deleteUserIdDropdown");
    
    if(editDropdown) editDropdown.innerHTML = `<option value="" disabled selected>Select Admin</option>`;
    if(deleteDropdown) deleteDropdown.innerHTML = `<option value="" disabled selected>Select Admin to Delete</option>`;
    
    admins.forEach(admin => {
        const option = `<option value="${admin.userId}">${admin.userId} - ${admin.name}</option>`;
        if(editDropdown) editDropdown.innerHTML += option;
        if(deleteDropdown) deleteDropdown.innerHTML += option;
    });
}

function addAdmin(e) {
    e.preventDefault();
    const userId = document.getElementById('addUserId').value.trim();
    const name = document.getElementById('addName').value.trim();
    const department = document.getElementById('addDept').value.trim();
    const password = document.getElementById('addPassword').value;

    if (!userId || !name || !department || !password) {
        showToast("Please fill in all fields.", true);
        return;
    }

    fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, department, password })
    })
    .then(res => res.ok ? res.json() : res.text().then(msg => { throw new Error(msg); }))
    .then(data => {
        showToast(`Admin ${data.name} added.`, false);
        fetchAdmins();
        document.getElementById('addForm').querySelector('form').reset();
    })
    .catch(err => showToast(err.message, true));
}

function editAdmin(e) {
    e.preventDefault();
    const userId = document.getElementById('editUserIdDropdown').value;
    const name = document.getElementById('editName').value.trim();
    const department = document.getElementById('editDept').value.trim();
    const password = document.getElementById('editPassword').value;

    if (!userId) { showToast("Select admin.", true); return; }

    fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, department, password })
    })
    .then(res => res.ok ? res.json() : res.text().then(msg => { throw new Error(msg); }))
    .then(data => {
        showToast(`Admin ${data.name} updated.`, false);
        fetchAdmins();
        document.getElementById('editForm').querySelector('form').reset();
    })
    .catch(err => showToast(err.message, true));
}

function deleteAdmin(e) {
    e.preventDefault();
    const userId = document.getElementById('deleteUserIdDropdown').value;
    if (!userId) { showToast("Select admin.", true); return; }
    if (!confirm(`Delete Admin ${userId}?`)) return;

    fetch(`/api/admins/${userId}`, { method: 'DELETE' })
    .then(res => res.ok ? res.text() : Promise.reject())
    .then(msg => {
        showToast(msg, false);
        fetchAdmins();
    })
    .catch(() => showToast("Failed to delete.", true));
}

// --- 5. REGISTRATIONS VIEW LOGIC ---

function setupRegistrationView() {
    const eventSelect = document.getElementById("eventSelect");
    if(eventSelect) {
        eventSelect.addEventListener("change", (e) => {
            const eventId = e.target.value;
            if (eventId) loadStudents(eventId);
        });
    }
}

async function loadEventsForRegistrationDropdown() {
    try {
        const res = await fetch("/api/events/all");
        if (!res.ok) throw new Error("Failed to fetch events");
        const events = await res.json();
        const select = document.getElementById("eventSelect");
        if(select) {
            select.innerHTML = '<option value="" disabled selected>Select Event</option>';
            events.forEach(event => {
                const option = document.createElement("option");
                option.value = event.eventId;
                option.textContent = event.eventName;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error loading events:", error);
    }
}

async function loadStudents(eventId) {
    const container = document.getElementById("studentsContainer");
    if(!container) return;
    
    container.innerHTML = "<p>Loading registered students...</p>";
    try {
        const res = await fetch(`/api/event-registration?eventId=${encodeURIComponent(eventId)}`);
        if (!res.ok) throw new Error("Failed to fetch registered students");
        const students = await res.json();

        if (students.length === 0) {
            container.innerHTML = "<p class='no-data'>No students registered for this event yet.</p>";
            return;
        }

        const table = document.createElement("table");
        table.className = "table table-striped"; // Adding Bootstrap class for look
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Dept</th>
          </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        students.forEach(s => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${s.registrationId}</td>
            <td>${s.name}</td>
            <td>${s.collegeMailId}</td>
            <td>${s.phone}</td>
            <td>${s.department}</td>
          `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.innerHTML = "";
        container.appendChild(table);
    } catch (error) {
        container.innerHTML = "<p class='no-data'>Failed to load registered students.</p>";
    }
}