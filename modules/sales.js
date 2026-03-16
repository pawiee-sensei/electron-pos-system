const db = require("../db");

// ======================================
// GET SALES LIST
// ======================================

async function getSales(){

    const [rows] = await db.execute(`
        SELECT id,total_amount,status,created_at
        FROM sales
        ORDER BY id DESC
        LIMIT 50
    `);

    return rows;

}


// ======================================
// GET SALE DETAILS
// ======================================

async function getSaleItems(saleId){

    const [rows] = await db.execute(`
        SELECT p.name, si.quantity, si.price
        FROM sale_items si
        JOIN products p ON p.id = si.product_id
        WHERE si.sale_id = ?
    `,[saleId]);

    return rows;

}


// ======================================
// VOID TRANSACTION
// ======================================

async function voidSale(saleId){

    const connection = await db.getConnection();

    try{

        await connection.beginTransaction();

        const [items] = await connection.execute(`
            SELECT product_id, quantity
            FROM sale_items
            WHERE sale_id = ?
        `,[saleId]);


        for(const item of items){

            // restore stock
            await connection.execute(`
                UPDATE products
                SET current_stock = current_stock + ?
                WHERE id = ?
            `,[item.quantity,item.product_id]);


            // log movement
            await connection.execute(`
                INSERT INTO stock_movements
                (product_id,type,quantity,note)
                VALUES (?, 'RETURN', ?, ?)
            `,[item.product_id,item.quantity,`Void Sale #${saleId}`]);

        }


        await connection.execute(`
            UPDATE sales
            SET status='VOIDED'
            WHERE id = ?
        `,[saleId]);


        await connection.commit();

        return { success:true };

    }catch(err){

        await connection.rollback();
        console.error(err);

        return { success:false };

    }finally{

        connection.release();

    }

}

module.exports = { getSales, getSaleItems, voidSale };