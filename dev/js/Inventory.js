export default class Inventory {
    constructor(id, allItems) {
        this.id = id;
        this.allItems = allItems;
        this.items = [];
    }

    addItem(itemId, quantity) {
        this.items.push({ itemId, quantity });
    }

    getItemQuantity(itemId) { 
        let array = this.items; 
        for (let i = 0; i < array.length; i++) {
            if (itemId == array[i].itemId) {
                return array[i].quantity;
            }
        }
    }

    getInventory() {
        return this.items;
    }

    
    getItemTemplate(itemId){
        let item;
        let allItems = this.allItems;
        for (let i = 0; i < allItems.length; i++) {
            if (itemId == allItems[i].id) {
                item = allItems[i];
                break;
            }
        }

        let div = document.createElement('div');
        let itemTemplate = '' +
        '<div id="'+ item.id +'" class="item ' + item.type + '" data-type="' + item.type + '" data-price=" '+ item.price + '">' +
          '<div class="item-content">' +
                item.name + ' ' + item.price +
              '<div class="item-quantity">' +  this.getItemQuantity(item.id) + '</div>' +
              '<div class="item-more">'+ 
                  '<h5>' + item.name + '</h5>' +
                  '<h6>' + item.price + '</h6>' +
                  '<p>' + item.description + '</p>' +
              '</div>' +
          '</div>' +
        '</div>';
        div.innerHTML = itemTemplate;
        return div.firstChild;
    }

}