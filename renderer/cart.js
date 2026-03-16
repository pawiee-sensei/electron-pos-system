// This array stores all products currently added to the cart
let cart = [];

// Expose the cart globally so other scripts (checkout.js, pos.js) can access it
window.cart = cart;



// =======================================================
// ADD PRODUCT TO CART
// =======================================================

// Expose the function globally so product cards can call it from HTML
window.addToCart = function(product){

    // Check if the product already exists in the cart
    const existing = cart.find(item => item.id === product.id);

    if(existing){

        // Prevent adding more items than available stock
        if(existing.qty >= product.current_stock){
            showAlert("Not enough stock");
            return;
        }

        // Increase quantity if already in cart
        existing.qty++;

    }else{

        // Prevent adding products with zero stock
        if(product.current_stock <= 0){
            showAlert("Product out of stock");
            return;
        }

        // Add new product to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.selling_price,
            stock: product.current_stock,
            image: product.image,
            qty: 1
        });

    }

    // Re-render the cart UI after modification
    renderCart();
}



// =======================================================
// INCREASE PRODUCT QUANTITY
// =======================================================

// Called when "+" button is pressed in cart
window.increaseQty = function(id){

    // Find the product inside the cart
    const item = cart.find(i => i.id === id);

if(!item) return;

    // Check stock limit
    if(item.qty < item.stock){

        item.qty++;

    }else{

        showAlert("Not enough stock");

    }

    // Update cart display
    renderCart();
}



// =======================================================
// DECREASE PRODUCT QUANTITY
// =======================================================

// Called when "-" button is pressed
window.decreaseQty = function(id){

    // Find product index in cart
    const index = cart.findIndex(i => i.id === id);

if(index === -1) return;

    // If quantity is greater than 1 → decrease
    if(cart[index].qty > 1){

        cart[index].qty--;

    }else{

        // If quantity becomes 0 → remove product from cart
        cart.splice(index,1);

    }

    // Update cart display
    renderCart();
}



// =======================================================
// CALCULATE TOTAL CART PRICE
// =======================================================

// This function calculates the total price of all items in the cart
// It is used in multiple places:
// - Checkout page
// - Cart summary
// - Payment calculation

window.getCartTotal = function(){

    return cart.reduce((sum,item)=>{

        return sum + item.price * item.qty;

    },0);

};