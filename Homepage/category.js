document.addEventListener("DOMContentLoaded", () => {
  const categoryItems = document.querySelectorAll('nav ul li');
  const products = document.querySelectorAll('.product-card');

  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.getAttribute('data-category');

      products.forEach(product => {
        const productCategory = product.getAttribute('data-category');

        if (category === 'All' || productCategory === category) {
          product.style.display = '';   // show (reset to CSS default)
        } else {
          product.style.display = 'none'; // hide
        }
      });

      // Highlight active category
      categoryItems.forEach(li => li.classList.remove('active'));
      item.classList.add('active');
    });
  });
});
