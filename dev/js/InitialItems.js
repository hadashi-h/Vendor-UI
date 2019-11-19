import { Weapon, Quest, Consumable, CraftingMaterial } from "./Item.js";

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
        new CraftingMaterial(9, "Piece of Iron", "crafting", 890, "It's hard to chew."),
    ]; 
    return items;
}