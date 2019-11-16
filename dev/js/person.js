import Inventory from "./Inventory.js";
var personsCounter = 0;

export default class Person {
    constructor(money, allItems) {
        this.id = personsCounter++;
        this.money = money;
        this.allItems = allItems;
        this.inventory = new Inventory(this.id, this.allItems);
    } 

    addItem(itemId, quantity){
        this.inventory.addItem(itemId, quantity);
    }
} 