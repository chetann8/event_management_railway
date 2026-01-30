//JS Logic for admin dashboard

    // Fetch all events to populate dropdown
    async function loadEvents() {
      try {
        const res = await fetch("http://localhost:8080/api/events/all");
        if (!res.ok) throw new Error("Failed to fetch events");
        const events = await res.json();
        const select = document.getElementById("eventSelect");
        events.forEach(event => {
          const option = document.createElement("option");
          option.value = event.eventId;
          option.textContent = event.eventName;
          select.appendChild(option);
        });
      } catch (error) {
        console.error("Error loading events:", error);
        //alert("Error loading events, please try again later.");
      }
    }
	
    // Fetch students registered to a specific event
    async function loadStudents(eventId) {
      const container = document.getElementById("studentsContainer");
      container.innerHTML = "<p>Loading registered students...</p>";
      try {
        const res = await fetch(`http://localhost:8080/api/event-registration?eventId=${encodeURIComponent(eventId)}`);
        if (!res.ok) throw new Error("Failed to fetch registered students");
        const students = await res.json();

        if (students.length === 0) {
          container.innerHTML = "<p class='no-data'>No students registered for this event yet.</p>";
          return;
        }

        // Create table
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th>Registration ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Program</th>
            <th>School</th>
            <th>Course</th>
            <th>Year</th>
            <th>Semester</th>
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
            <td>${s.program}</td>
            <td>${s.school}</td>
            <td>${s.department}</td>
            <td>${s.year}</td>
            <td>${s.semester}</td>
          `;
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.innerHTML = "";
        container.appendChild(table);
      } catch (error) {
        console.error("Error loading registered students:", error);
        container.innerHTML = "<p class='no-data'>Failed to load registered students.</p>";
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      loadEvents();

      document.getElementById("eventSelect").addEventListener("change", (e) => {
        const eventId = e.target.value;
        if (eventId) {
          loadStudents(eventId);
        }
      });
    });



//JS Logic for event

	// IDs of all event forms
	const eventForms = [
	  'add-event-form',
	  'update-event-form',
	  'delete-event-form',
	  'view-event-form'
	];

	// Show only one event form or hide all if formId=null
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

	// Navigation buttons and sections
	const navButtons = document.querySelectorAll('.nav-btn');
	const sections = document.querySelectorAll('.content-section');
	const sectionTitle = document.getElementById('sectionTitle');

	navButtons.forEach(button => {
	  button.addEventListener('click', () => {
	    // Highlight active nav button
	    navButtons.forEach(btn => btn.classList.remove('active'));
	    button.classList.add('active');

	    // Show corresponding section
	    const target = button.getAttribute('data-section');
	    sections.forEach(section => section.classList.remove('active'));
	    document.getElementById(target).classList.add('active');

	    // Update section title
	    sectionTitle.innerText = button.innerText.trim();

	    // Hide all event forms on section switch
	    showEventForm(null);
	  });
	});

	// Toggle functions for event forms (toggle show/hide)
	function toggleAddEventForm() {
	  const form = document.getElementById('add-event-form');
	  if (form.classList.contains('show')) {
	    showEventForm(null);
	  } else {
	    showEventForm('add-event-form');
	  }
	}

	function toggleUpdateEventForm() {
	  const form = document.getElementById('update-event-form');
	  if (form.style.display === 'block') {
	    showEventForm(null);
	  } else {
	    showEventForm('update-event-form');
	  }
	}

	function toggleDeleteEventForm() {
	  const form = document.getElementById('delete-event-form');
	  if (form.style.display === 'block') {
	    showEventForm(null);
	  } else {
	    showEventForm('delete-event-form');
	  }
	}

	function toggleViewEventForm() {
	  const form = document.getElementById('view-event-form');
	  if (form.style.display === 'block') {
	    showEventForm(null);
	  } else {
	    showEventForm('view-event-form');
	  }
	}

	// Add event form submission
	document.getElementById("eventForm").addEventListener("submit", function (e) {
	  e.preventDefault();

	  const eventData = {
	    eventName: document.getElementById("eventName").value,
	    eventDate: document.getElementById("eventDate").value,
	    eventTime: document.getElementById("eventTime").value,
	    eventPlace: document.getElementById("eventPlace").value,
	    eventDescription: document.getElementById("eventDescription").value,
	    eventImage: document.getElementById("eventImage").value
	  };

	  fetch("http://localhost:8080/api/events/add", {
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
	    this.reset();
	    showEventForm(null);
	    fetchEventsDropdown();
	  })
	  .catch(error => {
	    console.error("Error:", error);
	    showToast("Error adding event", true);
	  });
	});

	// Fetch events and populate dropdowns and table
	async function fetchEventsDropdown() {
	  try {
	    const res = await fetch("http://localhost:8080/api/events/all");
	    if (!res.ok) throw new Error('Failed to fetch events');
	    const events = await res.json();

	    // Update dropdowns
	    const updateSel = document.getElementById("updateEventSelect");
	    const deleteSel = document.getElementById("deleteEventSelect");
	    if (updateSel && deleteSel) {
	      updateSel.innerHTML = deleteSel.innerHTML = `<option value="" disabled selected>Select an event</option>`;
	      events.forEach(event => {
	        const opt = new Option(event.eventName, event.eventId);
	        updateSel.appendChild(opt.cloneNode(true));
	        deleteSel.appendChild(opt.cloneNode(true));
	      });
	    }

	    // Update table
	    const tbody = document.getElementById("eventsTableBody");
	    if (tbody) {
	      tbody.innerHTML = "";
	      events.forEach(ev => {
	        const row = `
	          <tr>
	            <td>${ev.eventName}</td>
	            <td>${ev.eventDate}</td>
	            <td>${ev.eventTime}</td>
	            <td>${ev.eventPlace}</td>
	            <td>${ev.eventDescription}</td>
	          </tr>`;
	        tbody.innerHTML += row;
	      });
	    }

	    // Update Event Cards on index.html
	    const container = document.getElementById("eventCardsContainer");
	    if (container) {
	      container.innerHTML = "";
	      events.forEach(event => {
	        const imageSource = event.eventImage.startsWith("data:image") ? event.eventImage : `data:image/jpeg;base64,${event.eventImage}`;
	        const card = `
	          <div class="col-md-4">
	            <div class="card bg-dark text-white h-100 shadow-lg">
	              <img src="${imageSource}" class="card-img-top" alt="${event.eventName}" style="height: 200px; object-fit: cover;">
	              <div class="card-body">
	                <h5 class="card-title">${event.eventName}</h5>
	                <p class="card-text"><strong>Date:</strong> ${event.eventDate}</p>
	                <p class="card-text"><strong>Time:</strong> ${event.eventTime}</p>
	                <p class="card-text"><strong>Place:</strong> ${event.eventPlace}</p>
	                <p class="card-text">${event.eventDescription}</p>
	              </div>
	            </div>
	          </div>`;
	        container.innerHTML += card;
	      });
	    }
	  } catch (error) {
	    console.error('Error fetching events:', error);
	    showToast('Error loading events', true);
	  }
	}


	// Update event select change handler to fill form with data
	document.getElementById("updateEventSelect").addEventListener("change", async (e) => {
	  const eventId = e.target.value;
	  if (!eventId) return;
	  try {
	    const res = await fetch(`http://localhost:8080/api/events/${eventId}`);
	    if (!res.ok) throw new Error('Failed to fetch event details');
	    const data = await res.json();

	    document.getElementById("updateEventName").value = data.eventName || "";
	    document.getElementById("updateEventDate").value = data.eventDate || "";
	    document.getElementById("updateEventTime").value = data.eventTime || "";
	    document.getElementById("updateEventPlace").value = data.eventPlace || "";
	    document.getElementById("updateEventDescription").value = data.eventDescription || "";
	    document.getElementById("updateEventImage").value = data.eventImage || "";

	  } catch (error) {
	    console.error("Error fetching event details:", error);
	    showToast("Error loading event details", true);
	  }
	});

	// Update event form submission
	document.getElementById("updateForm").addEventListener("submit", async function (e) {
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
	    const response = await fetch(`http://localhost:8080/api/events/update/${eventId}`, {
	      method: "PUT",
	      headers: { "Content-Type": "application/json" },
	      body: JSON.stringify(payload)
	    });

	    if (!response.ok) throw new Error("Failed to update event");

	    showToast("Event updated successfully");
	    await fetchEventsDropdown();
	    showEventForm(null);

	  } catch (error) {
	    console.error("Error updating event:", error);
	    showToast("Error updating event", true);
	  }
	});

	// Delete event form submission
	document.getElementById("deleteForm").addEventListener("submit", async function (e) {
	  e.preventDefault();
	  const eventId = document.getElementById("deleteEventSelect").value;
	  if (!eventId) {
	    showToast("Please select an event to delete", true);
	    return;
	  }
	  if (confirm("Are you sure you want to delete this event?")) {
	    try {
	      const res = await fetch(`http://localhost:8080/api/events/delete/${eventId}`, { method: "DELETE" });
	      if (!res.ok) throw new Error("Failed to delete event");

	      showToast("Event deleted successfully");
	      await fetchEventsDropdown();
	      showEventForm(null);

	    } catch (error) {
	      console.error("Error deleting event:", error);
	      showToast("Error deleting event", true);
	    }
	  }
	});

	// Initial fetch of events for dropdown and table
	fetchEventsDropdown();


