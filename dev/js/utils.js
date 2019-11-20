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
    let item;
    for (let i = 0; i < allItemsList.length; i++) {
        if (itemId == allItemsList[i].id) {
            item = allItemsList[i];
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
            let craftingMaterial = findItem(craftingMaterialId, allItemsList);
            disasseble += '<div class="crafting-material">' + craftingMaterial.name + '</div>';
        }
        disasseble += '<button id="disassemble-item" type="button" class="btn-primary disassemble-item">Disassemble Item</button>';
    }
    let div = document.createElement('div');
    let itemTemplate = '' +
        '<div id="' + item.id + '" class="item ' + item.type + '" data-type="' + item.type + '" data-price=" ' + item.price + '">' +
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
