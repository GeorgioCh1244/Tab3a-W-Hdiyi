console.log("profit.js working");

function loadProfitFilter() {
  fetch("profit_filter.php")
    .then(response => response.text())
    .then(html => {
      document.getElementById("profitMonthFilter").innerHTML = html;
    })
    .catch(error => console.error("Error loading profit filter:", error));
}

function loadProfits(date = "") {
  const url = date ? `list_profits.php?date=${date}` : "list_profits.php";
  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById("profits-body").innerHTML = html;
    })
    .catch(error => console.error("Error loading profits:", error));
}

function filterProfitsByMonth() {
  const date = document.getElementById("profitMonthFilter").value;
  loadProfits(date);
}

document.addEventListener("DOMContentLoaded", function() {
  loadProfitFilter(); // populate dropdown dynamically
  loadProfits();      // load all profits initially
});