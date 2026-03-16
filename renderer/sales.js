// ====================================
// LOAD SALES HISTORY
// ====================================

window.loadSales = async function(){

    const sales = await window.api.getSales();

    const container = document.getElementById("salesList");

    container.innerHTML = "";

    sales.forEach(sale => {

        const row = document.createElement("div");

        row.className = "sale-row";

        row.innerHTML = `
            <strong>Sale #${sale.id}</strong>
            ₱${sale.total_amount}
            ${sale.status}
            ${new Date(sale.created_at).toLocaleString()}
        `;

        row.onclick = () => viewSale(sale.id,sale.status);

        container.appendChild(row);

    });

};


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