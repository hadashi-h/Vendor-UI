import { Consumable, DisassemblableItem } from "./Item.js";
import { findItem } from "./utils.js";

export default class Inventory {
    constructor(id, allItems) {
        this.id = id;
        this.allItems = allItems;
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

    getItemTemplate(itemId, stackId, quantity) {
        let item;
        let allItems = this.allItems;
        for (let i = 0; i < allItems.length; i++) {
            if (itemId == allItems[i].id) {
                item = allItems[i];
                break;
            }
        }

        let usable = "";
        let disasseble = "";
        if (item instanceof Consumable) {
            usable = '<button id="use-item" type="button" class="btn-primary use-item">Use Item</button>';
        }
        if (item instanceof DisassemblableItem) {
            let craftingMaterialsList = item.craftingMaterials;
            for (let i = 0; i < craftingMaterialsList.length; i++) {
                let craftingMaterialId = craftingMaterialsList[i];
                let craftingMaterial = findItem(craftingMaterialId, this.allItems);
                disasseble += '<div class="crafting-material">' + craftingMaterial.name + '</div>';
            }
            disasseble += '<button id="disassemble-item" type="button" class="btn-primary disassemble-item">Disassemble Item</button>';
        } 
        let div = document.createElement('div');
        let itemTemplate = '' +
            '<div id="' + item.id + '" class="item ' + item.type + '" data-stackId="' + stackId + '" data-type="' + item.type + '" data-price=" ' + item.price + '">' +
                '<div class="item-content">' +
                    item.name + ' $' + item.price +
                    '<div class="item-quantity">' + quantity + '</div>' +
                '</div>' + 
                '<div class="item-more">' +
                    '<h5>' + item.name + '</h5>' +
                    '<h6>$' + item.price + '</h6>' +
                    '<p>' + item.description + '</p>' +
                    usable +
                    disasseble +
                '</div>' +
            '</div>';
        div.innerHTML = itemTemplate;
        return div.firstChild;
    }
}