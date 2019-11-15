import Person from "./person.js";
 
var user = new Person;
user.money = 1000;

var vendor = new Person;
vendor.money = 2000;


$(document).ready(function(){ 
  updateFunds();
});

function updateFunds(){
  $("#user-money").html(user.money);
  $("#vendor-money").html(vendor.money);
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
              100 + Math.floor(Math.random() * 2000),
              1 + Math.floor(Math.random() * 100),
              'description'
          ));
      }

    return ret;
  }

  function generateItem(type, name, price, quantity, description) {
    var itemElem = document.createElement('div');
    var useItem = "";
    if(type == "consumable"){
      useItem = '<button type="button" class="btn-primary">use item</button>';
    }
    var itemTemplate = '' +
        '<div class="item ' + type + '" data-price=" '+ price + '">' +
          '<div class="item-content">' +
                name + ' ' + price +
              '<div class="item-quantity">'+ quantity +'</div>' +
              '<div class="item-more">'+ 
                  '<h5>' + name + '</h5>' +
                  '<h6>' + price + '</h6>' +
                  '<p>' + description + '</p>' +
                  useItem +
              '</div>' +
          '</div>' +
        '</div>';

    itemElem.innerHTML = itemTemplate;
    return itemElem.firstChild;
  }