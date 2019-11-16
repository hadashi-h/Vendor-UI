import Person from "./Person.js";
import Item from "./Item.js";
import { elementMatches } from "./utils.js";
import { elementClosest } from "./utils.js";
import { compareItemType } from "./utils.js";
import { compareItemPrice } from "./utils.js";

var itemsList;
var user;
var vendor;

const itemTypes = {
  QUEST: "quest",
  WEAPON: "weapon",
  CONSUMABLE: "consumable",
  CRAFTING: "crafting"
};
Object.freeze(itemTypes);



$(document).ready(function () {
  itemsList = generateItems(20);
  vendor = new Person(2000, itemsList);
  vendorInventory.add(generateItemsTemplates(itemsList));
  vendorInventory.sort(compareItemType);
  user = new Person(2000, itemsList);
  updateFunds();
});

function updateFunds() {
  $("#user-money").html(user.money);
  $("#vendor-money").html(vendor.money);
}

$('.user-inventory').on('click', function (e) {
  if (elementMatches(e.target, '#use-item')) {
    removeItem(e, userInventory);
  }
});

function removeItem(e, inventory) {
  var elem = elementClosest(e.target, '.item');
  inventory.hide(elem, {
    onFinish: function (items) {
      var item = items[0];
      inventory.remove(item, { removeElements: true });
    }
  });
}

var vendorInventory = new Muuri('.vendor-inventory', {
  dragEnabled: true,
  dragStartPredicate: function (item, event) {
    //dragable only if price is not bigger than funds
    var element = item._element;
    var price = $(element).data("price");
    if (price > user.money) {
      return false;
    }
    return Muuri.ItemDrag.defaultStartPredicate(item, event);
  },
  dragContainer: document.body,
  dragSort: function () {
    return [vendorInventory, userInventory]
  },
  dragPlaceholder: {
    enabled: true,
    duration: 400,
    createElement: function (item) {
      return item.getElement().cloneNode(true);
    }
  },
  dragReleaseDuration: 400,
  dragReleseEasing: 'ease'
})
  .on('beforeSend', function (data) {
    var element = data.item._element;
    var price = $(element).data("price");
    if (price < user.money) {
      user.money = user.money - price;
      vendor.money = +vendor.money + +price;
      updateFunds();
    }
  });

var userInventory = new Muuri('.user-inventory', {
  dragEnabled: true,
  dragStartPredicate: function (item, event) {
    //dragable only if price is not bigger than funds
    var element = item._element;
    var price = $(element).data("price");
    if (price > vendor.money) {
      return false;
    }
    return Muuri.ItemDrag.defaultStartPredicate(item, event);
  },
  dragContainer: document.body,
  dragSort: function () {
    return [vendorInventory, userInventory]
  },
  dragPlaceholder: {
    enabled: true,
    duration: 400,
    createElement: function (item) {
      return item.getElement().cloneNode(true);
    }
  },
  dragReleaseDuration: 400,
  dragReleseEasing: 'ease'
})
  .on('beforeSend', function (data) {
    var element = data.item._element;
    var price = $(element).data("price");
    if (price < vendor.money) {
      vendor.money = vendor.money - price;
      user.money = +user.money + +price;
      updateFunds();
    }
  });


//init
function generateItemsTemplates(itemsList) {
  let ret = []; 
  for (var i = 0; i < itemsList.length; i++) {
    let randomQuantity = 1 + Math.floor(Math.random() * 100);
    vendor.addItem(itemsList[i].id, randomQuantity);
    let itemTemplate = vendor.inventory.getItemTemplate(itemsList[i].id);
    ret.push(itemTemplate);
  }
  return ret;
}

function generateItems(amount) {
  let ret = [];
  let keys = Object.keys(itemTypes);

  for (var i = 0; i < amount; i++) {
    let randomType = itemTypes[keys[keys.length * Math.random() << 0]];
    let randomPrice = 100 + Math.floor(Math.random() * 2000);
    let item = new Item(randomType, randomType, randomPrice, 'desc');
    ret.push(item);
  }
  return ret;
}
$('#sort-vendor-type').on('click', function () {
  vendorInventory.sort(compareItemType);
});
$('#sort-vendor-price').on('click', function () {
  vendorInventory.sort(compareItemPrice);
});
$('#sort-user-type').on('click', function () {
  userInventory.sort(compareItemType);
});
$('#sort-user-price').on('click', function () {
  userInventory.sort(compareItemPrice);
});