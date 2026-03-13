const db = require("../db");

async function processSale(cart, total, payment){

    const connection = await db.getConnection();

    try{

        await connection.beginTransaction();

        // 1️⃣ Insert sale record
        const [saleResult] = await connection.execute(
            `INSERT INTO sales (total_amount)
             VALUES (?)`,
            [total]
        );

        const saleId = saleResult.insertId;

        // 2️⃣ Process each cart item
        for(const item of cart){

            // Insert sale item
            await connection.execute(
                `INSERT INTO sale_items
                (sale_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [saleId, item.id, item.qty, item.price]
            );

            // Deduct stock safely
            const [stockUpdate] = await connection.execute(
                `UPDATE products
                 SET current_stock = current_stock - ?
                 WHERE id = ? AND current_stock >= ?`,
                [item.qty, item.id, item.qty]
            );

            if(stockUpdate.affectedRows === 0){
                throw new Error("Stock not sufficient");
            }

            // Insert stock movement log
            await connection.execute(
                `INSERT INTO stock_movements
                (product_id, type, quantity, note)
                VALUES (?, 'SALE', ?, ?)`,
                [item.id, item.qty, `POS Sale #${saleId}`]
            );
        }

        // 3️⃣ Insert payment record
        await connection.execute(
            `INSERT INTO payments
            (sale_id, amount, payment_method)
            VALUES (?, ?, ?)`,
            [saleId, total, payment]
        );

        // 4️⃣ Commit transaction
        await connection.commit();

        return { success:true, saleId };

    }catch(error){

        await connection.rollback();

        console.error("SALE ERROR:", error);

        return { success:false };

    }finally{

        connection.release();

    }

}

module.exports = { processSale };