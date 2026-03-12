let cart = [];
window.cart = cart;

async function loadProducts() {

    const products = await window.api.getProducts();

    const grid = document.getElementById("productGrid");

    grid.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");

            card.className = "product-card";

            if(product.current_stock <= 0){
                card.classList.add("out-of-stock");
            }
        card.dataset.category = product.category || "General";

        card.onclick = () => {
            addToCart(product);
        };

        card.innerHTML = `
            <div class="product-image">
                <img src="file:///C:/Users/Paolo/OneDrive/Documents/inventory/uploads/${product.image || 'placeholder.png'}">
            </div>

            <div class="product-name">
                ${product.name}
            </div>

            <div class="product-price">
                ₱${product.selling_price}
            </div>

            <div class="product-stock">
                Stock: ${product.current_stock}
            </div>
        `;

        grid.appendChild(card);

    });

    const categories = ["All", ...new Set(products.map(p => p.category || "General"))];

const tabs = document.getElementById("categoryTabs");

tabs.innerHTML = "";

categories.forEach(cat => {

    const tab = document.createElement("div");

    tab.className = "category-tab";

    tab.innerText = cat;

    tab.onclick = () => filterCategory(cat);

    tabs.appendChild(tab);

});



}

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

document
        .getElementById("checkoutBtn")
        .addEventListener("click", () => {

            showView("checkout");

        });
document
    .getElementById("searchInput")
    .addEventListener("input", e => {

        const value = e.target.value.toLowerCase();

    document
        .querySelectorAll(".product-card")
        .forEach(card => {

            const name = card.innerText.toLowerCase();

            card.style.display =
                name.includes(value) ? "block" : "none";

        });

    });


    const value = e.target.value.toLowerCase();

    document
    .querySelectorAll(".product-card")
    .forEach(card => {

        const name = card.innerText.toLowerCase();

        card.style.display =
            name.includes(value) ? "block" : "none";

    });

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
            image: product.image,
            qty: 1
        });

    }

    renderCart();
}


// 
function renderCart(){

    const cartItems = document.getElementById("cartItems");
    cartItems.innerHTML = "";

    cart.forEach(item => {

        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
        <div class="cart-item-left">

            <div class="cart-item-img">
                <img src="file:///C:/Users/Paolo/OneDrive/Documents/inventory/uploads/${item.image}">
            </div>

            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₱${item.price}</div>
            </div>

        </div>

        <div class="qty-controls">

            <button class="qty-btn" onclick="decreaseQty(${item.id})">−</button>

            <span>${item.qty}</span>

            <button class="qty-btn" onclick="increaseQty(${item.id})">+</button>

        </div>
        `;

        cartItems.appendChild(row);

    });

    updateTotal();
}

function increaseQty(id){

    const item = cart.find(i => i.id === id);

    if(item.qty < item.stock){
        item.qty++;
    }

    renderCart();
}

function decreaseQty(id){

    const index = cart.findIndex(i => i.id === id);

    if(cart[index].qty > 1){
        cart[index].qty--;
    }else{
        cart.splice(index,1);
    }

    renderCart();
}

function updateTotal(){

    const total = cart.reduce((sum,item)=>{
        return sum + item.price * item.qty;
    },0);

    document.getElementById("subtotalAmount").innerText =
        "₱" + total;

    document.getElementById("totalAmount").innerText =
        "₱" + total;
}

function showView(view){

    document
        .getElementById("view-pos")
        .classList.add("hidden");

    document
        .getElementById("view-checkout")
        .classList.add("hidden");

    document
        .getElementById("view-" + view)
        .classList.remove("hidden");

    const checkoutBtn = document.getElementById("checkoutBtn");

    if(view === "checkout"){
        checkoutBtn.style.display = "none";
    }else{
        checkoutBtn.style.display = "block";
    }

}

function filterCategory(category){

    document
    .querySelectorAll(".product-card")
    .forEach(card => {

        if(category === "All" || card.dataset.category === category){
            card.style.display = "block";
        }else{
            card.style.display = "none";
        }

    });

}

