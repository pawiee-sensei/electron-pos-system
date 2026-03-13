let cart = [];
window.cart = cart;

window.addToCart = function(product){

    const existing = cart.find(item => item.id === product.id);

    if(existing){

        if(existing.qty >= product.current_stock){
            showAlert("Not enough stock");
            return;
        }

        existing.qty++;

    }else{

        if(product.current_stock <= 0){
            showAlert("Product out of stock");
            return;
        }

        cart.push({
            id: product.id,
            name: product.name,
            price: product.selling_price,
            stock: product.current_stock,
            image: product.image,
            qty: 1
        });

    }

    renderCart();
}

window.increaseQty = function(id){

    const item = cart.find(i => i.id === id);

    if(item.qty < item.stock){

        item.qty++;

    }else{

        showAlert("Not enough stock");

    }

    renderCart();
}

window.decreaseQty = function(id){

    const index = cart.findIndex(i => i.id === id);

    if(cart[index].qty > 1){
        cart[index].qty--;
    }else{
        cart.splice(index,1);
    }

    renderCart();
}

window.getCartTotal = function(){
    return cart.reduce((sum,item)=>{
        return sum + item.price * item.qty;
    },0);
};