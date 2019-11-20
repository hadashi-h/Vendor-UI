import { Weapon, Quest, Consumable, CraftingMaterial } from "./Item.js";
import { getItemTemplate } from "./utils.js";

export function initialItems() {
    let items = [
        new Quest(0, "Szczerbiec", "quest", 2085, "Some kind of a sword. A little bit jagged. I cannot use it, or spell its name."),
        new Consumable(1, "Russian Dumpling", "consumable", 456, "A culinary masterpiece. Will boost my energy up to 15% by 30 minutes!", [6]),
        new CraftingMaterial(2, "Rotten cardboard", "crafting", 127, "I could definitely use this. For something. Hm..."),
        new Weapon(3, "Slingshot", "weapon", 862, "A ranged weapon for catching squirrels.", [5, 7]),
        new Weapon(4, "Boxing Gloves", "weapon", 1250, "Now where is my kangaroo...", [5, 9]),
        new CraftingMaterial(5, "Paperclip and Rubberband", "crafting", 285, "Damn, a little bit of ketchup and I could do a helicopter."),
        new CraftingMaterial(6, "Flour", "crafting", 237, "How do I eat this?"),
        new CraftingMaterial(7, "Piece of Wood", "crafting", 359, "Multi-purpose. Nicely smelling. Not so soft. I can build almost anything with it."),
        new Quest(8, "Small magical branch", "quest", 189, "It shots fireworks when I touch it!"),
        new CraftingMaterial(9, "Piece of Iron", "crafting", 890, "It's hard to chew.")
    ]; 
    return items;
}

export function generateItemsForPerson(person) {
    let ret = [];
    let allItemsList = initialItems();

    for (let i = 0; i < allItemsList.length; i++) {
      let item = allItemsList[i];
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
      person.addItem(item.id, randomQuantity);
  
      while (!item.stackable && randomQuantity > 1) {
        randomQuantity = randomQuantity - 1;
        let itemTemplate = getItemTemplate(item.id, 1, allItemsList);
        ret.push(itemTemplate);
      }
      let itemTemplate = getItemTemplate(item.id, randomQuantity, allItemsList);
      ret.push(itemTemplate);
    }
    
    return ret;
  }