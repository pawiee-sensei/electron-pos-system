async function loadProducts() {

    const products = await window.api.getProducts();

    const grid = document.getElementById("productGrid");

    grid.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>₱${product.price}</p>
            <small>Stock: ${product.stock}</small>
        `;

        grid.appendChild(card);

    });

}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});