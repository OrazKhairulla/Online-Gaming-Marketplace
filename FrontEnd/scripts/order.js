document.addEventListener('DOMContentLoaded', async function () {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');

    try {
        console.log("Fetching orders..."); // Лог для отладки
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch orders. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Orders received:", data); // Лог полученных данных

        if (!data.orders || data.orders.length === 0) {
            orderContainer.innerHTML = '<p>No orders found.</p>';
            orderTotal.textContent = '0.00';
            return;
        }

        orderContainer.innerHTML = ''; // Очищаем контейнер
        let totalAmount = 0;

        data.orders.forEach(order => {
            order.games.forEach(game => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('order-item');
                orderItem.innerHTML = `
                    <div class="order-item-details">
                        <h3>${game.title}</h3>
                        <p>Price: $${game.price.toFixed(2)}</p>
                    </div>
                `;
                orderContainer.appendChild(orderItem);
                totalAmount += game.price;
            });
        });

        orderTotal.textContent = totalAmount.toFixed(2);
    } catch (error) {
        console.error('Error loading orders:', error);
        orderContainer.innerHTML = `<p>Failed to load orders. Error: ${error.message}</p>`;
    }
});
