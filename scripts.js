//GPS Data Fetching 
let map, marker;

function initMap(latitude = 14.0005, longitude = 121.9287) {
    // Default location (Atimonan Port)
    const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    // Initialize the map
    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15
    });

    // Add a customizable marker
    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Current GPS Location",
        icon: {
            url: 'boat-icon.png',
            scaledSize: new google.maps.Size(70, 70),
        },
        animation: google.maps.Animation.DROP
    });
}

function fetchData() {
    fetch('controller.php') // Replace with your PHP file
        .then(response => response.json())
        .then(data => {
            document.getElementById('wifi_status').textContent = data.wifi_status || 'Unknown';
            document.getElementById('gpsCoordinates').textContent = data.gpsCoordinates || 'No Data';
            document.getElementById('latitude').textContent = data.latitude || 'N/A';
            document.getElementById('longitude').textContent = data.longitude || 'N/A';
            document.getElementById('speed').textContent = data.speed || 'N/A';
            document.getElementById('satellites').textContent = data.satellites || 'N/A';

            if (data.latitude && data.longitude) {
                updateMap(parseFloat(data.latitude), parseFloat(data.longitude));
            }
        })
        .catch(error => {
            document.getElementById('wifi_status').textContent = "Error fetching data";
            document.getElementById('wifi_status').classList.add("error");
            console.error("Error:", error);
        });
}

function updateMap(latitude, longitude) {
    const location = { lat: latitude, lng: longitude };

    // Move the map center
    map.setCenter(location);

    // Update the marker position with bounce effect
    marker.setPosition(location);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    
    // Stop bouncing after 2 seconds
    setTimeout(() => {
        marker.setAnimation(null);
    }, 2000);
}

// Load the map when the page loads
window.onload = function () {
    initMap();
    fetchData();
};

// Auto-refresh every 10 seconds
setInterval(fetchData, 10000);
//For the Time and Date
function updateDateTime() {
  const now = new Date();

  // Format the time and date as needed
  const date = now.toLocaleDateString(); // You can adjust the format as needed
  const time = now.toLocaleTimeString(); // This will give the time in the user's local format

  // Set the time and date in the 'current-time-date' span
  document.getElementById('current-time-date').textContent = `${date} | ${time}`;
}

// Update time and date every second
setInterval(updateDateTime, 1000);

// Initially update the date and time when the page loads
updateDateTime();
//Kiosk
let selectedPrice = 0;
let selectedType = '';
let ticketCount = 1;
let cart = [];
let totalCost = 0;

const ticketControls = document.getElementById('ticketControls');
const selectedTypeDisplay = document.getElementById('selectedType');
const ticketCountDisplay = document.getElementById('ticketCountDisplay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cancelButton = document.getElementById('cancelButton');
const checkoutButton = document.getElementById('checkoutButton');
const reviewModal = document.getElementById('reviewModal');
const reviewList = document.getElementById('reviewList');
const reviewTotal = document.getElementById('reviewTotal');
const confirmCheckoutButton = document.getElementById('confirmCheckoutButton');
const cancelCheckoutButton = document.getElementById('cancelCheckoutButton');

// Handle passenger type selection
document.querySelectorAll('.passenger-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.passenger-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    selectedPrice = parseFloat(button.dataset.price);
    selectedType = button.dataset.type;
    ticketCount = 1;

    selectedTypeDisplay.textContent = `${selectedType} (₱${selectedPrice})`;
    ticketCountDisplay.textContent = ticketCount;
    ticketControls.classList.remove('hidden');
  });
});

// Adjust ticket count
document.getElementById('increaseButton').addEventListener('click', () => {
  ticketCount++;
  ticketCountDisplay.textContent = ticketCount;
});

document.getElementById('decreaseButton').addEventListener('click', () => {
  if (ticketCount > 1) {
    ticketCount--;
    ticketCountDisplay.textContent = ticketCount;
  }
});

// Add to cart
document.getElementById('addToCartButton').addEventListener('click', () => {
  const cost = selectedPrice * ticketCount;
  cart.push({ type: selectedType, count: ticketCount, cost });
  updateCart();
  resetSelection();
});

// Cancel current selection
cancelButton.addEventListener('click', () => {
  resetSelection();
});

// Update cart display
function updateCart() {
  cartItems.innerHTML = '';
  totalCost = 0;

  cart.forEach(item => {
    totalCost += item.cost;
    const listItem = document.createElement('li');
    listItem.textContent = `${item.count}x ${item.type} - ₱${item.cost.toFixed(2)}`;
    cartItems.appendChild(listItem);
  });

  cartTotal.textContent = `₱${totalCost.toFixed(2)}`;
}

// Checkout button logic
checkoutButton.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  showReviewModal();
});

// Show review modal
function showReviewModal() {
  reviewList.innerHTML = '';
  cart.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <span>${item.count}x ${item.type} - ₱${item.cost.toFixed(2)}</span>
      <button class="edit-button" data-index="${index}">Edit</button>
      <button class="delete-button" data-index="${index}">Delete</button>
    `;
    reviewList.appendChild(listItem);
  });
  reviewTotal.textContent = `₱${totalCost.toFixed(2)}`;
  reviewModal.classList.remove('hidden');

  // Add edit and delete functionality
  document.querySelectorAll('.edit-button').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      editCartItem(index);
    });
  });

  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      deleteCartItem(index);
    });
  });
}

// Edit cart item
function editCartItem(index) {
  const item = cart[index];
  selectedType = item.type;
  selectedPrice = item.cost / item.count;
  ticketCount = item.count;

  selectedTypeDisplay.textContent = `${selectedType} (₱${selectedPrice})`;
  ticketCountDisplay.textContent = ticketCount;
  ticketControls.classList.remove('hidden');

  cart.splice(index, 1);
  updateCart();
  closeModal();
}

// Delete cart item
function deleteCartItem(index) {
  cart.splice(index, 1);
  updateCart();
  showReviewModal();
}

// Confirm checkout
confirmCheckoutButton.addEventListener('click', () => {
  cart = [];
  updateCart();
  closeModal();
});

// Cancel checkout
cancelCheckoutButton.addEventListener('click', closeModal);

// Close modal
function closeModal() {
  reviewModal.classList.add('hidden');
}

// Reset selection
function resetSelection() {
  ticketControls.classList.add('hidden');
  selectedPrice = 0;
  selectedType = '';
  ticketCount = 1;
  document.querySelectorAll('.passenger-button').forEach(btn => btn.classList.remove('selected'));
}

document.addEventListener("DOMContentLoaded", function () {
    const confirmCheckoutButton = document.getElementById("confirmCheckoutButton");

    if (confirmCheckoutButton) {
        confirmCheckoutButton.addEventListener("click", function () {
            // Redirect to PrintTicket.html
            window.location.href = "PrintTicket.html";
        });
    }
});


// Function to generate ticket content
function generateTicketContent(cart, totalCost) {
    let content = "===== Ticket Receipt =====\n";
    cart.forEach((item) => {
        content += `${item.count}x ${item.type} @ ₱${(item.cost / item.count).toFixed(2)}\n`;
        content += `  Subtotal: ₱${item.cost.toFixed(2)}\n`;
    });
    content += `-------------------------\n`;
    content += `TOTAL: ₱${totalCost.toFixed(2)}\n`;
    content += `=========================\n`;
    content += `Thank you for your purchase!`;
    return content;
}

// Function to print the ticket
function printTicket(content) {
    const printWindow = window.open("", "", "width=300,height=400");
    printWindow.document.open();
    printWindow.document.write(`
        <pre style="font-family: monospace; font-size: 12px;">
${content}
        </pre>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
}
