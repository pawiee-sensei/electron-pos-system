const db = require("../db");

// ======================================
// VERIFY MANAGER PIN
// ======================================

async function verifyPin(pin){

    const [rows] = await db.execute(`
        SELECT pin
        FROM manager_security
        LIMIT 1
    `);

    if(rows.length === 0){
        return { success:false };
    }

    if(rows[0].pin === pin){
        return { success:true };
    }

    return { success:false };

}

module.exports = { verifyPin };