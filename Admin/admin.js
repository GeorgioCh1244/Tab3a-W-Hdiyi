// Toggle sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');

  // Show selected section
  document.getElementById(sectionId).style.display = 'block';

  // Highlight active nav item
  document.querySelectorAll('.admin-nav li').forEach(li => li.classList.remove('active'));
  document.querySelector(`.admin-nav li[onclick="showSection('${sectionId}')"]`).classList.add('active');

  // Load products
  if (sectionId === 'products') {
    fetch('list_products.php')
      .then(response => response.text())
      .then(html => {
        document.getElementById('products-body').innerHTML = html;
      })
      .catch(error => console.error('Error loading products:', error));
  }

  // Load orders
  if (sectionId === 'orders') {
    populateMonthDropdown();   // ✅ build months dynamically
    filterOrdersByMonth();     // loads all by default
  }

  // Load users
  if (sectionId === 'users') {
    fetch('list_users.php')
      .then(response => response.text())
      .then(html => {
        document.getElementById('users-body').innerHTML = html;
      })
      .catch(error => console.error('Error loading users:', error));
  }
}

// ✅ Dynamically populate month dropdown
function populateMonthDropdown() {
  const monthSelect = document.getElementById('monthFilter');
  if (!monthSelect) return;

  // Clear existing options
  monthSelect.innerHTML = "";

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All";
  monthSelect.appendChild(allOption);

  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = (index + 1).toString().padStart(2, '0'); // 01–12
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Preselect current month
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  monthSelect.value = currentMonth;

  // Attach change listener
  monthSelect.addEventListener("change", filterOrdersByMonth);
}

// Filter orders by month
function filterOrdersByMonth() {
  const month = document.getElementById('monthFilter')?.value || '';
  const url = month ? `list_orders.php?month=${month}` : 'list_orders.php';

  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById('orders-body').innerHTML = html;
    })
    .catch(error => console.error('Error loading orders:', error));
}

// Mark order as Ready
function markOrderReady(orderId) {
  if (confirm("Mark this order as Ready?")) {
    fetch('update_order_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'id=' + orderId,
    })
    .then(response => response.text())
    .then(result => {
      alert(result);
      filterOrdersByMonth(); // reload table
    })
    .catch(error => console.error('Error updating order:', error));
  }
}

// Delete pending order
function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this pending order?")) {
    fetch('delete_order.php?id=' + orderId, { method: 'GET' })
      .then(response => response.text())
      .then(result => {
        alert(result);
        filterOrdersByMonth(); // reload table
      })
      .catch(error => console.error('Error deleting order:', error));
  }
}

// Delete user
function deleteUser(userId) {
  if (confirm("Are you sure you want to delete this user?")) {
    fetch('delete_user.php?id=' + userId, { method: 'GET' })
      .then(response => response.text())
      .then(result => {
        alert(result);
        showSection('users'); // reload users
      })
      .catch(error => console.error('Error deleting user:', error));
  }
}

// Handle login/logout visibility
document.addEventListener("DOMContentLoaded", function() {
  const loginBtn = document.getElementById("login-button");
  const logoutBtn = document.getElementById("logout-button");
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  loginBtn.style.display = isLoggedIn === "true" ? "none" : "block";
  logoutBtn.style.display = isLoggedIn === "true" ? "block" : "none";

  // Load products by default
  showSection('products');
});

// Delete product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch('delete_product.php?id=' + id, { method: 'GET' })
      .then(response => response.text())
      .then(result => {
        alert(result);
        showSection('products');
      })
      .catch(error => console.error('Error deleting product:', error));
  }
}

// Edit product
function editProduct(id) {
  window.location.href = 'edit_product.php?id=' + id;
}