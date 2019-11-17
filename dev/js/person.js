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

    addItem(itemId, quantity){
        this.inventory.addItem(itemId, quantity);
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