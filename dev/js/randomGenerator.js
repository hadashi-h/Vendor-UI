
import { Weapon, Consumable, CraftingMaterial, Quest } from "./Item.js";

const itemTypes = {
    QUEST: "quest",
    WEAPON: "weapon",
    CONSUMABLE: "consumable",
    CRAFTING: "crafting"
  };
  
  Object.freeze(itemTypes);
  
export function generateItems(amount) {
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