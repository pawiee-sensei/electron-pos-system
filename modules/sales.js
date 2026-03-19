const db = require("../db");


// ======================================
// GET SALES LIST (WITH PAYMENT METHOD)
// ======================================
async function getSales(date = null, staffId = null){   

    

    let query = `
        SELECT 
            s.id,
            s.total_amount,
            s.status,
            s.created_at,
            p.payment_method,

            u.username AS staff_name,

            COALESCE(SUM(si.quantity),0) AS items_count

        FROM sales s

        LEFT JOIN users u ON u.id = s.staff_id
        LEFT JOIN payments p ON p.sale_id = s.id
        LEFT JOIN sale_items si ON si.sale_id = s.id
    `;

    let params = [];

    let conditions = [];

if(date){
    conditions.push("DATE(s.created_at) = ?");
    params.push(date);
}

if(staffId){
    conditions.push("s.staff_id = ?");
    params.push(staffId);
}

if(conditions.length > 0){
    query += " WHERE " + conditions.join(" AND ");
}

    query += `
        GROUP BY s.id
        ORDER BY s.id DESC
        LIMIT 100
    `;

    const [rows] = await db.execute(query, params);

    console.log("BACKEND SALES:", rows); // debug

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

async function voidSale(data){

    const saleId = data.saleId;
    let reason = data.reason;
    let staffId = data.staffId;

    if(typeof reason === "undefined") reason = null;
    if(typeof staffId === "undefined") staffId = null;

    const connection = await db.getConnection();

    try{

        await connection.beginTransaction();

        const [items] = await connection.execute(`
            SELECT product_id, quantity
            FROM sale_items
            WHERE sale_id = ?
        `,[saleId]);

        for(const item of items){

            await connection.execute(`
                UPDATE products
                SET current_stock = current_stock + ?
                WHERE id = ?
            `,[item.quantity,item.product_id]);

            await connection.execute(`
                INSERT INTO stock_movements
                (product_id,type,quantity,note)
                VALUES (?, 'RETURN', ?, ?)
            `,[item.product_id,item.quantity,`Void Sale #${saleId}`]);

        }

        await connection.execute(`
            UPDATE sales
            SET status='VOIDED',
                void_reason = ?,
                void_by = ?
            WHERE id = ?
        `,[reason,staffId,saleId]);

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