import Person from "./Person.js";
import { Weapon, Consumable, CraftingMaterial, Quest } from "./Item.js";
import { elementMatches, elementClosest, compareItemType, compareItemPrice, updateFunds, findItem, removeItem } from "./utils.js";
import { generateItems } from "./randomGenerator.js";
import Transaction from "./Transaction.js";

var itemsList;
var user;
var vendor;
var uuid = 0;
var currentTransaction;
var cloneMap = {};



const grids = [setupGrid('.vendor-inventory'), setupGrid('.user-inventory')];
var vendorInventory = grids[0];
var userInventory = grids[1];

$(document).ready(function () {
  itemsList = generateItems(10);

  vendor = new Person(20002, itemsList, false);
  vendorInventory.add(generateItemsTemplates(itemsList));
  vendorInventory.sort(compareItemType);

  userInventory.sort(compareItemType);
  user = new Person(20002, itemsList, true);

  updateFunds(user.money, vendor.money);
});

function setupGrid(container) {
  return new Muuri(container, {
    dragEnabled: true,
    dragSortHeuristics: {
      sortInterval: 50,
      minDragDistance: 10,
      minBounceBackAngle: 1
    },
    dragContainer: document.body,
    dragPlaceholder: {
      enabled: true,
      duration: 400,
      createElement: function (item) {
        return item.getElement().cloneNode(true);
      }
    },
    dragReleaseDuration: 400,
    dragReleseEasing: 'ease',
    dragSort: function () {
      return [vendorInventory, userInventory]
    },
    dragStartPredicate: function (htmlItem, event) {

      let item = htmlItem._element;
      if ($(item).hasClass('disabled')) {
        return false;
      }
      else {
        return Muuri.ItemDrag.defaultStartPredicate(htmlItem, event);
      }
    }
  }).on('dragStart', dragStart)
    .on('dragReleaseEnd', dragReleaseEnd)
    .on('receive', function (data) {
      cloneMap[data.item._id] = {
        item: data.item,
        fromGrid: data.fromGrid,
        toGrid: data.toGrid,
        index: data.fromIndex
      };
    })
    .on('send', function (data) {
      delete cloneMap[data.item._id];
    });
}

function dragStart(item) {
  item.getElement().style.width = item.getWidth() + 'px';
  item.getElement().style.height = item.getHeight() + 'px';
}
let slider = $("#choose-quantity");

let sliderValue = $(slider).val();
$("#chosen-quantity").html(sliderValue);
$("#chosen-quantity-price").html(sliderValue);

$(slider).change(function () {
  sliderValue = $(this).val();
  $("#chosen-quantity").html(sliderValue);
  $("#chosen-quantity-price").html(sliderValue);
});

function dragReleaseEnd(htmlItem) {
  let cloneData = cloneMap[htmlItem._id];
  if (cloneData) {
    delete cloneMap[htmlItem._id];

    if (cloneData.fromGrid != cloneData.toGrid) {
      let clone = cloneData.item.getElement().cloneNode(true);
      clone.setAttribute('style', 'display:none;');
      clone.children[0].setAttribute('style', '');
      clone.classList.add('clone')
      cloneData.fromGrid.add(clone, { index: cloneData.index });
      cloneData.fromGrid.show(clone);

      let buyer;
      let seller;

      if (htmlItem._gridId == 2) {
        buyer = "user";
        seller = "vendor";
      }
      else {
        buyer = "vendor";
        seller = "user";
      }

      let element = htmlItem._element;
      let item = findItem(element.id, itemsList);
      let stackAmount = $(element).find('.item-quantity').text();

      currentTransaction = new Transaction(buyer, seller, item, 1);
      if (stackAmount) {
        $(slider).attr('max', stackAmount);
        $('#max-value').html(stackAmount);
        $('#choose-quantity-modal').modal('show');
      }
      else {
        continueTransaction(currentTransaction);
      }
    }
  }

  htmlItem.getElement().style.width = '';
  htmlItem.getElement().style.height = '';
  grids.forEach(grid => {
    grid.refreshItems().layout();
  });
}

function continueTransaction(currentTransaction) {

  //user buys stuff
  let quantityToBuy = currentTransaction.quantity;
  let item = currentTransaction.item;
  let totalPrice = item.price * quantityToBuy;

  if (currentTransaction.buyer == "user") {

    if (!user.checkFunds(totalPrice)) {
      cancelTransaction(user, userInventory, item);
      vendor.speaks("Not enough money, kid");
    }
    else {
      finalizeTransation(user, userInventory, vendor, vendorInventory, item, quantityToBuy);
      vendor.speaks("Use it well");
    }
  }
  //user sells stuff
  if (currentTransaction.buyer == "vendor") {

    if (!vendor.checkFunds(totalPrice)) {
      cancelTransaction(vendorInventory, item);
      vendor.speaks("Please, I cannot buy all your junk");
    }
    else {
      finalizeTransation(vendor, vendorInventory, user, userInventory, item, quantityToBuy);
      user.speaks("I think you might want it");
    }
  }
  updateFunds(user.money, vendor.money);
}

