var vendorInventory = new Muuri('.vendor-inventory', {
    items: generateItems(56),

    dragEnabled: true,
    dragContainer: document.body,
    dragSort: function () {
      return [vendorInventory, userInventory]
    }
  });
  
  var userInventory = new Muuri('.user-inventory', {
    items: generateItems(15),
    dragEnabled: true,
    dragContainer: document.body,
    dragSort: function () {
      return [vendorInventory, userInventory]
    }
  });
  //init
  function generateItems(amount) {
    var ret = [];
    var itemTypes = [
        "quest",
        "weapon",
        "consumable",
        "crafting"
      ];
    for (var i = 0; i < amount; i++) {
        var randomItem = itemTypes[Math.floor(Math.random()*itemTypes.length)];
        ret.push(generateItem(
              randomItem,
              randomItem,
              100 + Math.floor(Math.random() * 5000)
          ));
      }

    return ret;
  }

  function generateItem(type, name, price) {
    var itemElem = document.createElement('div');
    var itemTemplate = '' +
        '<div class="item ' + type + '">' +
          '<div class="item-content">' +
                name + ' ' + price
          '</div>' +
        '</div>';

    itemElem.innerHTML = itemTemplate;
    return itemElem.firstChild;
  }