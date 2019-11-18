
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