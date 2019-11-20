import { updateFunds, removeItem } from "./utils.js";
import { Quest } from "./Item.js";

const defaultQuantity = 1;

export default class Transaction {
    constructor(buyer, buyerInventory, seller, sellerInventory, item) {
        this.buyer = buyer;
        this.buyerInventory = buyerInventory;
        this.seller = seller;
        this.sellerInventory = sellerInventory;
        this.item = item;
        this.quantity = defaultQuantity;
    }

    continue() {
        //user buys stuff
        let totalPrice = this.item.price * this.quantity;

        if (this.buyer.isUser) {
            if (!this.buyer.checkFunds(totalPrice)) {
                this.cancel();
                this.seller.speaks("Not enough money, kid");
            }
            else {
                this.finalize();
                this.seller.speaks("Use it well");
            }
            updateFunds(this.buyer.money, this.seller.money);
        }
        //user sells stuff
        if (!this.buyer.isUser) {

            if (!this.buyer.checkFunds(totalPrice)) {
                this.cancel();
                this.buyer.speaks("Please, I cannot buy all your junk");
            }
            else {
                this.finalize();
                this.seller.speaks("I think you might want it");
            }
            updateFunds(this.seller.money, this.buyer.money);
        }
    }

    cancel() {
        let notBoughtItem = $(this.buyerInventory._element).find('div#' + this.item.id);
        $(notBoughtItem).find('.item-quantity').html(this.buyer.inventory.getItemQuantity(this.item.id));
        removeItem(this.buyerInventory, notBoughtItem[0]);
        $('.clone').removeClass('clone');
    }

    finalize() {
        if (this.buyer.inventory.getItem(this.item.id)) {
            this.buyer.buyItem(this.item.id, this.quantity);
            let buyerItem = $(this.buyerInventory._element).find('div#' + this.item.id);
            if (this.item.stackable) {
                $(buyerItem).find('.item-quantity').html(this.buyer.inventory.getItemQuantity(this.item.id));

                if (buyerItem.length > 1) {
                    removeItem(this.buyerInventory, buyerItem[0]);
                }
            }
        }
        else {
            this.buyer.buyItem(this.item.id, this.quantity);
            let boughtItem = $(this.buyerInventory._element).find('div#' + this.item.id);
            $(boughtItem[0]).find('.item-quantity').html(this.buyer.inventory.getItemQuantity(this.item.id));
            if (this.item instanceof Quest) {
                $(boughtItem[1]).addClass('disabled');
            }
        }

        this.seller.sellItem(this.item.id, this.quantity);
        let sellerItem = $(this.sellerInventory._element).find('div#' + this.item.id);

        if (this.seller.inventory.getItem(this.item.id) && this.item.stackable) {
            $(sellerItem).find('.item-quantity').html(this.seller.inventory.getItemQuantity(this.item.id));
        }
        else {
            removeItem(this.sellerInventory, sellerItem[0]);
        }
        $('.clone').removeClass('clone');
    }
}