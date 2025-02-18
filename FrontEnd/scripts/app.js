document.addEventListener('DOMContentLoaded', function() {
    console.log('Game Log frontend loaded successfully!');

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
         menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
             if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
             }
         });
    }

    const gameCardsHover = document.querySelectorAll('.game-card');
    gameCardsHover.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const username = localStorage.getItem("username");
    const navList = document.querySelector("#user-nav");

    if (username) {
        navList.innerHTML = "";

        // add user and logout links
        const userElement = document.createElement("li");
        const logoutElement = document.createElement("li");

        // user link
        const userLink = document.createElement("a");
        userLink.href = "/FrontEnd/public/library.html";
        userLink.textContent = username;

        // logout link
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.textContent = "Logout";
        logoutLink.addEventListener("click", function () {
            // delete token and username from local storage
            localStorage.removeItem("username");
            window.location.href = "/FrontEnd/public/index.html";
        });

        userElement.appendChild(userLink);
        logoutElement.appendChild(logoutLink);
        navList.appendChild(userElement);
        navList.appendChild(logoutElement);
    }
});

// Account Information section
const usernameDisplay = document.getElementById('username-display');
const emailDisplay = document.getElementById('email-display');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');

if (usernameDisplay && emailDisplay && usernameInput && emailInput && editProfileBtn && saveProfileBtn) {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (username) {
        usernameDisplay.textContent = username;
        usernameInput.value = username;
    }

    if (email) {
        emailDisplay.textContent = email;
        emailInput.value = email;
    }

    editProfileBtn.addEventListener('click', function() {
        usernameDisplay.style.display = 'none';
        emailDisplay.style.display = 'none';
        usernameInput.style.display = 'inline';
        emailInput.style.display = 'inline';
        editProfileBtn.style.display = 'none';
        saveProfileBtn.style.display = 'inline';
    });

    saveProfileBtn.addEventListener('click', async function() {
        const newUsername = usernameInput.value;
        const newEmail = emailInput.value;

        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({ username: newUsername, email: newEmail })
            });

            if (response.ok) {
                // success handling
                console.log('Profile updated successfully!');
                localStorage.setItem('username', newUsername);

                // Update email if provided
                if (newEmail) {
                    localStorage.setItem('email', newEmail);
                    emailDisplay.textContent = newEmail;
                }

                usernameDisplay.textContent = newUsername;

            } else {
                // error handling
                console.error('Error updating profile:', response.statusText);
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred. Please try again later.');
        }

        // restore display
        usernameDisplay.style.display = 'inline';
        emailDisplay.style.display = 'inline';
        usernameInput.style.display = 'none';
        emailInput.style.display = 'none';
        editProfileBtn.style.display = 'inline';
        saveProfileBtn.style.display = 'none';
    });
}