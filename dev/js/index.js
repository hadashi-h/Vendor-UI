import Person from "./Person.js";
import { Weapon, Consumable, CraftingMaterial, Quest } from "./Item.js";
import { elementMatches, elementClosest, compareItemType, compareItemPrice, updateFunds, findItem } from "./utils.js";
import Transaction from "./Transaction.js";

var itemsList;
var user;
var vendor;
var uuid = 0;
var currentTransaction;

const itemTypes = {
  QUEST: "quest",
  WEAPON: "weapon",
  CONSUMABLE: "consumable",
  CRAFTING: "crafting"
};

Object.freeze(itemTypes);

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
    }
  }).on('dragStart', dragStart)
    .on('dragReleaseEnd', dragReleaseEnd);
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
  if (currentTransaction.buyer == "user") {
    if (!user.checkFunds(item.price * quantityToBuy)) {
      finalizeTransation(user, userInventory, vendor, vendorInventory, item, quantityToBuy, false);
      vendor.speaks("Not enough money, kid");
      return false;
    }
    else {
      finalizeTransation(user, userInventory, vendor, vendorInventory, item, quantityToBuy, true);
      vendor.speaks("Use it well");
    }
  }
  //user sells stuff
  else {
    if (item instanceof Quest) {
      finalizeTransation(vendor, vendorInventory, user, userInventory, item, quantityToBuy, false);
      vendor.speaks("Nah, I don't want this");
      return false;
    }
    if (!vendor.checkFunds(item.price * quantityToBuy)) {
      finalizeTransation(vendor, vendorInventory, user, userInventory, item, quantityToBuy, false);
      vendor.speaks("Please, I cannot buy all your junk");
      return false;
    }
    else {
      finalizeTransation(vendor, vendorInventory, user, userInventory, item, quantityToBuy, true);
      user.speaks("I think you might want it");
    }
  }
  updateFunds(user.money, vendor.money);
}


function removeItem(e, inventory) {
  let elem = elementClosest(e.target, '.item');
  let id = elem.getAttribute('id');
  user.inventory.removeItem(+id, 1);
  inventory.hide(elem, {
    onFinish: function (items) {
      let item = items[0];
      inventory.remove(item, { removeElements: true });
    }
  });
}

function finalizeTransation(buyer, buyerInventory, seller, sellerInventory, item, quantity, successful) {
  let beforeTransactionQuantity = seller.inventory.getItemQuantity(item.id);
  if (!successful) {
    let vendorItem = seller.inventory.getItemTemplate(item.id, ++uuid, beforeTransactionQuantity);
    sellerInventory.add(vendorItem);

    buyerInventory.hide(vendorItem, {
      onFinish: function (items) {
        let item2 = items[0];
        buyerInventory.remove(item2, { removeElements: true });
      }
    });
    return;
  }
  let leftForSeller = beforeTransactionQuantity - quantity;
  let existingItem = buyer.inventory.getItem(item.id);

  seller.sellItem(item.id, quantity);
  buyer.buyItem(item.id, quantity);

  if (leftForSeller > 0 && item.maxStackSize != 1) {
    let vendorItem = seller.inventory.getItemTemplate(item.id, ++uuid, leftForSeller);
    sellerInventory.add(vendorItem);
  }

  if (existingItem != undefined) {
    $(buyerInventory._element).find('#' + item.id).find('.item-quantity').html(buyer.inventory.getItemQuantity(item.id));
  }
  else {
    let userItem = buyer.inventory.getItemTemplate(item.id, ++uuid, quantity);
    buyerInventory.add(userItem);
  }
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

function generateItems(amount) {
  let ret = [];
  let keys = Object.keys(itemTypes);

  for (let i = 0; i < amount; i++) {
    let randomType = itemTypes[keys[keys.length * Math.random() << 0]];
    let randomPrice = 100 + Math.floor(Math.random() * 2000);
    let item;
    switch (randomType) {
      case itemTypes.QUEST:
        item = new Quest(randomType, randomType, randomPrice, 'desc');
        break;
      case itemTypes.WEAPON:
        item = new Weapon(randomType, randomType, randomPrice, 'desc');
        item.craftingMaterials = [1, 2];
        break;
      case itemTypes.CONSUMABLE:
        item = new Consumable(randomType, randomType, randomPrice, 'desc');
        item.craftingMaterials = [3, 4];
        break;
      case itemTypes.CRAFTING:
        item = new CraftingMaterial(randomType, randomType, randomPrice, 'desc');
        break;
      default:
        break;
    }
    ret.push(item);
  }
  return ret;
}

//buttons
$('.user-inventory').on('click', function (e) {
  if (elementMatches(e.target, '#use-item')) {
    removeItem(e, userInventory);
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
    finalizeTransation(user, userInventory, vendor, vendorInventory, currentTransaction.item, 0, false);
  }
  else {
    finalizeTransation(vendor, vendorInventory, user, userInventory, currentTransaction.item, 0, false);
  }
})
$('#choose-quantity-buy').on('click', function () {
  currentTransaction.quantity = sliderValue;
  continueTransaction(currentTransaction);
});
