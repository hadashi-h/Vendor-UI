import Inventory from "./Inventory.js";
import { findItem } from "./utils.js";

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