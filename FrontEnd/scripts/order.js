document.addEventListener('DOMContentLoaded', async function () {
    const orderContainer = document.getElementById('order-items');
    const orderTotal = document.getElementById('order-total');

    try {
        console.log("Fetching orders...");
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
        console.log("Orders received:", data);

        if (!data.orders || data.orders.length === 0) {
            orderContainer.innerHTML = '<p>No pending orders found.</p>';
            orderTotal.textContent = '0.00';
            return;
        }

        orderContainer.innerHTML = '';
        let totalAmount = 0;
        let hasPendingOrders = false;

        data.orders.forEach(order => {
            if (order.status === 'pending') {
                hasPendingOrders = true;

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

                // add complete order button
                const completeButton = document.createElement('button');
                completeButton.textContent = 'Complete Order';
                completeButton.classList.add('order-complete-btn');
                completeButton.addEventListener('click', async function () {
                    if (order._id) {
                        await completeOrder(order._id);
                    } else {
                        console.error("Order ID is undefined");
                        alert("Failed to complete order: Order ID is undefined.");
                    }
                });
                orderContainer.appendChild(completeButton);
            }
        });

        if (!hasPendingOrders) {
            orderContainer.innerHTML = '<p>No pending orders found.</p>';
            orderTotal.textContent = '0.00';
        } else {
            orderTotal.textContent = totalAmount.toFixed(2);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        orderContainer.innerHTML = `<p>Failed to load orders. Error: ${error.message}</p>`;
    }
});

async function completeOrder(orderID) {
    try {
        const response = await fetch(`/api/orders/complete/${orderID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to complete order. Status: ${response.status}`);
        }

        const data = await response.json();
        alert("Order completed successfully!");
        location.reload();
    } catch (error) {
        console.error('Error completing order:', error);
        alert(`Failed to complete order: ${error.message}`);
    }
}
