window.renderCart = function(){

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

window.updateTotal = function(){

    const total = cart.reduce((sum,item)=>{
        return sum + item.price * item.qty;
    },0);

    document.getElementById("subtotalAmount").innerText = "₱" + total;
    document.getElementById("totalAmount").innerText = "₱" + total;
}

