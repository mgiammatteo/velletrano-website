// List of items
const items = [
    'antipastiSmall', 'antipastiLarge', 'bresaola', 
    'insalataVerde', 'pastaPomodoro', 'pastaArrabbiata', 'ravioliZucca', 
    'pastaAmatriciana', 'pastaCarbonara', 'pastaGricia', 'pastaPesto'
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

// Submit the form and display the order details
// document.getElementById('orderForm').addEventListener('submit', function (e) {
//     e.preventDefault(); // Prevent form submission for demo purposes
//     const name = document.getElementById('name').value;
//     alert(`Thank you, ${name}. Your order has been placed!`);
// });

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

// function saveOrderDetails() {
//     const collectionDateTime = document.getElementById('collectionDateTime').value;
//     localStorage.setItem('collectionDateTime', collectionDateTime);

//     const name = document.getElementById('name').value;
//     localStorage.setItem('name', name);
    
//     const orderDetails = document.getElementById('orderDetails').value;
//     localStorage.setItem('orderDetails', orderDetails);

//     const totalAmount = document.getElementById('totalAmount').value;
//     localStorage.setItem('totalAmount', totalAmount);

//     // Assuming you are already saving other order details to localStorage
//     //const orderDetails = '...'; // Replace with actual order details
//     //const totalAmount = '...';  // Replace with actual total amount
//     localStorage.setItem('orderDetails', orderDetails);
//     localStorage.setItem('totalAmount', totalAmount);

//     // Log values to console for debugging
//     console.log('Collection Date and Time:', collectionDateTime);
//     console.log('Customer Name:', name);
//     console.log('Order Details:', orderDetails);
//     console.log('Total Amount:', totalAmount);
    
//     // Display on the screen temporarily
//     const logElement = document.createElement('div');
//     logElement.innerHTML = `
//         <p>Collection Date and Time: ${collectionDateTime}</p>
//         <p>Order Details: ${orderDetails}</p>
//         <p>Total Amount: £${totalAmount}</p>
//     `;
    
//     document.body.appendChild(logElement); // Append the log to the body of the page
    
//     // Redirect to payment page
//     //window.location.href = "payment.html";
// }


