import { Weapon, Quest, Consumable, CraftingMaterial } from "./Item.js";
import { getItemTemplate } from "./utils.js";

export function initialItems() {
    let items = [
        new Quest(0, "Szczerbiec", "Quest", 2085, "Some kind of a sword. A little bit jagged. I cannot use it, or spell its name.", "http://localhost:3000/img/sword.svg"),
        new Consumable(1, "Russian Dumpling", "Consumable", 55, "A culinary masterpiece. Will boost my energy up to 15% for 30 minutes!", "http://localhost:3000/img/dumplings.svg", [6]),
        new CraftingMaterial(2, "Rotten cardboard", "Crafting material", 127, "I could definitely use this. For something. Hm...", "http://localhost:3000/img/box.svg"),
        new Weapon(3, "Slingshot", "Weapon", 862, "A ranged weapon for catching squirrels.", "http://localhost:3000/img/sling-shot-variant.svg", [5, 7]),
        new Weapon(4, "Boxing Gloves", "Weapon", 1250, "Now where is my kangaroo...", "http://localhost:3000/img/boxing.svg", [5, 9]),
        new CraftingMaterial(5, "Paperclip and Rubberband", "Crafting material", 285, "Damn, a little bit of ketchup and I could do a helicopter.", "http://localhost:3000/img/inclined-clip.svg"),
        new CraftingMaterial(6, "Flour", "Crafting material", 37, "How do I eat this?", "http://localhost:3000/img/flour.svg"),
        new CraftingMaterial(7, "Piece of Wood", "Crafting material", 359, "Multi-purpose. Nicely smelling. Not so soft. I can build almost anything with it.", "http://localhost:3000/img/log.svg"),
        new Quest(8, "Small magical branch", "Quest", 189, "It shots fireworks when I touch it!", "http://localhost:3000/img/magic-wand.svg"),
        new CraftingMaterial(9, "Piece of Iron", "Crafting material", 790, "It's hard to chew.", "http://localhost:3000/img/iron-man.svg")
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