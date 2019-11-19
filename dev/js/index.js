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

let buySlider = $("#choose-quantity");
let buySliderValue = $(buySlider).val();
let disassembleSlider = $("#disassemble-slider");
let disassembleSliderValue = $(disassembleSlider).val();


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

function dragReleaseEnd(htmlItem) {
  let cloneData = cloneMap[htmlItem._id];
  if (cloneData) {
    delete cloneMap[htmlItem._id];

    let element = htmlItem._element;
    let item = findItem(element.id, itemsList);

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

      let stackAmount = $(element).find('.item-quantity').text();

      currentTransaction = new Transaction(buyer, seller, item, 1);
      if (stackAmount) {

        $(buySlider).attr('max', stackAmount);
        $('#max-value').html(stackAmount);
        $('#item-name').html(item.name);
        $('#item-price').html(item.price);
        $("#chosen-quantity").html(buySliderValue);
        $("#chosen-quantity-price").html($("#item-price").html() * buySliderValue);

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

$("#choose-quantity").on("input change", function () {
  buySliderValue = $(this).val();
  $("#chosen-quantity-price").html($("#item-price").html() * buySliderValue);
  $("#chosen-quantity").html(buySliderValue);
});

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
  //DISASSEMBLING ITEMS
  if (elementMatches(e.target, '#disassemble-item')) {
    $('#disassemble-modal #crafting-materials').empty();

    let clickedItem = elementClosest(e.target, '.item');
    let id = clickedItem.getAttribute('id');

    let item = findItem(id, itemsList);
    let craftingMaterialsArray = item.craftingMaterials;

    for (let i = 0; i < craftingMaterialsArray.length; i++) {
      let craftingMaterial = findItem(craftingMaterialsArray[i], itemsList);
      let craftingTemplate = `<div class="crafting-material">${craftingMaterial.name}</div>`
      $('#disassemble-modal #crafting-materials').append(craftingTemplate);
    }
    $('#disassemble-modal #item-name').html(item.name);

    let itemQuantity = $(clickedItem).find('.item-quantity');
    let stackAmount = $(itemQuantity[0]).text();
    let disassembledAmount = 1;
    if (stackAmount) {
      $(disassembleSlider).attr('max', stackAmount);
      $('#disassemble-modal #max-value').html(stackAmount);
      $("#disassemble-modal #chosen-quantity").html(disassembleSliderValue);
      disassembledAmount = disassembleSliderValue;
      $('#slider-wrapper').show();
    }
    else {
      $('#slider-wrapper').hide();
    }

    $(disassembleSlider).on("input change", function () {
      disassembleSliderValue = $(this).val();
      disassembledAmount = disassembleSliderValue;
      $("#disassemble-modal #chosen-quantity").html(disassembleSliderValue);
    });

    $('#disassemble-modal').modal('show');

    $('#dissasemble-accept').on('click', function () {
      dissasembleItem(item, disassembledAmount, clickedItem, craftingMaterialsArray);
      user.speaks("Welp, it's gone now");
    });
  }
});

function dissasembleItem(item, quantity, templateItem, craftingMaterialsArray) {
  user.removeItem(item.id, quantity);
  if (user.inventory.getItem(item.id)) {
    if (item.maxStackSize != 1) {
      $(templateItem).find('.item-quantity').html(user.inventory.getItemQuantity(item.id));
    }
    else {
      removeItem(userInventory, templateItem);
    }
  }
  else {
    removeItem(userInventory, templateItem);
  }

  for (let i = 0; i < quantity; i++) {
    for (let i = 0; i < craftingMaterialsArray.length; i++) {

      let craftingMaterialId = craftingMaterialsArray[i];
      let craftingMaterialAmount = 1;
      let itemTemplate = user.inventory.getItemTemplate(craftingMaterialId, ++uuid, craftingMaterialAmount);
      
      let craftingItem = findItem(craftingMaterialId, itemsList);

   ///   user.addItem(craftingMaterialId, craftingMaterialAmount);
    //  userInventory.add(itemTemplate);

      if (user.inventory.getItem(craftingMaterialId)) {
        user.addItem(craftingMaterialId, craftingMaterialAmount);
        let buyerItem = $(userInventory._element).find('div#' + craftingMaterialId);

        if (craftingItem.maxStackSize != 1) {
          $(buyerItem).find('.item-quantity').html(user.inventory.getItemQuantity(craftingMaterialId));

          if (buyerItem.length > 1) {
            removeItem(userInventory, buyerItem[0]);
          }
        }
      }
      else {
        user.addItem(craftingMaterialId, craftingMaterialAmount);
        userInventory.add(itemTemplate);

        let boughtItem = $(userInventory._element).find('div#' + craftingMaterialId);

        $(boughtItem[0]).find('.item-quantity').html(user.inventory.getItemQuantity(craftingMaterialId));
        if (item instanceof Quest) {
          $(boughtItem[1]).addClass('disabled');
        }
      }
    }
  }
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

$('#choose-quantity-cancel').on('click', function () {
  if (currentTransaction.buyer == "user") {
    cancelTransaction(user, userInventory, currentTransaction.item);
  }
  else {
    cancelTransaction(vendor, vendorInventory, currentTransaction.item);
  }
});
$('#choose-quantity-buy').on('click', function () {
  currentTransaction.quantity = buySliderValue;
  continueTransaction(currentTransaction);
});
