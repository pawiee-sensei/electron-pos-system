// ======================================
// SHOW RECEIPT
// ======================================

window.showReceipt = function(data){

    const { saleId, items, total, payment, cash, change } = data;

    document.getElementById("receiptSaleId").innerText =
        "Sale #" + saleId;

    const container = document.getElementById("receiptItems");
    container.innerHTML = "";

    items.forEach(item => {

        const row = document.createElement("div");

        row.className = "receipt-row";

        row.innerHTML = `
            <span>${item.name} x${item.qty}</span>
            <span>₱${(item.price * item.qty).toFixed(2)}</span>
        `;

        container.appendChild(row);

    });

    document.getElementById("receiptTotal").innerText =
        "₱" + total.toFixed(2);

    document.getElementById("receiptPayment").innerText =
        payment.toUpperCase();

    document.getElementById("receiptCash").innerText =
        "₱" + cash.toFixed(2);

    document.getElementById("receiptChange").innerText =
        "₱" + change.toFixed(2);

    showView("receipt");

};


// ======================================
// PRINT RECEIPT
// ======================================

window.printReceipt = function(){

    window.print();

};


// ======================================
// NEW SALE
// ======================================

window.newSale = function(){

    window.cart.length = 0;

    renderCart();

    showView("pos");

};