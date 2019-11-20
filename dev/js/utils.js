import { Consumable, DisassemblableItem } from "./Item.js";

export function elementMatches(element, selector) {
    var p = Element.prototype;
    return (p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector).call(element, selector);
}

export function elementClosest(element, selector) {
    if (window.Element && !Element.prototype.closest) {
        var isMatch = elementMatches(element, selector);
        while (!isMatch && element && element !== document) {
            element = element.parentNode;
            isMatch = element && element !== document && elementMatches(element, selector);
        }
        return element && element !== document ? element : null;
    }
    else {
        return element.closest(selector);
    }
}

export function compareItemType(a, b) {
    let aVal = a.getElement().getAttribute('data-type') || '';
    let bVal = b.getElement().getAttribute('data-type') || '';
    return aVal < bVal ? -1 : aVal > bVal ? 1 : compareItemPrice(a, b);
}
export function compareItemPrice(a, b) {
    let aVal = a.getElement().getAttribute('data-price') || '';
    let bVal = b.getElement().getAttribute('data-price') || '';
    return +aVal < +bVal ? -1 : +aVal > +bVal ? 1 : 0;
}

export function updateFunds(userMoney, vendorMoney) {
    $("#user-money").html(userMoney);
    $("#vendor-money").html(vendorMoney);
}

export function findItem(itemId, list) {
    for (let i = 0; i < list.length; i++) {
        if (itemId == list[i].id) {
            return list[i];
        }
    }
}

export function removeItem(inventory, itemToDestroy) {
    inventory.hide(itemToDestroy, {
        onFinish: function (item) {
            inventory.remove(item, { removeElements: true });
        }
    });
}

export function getItemTemplate(itemId, quantity, allItemsList) {
    let item = findItem(itemId, allItemsList);
    let usable = "";
    let disasseble = "";
    let stackable = "";

    if(item.stackable){
        stackable = "stackable";
    }
  
    if (item instanceof Consumable) {
        usable = '<button id="use-item" type="button" class="btn-accent use-item">Use Item</button>';
    } 
    if (item instanceof DisassemblableItem) { 
        disasseble = "<div class='disassemble'><p>Made of:</p>";
        let craftingMaterialsList = item.craftingMaterials;
        for (let i = 0; i < craftingMaterialsList.length; i++) {
            let craftingMaterialId = craftingMaterialsList[i];
            let craftingMaterial = findItem(craftingMaterialId, allItemsList);
            disasseble += '<div class="crafting-material"><img src="' + craftingMaterial.icon + '"/></div>';
        }
        disasseble += '<button id="disassemble-item" type="button" class="btn-accent disassemble-item">Disassemble Item</button></div>';
    }
    let div = document.createElement('div');
    let itemTemplate = '' +
        '<div id="' + item.id + '" class="item ' + item.className + ' ' + stackable + '" data-type="' + item.type + '" data-price=" ' + item.price + '">' +
        '<div class="item-content">' +
            '<img src="' + item.icon + '"/>'+
            '<div class="item-quantity">' + quantity + '</div>' +
        '</div>' +
        '<div class="item-more">' +
            '<div class="d-flex justify-content-between align-items-center"><h5>' + item.name + '</h5><h5>$' + item.price + '</h5></div>' +
            '<div class="d-flex justify-content-between align-items-center"><p>' + item.type + '</p> ' +  usable + ' </div>' +
            '<p>' + item.description + '</p>' +
            disasseble +
            '</div>' +
        '</div>';
    div.innerHTML = itemTemplate;
    return div.firstChild;
}
