const db = require("../db");

async function processSale(cart,total,payment){

    const conn = await db.getConnection();

    try{

        await conn.beginTransaction();

        const [sale] = await conn.query(
        "INSERT INTO sales(total_amount,payment_method) VALUES (?,?)",
        [total,payment]
        );

        const saleId = sale.insertId;

        for(const item of cart){

            await conn.query(
            `INSERT INTO sale_items
            (sale_id,product_id,quantity,price)
            VALUES (?,?,?,?)`,
            [saleId,item.id,item.qty,item.price]
            );

            await conn.query(
            `UPDATE products
             SET current_stock=current_stock-?
             WHERE id=?`,
            [item.qty,item.id]
            );

            await conn.query(
            `INSERT INTO stock_movements
            (product_id,type,quantity,reference_id)
            VALUES (?, 'sale', ?, ?)`,
            [item.id,item.qty,saleId]
            );

        }

        await conn.commit();

        return {success:true};

    }catch(err){

        await conn.rollback();

        throw err;

    }finally{

        conn.release();

    }

}

module.exports = {processSale};

async function processCheckout(){

    const total = window.getCartTotal();

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