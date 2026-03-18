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

// ======================================
// OPEN VOID DETAILS MODAL
// ======================================

window.startVoidProcess = async function(saleId){

    const items = await window.api.getSaleItems(saleId);

    const info = document.getElementById("voidSaleInfo");
    const list = document.getElementById("voidItems");

    info.innerHTML = `<strong>Sale #${saleId}</strong>`;

    list.innerHTML = "";

    items.forEach(item => {

        const row = document.createElement("div");

        row.className = "void-item";

        row.innerHTML = `
        <span>${item.name} x${item.quantity}</span>
        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
        `;

        list.appendChild(row);

    });

    pendingVoidSaleId = saleId;

    document
    .getElementById("voidModal")
    .classList.remove("hidden");

};



// ======================================
// CLOSE VOID MODAL
// ======================================

window.closeVoidModal = function(){

    document
    .getElementById("voidModal")
    .classList.add("hidden");

};



// ======================================
// CONFIRM VOID
// ======================================

window.confirmVoid = async function(){

    const reason = document.getElementById("voidReason").value;

if(!reason){
    showAlert("Please select void reason");
    return;
}

const result = await window.api.voidSale({
    saleId: pendingVoidSaleId,
    reason: reason
});

    if(result.success){

        showAlert("Transaction Voided");

        closeVoidModal();

        loadSales();

        if(typeof loadProducts === "function"){
            loadProducts();
        }

    }else{

        showAlert("Failed to void transaction");

    }

};

window.showSuccess = function(message){

    const box = document.getElementById("posAlert");

    box.innerText = message;

    // center + green
    box.style.bottom = "auto";
    box.style.top = "50%";
    box.style.transform = "translate(-50%, -50%)";
    box.style.background = "green";

    box.style.opacity = 1;

    setTimeout(()=>{
        // first hide it
        box.style.opacity = 0;

        // THEN reset after it's invisible (fix flicker)
        setTimeout(()=>{
            box.style.top = "";
            box.style.bottom = "30px";
            box.style.transform = "translateX(-50%)";
            box.style.background = "#e74c3c";
        },300); // match your CSS transition time

    },1500);
};