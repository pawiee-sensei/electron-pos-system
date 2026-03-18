// =======================================================
// TRACK CURRENTLY EXPANDED ROW
// =======================================================

let expandedRow = null;


// =======================================================
// AUTO FILTER WHEN DATE CHANGES
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

const dateInput = document.getElementById("salesDateFilter");

if(dateInput){

dateInput.addEventListener("change", () => {

const date = dateInput.value || null;

loadSales(date);

});

}

});



// =======================================================
// LOAD SALES LIST
// =======================================================

window.loadSales = async function(date = undefined){

    // if date is undefined, read from date picker
    if(date === undefined){

        const input = document.getElementById("salesDateFilter");

        if(input && input.value){
            date = input.value;
        }else{
            date = null;
        }

    }

    const sales = await window.api.getSales(date);

    // ===============================
// UPDATE REVENUE LABEL BASED ON FILTER
// ===============================

const label = document.getElementById("summaryRevenueLabel");

if(label){

    const today = new Date().toISOString().split("T")[0];

    if(date === null){
        label.innerText = "Total Revenue";
    }
    else if(date === today){
        label.innerText = "Today's Revenue";
    }
    else{
        const d = new Date(date);
        label.innerText = "Revenue (" + d.toLocaleDateString() + ")";
    }

}

    const body = document.getElementById("salesTableBody");

    body.innerHTML = "";



    // =======================================================
    // SALES SUMMARY CALCULATION
    // =======================================================

    let revenue = 0;
    let voided = 0;
    let itemsSold = 0;    

    sales.forEach(s => {

    if(s.status !== "VOIDED"){
    revenue += parseFloat(s.total_amount);
}

    if(s.status === "VOIDED"){
        voided++;
    }

    if(s.status !== "VOIDED"){
    itemsSold += parseInt(s.items_count || 0);
}

});

    const transactions = sales.length;

    const average = transactions ? revenue / transactions : 0;


        const revenueEl = document.getElementById("summaryRevenue");
        const transactionsEl = document.getElementById("summaryTransactions");
        const voidedEl = document.getElementById("summaryVoided");
        const itemsEl = document.getElementById("summaryItems");

        if(revenueEl) revenueEl.innerText = "₱" + revenue.toFixed(2);
        if(transactionsEl) transactionsEl.innerText = transactions;
        if(voidedEl) voidedEl.innerText = voided;
        if(itemsEl) itemsEl.innerText = itemsSold;



    // =======================================================
    // RENDER SALES TABLE
    // =======================================================

    sales.forEach(sale => {

        const row = document.createElement("tr");

        row.innerHTML = `
<td class="expand-icon">▶</td>

<td>#${sale.id}</td>

<td>${sale.staff_name || "-"}</td>

<td>₱${sale.total_amount}</td>

<td>
${sale.payment_method ? sale.payment_method.toUpperCase() : "-"}
</td>

<td class="status-${sale.status.toLowerCase()}">
${sale.status}
</td>

<td>
${new Date(sale.created_at).toLocaleString()}
</td>

<td>
${
sale.status !== "VOIDED"
?
`<button
class="void-btn"
onclick="handleVoidClick(this, ${sale.id});event.stopPropagation();">
Void
</button>`
:
"-"
}
</td>
`;

        row.onclick = () => toggleSaleDetails(row,sale);

        body.appendChild(row);

    });

};


// =======================================================
// EXPAND / COLLAPSE SALE DETAILS
// =======================================================

async function toggleSaleDetails(row, sale){

    const icon = row.querySelector(".expand-icon");
    const next = row.nextElementSibling;

    // collapse if clicking same row
    if(next && next.classList.contains("sale-details")){
        next.remove();
        icon.innerText = "▶";
        expandedRow = null;
        return;
    }

    // collapse previously expanded row
    if(expandedRow){
        const prev = expandedRow.nextElementSibling;
        if(prev && prev.classList.contains("sale-details")){
            prev.remove();

            const prevIcon = expandedRow.querySelector(".expand-icon");
            if(prevIcon) prevIcon.innerText = "▶";
        }
    }

    const items = await window.api.getSaleItems(sale.id);

    const detailsRow = document.createElement("tr");
    detailsRow.className = "sale-details";

    const td = document.createElement("td");
    td.colSpan = 7; // because we added expand column

    let html = `
    <div class="sale-details-container">

        <div class="sale-details-header">

            <span>Items Purchased</span>

            ${
                sale.status === "VOIDED"
                ?
                `<div class="void-badge">
                    VOIDED
                    <span class="void-reason-text">
                        ${sale.void_reason || ""}
                    </span>
                </div>`
                :
                ""
            }

        </div>

        <div class="sale-items">
    `;

    items.forEach(item => {

        html += `
        <div class="sale-item-row">

            <span class="item-name">
            ${item.name}
            </span>

            <span class="item-qty">
            x${item.quantity}
            </span>

            <span class="item-total">
            ₱${(item.price * item.quantity).toFixed(2)}
            </span>

        </div>
        `;

    });

    html += `
        </div>

        <div class="sale-total-row">

            <span>Total</span>

            <span>
            ₱${sale.total_amount}
            </span>

        </div>

    </div>
    `;

    td.innerHTML = html;

    detailsRow.appendChild(td);

    row.after(detailsRow);

    icon.innerText = "▼";

    expandedRow = row;
}



// =======================================================
// VOID TRANSACTION
// =======================================================

window.voidSale = async function(id){

    if(!confirm("Void this transaction?")) return;

    const result = await window.api.voidSale(id);

    if(result.success){

        showAlert("Transaction Voided");

        loadSales();

    if(typeof loadProducts === "function"){
        loadProducts();
    }

    }else{

        showAlert("Failed to void transaction");

    }

};



// =======================================================
// CLEAR DATE FILTER
// =======================================================

window.clearSalesFilter = function(){

    const input = document.getElementById("salesDateFilter");

    if(input){
        input.value = "";
    }

    loadSales();

};



window.loadTodaySales = function(){

const today = new Date().toISOString().split("T")[0];

const input = document.getElementById("salesDateFilter");

if(input){
input.value = today;
}

loadSales(today);

};



// =======================================================
// LOAD ALL SALES
// =======================================================

window.loadAllSales = function(){

    const input = document.getElementById("salesDateFilter");

    if(input){
        input.value = "";
    }

    loadSales(null);

};

window.handleVoidClick = function(btn, saleId){

    // prevent double click
    if(btn.disabled) return;

    btn.disabled = true;
    btn.innerText = "Processing...";

    // open your existing flow
    openPinModal(saleId);

    // re-enable after short delay
    setTimeout(() => {
        btn.disabled = false;
        btn.innerText = "Void";
    }, 1000);

};