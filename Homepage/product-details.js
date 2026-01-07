console.log("product-details.js working");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let stockQuantity = 1; // default

if (productId) {
  fetch("fetch_product_by_id.php?id=" + productId)
    .then(response => response.json())
    .then(product => {
      if (product) {
        document.getElementById("product-name").textContent = product.PRODUCT_NAME;
        document.getElementById("product-price").textContent = `$${product.SELL_PRICE}`;
        document.getElementById("product-description").textContent = product.DESCRIPTION;

        if (product.IMAGE) {
          document.getElementById("product-image").src =
            `data:${product.mimeType};base64,${product.IMAGE}`;
        }

        // Set stock limit
        stockQuantity = parseInt(product.STOCK_QUANTITY) || 1;
        const qtyInput = document.getElementById("qty-input");
        qtyInput.setAttribute("max", stockQuantity);

        // 🔑 Show customize button if product is customizable
        if (product.IS_CUSTOMIZABLE == 1) {
          const customizeBtn = document.getElementById("customize-button");
          customizeBtn.style.display = "inline-block";
          customizeBtn.onclick = () => {
            window.location.href = `../Customize/customize.html?id=${productId}`;
          };
        }

        // If product already in cart, show its quantity
        fetch("../Homepage/product-details.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: "action=status",
          credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
          const existingItem = data.cart.find(item => item.id == productId);
          if (existingItem) {
            document.getElementById("qty-input").value = existingItem.quantity;
          }
          document.getElementById("cart-count").textContent = data.total_items;
        });
      }
    })
    .catch(error => console.error("Error loading product:", error));
}

// Quantity selector
function changeQty(amount) {
  const input = document.getElementById("qty-input");
  let value = parseInt(input.value) || 1;

  value += amount;
  if (value < 1) value = 1;
  if (value > stockQuantity) value = stockQuantity;

  input.value = value;
}

// Add to Cart (no redirect)
function addToCart() {
  const quantity = document.getElementById("qty-input").value;

  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=add&product_id=${productId}&quantity=${quantity}`,
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    // Update header cart count
    document.getElementById("cart-count").textContent = data.total_items;

    // Show feedback
    alert(`Added to cart: ${quantity} × ${document.getElementById("product-name").textContent}`);
  })
  .catch(err => console.error("Error adding to cart:", err));
}

// Update cart count on page load
function updateCartCount() {
  fetch("../Homepage/product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=status",
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("cart-count").textContent = data.total_items;
  })
  .catch(err => console.error("Error fetching cart status:", err));
}

// ✅ Load reviews with average rating
function loadReviews() {
  fetch(`../Homepage/review.php?action=list&product_id=${productId}`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      const reviewsDiv = document.getElementById("reviews-list");
      const avgDiv = document.getElementById("average-rating");
      reviewsDiv.innerHTML = "";
      avgDiv.innerHTML = "";

      if (!data.reviews || data.reviews.length === 0) {
        avgDiv.innerHTML = "<p>No ratings yet</p>";
        reviewsDiv.innerHTML = "<p>No reviews yet. Be the first!</p>";
        return;
      }

      // ✅ Show average rating
      const avg = data.average;
      const stars = "⭐".repeat(Math.round(avg));
      avgDiv.innerHTML = `<p><strong>Average Rating:</strong> ${stars} (${avg.toFixed(1)}/5 from ${data.count} reviews)</p>`;

      data.reviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "review-item";
        div.innerHTML = `
          <p><strong>${r.NAME}</strong> (${r.RATING}⭐)</p>
          <p>${r.REVIEW_TEXT}</p>
          <small>${r.REVIEW_DATE}</small>
        `;
        reviewsDiv.appendChild(div);
      });
    })
    .catch(err => console.error("Error loading reviews:", err));
}

// ✅ Submit a new review
function submitReview(e) {
  e.preventDefault();
  const rating = document.getElementById("rating").value;
  const text = document.getElementById("review-text").value;

  fetch("../Homepage/review.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `action=add&product_id=${productId}&rating=${rating}&text=${encodeURIComponent(text)}`,
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadReviews(); // reload reviews
    document.getElementById("review-text").value = "";
    document.getElementById("rating").value = "";
  })
  .catch(err => console.error("Error submitting review:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadReviews();
});


