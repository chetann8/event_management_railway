// index.js - Handles Home Page, Event Cards, and Login/Signup

document.addEventListener("DOMContentLoaded", function () {
    loadPublicEvents();
    setupAuthForms();
    setupScrollButton();
});

// --- 1. Load Events for Public View (Cards) ---
function loadPublicEvents() {
    fetch('/api/events/all')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch events.');
            return response.json();
        })
        .then(events => {
            const container = document.getElementById("eventCardsContainer");
            if (!container) return; // Guard clause if running on a page without this container

            if (events.length === 0) {
                container.innerHTML = "<p>No events available.</p>";
                return;
            }

            container.innerHTML = ""; // Clear loading text
            events.forEach(event => {
                const col = document.createElement("div");
                col.className = "col-md-4";
                
                // Handle image source (base64 or URL)
                const imageSrc = event.eventImage && event.eventImage.startsWith("data:image") 
                    ? event.eventImage 
                    : event.eventImage || 'placeholder.jpg'; 

                col.innerHTML = `
                  <div class="flip-container">
                    <div class="flipper">
                      <div class="front">
                        <img src="${imageSrc}" alt="${event.eventName}" class="img-fluid" style="height: 200px; width: 100%; object-fit: cover;">
                        <h3 class="mt-2">${event.eventName}</h3>
                      </div>
                      <div class="back">
                        <div class="p-3">
                          <p><strong>Venue:</strong> ${event.eventPlace}</p>
                          <p><strong>Date:</strong> ${event.eventDate}</p>
                          <p><strong>Time:</strong> ${event.eventTime}</p>
                          <p><strong>Description:</strong> ${event.eventDescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                container.appendChild(col);
            });
        })
        .catch(error => {
            const container = document.getElementById("eventCardsContainer");
            if(container) container.innerHTML = "<p class='text-danger'>Failed to load events.</p>";
            console.error(error);
        });
}

// --- 2. Auth Form Toggles and Submission ---
function setupAuthForms() {
    const loginBtn = document.getElementById("loginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginMessage = document.getElementById("loginMessage");
    const signupMessage = document.getElementById("signupMessage");

    // Only run if elements exist (in case this script is loaded elsewhere)
    if (!loginBtn || !signupBtn) return;

    // Toggle Logic
    loginBtn.addEventListener("click", function() {
        loginForm.classList.remove("d-none");
        signupForm.classList.add("d-none");
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
    });

    signupBtn.addEventListener("click", function() {
        signupForm.classList.remove("d-none");
        loginForm.classList.add("d-none");
        signupBtn.classList.add("active");
        loginBtn.classList.remove("active");
    });

    // Default state
    loginForm.classList.remove("d-none");
    signupForm.classList.add("d-none");

    function clearMessages() {
        if(loginMessage) { loginMessage.textContent = ""; loginMessage.className = "message"; }
        if(signupMessage) { signupMessage.textContent = ""; signupMessage.className = "message"; }
    }

    // Student Login Submit
    const loginFormEl = document.getElementById("loginFormElement");
    if (loginFormEl) {
        loginFormEl.addEventListener("submit", function(e) {
            e.preventDefault();
            clearMessages();

            const registrationId = document.getElementById("loginRegistrationID").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            fetch("/students/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ registrationId, password })
            })
            .then(response => response.text())
            .then(text => {
                if (text.includes("Successful")) {
                    loginMessage.textContent = text;
                    loginMessage.classList.add("success");
                    setTimeout(() => { window.location.href = "event-registration"; }, 1000);
                } else {
                    loginMessage.textContent = text;
                    loginMessage.classList.add("error");
                }
            })
            .catch(() => {
                loginMessage.textContent = "An error occurred. Please try again.";
                loginMessage.classList.add("error");
            });
        });
    }

    // Student Signup Submit
    const signupFormEl = document.getElementById("signupFormElement");
    if (signupFormEl) {
        signupFormEl.addEventListener("submit", function(e) {
            e.preventDefault();
            clearMessages();

            const registrationId = document.getElementById("signupRegistrationID").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const password = document.getElementById("signupPassword").value.trim();
            const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

            if(password !== confirmPassword) {
                signupMessage.textContent = "Passwords do not match!";
                signupMessage.classList.add("error");
                return;
            }

            fetch("/students/signup", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ registrationId, email, password, confirmPassword })
            })
            .then(response => response.text())
            .then(text => {
                if(text.includes("Successful")) {
                    signupMessage.textContent = text;
                    signupMessage.classList.add("success");
                    signupFormEl.reset();
                } else {
                    signupMessage.textContent = text;
                    signupMessage.classList.add("error");
                }
            })
            .catch(() => {
                signupMessage.textContent = "An error occurred. Please try again.";
                signupMessage.classList.add("error");
            });
        });
    }

    // Admin Login Submit
    const adminLoginForm = document.getElementById("adminLoginForm");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const username = document.getElementById("adminUsername").value.trim();
            const password = document.getElementById("adminPassword").value.trim();
            const errorDiv = document.getElementById("adminLoginError");

            // Use relative path for Railway compatibility
            fetch("/api/admins/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: username, password: password })
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = "/admin"; // Ensure this matches your admin HTML file name
                } else {
                    if(errorDiv) errorDiv.classList.remove("d-none");
                }
            })
            .catch(err => {
                if(errorDiv) errorDiv.classList.remove("d-none");
            });
        });
    }
}

// --- 3. Scroll Up Button ---
function setupScrollButton() {
    const scrollBtn = document.getElementById("scrollUpBtn");
    if (scrollBtn) {
        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
}