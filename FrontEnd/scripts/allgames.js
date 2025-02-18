document.addEventListener("DOMContentLoaded", async function () {
    const gamesGrid = document.getElementById("all-games-grid");
    const searchInput = document.querySelector('.search-input');

    async function loadGames(searchTerm = "") {
        try {
            const url = searchTerm
                ? `/api/games/search?title=${encodeURIComponent(searchTerm)}`
                : "/api/games/getall";
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch games");
            const games = await response.json();
            gamesGrid.innerHTML = "";
            games.forEach((game) => {
                const gameCard = document.createElement("div");
                gameCard.classList.add("game-card");
                gameCard.innerHTML = `
                    <img src="${game.image_url}" alt="${game.title}">
                    <div class="game-info">
                        <h3>${game.title}</h3>
                        <p>${game.description}</p>
                        <p>Genre: ${game.genre}</p>
                        <p>Developer: ${game.developer}</p>
                        <p>Price: $${game.price.toFixed(2)}</p>
                        <button class="add-to-cart-btn" data-game-id="${game.id}">Add to Cart</button>
                    </div>
                `;
                gamesGrid.appendChild(gameCard);
            });

            // add event listeners for cart buttons
            addCartButtonListeners();
        } catch (error) {
            console.error("Failed to load games:", error);
        }
    }

    // function to add event listeners for cart buttons
    function addCartButtonListeners() {
        const isUserLoggedIn = !!localStorage.getItem("token");
        document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
            button.addEventListener("click", async function () {
                if (!isUserLoggedIn) {
                    window.location.href = "/FrontEnd/public/login.html";
                    return;
                }

                const gameId = this.getAttribute("data-game-id");
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`/api/cart`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            game_id: gameId,
                        }),
                    });
                    if (!response.ok) {
                        throw new Error("Failed to add to cart");
                    }

                    // Change button style on success
                    this.textContent = "Added";
                    this.style.backgroundColor = "gray";
                    this.style.cursor = "not-allowed";
                    this.disabled = true;
                } catch (error) {
                    console.error("Error:", error);
                    alert("An error occurred while adding to cart");
                }
            });
        });
    }

    loadGames();

    // add event listener for search input
    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.trim();
        loadGames(searchTerm);
    });
});
