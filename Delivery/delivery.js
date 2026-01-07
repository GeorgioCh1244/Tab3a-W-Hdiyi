console.log("delivery.js working");

function loadOrders() {
  fetch("fetch_orders.php", { credentials: "include" })
    .then(res => res.json())
    .then(orders => {
      console.log("Orders received:", orders);
      const tbody = document.querySelector("#orders-table tbody");
      tbody.innerHTML = "";

      orders.forEach(order => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${order.ORDER_ID}</td>
          <td>${order.USER_ID}</td>
          <td>$${order.TOTAL_AMOUNT}</td>
          <td>${order.STATUS}</td>
          <td>${order.order_date}</td>
          <td>${order.location}</td>   <!-- NEW -->
          <td>${order.phone}</td>      <!-- NEW -->
          <td>
            ${order.STATUS === "Pending" 
              ? `<button onclick="markOrderReady(${order.ORDER_ID})">Ready</button>` 
              : order.STATUS === "Ready"
                ? `<button onclick="confirmOrder(${order.ORDER_ID})">Confirm</button>`
                : order.STATUS}
          </td>
        `;

        tbody.appendChild(tr);
      });
    })
    .catch(err => console.error("Error loading orders:", err));
}

function markOrderReady(orderId) {
  if (confirm("Mark this order as Ready?")) {
    fetch("confirm_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "order_id=" + encodeURIComponent(orderId) + "&action=ready",
      credentials: "include"
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadOrders(); // reload table
    })
    .catch(err => console.error("Error updating order:", err));
  }
}

function confirmOrder(orderId) {
  if (confirm("Mark this order as Confirmed?")) {
    fetch("confirm_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "order_id=" + encodeURIComponent(orderId) + "&action=confirm",
      credentials: "include"
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      loadOrders(); // reload table
    })
    .catch(err => console.error("Error confirming order:", err));
  }
}

document.addEventListener("DOMContentLoaded", loadOrders);