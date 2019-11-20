export default class Inventory {
    constructor(id, allItemsList) {
        this.id = id;
        this.allItemsList = allItemsList;
        this.items = [];
    }

    addItem(itemId, givenQuantity) {
        let quantity = parseInt(givenQuantity);        
        let array = this.items;
        for (let i = 0; i < array.length; i++) {
            if (array[i].itemId === itemId) {
                array[i].quantity += quantity;
                return;
            }
        }
        this.items.push({ itemId, quantity });
    }

    removeItem(itemId, quantity) {
        let array = this.items;
        for (let i = 0; i < array.length; i++) {
            if (array[i].itemId === itemId) {
                if (array[i].quantity > quantity) {
                    array[i].quantity -= quantity;
                }
                else {
                    array.splice(i, 1);
                }
            }
        }
    }

    getItemQuantity(itemId) {
        let array = this.items;
        for (let i = 0; i < array.length; i++) {
            if (itemId == array[i].itemId) {
                return array[i].quantity;
            }
        }
    }

    getItem(itemId) {
        let array = this.items;
        for (let i = 0; i < array.length; i++) {
            if (itemId == array[i].itemId) {
                return array[i];
            }
        }
    }
}