//JS for student

  function showsection(sectionId) {
    const sections = ['addStudentForm', 'updateStudentForm', 'deleteStudentForm', 'viewStudentSection'];
    sections.forEach(id => {
      document.getElementById(id).style.display = (id === sectionId) ? 'block' : 'none';
    });

    if (sectionId === 'updateStudentForm' || sectionId === 'deleteStudentForm') {
      populateStudentDropdowns(); // load dropdowns when those forms are shown
    }

    if (sectionId === 'viewStudentSection') {
      viewStudents();
    }
  }

  function submitStudent(e, action) {
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
      document.querySelector(`#${action}StudentForm form`).reset();
      viewStudents();
      populateStudentDropdowns(); // refresh dropdowns
    })
	.catch(err => {
	  console.error(err);
	  showToast("Error: " + err.message, true); // true = error
	});
  }

  function viewStudents() {
    fetch("/students/all")
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector("#studentTable tbody");
        tbody.innerHTML = "";
        data.forEach(s => {
          tbody.innerHTML += `
            <tr>
              <td>${s.registrationId}</td>
              <td>${s.email}</td>
              <td>${s.password}</td>
            </tr>`;
        });
      });
  }

  function filterStudents() {
    const filter = document.getElementById('studentSearch').value.toLowerCase();
    const rows = document.querySelector("#studentTable tbody").getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
      const regId = row.getElementsByTagName('td')[0].textContent.toLowerCase();
      const email = row.getElementsByTagName('td')[1].textContent.toLowerCase();

      row.style.display = (regId.includes(filter) || email.includes(filter)) ? "" : "none";
    });
  }

  function populateStudentDropdowns() {
    fetch("/students/all")
      .then(res => res.json())
      .then(data => {
        const updateDropdown = document.getElementById('updateSelect');
        const deleteDropdown = document.getElementById('deleteRegId');

        updateDropdown.innerHTML = `<option value="" disabled selected>Select a student</option>`;
        deleteDropdown.innerHTML = `<option value="" disabled selected>Select a student</option>`;

        data.forEach(s => {
          const option = `<option value="${s.registrationId}">${s.registrationId} - ${s.email}</option>`;
          updateDropdown.innerHTML += option;
          deleteDropdown.innerHTML += option;
        });
      });
  }

  function fillUpdateFields() {
    const selectedId = document.getElementById('updateSelect').value;
    if (!selectedId) return;

    fetch(`/students/${selectedId}`)
      .then(res => res.json())
      .then(student => {
        document.getElementById("updateRegId").value = student.registrationId;
        document.getElementById("updateEmail").value = student.email;
        document.getElementById("updatePassword").value = student.password;
      });
  }

  // Call viewStudents initially
  document.addEventListener('DOMContentLoaded', () => {
    viewStudents();
  });








