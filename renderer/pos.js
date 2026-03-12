let cart = [];

async function loadProducts() {

    const products = await window.api.getProducts();

    const grid = document.getElementById("productGrid");

    grid.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "product-card";

        card.onclick = () => {
            addToCart(product);
        };

        card.innerHTML = `
            <h3>${product.name}</h3>
            <p>₱${product.selling_price}</p>
            <small>Stock: ${product.current_stock}</small>
        `;

        grid.appendChild(card);

    });

}

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

function addToCart(product){

    const existing = cart.find(item => item.id === product.id);

    if(existing){

        if(existing.qty >= product.current_stock){
            alert("Not enough stock");
            return;
        }

        existing.qty++;

    }else{

        if(product.current_stock <= 0){
            alert("Product out of stock");
            return;
        }

        cart.push({
            id: product.id,
            name: product.name,
            price: product.selling_price,
            stock: product.current_stock,
            qty: 1
        });

    }

    renderCart();
}

function renderCart(){

    const cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";

    cart.forEach(item => {

        const row = document.createElement("div");

        row.innerHTML = `
            ${item.name} x${item.qty} - ₱${item.price * item.qty}
        `;

        cartItems.appendChild(row);

    });

    updateTotal();
}

function updateTotal(){

    const total = cart.reduce((sum,item)=>{
        return sum + item.price * item.qty;
    },0);

    document.querySelector(".cart-total").innerText =
        "TOTAL ₱" + total;

}