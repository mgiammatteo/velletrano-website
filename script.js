// List of items
const items = [
    'antipastiSmall', 'antipastiLarge', 'bresaola', 
    'insalataVerde', 
    'pastaPesto', 'pastaRagu', 'pastaAmatriciana', 'pastaCarbonara', 
    'pastaGricia','pastaArrabbiata', 'pastaPomodoro'
];

// Function to calculate the total amount based on selections
function calculateTotal() {
    let total = 0;

    items.forEach(item => {
        const checkbox = document.getElementById(item);
        if (checkbox && checkbox.checked) {
            const quantity = parseInt(document.getElementById(`${item}Quantity`).value);
            const price = parseFloat(checkbox.getAttribute('data-price'));
            total += quantity * price;
        }
    });

    // Update total amount display
    document.getElementById('totalAmount').textContent = `Total Amount: £${total}`;
}

// Enable quantity input when an item is selected
function toggleQuantityInput(itemId, quantityId) {
    const itemCheckbox = document.getElementById(itemId);
    const quantityInput = document.getElementById(quantityId);
    if (itemCheckbox.checked) {
        quantityInput.disabled = false;
    } else {
        quantityInput.disabled = true;
        quantityInput.value = 1; // Reset quantity to 1 if unchecked
    }
}

// Event listeners for item selection checkboxes
items.forEach(item => {
    const checkbox = document.getElementById(item);
    if (checkbox) {
        checkbox.addEventListener('change', () => {
            toggleQuantityInput(item, `${item}Quantity`);
            calculateTotal();
        });
    }
});

// Event listeners for quantity input changes
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', calculateTotal);
});

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
    const name = document.getElementById('name').value;
    const collectionDateTime = document.getElementById('collectionDateTime').value;
    const orderDetails = items
        .filter(item => document.getElementById(item).checked)
        .map(item => `${item.replace(/([A-Z])/g, ' $1')}: ${document.getElementById(item).getAttribute('data-price')} x ${document.getElementById(`${item}Quantity`).value}`)
        .join('<br>');
    const totalAmount = document.getElementById('totalAmount').textContent.replace('Total Amount: £', '');

    // Store order details and total amount in localStorage
    localStorage.setItem('orderDetails', `<strong>Order for ${name}:</strong> <br> ${orderDetails}`);
    localStorage.setItem('collectionDateTime', collectionDateTime);
    localStorage.setItem('totalAmount', totalAmount);

    // Redirect to payment page
    window.location.href = 'payment.html';
});

document.getElementById('collectionDateTime').addEventListener('input', function(event) {
    const input = event.target;
    const selectedDateTime = new Date(input.value);
    const day = selectedDateTime.getDay();  // 0 for Sunday, 6 for Saturday
    const hour = selectedDateTime.getHours();
    const minute = selectedDateTime.getMinutes();

    // Check if it's Friday (5), Saturday (6), or Sunday (0)
    if (day !== 5 && day !== 6 && day !== 0) {
        alert('Please select a Friday, Saturday, or Sunday.');
        input.value = '';
    }

    // Check if time is between 6pm and 9pm (18:00 to 21:00)
    if (hour < 18 || hour > 21 || (hour === 21 && minute > 0)) {
        alert('Please select a time between 6pm and 9pm.');
        input.value = '';
    }
});




