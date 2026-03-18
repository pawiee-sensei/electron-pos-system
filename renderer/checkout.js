// =======================================================
// PAYMENT STATE
// =======================================================

// This variable stores the currently selected payment method
// Example values: "cash", "card", "gcash"
let selectedPayment = null;



// =======================================================
// SELECT PAYMENT METHOD
// =======================================================

// Expose the function globally so it can be called from HTML
// Example: onclick="selectPayment('cash')"
window.selectPayment = function(method){

    // Save the selected payment type
    selectedPayment = method;

    // Remove "active" style from all payment buttons
    document
    .querySelectorAll(".payment-option")
    .forEach(el => el.classList.remove("active"));

    // Add "active" style to the selected payment button
    document
    .getElementById("pay-"+method)
    .classList.add("active");

    // Show cash input section only when payment is cash
    if(method === "cash"){
        document.getElementById("cashSection").style.display="block";
    }else{
        document.getElementById("cashSection").style.display="none";
    }

}



// =======================================================
// CALCULATE CHANGE
// =======================================================

// This function calculates the change after the cashier enters cash
// It runs automatically when the cashier types in the cash input field
window.calculateChange = function(){

    // Get the cash entered by the cashier
    const cash = parseFloat(
        document.getElementById("cashInput").value
    );

    // Get the total amount displayed in the cart
    const totalText = document
        .getElementById("totalAmount")
        .innerText
        .replace("₱","");

    const total = parseFloat(totalText);

    // If no valid number is entered yet
    if(isNaN(cash)){
        document.getElementById("changeDisplay").innerText =
            "Change: ₱0";
        return;
    }

    // Calculate change
    const change = cash - total;

    // If the customer has not given enough money
    if(change < 0){
        document.getElementById("changeDisplay").innerText =
            "Insufficient Cash";
    }else{

        // Display calculated change
        document.getElementById("changeDisplay").innerText =
            "Change: ₱" + change.toFixed(2);
    }

};



// =======================================================
// PROCESS CHECKOUT
// =======================================================

window.processCheckout = async function(){

    // Prevent checkout if cart is empty
    if(window.cart.length === 0){
        showAlert("Cart is empty");
        return;
    }

    // Ensure a payment method is selected
    if(!selectedPayment){
        showAlert("Please select payment method");
        return;
    }

    // Get total cart amount
    const total = window.getCartTotal();

    // Validate cash input
    if(selectedPayment === "cash"){

        const cash = parseFloat(
            document.getElementById("cashInput").value
        );

        if(isNaN(cash) || cash < total){

            showAlert("Insufficient cash");

            const input = document.getElementById("cashInput");
            if(input) input.focus();

            return;
        }

    }

    // Send sale data to backend
    const result = await window.api.processSale({
        cart: window.cart,
        total,
        payment: selectedPayment
    });

    

 if(result.success){


    
    // 🔊 play sound (fixed)
    const audio = new Audio();
    audio.src = "sounds/sales.mp3";
    audio.volume = 1;
    audio.play().catch(()=>{});

    // ✅ show success message
    showSuccess("Sale Completed");

    const total = window.getCartTotal();

    const cash = parseFloat(
        document.getElementById("cashInput").value || 0
    );

    const change = cash - total;

    const items = [...window.cart];

    // 🧾 show receipt
    showReceipt({
        saleId: result.saleId,
        items: items,
        total: total,
        payment: selectedPayment,
        cash: cash,
        change: change
    });

    // clear cart
    window.cart.length = 0;
    renderCart();

    // reset payment
    selectedPayment = null;

    document
    .querySelectorAll(".payment-option")
    .forEach(el => el.classList.remove("active"));

    // reset inputs
    document.getElementById("cashInput").value = "";
    document.getElementById("changeDisplay").innerText = "Change: ₱0";

    // refresh products
    if(typeof loadProducts === "function"){
        loadProducts();
    }

}else{
    showAlert("Transaction failed");
}

}



// =======================================================
// QUICK CASH BUTTONS
// =======================================================

// Allows cashier to click preset cash amounts
// Example buttons: ₱100, ₱200, ₱500, ₱1000
window.quickCash = function(amount){

    const input = document.getElementById("cashInput");

    // Auto-fill the cash input
    input.value = amount;

    // Recalculate change automatically
    calculateChange();

};



// =======================================================
// KEYBOARD SHORTCUTS
// =======================================================

// Adds keyboard controls for faster cashier operation
document.addEventListener("keydown", function(e){

    // Ctrl + F → Focus search bar
    if(e.ctrlKey && e.key === "f"){

        e.preventDefault();

        const search = document.getElementById("searchInput");

        if(search){
            showView("pos");
            search.focus();
        }

    }

    // Ctrl + C → Focus cash input
    if(e.ctrlKey && e.key === "g"){

        e.preventDefault();

        const cashInput = document.getElementById("cashInput");

        if(cashInput){
            showView("checkout");
            selectPayment("cash");
            cashInput.focus();
        }

    }

   

    // Escape → Return to POS screen
    if(e.key === "Escape"){
        showView("pos");
    }

});

