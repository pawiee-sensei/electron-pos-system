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

        card.onclick = () => addToCart(product);

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

        grid.appendChild(card);

    });

    createCategories(products);
}


function createCategories(products){

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


function filterCategory(category){

    document.querySelectorAll(".product-card").forEach(card => {

        if(category === "All" || card.dataset.category === category){
            card.style.display = "block";
        }else{
            card.style.display = "none";
        }

    });

}


function showView(view){

    const checkoutBtn = document.getElementById("checkoutBtn");

    // hide all views
    document.getElementById("view-pos").classList.add("hidden");
    document.getElementById("view-checkout").classList.add("hidden");

    // show selected view
    document.getElementById("view-" + view).classList.remove("hidden");

    if(view === "checkout"){

        checkoutBtn.style.display = "none";

        const total = window.getCartTotal();

        const checkoutTotal = document.getElementById("checkoutTotal");
        const amountDue = document.getElementById("amountDue");

        if(checkoutTotal){
            checkoutTotal.innerText = "₱" + total;
        }

        if(amountDue){
            amountDue.innerText = "₱" + total;
        }

    }else{

        checkoutBtn.style.display = "block";

    }

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

});


function showAlert(message){

    const box = document.getElementById("posAlert");

    box.innerText = message;
    box.style.opacity = 1;

    setTimeout(()=>{
        box.style.opacity = 0;
    },2000);

}