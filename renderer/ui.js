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

    // Update checkout amount due live
    const checkoutTotal = document.getElementById("checkoutTotal");

    if(checkoutTotal){
        checkoutTotal.innerText = "₱" + total;
    }

}

// ======================================
// OPEN PIN MODAL
// ======================================

let pendingVoidSaleId = null;

window.openPinModal = function(saleId){

    pendingVoidSaleId = saleId;

    const modal = document.getElementById("pinModal");

    modal.classList.remove("hidden");

    const inputs = document.querySelectorAll(".pin-box");

    inputs.forEach(i => i.value = "");

    inputs[0].focus();

};



// ======================================
// CLOSE PIN MODAL
// ======================================

window.closePinModal = function(){

    document
    .getElementById("pinModal")
    .classList.add("hidden");

};



// ======================================
// PIN INPUT HANDLING
// ======================================

document.addEventListener("input", async function(e){

    if(!e.target.classList.contains("pin-box")) return;

    const boxes = [...document.querySelectorAll(".pin-box")];

    const index = boxes.indexOf(e.target);

    if(e.target.value && index < boxes.length - 1){
        boxes[index+1].focus();
    }

    const pin = boxes.map(b => b.value).join("");

    if(pin.length === 4){

        const result = await window.api.verifyPin(pin);

        if(result.success){

            closePinModal();

            // Phase 3 will continue void flow
            window.startVoidProcess(pendingVoidSaleId);

        }else{

            document.getElementById("pinError").innerText =
            "Incorrect PIN";

            boxes.forEach(b => b.value="");

            boxes[0].focus();

        }

    }

});