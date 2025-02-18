// Updated order.js
document.addEventListener('DOMContentLoaded', async function () {
    const orderItemsContainer = document.getElementById('order-items');
    const orderTotalElement = document.getElementById('order-total');

    try {
        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

        const cartData = await response.json();
        let orderTotal = 0;

        cartData.items.forEach(item => {
            const orderItemDiv = document.createElement('div');
            orderItemDiv.classList.add('order-item');
            orderItemDiv.innerHTML = `
                <p>${item.title}</p>
                <p>$${item.price.toFixed(2)}</p>
            `;
            orderItemsContainer.appendChild(orderItemDiv);
            orderTotal += item.price;
        });

        orderTotalElement.textContent = orderTotal.toFixed(2);
    } catch (error) {
        console.error('Error loading order items:', error);
        alert('Failed to load order items. Please try again later.');
    }
});

function redirectToPaymentPage() {
    window.location.href = "/FrontEnd/public/payment.html";
}
