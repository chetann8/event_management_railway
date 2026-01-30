//javascript function to load events on home page
document.addEventListener("DOMContentLoaded", function () {
      fetch('/api/events/all')
        .then(response => {
          if (!response.ok) throw new Error('Failed to fetch events.');
          return response.json();
        })
        .then(events => {
          console.log("Fetched events: ", events); // TEMP LOG
          const container = document.getElementById("eventCardsContainer");
          if (events.length === 0) {
            container.innerHTML = "<p>No events available.</p>";
            return;
          }

          events.forEach(event => {
            const col = document.createElement("div");
            col.className = "col-md-4";

			col.innerHTML = `
			  <div class="flip-container">
			    <div class="flipper">
			      <div class="front">
			        <img src="${event.eventImage}" alt="${event.eventName}" class="img-fluid" style="max-height: 200px; object-fit: cover;">
			        <h3>${event.eventName}</h3>
			      </div>
			      <div class="back">
			        <div>
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
          document.getElementById("eventCardsContainer").innerHTML = "<p class='text-danger'>Failed to load events.</p>";
          console.error(error);
        });
    });
	
	//Optional JavaScript to toggle between forms
	// Elements
	    const loginBtn = document.getElementById("loginBtn");
	    const signupBtn = document.getElementById("signupBtn");
	    const loginForm = document.getElementById("loginForm");
	    const signupForm = document.getElementById("signupForm");

	    // Event Listeners
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

	    // Default to show the login form initially
	    loginForm.classList.remove("d-none");
	    signupForm.classList.add("d-none");
		const loginMessage = document.getElementById("loginMessage");
		const signupMessage = document.getElementById("signupMessage");
		function clearMessages() {
		  loginMessage.textContent = "";
		  loginMessage.className = "message";
		  signupMessage.textContent = "";
		  signupMessage.className = "message";
		}

		// AJAX for login
		document.getElementById("loginFormElement").addEventListener("submit", function(e) {
		  e.preventDefault();
		  clearMessages();

		  const registrationId = document.getElementById("loginRegistrationID").value.trim();
		  const password = document.getElementById("loginPassword").value.trim();

		  fetch("/students/login", {
		    method: "POST",
		    headers: {
		      "Content-Type": "application/x-www-form-urlencoded"
		    },
		    body: new URLSearchParams({
		      registrationId: registrationId,
		      password: password
		    })
		  })
		  .then(response => response.text())
		  .then(text => {
		    if (text.includes("Successful")) {
		      loginMessage.textContent = text;
		      loginMessage.classList.add("success");

		      // ✅ Redirect to event_registration.html
		      setTimeout(() => {
		        window.location.href = "event-registration";
		      }, 1000);
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


		      // AJAX for signup
		      document.getElementById("signupFormElement").addEventListener("submit", function(e) {
		        e.preventDefault();
		        clearMessages();

		        const registrationId = document.getElementById("signupRegistrationID").value.trim();
		        const email = document.getElementById("signupEmail").value.trim();
		        const password = document.getElementById("signupPassword").value.trim();
		        const confirmPassword = document.getElementById("signupConfirmPassword").value.trim();

		        // Simple client-side check for password match before sending request
		        if(password !== confirmPassword) {
		          signupMessage.textContent = "Passwords do not match!";
		          signupMessage.classList.add("error");
		          return;
		        }

		        fetch("/students/signup", {
		          method: "POST",
		          headers: {
		            "Content-Type": "application/x-www-form-urlencoded"
		          },
		          body: new URLSearchParams({
		            registrationId: registrationId,
		            email: email,
		            password: password,
		            confirmPassword: confirmPassword
		          })
		        })
		        .then(response => response.text())
		        .then(text => {
		          if(text.includes("Successful")) {
		            signupMessage.textContent = text;
		            signupMessage.classList.add("success");
		            // Optional: clear the form
		            document.getElementById("signupFormElement").reset();
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
			  
			  document.getElementById("adminLoginForm").addEventListener("submit", function (e) {
			        e.preventDefault();
			        const username = document.getElementById("adminUsername").value.trim();
			        const password = document.getElementById("adminPassword").value.trim();
			        const errorDiv = document.getElementById("adminLoginError");

			        fetch("http://localhost:8080/api/admins/login", {
			          method: "POST",
			          headers: {
			            "Content-Type": "application/json"
			          },
			          body: JSON.stringify({
			            userId: username,
			            password: password
			          })
			        })
			          .then(response => {
			            if (response.ok) {
			              window.location.href = "/admin"; // redirect on success
			            } else {
			              errorDiv.classList.remove("d-none");
			            }
			          })
			          .catch(err => {
			            errorDiv.classList.remove("d-none");
			          });
			      });
				  
				  document.addEventListener("DOMContentLoaded", function () {
				        fetch("EventFetchServlet")
				          .then(response => response.json())
				          .then(events => {
				            const container = document.getElementById("eventCardsContainer");
				            events.forEach(event => {
				              const card = document.createElement("div");
				              card.className = "col-md-4";
				              card.innerHTML = `
				                <div class="flip-container">
				                  <div class="flipper">
				                    <div class="front">
				                      <h3>${event.name}</h3>
				                    </div>
				                    <div class="back">
				                      <p>${event.description}</p>
				                    </div>
				                  </div>
				                </div>`;
				              container.appendChild(card);
				            });
				          })
				          .catch(error => console.error("Error loading events:", error));
				      });

				      // Scroll up button
				      const scrollBtn = document.getElementById("scrollUpBtn");
				      scrollBtn.addEventListener("click", () => {
				        window.scrollTo({ top: 0, behavior: "smooth" });
				      });
					  
					  // Admin login functionality
					      //document.getElementById("adminLoginForm").addEventListener("submit", function(e) {
					        //e.preventDefault();
					        //const username = document.getElementById("adminUsername").value.trim();
					        //const password = document.getElementById("adminPassword").value.trim();
					        //const errorDiv = document.getElementById("adminLoginError");
					        //const loginContainer = document.getElementById("adminLoginContainer");
					        //const adminContent = document.getElementById("adminContent");

					        //if (username === "admin" && password === "shang") {
					          //// Success
					          //loginContainer.classList.add("d-none");
					          //adminContent.classList.remove("d-none");
					        //} else {
					          //// Error
					          //errorDiv.classList.remove("d-none");
					        //}
					      //});		
						  
			  