//JS Section for admin

  const API_URL = 'http://localhost:8080/api/admins';
  let adminVisible = false;

  function showSection(type) {
    // Hide all sections
	
    document.getElementById('addForm').classList.add('d-none');
    document.getElementById('editForm').classList.add('d-none');
    document.getElementById('deleteAForm').classList.add('d-none');
    document.getElementById('viewAdminsSection').classList.add('d-none');

    // Show the requested section
    if (type === 'add') {
      document.getElementById('addForm').classList.remove('d-none');
    } else if (type === 'edit') {
      document.getElementById('editForm').classList.remove('d-none');
    } else if (type === 'delete') {
      document.getElementById('deleteAForm').classList.remove('d-none');
    } else if (type === 'viewAdmins') {
      document.getElementById('viewAdminsSection').classList.remove('d-none');
      fetchAdmins();
    }
  }

  function fetchAdmins() {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector('#adminTable tbody');
        tbody.innerHTML = '';
        data.forEach(admin => {
          tbody.innerHTML += `<tr><td>${admin.userId}</td><td>${admin.name}</td><td>${admin.department}</td></tr>`;
        });
        populateAdminDropdowns(data);
      });
  }

  function populateAdminDropdowns(admins) {
    const editDropdown = document.getElementById("editUserIdDropdown");
    const deleteDropdown = document.getElementById("deleteUserIdDropdown");
    editDropdown.innerHTML = `<option value="" disabled selected>Select Admin</option>`;
    deleteDropdown.innerHTML = `<option value="" disabled selected>Select Admin to Delete</option>`;
    admins.forEach(admin => {
      const option = `<option value="${admin.userId}">${admin.userId} - ${admin.name}</option>`;
      editDropdown.innerHTML += option;
      deleteDropdown.innerHTML += option;
    });
  }

  function addAdmin(e) {
    e.preventDefault();

    const userId = document.getElementById('addUserId').value.trim();
    const name = document.getElementById('addName').value.trim();
    const department = document.getElementById('addDept').value.trim();
    const password = document.getElementById('addPassword').value;

    // Simple validation
    if (!userId || !name || !department || !password) {
      showToast("Please fill in all fields to add an admin.", true);
      return;
    }

    const admin = { userId, name, department, password };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    })
      .then(response => {
        if (response.status === 409) {
          // Conflict (already exists)
          return response.text().then(msg => { throw new Error(msg); });
        }
        if (!response.ok) {
          return response.text().then(msg => { throw new Error("Failed to add admin. " + msg); });
        }
        return response.json();
      })
      .then(data => {
        showToast(`Admin ${data.name} added successfully.`, false);
        fetchAdmins();
        e.target.reset();
      })
      .catch(error => {
        console.error("Add admin error:", error);
        showToast(error.message, true);
      });
  }


  function editAdmin(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserIdDropdown').value;
    const name = document.getElementById('editName').value.trim();
    const department = document.getElementById('editDept').value.trim();
    const password = document.getElementById('editPassword').value;

    // Basic validation
    if (!userId || !name || !department || !password) {
      showToast("Please fill in all fields to update the admin.", true);
      return;
    }

    const admin = { userId, name, department, password };

    fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    })
      .then(response => {
        if (response.status === 404) {
          return response.text().then(msg => { throw new Error(msg); });
        }
        if (!response.ok) {
          return response.text().then(msg => { throw new Error("Failed to update admin. " + msg); });
        }
        return response.json();
      })
      .then(data => {
        showToast(`Admin ${data.name} updated successfully.`, false);
        fetchAdmins();
        e.target.reset();
      })
      .catch(error => {
        console.error("Edit admin error:", error);
        showToast(error.message, true);
      });
  }


  function deleteAdmin(e) {
    e.preventDefault();

    const userId = document.getElementById('deleteUserIdDropdown').value;

    if (!userId) {
      showToast("Please select an admin to delete.", true);
      return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete Admin with ID: ${userId}?`);
    if (!confirmDelete) return;

    fetch(`${API_URL}/${userId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to delete admin.");
        return response.text();
      })
      .then(message => {
        showToast(message, false);
        fetchAdmins();
        e.target.reset();
      })
      .catch(error => {
        console.error("Delete failed:", error);
        showToast("An error occurred while deleting the admin.", true);
      });
  }

  window.onload = fetchAdmins;




	function showToast(message, isError) {
	  const toastEl = document.getElementById('toastMessage');
	  const toastBody = document.getElementById('toastBody');

	  // Set toast color
	  if (isError) {
	    toastEl.classList.remove('text-bg-success');
	    toastEl.classList.add('text-bg-danger');
	  } else {
	    toastEl.classList.remove('text-bg-danger');
	    toastEl.classList.add('text-bg-success');
	  }

	  toastBody.textContent = message;
	  const toast = new bootstrap.Toast(toastEl);
	  toast.show();
	}

