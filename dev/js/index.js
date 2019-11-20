import Person from "./Person.js";
import {
  elementMatches, elementClosest, compareItemType, compareItemPrice, updateFunds,
  findItem, removeItem
} from "./utils.js";
import Transaction from "./Transaction.js";
import { initialItems, generateItemsForPerson } from "./InitialItems.js";

var allItemsList;
var user;
var vendor;
var currentTransaction;
var cloneMap = {};

let buySlider = $("#choose-quantity");
let buySliderValue = 1;
let disassembleSlider = $("#disassemble-slider");
let disassembleSliderValue = 1;


const grids = [setupGrid('.vendor-inventory'), setupGrid('.user-inventory')];
var vendorInventory = grids[0];
var userInventory = grids[1];

$(document).ready(function () {
  allItemsList = initialItems();

  vendor = new Person(20002, allItemsList, false);
  vendorInventory.add(generateItemsForPerson(vendor));
  vendorInventory.sort(compareItemType);

  userInventory.sort(compareItemType);
  user = new Person(20002, allItemsList, true);

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
      if (cloneMap[data.item._id] == undefined) {
        cloneMap[data.item._id] = {
          item: data.item,
          fromGrid: data.fromGrid,
          toGrid: data.toGrid,
          index: data.fromIndex
        };
      }
      else {
        cloneMap[data.item._id].toGrid = data.toGrid;
      }
    })
}

function dragStart(item) {
  item.getElement().style.width = item.getWidth() + 'px';
  item.getElement().style.height = item.getHeight() + 'px';
}

function dragReleaseEnd(htmlItem) {
  let cloneData = cloneMap[htmlItem._id];
  if (cloneData && cloneData.fromGrid != cloneData.toGrid) {
    delete cloneMap[htmlItem._id];

    let element = htmlItem._element;
    let item = findItem(element.id, allItemsList);
    let clone = cloneData.item.getElement().cloneNode(true);
    clone.setAttribute('style', 'display:none;');
    clone.children[0].setAttribute('style', '');
    clone.classList.add('clone')
    cloneData.fromGrid.add(clone, { index: cloneData.index });
    cloneData.fromGrid.show(clone);

    let buyer;
    let seller;
    let buyerInventory;
    let sellerInventory;

    if (htmlItem._gridId == 2) {
      buyer = user;
      seller = vendor;
      buyerInventory = userInventory;
      sellerInventory = vendorInventory;
    }
    else {
      buyer = vendor;
      seller = user;
      buyerInventory = vendorInventory;
      sellerInventory = userInventory;
    }

    let stackAmount = $(element).find('.item-quantity').text();

    currentTransaction = new Transaction(buyer, buyerInventory, seller, sellerInventory, item);

    $(buySlider).val(1);
    buySliderValue = 1;
    if (+stackAmount != 1) {
      $(buySlider).attr('max', stackAmount);
      $('#choose-quantity-modal #max-value').html(stackAmount);
      $('#choose-quantity-modal #item-name').html(item.name);
      $('#choose-quantity-modal #item-price').html(item.price);
      $("#choose-quantity-modal #chosen-quantity").html(buySliderValue);
      $("#choose-quantity-modal #chosen-quantity-price").html($("#item-price").html() * buySliderValue);

      $('#choose-quantity-modal').modal('show');
    }
    else {
      currentTransaction.continue();
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
  $("#choose-quantity-modal #chosen-quantity-price").html($("#choose-quantity-modal #item-price").html() * buySliderValue);
  $("#choose-quantity-modal #chosen-quantity").html(buySliderValue);
});

//buttons
$('.user-inventory').on('click', function (e) {
  //USING ITEMS
  if (elementMatches(e.target, '#use-item')) {

    let clickedItem = elementClosest(e.target, '.item');
    let itemId = clickedItem.getAttribute('id');
    let item = findItem(itemId, allItemsList);
    user.inventory.removeItem(+itemId, 1);

    let eatenItem = user.inventory.getItem(itemId);
    if (eatenItem && item.stackable) {
      $(clickedItem).find('.item-quantity').html(user.inventory.getItemQuantity(itemId));
    }
    else {
      removeItem(userInventory, clickedItem);
    }
    user.speaks("Mmmm, delicious");
  }
  //DISASSEMBLING ITEMS
  if (elementMatches(e.target, '#disassemble-item')) {
    $('#disassemble-modal #crafting-materials').empty();
    $(disassembleSlider).val(1);
    disassembleSliderValue = 1;

    let clickedItem = elementClosest(e.target, '.item');
    let id = clickedItem.getAttribute('id');

    let item = findItem(id, allItemsList);
    let craftingMaterialsArray = item.craftingMaterials;

    for (let i = 0; i < craftingMaterialsArray.length; i++) {
      let craftingMaterial = findItem(craftingMaterialsArray[i], allItemsList);
      let craftingTemplate = `<div class="crafting-material">${craftingMaterial.name}</div>`
      $('#disassemble-modal #crafting-materials').append(craftingTemplate);
    }
    $('#disassemble-modal #item-name').html(item.name);

    let itemQuantity = $(clickedItem).find('.item-quantity');
    let stackAmount = $(itemQuantity[0]).html();
    if (+stackAmount != 1) {
      $(disassembleSlider).attr('max', stackAmount);
      $('#disassemble-modal #max-value').html(stackAmount);
      $("#disassemble-modal #chosen-quantity").html(disassembleSliderValue);
      $('#slider-wrapper').show();
    }
    else {
      $('#slider-wrapper').hide();
    }
    $('#disassemble-modal').attr("data-id", id);
    $('#disassemble-modal').modal('show');
  }
});

$(disassembleSlider).on("input change", function () {
  disassembleSliderValue = $(this).val();
  $("#disassemble-modal #chosen-quantity").html(disassembleSliderValue);
});

$('#dissasemble-accept').on('click', function () {
  let itemId = $('#disassemble-modal').attr('data-id');
  user.dissasembleItem(+itemId, disassembleSliderValue, userInventory);
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
  currentTransaction.cancel();
});
$('#choose-quantity-buy').on('click', function () {
  currentTransaction.quantity = buySliderValue;
  currentTransaction.continue();
});
