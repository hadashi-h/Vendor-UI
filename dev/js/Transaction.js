export default class Transaction{
    constructor(buyer, seller, item, quantity){
        this.buyer = buyer;
        this.seller = seller;
        this.item = item;
        this.quantity = quantity;
        this.cancelled = false;
    }
}