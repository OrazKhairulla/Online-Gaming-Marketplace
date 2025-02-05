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

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) { // Проверяем, что searchInput существует
        const gameCardsSearch = document.querySelectorAll('.game-card');

        searchInput.addEventListener('input', function() {
            const searchTerm = searchInput.value.toLowerCase();

            gameCardsSearch.forEach(card => {
                const gameTitle = card.querySelector('h3').textContent.toLowerCase();
                if (gameTitle.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const gameTitle = button.dataset.gameTitle;
            const gameImage = button.dataset.gameImage;

            // Get existing cart items from localStorage
            let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

            // Add new item to cart
            cartItems.push({
                title: gameTitle,
                image: gameImage,
                quantity: 1 // You can adjust quantity later
            });

            // Save updated cart items to localStorage
            localStorage.setItem('cartItems', JSON.stringify(cartItems));

            alert(`${gameTitle} added to cart!`); // Optional feedback message
        });
    });

    // Cart page functionality
    const cartItemsContainer = document.querySelector('.cart-items');
    if (cartItemsContainer) { //* добавил проверку, чтобы скрипт выполнялся только на странице корзины*/
        let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        let cartTotal = 0;

        cartItems.forEach((item, index) => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');

            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-price">$59.99</p>
                </div>
                <div class="cart-item-quantity">
                    <label for="quantity${index}">Quantity:</label>
                    <input type="number" id="quantity${index}" name="quantity${index}" value="${item.quantity}" min="1">
                </div>
                <button class="remove-from-cart-btn" data-index="${index}">Remove</button>
            `;

            cartItemsContainer.appendChild(cartItemDiv);
            cartTotal += 59.99 * item.quantity;
        });

        document.querySelector('.cart-total p').textContent = `Total: $${cartTotal.toFixed(2)}`;

        // Remove from cart functionality
        const removeFromCartButtons = document.querySelectorAll('.remove-from-cart-btn');
        removeFromCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const indexToRemove = parseInt(button.dataset.index);

                // Remove item from cartItems array
                cartItems.splice(indexToRemove, 1);

                // Save updated cart items to localStorage
                localStorage.setItem('cartItems', JSON.stringify(cartItems));

                // Reload cart page
                location.reload();
            });
        });
    }
});