const db = require("../db");

async function getAllProducts() {
    const [rows] = await db.query("SELECT * FROM products");
    return rows;
}

module.exports = {
    getAllProducts
};