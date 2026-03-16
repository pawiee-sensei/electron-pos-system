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

    const body = document.getElementById("salesTableBody");

    body.innerHTML = "";

    sales.forEach(sale => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>#${sale.id}</td>

        <td>₱${sale.total_amount}</td>

        <td>
        ${sale.payment_method
            ? sale.payment_method.toUpperCase()
            : "-"
        }
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
        onclick="voidSale(${sale.id});event.stopPropagation();">
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

async function toggleSaleDetails(row,sale){

    const next = row.nextElementSibling;

    // collapse if clicking the same row
    if(next && next.classList.contains("sale-details")){
        next.remove();
        expandedRow = null;
        return;
    }

    // collapse previous expanded row
    if(expandedRow){
        const prev = expandedRow.nextElementSibling;
        if(prev && prev.classList.contains("sale-details")){
            prev.remove();
        }
    }

    const items = await window.api.getSaleItems(sale.id);

    const detailsRow = document.createElement("tr");
    detailsRow.className = "sale-details";

    const td = document.createElement("td");
    td.colSpan = 6;

    let html = `
    <div class="sale-details-container">

        <div class="sale-details-header">
            Items Purchased
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



