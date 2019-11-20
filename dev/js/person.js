import Inventory from "./Inventory.js";
import { findItem, removeItem } from "./utils.js";

var personsCounter = 0;

export default class Person {
    constructor(money, allItems, isUser) {
        this.id = personsCounter++;
        this.money = money;
        this.allItems = allItems;
        this.isUser = isUser;
        this.inventory = new Inventory(this.id, this.allItems);
    }

    addItem(itemId, quantity) {
        this.inventory.addItem(itemId, quantity);
    }
    removeItem(itemId, quantity) {
        this.inventory.removeItem(itemId, quantity);
    }

    checkFunds(price) {
        if (price > this.money) {
            return false;
        }
        return true;
    }

    buyItem(itemId, quantity) { 
        let item = findItem(itemId, this.allItems);
        let totalPrice = item.price * quantity;
        this.money = this.money - totalPrice;
        this.inventory.addItem(item.id, quantity);
    }

    sellItem(itemId, quantity) {
        let item = findItem(itemId, this.allItems);
        let totalPrice = item.price * quantity;

        this.money = this.money + totalPrice;
        this.inventory.removeItem(item.id, quantity);
    }

    dissasembleItem(itemId, quantity, inventoryGrid) {
        let item = findItem(itemId, this.allItems);
        let craftingMaterialsArray = item.craftingMaterials;
        let templateItem = $(inventoryGrid._element).find('div#' + itemId)[0];

        this.removeItem(itemId, quantity);
        if (this.inventory.getItem(itemId) && item.maxStackSize != 1) {
            $(templateItem).find('.item-quantity').html(this.inventory.getItemQuantity(itemId));
        }
        else {
            removeItem(inventoryGrid, templateItem);
        }

        for (let i = 0; i < craftingMaterialsArray.length; i++) {

            let craftingMaterialId = craftingMaterialsArray[i];

            let craftingItem = findItem(craftingMaterialId, this.allItems);
            let alreadyOwnsItem = this.inventory.getItem(craftingMaterialId);
            this.addItem(craftingMaterialId, quantity);

            if (alreadyOwnsItem) {
                let buyerItem = $(inventoryGrid._element).find('div#' + craftingMaterialId);

                if (craftingItem.maxStackSize != 1) {
                    $(buyerItem).find('.item-quantity').html(this.inventory.getItemQuantity(craftingMaterialId));
                    if (buyerItem.length > 1) {
                        removeItem(inventoryGrid, buyerItem[0]);
                    }
                }
            }
            else {
                let itemTemplate = this.inventory.getItemTemplate(craftingMaterialId, quantity);
                inventoryGrid.add(itemTemplate);
                let boughtItem = $(inventoryGrid._element).find('div#' + craftingMaterialId);
                $(boughtItem[0]).find('.item-quantity').html(this.inventory.getItemQuantity(craftingMaterialId));
            }
        }
        this.speaks("Welp, it's gone now");
    }

    speaks(text) {
        let person = "vendor";
        if (this.isUser) {
            person = "user";
        }
        $('body').append('<div class="monit ' + person + '">' + text + '</div>');
        setTimeout(function () {
            $('.monit.' + person).remove();
        }, 3000);
    }
} 