document.getElementById('payment-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/api/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Payment failed');
        }

        alert('Payment processed successfully. Check your email for the receipt.');
        window.location.href = "/FrontEnd/public/index.html";
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('An error occurred while processing your payment. Please try again.');
    }
});