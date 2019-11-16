import Person from "./Person.js";
import { elementMatches } from "./utils.js";
import { elementClosest } from "./utils.js";
import Item from "./Item.js";
 
var user = new Person;
user.money = 1000;

var vendor = new Person;
vendor.money = 2000;

const itemTypes = {
  QUEST: "quest",
  WEAPON: "weapon",
  CONSUMABLE: "consumable",
  CRAFTING: "crafting"
};

Object.freeze(itemTypes);


$(document).ready(function(){ 
  updateFunds();

});

function updateFunds(){
  $("#user-money").html(user.money);
  $("#vendor-money").html(vendor.money);
}
  
$('.user-inventory').on('click', function (e) {
  if (elementMatches(e.target, '#use-item')) {
    removeItem(e,userInventory);
  }
});

function removeItem(e, inventory) {
  var elem = elementClosest(e.target, '.item');
  inventory.hide(elem, {onFinish: function (items) {
    var item = items[0];
    inventory.remove(item, {removeElements: true});
  }});
}
 
var vendorInventory = new Muuri('.vendor-inventory', {
    items: generateItems(56),
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
    if(price < user.money){
        user.money = user.money - price;
        vendor.money = +vendor.money + +price;
        updateFunds();
    }
  });
  
  var userInventory = new Muuri('.user-inventory', {
    items: generateItems(2),
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
    if(price < vendor.money){
        vendor.money = vendor.money - price;
        user.money = +user.money + +price;
        updateFunds();
    }
  });

  
//init
  function generateItems(amount) {
    let ret = []; 
    let keys = Object.keys(itemTypes);

    for (var i = 0; i < amount; i++) {
      let randomType = itemTypes[keys[ keys.length * Math.random() << 0]];
      let randomQuantity = 1 + Math.floor(Math.random() * 100);
      let randomPrice = 100 + Math.floor(Math.random() * 2000);

      let item = new Item(i, randomType, randomType, randomPrice, 'desc');
      let itemTemplate = item.getItemTemplate();

      ret.push(itemTemplate);
      }
     return ret;
  }
