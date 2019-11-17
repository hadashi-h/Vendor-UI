import Inventory from "./Inventory.js";
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

    buyItem(itemId, quantity) {
        let item = this.inventory.getItem(itemId);
        let totalPrice = item.price * quantity;
        if (totalPrice > this.money) {
            return false;
        }
        else {
            this.money = this.money - totalPrice;
            return true;
        }
    }

    sellItem(itemId, quantity) {
        let item = this.inventory.getItem(itemId);
        let totalPrice = item.price * quantity;

        this.money = this.money + totalPrice;
    }

    speaks(text) {
        let person = "vendor";
        if(this.isUser){
            person = "user";
        }
        $('body').append('<div class="monit ' + person + '">' + text + '</div>');
        setTimeout(function () {
            $('.monit.' + person).remove();
        }, 3000);
    }
} 