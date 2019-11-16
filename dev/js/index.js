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



const grids = [setupGrid('.vendor-inventory'), setupGrid('.user-inventory')];
var vendorInventory = grids[0];
var userInventory = grids[1];

$(document).ready(function () {
  itemsList = generateItems(20);
  vendor = new Person(2000, itemsList);
  vendorInventory.add(generateItemsTemplates(itemsList));
  vendorInventory.sort(compareItemType);
  userInventory.sort(compareItemType);
  user = new Person(2000, itemsList);
  updateFunds();
});

function updateFunds() {
  $("#user-money").html(user.money);
  $("#vendor-money").html(vendor.money);
}
function allGrids() {
  return grids;
}

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
    dragSortPredicate: function (item) {
      var result = Muuri.ItemDrag.defaultSortPredicate(item, dragSortOptions);
      console.log(item);
      if(item._element.classList.contains('quest') && result.grid._element.classList.contains('vendor-inventory')){
        showMonit("Nah, I don't want this");
        return false;
      }
      return result;

    }
  }).on('dragStart', dragStart)
    .on('dragReleaseEnd', dragReleaseEnd);
}
var dragSortOptions = {
  action: 'swap',
  threshold: 50
};
function dragStart(item) {
  item.getElement().style.width = item.getWidth() + 'px';
  item.getElement().style.height = item.getHeight() + 'px';
}
function dragReleaseEnd(item){
  item.getElement().style.width = '';
  item.getElement().style.height = '';
  grids.forEach(grid => {
    grid.refreshItems().layout();
  });
}

function removeItem(e, inventory) {
  let elem = elementClosest(e.target, '.item');
  let id = elem.getAttribute('id');
  vendor.inventory.removeItem(+id, 1);
  inventory.hide(elem, {
    onFinish: function (items) {
      let item = items[0];
      inventory.remove(item, { removeElements: true });
    }
  });
}

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

function showMonit(text){
  $('body').append('<div class="monit">' + text + '</div>');
  setTimeout(function() { 
    $('.monit').remove();
  }, 3000);
}

//buttons
$('.user-inventory').on('click', function (e) {
  if (elementMatches(e.target, '#use-item')) {
    removeItem(e, userInventory);
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