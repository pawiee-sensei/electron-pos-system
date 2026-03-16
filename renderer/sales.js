// ====================================
// LOAD SALES TABLE
// ====================================

window.loadSales = async function(){

    const sales = await window.api.getSales();

    const body = document.getElementById("salesTableBody");

    body.innerHTML = "";

    sales.forEach(sale => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>#${sale.id}</td>
        <td>₱${sale.total_amount}</td>
        <td>${sale.status}</td>
        <td>${new Date(sale.created_at).toLocaleString()}</td>
        `;

        row.onclick = () => toggleSaleDetails(row,sale);

        body.appendChild(row);

    });

};



// ====================================
// EXPAND SALE DETAILS
// ====================================

async function toggleSaleDetails(row,sale){

    // remove if already expanded
    const next = row.nextElementSibling;

    if(next && next.classList.contains("sale-details")){
        next.remove();
        return;
    }

    const items = await window.api.getSaleItems(sale.id);

    const detailsRow = document.createElement("tr");
    detailsRow.className = "sale-details";

    const td = document.createElement("td");
    td.colSpan = 4;

    let html = `<div class="sale-items">`;

    items.forEach(item => {

        html += `
        <div class="sale-item">
        <span>${item.name} x${item.quantity}</span>
        <span>₱${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        `;

    });

    if(sale.status !== "VOIDED"){

        html += `
        <button class="void-btn"
        onclick="voidSale(${sale.id});event.stopPropagation();">
        Void Transaction
        </button>
        `;

    }

    html += `</div>`;

    td.innerHTML = html;

    detailsRow.appendChild(td);

    row.after(detailsRow);

}


// ====================================
// VIEW SALE DETAILS
// ====================================

async function viewSale(id,status){

    const items = await window.api.getSaleItems(id);

    const details = document.getElementById("saleDetails");

    let html = `<h3>Sale #${id}</h3>`;

    items.forEach(item => {

        html += `
            <div>
                ${item.name} x${item.quantity}
                ₱${item.price * item.quantity}
            </div>
        `;

    });

    if(status !== "VOIDED"){

        html += `
        <button onclick="voidSale(${id})">
        VOID TRANSACTION
        </button>
        `;

    }

    details.innerHTML = html;

}


// ====================================
// VOID SALE
// ====================================

window.voidSale = async function(id){

    if(!confirm("Void this transaction?")) return;

    const result = await window.api.voidSale(id);

    if(result.success){

        showAlert("Transaction Voided");

        loadSales();

        document.getElementById("saleDetails").innerHTML="";

    }

};