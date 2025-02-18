document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    const authMessage = document.getElementById('auth-message');
    const cartContent = document.querySelector('.cart-content');

    if (username) {
        cartContent.style.display = 'block';
        loadCartItems();
    } else {
        authMessage.style.display = 'block';
    }

    async function loadCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        let cartTotal = 0;

        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch cart items: ${response.status}`);

            const cartData = await response.json();
            if (!cartData.items || cartData.items.length === 0) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                document.querySelector('.cart-total p').textContent = 'Total: $0.00';
                return;
            }

            cartItemsContainer.innerHTML = '';

            for (const item of cartData.items) {
                const gameResponse = await fetch(`/api/games/${item.game_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!gameResponse.ok) throw new Error('Failed to fetch game details');

                const gameData = await gameResponse.json();

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${gameData.image_url}" alt="${gameData.title}">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${gameData.title}</h3>
                        <p class="cart-item-price">$${gameData.price.toFixed(2)}</p>
                    </div>
                    <button class="remove-from-cart-btn" data-id="${item.game_id}">Remove</button>
                `;

                cartItemsContainer.appendChild(cartItemDiv);
                cartTotal += gameData.price;
            }

            document.querySelector('.cart-total p').textContent = `Total: $${cartTotal.toFixed(2)}`;

            document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const gameID = button.dataset.id;
                    try {
                        const deleteResponse = await fetch(`/api/cart/${gameID}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });

                        if (!deleteResponse.ok) throw new Error('Failed to remove item from cart');

                        button.parentElement.remove();
                        cartTotal -= parseFloat(button.parentElement.querySelector('.cart-item-price').textContent.replace('$', ''));
                        document.querySelector('.cart-total p').textContent = `Total: $${cartTotal.toFixed(2)}`;

                        if (cartItemsContainer.children.length === 0) {
                            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                            document.querySelector('.cart-total p').textContent = 'Total: $0.00';
                        }
                    } catch (error) {
                        console.error('Error removing item from cart:', error);
                    }
                });
            });
        } catch (error) {
            console.error('Error loading cart items:', error);
            cartItemsContainer.innerHTML = '<p>Failed to load cart items. Please try again later.</p>';
        }
    }

    document.querySelector('.buy-all-button').addEventListener('click', async function () {
        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch cart items');

            const cartData = await response.json();
            if (!cartData.items || cartData.items.length === 0) {
                alert('Your cart is empty.');
                return;
            }

            let cartTotal = 0;
            const games = [];

            for (const item of cartData.items) {
                const gameResponse = await fetch(`/api/games/${item.game_id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!gameResponse.ok) throw new Error('Failed to fetch game details');

                const gameData = await gameResponse.json();
                games.push({ game_id: item.game_id });
                cartTotal += gameData.price;
            }

            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ items: games, total: cartTotal })
            });

            if (!orderResponse.ok) throw new Error('Failed to create order');

            alert('Order placed successfully!');
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            document.querySelector('.cart-total p').textContent = 'Total: $0.00';

            await fetch('/api/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            window.location.href = '/FrontEnd/public/order.html';
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again later.');
        }
    });
});