import Person from "./Person.js";
import { Weapon, Consumable, CraftingMaterial, Quest } from "./Item.js";
import { elementMatches, elementClosest, compareItemType, compareItemPrice } from "./utils.js";

var itemsList;
var user;
var vendor;
var uuid = 0;

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
  vendor = new Person(2000, itemsList, false);
  vendorInventory.add(generateItemsTemplates(itemsList));
  vendorInventory.sort(compareItemType);
  userInventory.sort(compareItemType);
  user = new Person(2000, itemsList, true);
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
    dragSortPredicate: function (htmlItem) {
      let result = Muuri.ItemDrag.defaultSortPredicate(htmlItem, dragSortOptions);
      let resultGrid = result.grid;
      let item;
      let element = htmlItem._element;

      for (let i = 0; i < itemsList.length; i++) {
        if (element.id == itemsList[i].id) {
          item = itemsList[i];
          break;
        }
      }
      if (resultGrid) {
        let sourceGridId = htmlItem._gridId;
        let destinationGridId = resultGrid._id;

        if (sourceGridId != destinationGridId) {
          let userGrid = resultGrid._element.classList.contains('user-inventory');
          let stackAmount = $(element).find('.item-quantity').text();
          let quantityToBuy = 1;

          if (stackAmount) {
            $('#choose-quantity-modal').modal('show');
            quantityToBuy = 2;
          }

          //user buys stuff
          if (userGrid) {
            if (user.buyItem(item.id, quantityToBuy) == false) {
              vendor.speaks("Not enough money, kid");
              return false;
            }
            else {
              vendor.sellItem(item.id, quantityToBuy);
              vendor.speaks("Use it well");
            }
          }
          //user sells stuff
          else {
            if (item instanceof Quest) {
              vendor.speaks("Nah, I don't want this");
              return false;
            }
            else if (vendor.buyItem(item.id, quantityToBuy) == false) {
              vendor.speaks("Please, I cannot buy all your junk");
              return false;
            }
            else {
              user.sellItem(item.id, quantityToBuy);
              user.speaks("I think you might want it");
            }
          }
        }
      }
      updateFunds();
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
function dragReleaseEnd(item) {
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
        break;
      case itemTypes.CONSUMABLE:
        item = new Consumable(randomType, randomType, randomPrice, 'desc');
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