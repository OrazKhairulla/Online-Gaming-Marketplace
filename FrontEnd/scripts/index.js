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