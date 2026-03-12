let cart = [];

function addToCart(product){

    const existing = cart.find(item => item.id === product.id);

    if(existing){
        existing.qty += 1;
    }else{
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1
        });
    }

}

function getCart(){
    return cart;
}

function getTotal(){

    return cart.reduce((total,item)=>{
        return total + item.price * item.qty;
    },0);

}

module.exports = {
    addToCart,
    getCart,
    getTotal
};