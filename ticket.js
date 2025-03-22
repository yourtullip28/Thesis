let map, marker;

function initMap(latitude = 14.5995, longitude = 120.9842) {
    const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

    map = new google.maps.Map(document.getElementById('map'), {
        center: location,
        zoom: 15
    });

    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: "Current GPS Location",
        icon: {
            url: 'boat-icon.png',
            scaledSize: new google.maps.Size(50, 50),
        },
        animation: google.maps.Animation.DROP
    });
}

function fetchCoordinates() {
    fetch('controller.php') // Replace with your PHP file
        .then(response => response.json())
        .then(data => {
            if (data.latitude && data.longitude) {
                document.getElementById('latitude').textContent = data.latitude;
                document.getElementById('longitude').textContent = data.longitude;
                updateMap(parseFloat(data.latitude), parseFloat(data.longitude));
            }
        })
        .catch(error => console.error("Error fetching coordinates:", error));
}

function updateMap(latitude, longitude) {
    const location = { lat: latitude, lng: longitude };

    map.setCenter(location);
    marker.setPosition(location);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    
    setTimeout(() => {
        marker.setAnimation(null);
    }, 2000);
}

window.onload = function () {
    initMap();
    fetchCoordinates();
};

setInterval(fetchCoordinates, 10000);

//Total Value
document.addEventListener('DOMContentLoaded', () => {
let totalValue = document.getElementById('total-value'); // Total display
let cartTotal = localStorage.getItem('cartTotal') ? parseFloat(localStorage.getItem('cartTotal')) : 0; // Retrieve stored total

// Update total on page load
totalValue.textContent = `₱${cartTotal.toLocaleString()}`;

// Retrieve stored transactions or initialize empty array
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];

document.querySelectorAll('.ticket-card').forEach(ticketCard => {
let quantity = ticketCard.querySelector('.quantity');
let plusBtn = ticketCard.querySelector('.plus');
let minusBtn = ticketCard.querySelector('.minus');
let addToCartBtn = ticketCard.querySelector('.add-to-cart');
let doneBtn = document.querySelector('.done'); 
let cancelBtn = document.querySelector('.cancel');

let ticketPrice = 100; 

// Quantity increase
plusBtn.addEventListener('click', () => {
    quantity.textContent = parseInt(quantity.textContent) + 1;
});

// Quantity decrease
minusBtn.addEventListener('click', () => {
    let currentQuantity = parseInt(quantity.textContent);
    if (currentQuantity > 0) {
        quantity.textContent = currentQuantity - 1;
    }
});

// Add to cart functionality
addToCartBtn.addEventListener('click', () => {
    let ticketCount = parseInt(quantity.textContent);
    if (ticketCount > 0) {
        cartTotal += ticketCount * ticketPrice; 
        localStorage.setItem('cartTotal', cartTotal);

        // Update UI
        totalValue.textContent = `₱${cartTotal.toLocaleString()}`;
        quantity.textContent = "0"; 
    } else {

    }
});

// Store transaction and reset when clicking "Done"
doneBtn.addEventListener('click', () => {
    if (cartTotal > 0) {
        let transaction = {
            date: new Date().toLocaleString(),
            total: cartTotal
        };
        transactionHistory.push(transaction); // Add new transaction
        localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory)); // Save to storage

        // Reset total
        cartTotal = 0;
        localStorage.setItem('cartTotal', cartTotal); // Update storage
        totalValue.textContent = "₱0.00"; // Update UI

        alert("Transaction saved! Your total has been reset.");
    } else {
        alert("No items to checkout.");
    }
});

// Reset total when clicking "Cancel"
cancelBtn.addEventListener('click', () => {
    localStorage.removeItem('cartTotal'); 
    cartTotal = 0; 
    totalValue.textContent = "₱0.00"; 
    alert("Transaction has been canceled!");
});
});
});

