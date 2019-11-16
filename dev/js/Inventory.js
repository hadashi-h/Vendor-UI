export default class Inventory {
    constructor(id, allItems) {
        this.id = id;
        this.allItems = allItems;
        this.items = [];
    }

    addItem(itemId, quantity) {
        this.items.push({ itemId, quantity });
    }

    getItem(itemId) { 
        let array = this.allItems; 
        for (let i = 0; i < array.length; i++) {
            if (itemId == array[i].id) {
                console.log(array[i].name);
            }
        }
    }

    getInventory() {
        return this.items;
    }

}