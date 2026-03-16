const db = require("../db");


// ======================================
// GET SALES LIST (WITH PAYMENT METHOD)
// ======================================

async function getSales(date = null){

    let query = `
        SELECT 
            s.id,
            s.total_amount,
            s.status,
            s.created_at,
            p.payment_method
        FROM sales s
        LEFT JOIN payments p
        ON p.sale_id = s.id
    `;

    let params = [];

    if(date){

        query += `
            WHERE DATE(s.created_at) = ?
        `;

        params.push(date);
    }

    query += `
        ORDER BY s.id DESC
        LIMIT 100
    `;

    const [rows] = await db.execute(query, params);

    return rows;

}



// ======================================
// GET SALE DETAILS
// ======================================

async function getSaleItems(saleId){

    const [rows] = await db.execute(`
        SELECT 
            p.name,
            si.quantity,
            si.price
        FROM sale_items si
        JOIN products p 
        ON p.id = si.product_id
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

        // Get sale items first
        const [items] = await connection.execute(`
            SELECT product_id, quantity
            FROM sale_items
            WHERE sale_id = ?
        `,[saleId]);


        for(const item of items){

            // Restore stock
            await connection.execute(`
                UPDATE products
                SET current_stock = current_stock + ?
                WHERE id = ?
            `,[item.quantity,item.product_id]);


            // Insert stock movement log
            await connection.execute(`
                INSERT INTO stock_movements
                (product_id,type,quantity,note)
                VALUES (?, 'RETURN', ?, ?)
            `,[item.product_id,item.quantity,`Void Sale #${saleId}`]);

        }


        // Mark sale as voided
        await connection.execute(`
            UPDATE sales
            SET status = 'VOIDED'
            WHERE id = ?
        `,[saleId]);


        await connection.commit();

        return { success:true };

    }catch(err){

        await connection.rollback();

        console.error("VOID SALE ERROR:",err);

        return { success:false };

    }finally{

        connection.release();

    }

}


module.exports = { getSales, getSaleItems, voidSale };