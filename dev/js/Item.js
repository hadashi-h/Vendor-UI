class Item {
    constructor(id, name, type, price, description, icon) { 
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
        this.icon = icon;
    }
}

export class DisassemblableItem extends Item {
    constructor(id, name, type, price, description, icon, materials) { 
        super(id, name, type, price, description, icon);
        this.craftingMaterials = materials;
    }
}

export class Weapon extends DisassemblableItem {
    constructor(...args) {
        super(...args);
        this.stackable = false;
        this.className = "weapon";
    }
}

export class Consumable extends DisassemblableItem {
    constructor(...args) {
        super(...args);
        this.stackable = true;
        this.className = "consumable";
    }
}

export class CraftingMaterial extends Item {
    constructor(...args) {
        super(...args);
        this.stackable = true;
        this.className = "crafting";
    }
}

export class Quest extends Item {
    constructor(...args) {
        super(...args);
        this.stackable = false;
        this.className = "quest";
    }
}