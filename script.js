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

            // Store item selection in localStorage
            sessionStorage.setItem(item, checkbox.checked);
        });
    }
});

// Event listeners for quantity input changes
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function () {
        calculateTotal();

        // Store quantity in localStorage
        const item = input.id.replace('Quantity', ''); // Extract item name from quantity id
        sessionStorage.setItem(`${item}Quantity`, input.value);
    });
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

// Handle name input changes and save to sessionStorage
document.getElementById('name').addEventListener('input', function () {
    sessionStorage.setItem('customerName', this.value);
});

// Handle collection date changes and store to sessionStorage
document.getElementById('collectionDateTime').addEventListener('input', function () {
    sessionStorage.setItem('collectionDateTime', this.value);
});

// Check that customer provided date and time are valid
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

// Time slots functionality
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALpPjf1T2lH5uJAxMCbzudaP8HBXwsZPM",
  authDomain: "velletrano-backend.firebaseapp.com",
  projectId: "velletrano-backend",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getAvailableSlots(date) {
    const q = query(collection(db, "bookings"), where("date", "==", date));
    const querySnapshot = await getDocs(q);
    const bookedSlots = [];
    
    querySnapshot.forEach((doc) => {
        bookedSlots.push(doc.data().time);
    });

    // All possible slots between 18:00 and 21:00 (every 15 minutes)
    const allSlots = [];
    for (let hour = 18; hour <= 21; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            // Add the 21:00 slot but skip any minutes after 21:00 (since it's the last slot)
            if (hour === 21 && minute > 0) break; 
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            allSlots.push(time);
        }
    }

    // Filter out the booked slots to get available slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    // Return available slots in increasing time order (no need for sorting, they are already ordered)
    return availableSlots;
}


// Function to book a time slot with a check to prevent double-booking
async function bookSlot(date, time) {
    try {
        // Check if the slot is already booked
        const q = query(collection(db, "bookings"), where("date", "==", date), where("time", "==", time));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Slot is already booked, show an error message
            document.getElementById('bookingMessage').innerHTML = 
                `Slot already booked: ${time} on ${date}`;
            document.getElementById('bookingMessage').style.color = "red";
        } else {
            // Slot is available, proceed with booking
            await addDoc(collection(db, "bookings"), { date: date, time: time });
            document.getElementById('bookingMessage').innerHTML = 
                `Slot booked: ${time} on ${date}`;
            document.getElementById('bookingMessage').style.color = "green";
        }
    } catch (e) {
        console.error("Error booking slot: ", e);
    }
}

// Function to display the available slots
document.getElementById('checkSlotsBtn').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission
    const dateAndTime = document.getElementById('collectionDateTime').value;
    document.getElementById('bookingMessage').innerHTML = ''; // Clear the message
    const date = dateAndTime.split('T')[0];
    const availableSlots = await getAvailableSlots(date);

    if (availableSlots.length > 0) {
        document.getElementById('availableSlotsResult').innerHTML = 
            'Available slots on selected Date: ' + availableSlots.join(', ');
    } else {
        document.getElementById('availableSlotsResult').innerHTML = 'No slots booked for this date.';
    }
});

// Function to book a slot
document.getElementById('bookSlotBtn').addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent form submission
    const dateAndTime = document.getElementById('collectionDateTime').value;
    document.getElementById('bookingMessage').innerHTML = ''; // Clear the message
    const date = dateAndTime.split('T')[0];
    const time = dateAndTime.split('T')[1];

    if (date && time) {
        await bookSlot(date, time);
        // document.getElementById('availableSlotsResult').innerHTML = 
        //     `Slot booked: ${time} on ${date}`;
    } else {
        alert('Please enter both date and time!');
    }
});

////////////////////////
// Restore functionality
////////////////////////
window.addEventListener('load', function () {
    // Restore name
    const storedName = sessionStorage.getItem('customerName');
    if (storedName) {
        document.getElementById('name').value = storedName;
    }

    // Restore Date and Time
    const storeDateAndTime = sessionStorage.getItem('collectionDateTime');
    if (storeDateAndTime) {
        document.getElementById('collectionDateTime').value = storeDateAndTime;
    }

    items.forEach(item => {
        const checkbox = document.getElementById(item);
        const quantityInput = document.getElementById(`${item}Quantity`);

        if (checkbox) {
            // Restore checkbox state
            const storedChecked = sessionStorage.getItem(item) === 'true';
            checkbox.checked = storedChecked;

            // Restore quantity if item was checked
            if (storedChecked) {
                const storedQuantity = sessionStorage.getItem(`${item}Quantity`) || 1;
                quantityInput.disabled = false;
                quantityInput.value = storedQuantity;
            } else {
                quantityInput.disabled = true;
                quantityInput.value = 1; // Reset quantity to default
            }
        }
    });

    calculateTotal(); // Recalculate total after restoring selections
});





