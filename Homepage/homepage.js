console.log("homepage.js working");

// --------------------
// Fetch products from backend
// --------------------
fetch("fetch_all_products.php") // adjust path if needed
  .then(response => response.json())
  .then(products => {
    const main = document.querySelector("main");
    main.innerHTML = ""; // Clear hardcoded cards

    products.forEach(product => {
      // Create product card
      const card = document.createElement("div");
      card.className = "product-card";
      card.setAttribute("data-id", product.PRODUCT_ID);
      card.setAttribute("data-category", product.CATEGORY);
      card.onclick = () => goToDetails(card);

      // Image
      const img = document.createElement("img");
      img.src = `data:${product.mimeType};base64,${product.IMAGE}`;
      img.alt = "Product Image";

      // Info
      const info = document.createElement("div");
      info.className = "product-info";

      const name = document.createElement("h4");
      name.className = "product-name"; // class for search
      name.textContent = product.PRODUCT_NAME;

      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = `$${product.SELL_PRICE}`;

      const desc = document.createElement("p");
      desc.className = "product-description";
      desc.textContent = product.DESCRIPTION;

      info.appendChild(name);
      info.appendChild(price);
      info.appendChild(desc);

      card.appendChild(img);
      card.appendChild(info);
      main.appendChild(card);
    });
  })
  .catch(error => console.error("Error loading products:", error));

// --------------------
// Redirect to product details by ID
// --------------------
function goToDetails(product) {
  const productId = product.getAttribute("data-id");
  window.location.href = `../Homepage/product-details.html?id=${encodeURIComponent(productId)}`;
}

// --------------------
// Cart count updater
// --------------------
function updateCartCount() {
  fetch("product-details.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=status",
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    const cartCountEl = document.getElementById("cart-count");
    if (cartCountEl) {
      cartCountEl.textContent = data.total_items;
    }
  })
  .catch(err => console.error("Error fetching cart status:", err));
}

// --------------------
// Order success message
// --------------------
function checkOrderStatus() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("order");

  if (status === "success") {
    alert("✅ Your order was placed successfully!");
  } else if (status === "empty") {
    alert("⚠️ Your cart was empty. No order was placed.");
  }
}

// --------------------
// Product search filter (by name only)
// --------------------
function filterProducts() {
  const query = document.querySelector(".searchInput").value.toLowerCase();
  const products = document.querySelectorAll(".product-card");

  products.forEach(card => {
    const name = card.querySelector(".product-name")?.textContent.toLowerCase() || "";

    if (name.includes(query)) {
      card.style.display = "block"; // show matching product
    } else {
      card.style.display = "none"; // hide non-matching product
    }
  });
}

// --------------------
// Category filter
// --------------------
function filterByCategory(selectedCategory) {
  const products = document.querySelectorAll(".product-card");

  products.forEach(card => {
    const cardCategory = card.getAttribute("data-category");

    if (selectedCategory === "All" || cardCategory === selectedCategory) {
      card.style.display = "block"; // show matching category
    } else {
      card.style.display = "none"; // hide others
    }
  });
}

// --------------------
// Run on page load
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  checkOrderStatus();

  const searchInput = document.querySelector(".searchInput");
  const searchButton = document.querySelector(".searchButton");

  // Run search when typing
  searchInput.addEventListener("input", filterProducts);

  // Run search when clicking the button
  searchButton.addEventListener("click", filterProducts);

  // Category filtering
  const categoryItems = document.querySelectorAll("nav ul li");
  categoryItems.forEach(item => {
    item.addEventListener("click", () => {
      const selectedCategory = item.getAttribute("data-category");
      filterByCategory(selectedCategory);
    });
  });
});
