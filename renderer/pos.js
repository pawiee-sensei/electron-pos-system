// =======================================================
// LOAD PRODUCTS FROM DATABASE
// =======================================================

// Fetch products from Electron backend and render them in the product grid
async function loadProducts() {

    // Request products from main process (via preload.js IPC bridge)
    const products = await window.api.getProducts();

    // Target the grid container
    const grid = document.getElementById("productGrid");

    // Clear existing product cards before rendering
    grid.innerHTML = "";

    products.forEach(product => {

        // Create a card element for each product
        const card = document.createElement("div");
        card.className = "product-card";

        // If stock is zero mark product visually as unavailable
        if(product.current_stock <= 0){
            card.classList.add("out-of-stock");
        }

        // Store category and name for filtering and search
        card.dataset.category = product.category || "General";
        card.dataset.name = product.name.toLowerCase();

        // Clicking the card adds product to cart
        card.onclick = () => addToCart(product);

        // Render product information
        card.innerHTML = `
            <div class="product-image">
                <img src="file:///C:/Users/Paolo/OneDrive/Documents/inventory/uploads/${product.image || 'placeholder.png'}">
            </div>

            <div class="product-name">${product.name}</div>

            <div class="product-price">₱${product.selling_price}</div>

            <div class="product-stock">
                Stock: ${product.current_stock}
            </div>
        `;

        // Add card to grid
        grid.appendChild(card);

    });

    // Generate category tabs dynamically
    createCategories(products);
}



// =======================================================
// CREATE CATEGORY TABS
// =======================================================

// Builds category filters based on available product categories
function createCategories(products){

    // Get unique categories + add "All"
    const categories = ["All", ...new Set(products.map(p => p.category || "General"))];

    const tabs = document.getElementById("categoryTabs");

    // Clear old tabs
    tabs.innerHTML = "";

    categories.forEach(cat => {

        const tab = document.createElement("div");

        tab.className = "category-tab";
        tab.innerText = cat;

        // Clicking a tab filters products
        tab.onclick = () => filterCategory(cat);

        tabs.appendChild(tab);

    });

}



// =======================================================
// FILTER PRODUCTS BY CATEGORY
// =======================================================

// Shows only products belonging to selected category
function filterCategory(category){

    document.querySelectorAll(".product-card").forEach(card => {

        if(category === "All" || card.dataset.category === category){
            card.style.display = "block";
        }else{
            card.style.display = "none";
        }

    });

}



// =======================================================
// SWITCH BETWEEN POS VIEW AND CHECKOUT VIEW
// =======================================================

// Handles navigation between POS screen and Checkout screen
function showView(view){

    const checkoutBtn = document.getElementById("checkoutBtn");

    // Hide both views first
    document.getElementById("view-pos").classList.add("hidden");
    document.getElementById("view-checkout").classList.add("hidden");

    const receiptView = document.getElementById("view-receipt");
    if(receiptView){
        receiptView.classList.add("hidden");
    }

    const salesView = document.getElementById("view-sales");
    if(salesView){
        salesView.classList.add("hidden");
    }

    // Show selected view
    document.getElementById("view-" + view).classList.remove("hidden");

    if(view === "sales"){
    if(typeof loadSales === "function"){
        loadSales();
    }
}

    if(view === "checkout"){

        // Hide checkout button when already inside checkout screen
        checkoutBtn.style.display = "none";

        // Calculate cart total
        const total = window.getCartTotal();

        // Display total in checkout page
        const checkoutTotal = document.getElementById("checkoutTotal");
        const amountDue = document.getElementById("amountDue");

        if(checkoutTotal){
            checkoutTotal.innerText = "₱" + total;
        }

        if(amountDue){
            amountDue.innerText = "₱" + total;
        }

        // Auto select cash payment for faster cashier workflow
        if(typeof window.selectPayment === "function"){
            window.selectPayment("cash");
        }

        // Focus the cash input field
        setTimeout(()=>{
            const input = document.getElementById("cashInput");
            if(input){
                input.focus();
                input.select();
            }
        },150);

    }else{

        // Show checkout button again when returning to POS screen
        checkoutBtn.style.display = "block";

        // Automatically focus search bar for fast product lookup
        setTimeout(()=>{
            const search = document.getElementById("searchInput");
            if(search) search.focus();
        },100);

    }

}



// =======================================================
// INITIALIZE POS WHEN PAGE LOADS
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    // Load products immediately when app starts
    loadProducts();

    // Checkout button opens checkout screen
    document
        .getElementById("checkoutBtn")
        .addEventListener("click", () => {

            showView("checkout");

        });

    // Product search functionality
    document
        .getElementById("searchInput")
        .addEventListener("input", e => {

            const value = e.target.value.toLowerCase();

            document.querySelectorAll(".product-card").forEach(card => {

                // Safe fallback if dataset missing
                const name = card.dataset.name || "";

                card.style.display =
                    name.includes(value) ? "block" : "none";

            });

        });

});



// =======================================================
// POS ALERT SYSTEM
// =======================================================

// Displays temporary notification messages (instead of alert())
function showAlert(message){

    const box = document.getElementById("posAlert");

    box.innerText = message;
    box.style.opacity = 1;

    setTimeout(()=>{
        box.style.opacity = 0;
    },2000);

}