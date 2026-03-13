let selectedPayment = null;

window.selectPayment = function(method){

    selectedPayment = method;

    document
    .querySelectorAll(".payment-option")
    .forEach(el => el.classList.remove("active"));

    document
    .getElementById("pay-"+method)
    .classList.add("active");

    if(method === "cash"){
        document.getElementById("cashSection").style.display="block";
    }else{
        document.getElementById("cashSection").style.display="none";
    }

}

window.calculateChange = function(){

    const cash = parseFloat(
        document.getElementById("cashInput").value
    );

    const totalText = document
        .getElementById("totalAmount")
        .innerText
        .replace("₱","");

    const total = parseFloat(totalText);

    if(isNaN(cash)){
        document.getElementById("changeDisplay").innerText =
            "Change: ₱0";
        return;
    }

    const change = cash - total;

    if(change < 0){
        document.getElementById("changeDisplay").innerText =
            "Insufficient Cash";
    }else{
        document.getElementById("changeDisplay").innerText =
            "Change: ₱" + change.toFixed(2);
    }

};

window.processCheckout = async function(){

    if(window.cart.length === 0){
    alert("Cart is empty");
    return;
}

    if(!selectedPayment){
        alert("Please select a payment method");
        return;
    }

    const total = window.getCartTotal();

    // CASH VALIDATION FIRST
    if(selectedPayment === "cash"){

        const cash = parseFloat(
            document.getElementById("cashInput").value
        );

        if(isNaN(cash) || cash < total){
            alert("Insufficient cash");
            return;
        }

    }

    // PROCESS SALE
    const result = await window.api.processSale({
        cart: window.cart,
        total,
        payment: selectedPayment
    });

    if(result.success){

        alert("Sale completed");

        location.reload();

    }

    

}

window.quickCash = function(amount){

    const input = document.getElementById("cashInput");

    input.value = amount;

    calculateChange();

};

document.addEventListener("keydown", function(e){

    // Ctrl + F → focus search bar
    if(e.ctrlKey && e.key === "f"){

        e.preventDefault();

        const search = document.getElementById("searchInput");

        if(search){
            showView("pos");
            search.focus();
        }

    }

    // Ctrl + C → focus cash input
    if(e.ctrlKey && e.key === "c"){

        e.preventDefault();

        const cashInput = document.getElementById("cashInput");

        if(cashInput){
            showView("checkout");
            selectPayment("cash");
            cashInput.focus();
        }

    }

    // Enter → Complete sale
    if(e.key === "Enter"){
        processCheckout();
    }

    // Escape → Back to POS
    if(e.key === "Escape"){
        showView("pos");
    }

});