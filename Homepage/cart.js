console.log("cart.js working");

// Fetch cart contents from PHP session
function loadCart() {
  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=status",
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    const cartBody = document.getElementById("cart-body");
    cartBody.innerHTML = "";

    data.cart.forEach(item => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.name}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <input type="number" min="1" value="${item.quantity}" 
                   onchange="updateItem(${item.id}, this.value)">
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
        <td><button class="remove-btn" onclick="removeItem(${item.id})">Remove</button></td>
      `;

      cartBody.appendChild(row);
    });

    // ✅ Calculate totals with delivery fee
    const subtotal = data.total_price;
    const deliveryFee = 7.00;
    const totalPrice = subtotal + deliveryFee;

    document.getElementById("total-items").textContent = data.total_items;
    document.getElementById("subtotal-price").textContent = subtotal.toFixed(2);
    document.getElementById("delivery-fee").textContent = deliveryFee.toFixed(2);
    document.getElementById("total-price").textContent = totalPrice.toFixed(2);
    document.getElementById("cart-count").textContent = data.total_items;
  })
  .catch(err => console.error("Error loading cart:", err));
}

// Update item quantity
function updateItem(productId, qty) {
  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=update&product_id=${productId}&quantity=${qty}`,
    credentials: "include"
  })
  .then(() => loadCart());
}

// Change quantity with +/− buttons
function changeQty(productId, delta) {
  const input = document.querySelector(`input[onchange="updateItem(${productId}, this.value)"]`);
  let newQty = parseInt(input.value) + delta;
  if (newQty < 1) newQty = 1;
  input.value = newQty;
  updateItem(productId, newQty);
}

// Remove item
function removeItem(productId) {
  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=remove&product_id=${productId}`,
    credentials: "include"
  })
  .then(() => loadCart());
}

document.addEventListener("DOMContentLoaded", loadCart);