function cancelTransaction(buyer, buyerInventory, item) {
  var notBoughtItem = $(buyerInventory._element).find('div#' + item.id);
  console.log(notBoughtItem);
  $(notBoughtItem).find('.item-quantity').html(buyer.inventory.getItemQuantity(item.id));
  removeItem(buyerInventory, notBoughtItem[0]);
  $('.clone').removeClass('clone');
}

function finalizeTransation(buyer, buyerInventory, seller, sellerInventory, item, quantity) {

  if (buyer.inventory.getItem(item.id)) {
    buyer.buyItem(item.id, quantity);
    let buyerItem = $(buyerInventory._element).find('div#' + item.id);
    if (item.maxStackSize != 1) {
      $(buyerItem).find('.item-quantity').html(buyer.inventory.getItemQuantity(item.id));

      if (buyerItem.length > 1) {
        removeItem(buyerInventory, buyerItem[0]);
      }
    }
  }
  else {
    buyer.buyItem(item.id, quantity);
    let boughtItem = $(buyerInventory._element).find('div#' + item.id);
    $(boughtItem[0]).find('.item-quantity').html(buyer.inventory.getItemQuantity(item.id));
    if (item instanceof Quest) {
      $(boughtItem[1]).addClass('disabled');
    }
  }

  seller.sellItem(item.id, quantity);
  let sellerItem = $(sellerInventory._element).find('div#' + item.id);

  if (seller.inventory.getItem(item.id)) {
    if (item.maxStackSize != 1) {
      $(sellerItem).find('.item-quantity').html(seller.inventory.getItemQuantity(item.id));
    }
    else {
      removeItem(sellerInventory, sellerItem[0]);
    }
  }
  else {
    removeItem(sellerInventory, sellerItem[0]);
  }
  $('.clone').removeClass('clone');
}

//init
function generateItemsTemplates(itemsList) {
  let ret = [];
  for (let i = 0; i < itemsList.length; i++) {
    let item = itemsList[i];
    let maxStackSize = item.maxStackSize;
    let randomQuantity;

    if (item instanceof Quest) {
      randomQuantity = 1;
    }
    else if (item instanceof Weapon) {
      randomQuantity = 1 + Math.floor(Math.random() * 5);
    }
    else {
      randomQuantity = 1 + Math.floor(Math.random() * 100);
    }
    vendor.addItem(item.id, randomQuantity);

    while (randomQuantity > maxStackSize) {
      randomQuantity = randomQuantity - maxStackSize;
      let itemTemplate = vendor.inventory.getItemTemplate(item.id, ++uuid, maxStackSize);
      ret.push(itemTemplate);
    }
    let itemTemplate = vendor.inventory.getItemTemplate(item.id, ++uuid, randomQuantity);
    ret.push(itemTemplate);
  }
  return ret;
}


//buttons
$('.user-inventory').on('click', function (e) {
  //USING ITEMS
  if (elementMatches(e.target, '#use-item')) {

    let clickedItem = elementClosest(e.target, '.item');
    let id = clickedItem.getAttribute('id');
    user.inventory.removeItem(+id, 1);

    let eatenItem = user.inventory.getItem(id);
    if (eatenItem) {
      if (eatenItem.maxStackSize != 1) {
        $(clickedItem).find('.item-quantity').html(user.inventory.getItemQuantity(id));
      }
      else {
        removeItem(userInventory, clickedItem);
      }
    }
    else {
      removeItem(userInventory, clickedItem);
    }
    user.speaks("Mmmm, delicious");
  }
});
$('.user-inventory').on('click', function (e) {
  if (elementMatches(e.target, '#disassemble-item')) {
    removeItem(e, userInventory);
    user.speaks("Welp, it's gone now");
    let elem = elementClosest(e.target, '.item');
    let id = elem.getAttribute('id');
    let item = findItem(id, itemsList);
    let craftingMaterialsArray = item.craftingMaterials;
    for (let i = 0; i < craftingMaterialsArray.length; i++) {
      let craftingMaterialId = craftingMaterialsArray[i];
      let itemTemplate = user.inventory.getItemTemplate(craftingMaterialId, ++uuid, 1);
      userInventory.add(itemTemplate);
    }
  }
});
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

$('#choose-quantity-cancel').on('click', function () {
  if (currentTransaction.buyer == "user") {
    cancelTransaction(user, userInventory, currentTransaction.item);
  }
  else {
    cancelTransaction(vendor, vendorInventory, currentTransaction.item);
  }
});
$('#choose-quantity-buy').on('click', function () {
  currentTransaction.quantity = sliderValue;
  continueTransaction(currentTransaction);
});
