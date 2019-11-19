class Item {
    constructor(id, name, type, price, description) { 
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
    }

}
export class DisassemblableItem extends Item {
    constructor(id, name, type, price, description, materials) { 
        super(id, name, type, price, description);
        this.craftingMaterials = materials;
    }
}

export class Weapon extends DisassemblableItem {
    constructor(...args) {
        super(...args);
        this.maxStackSize = 1;
    }
}

export class Consumable extends DisassemblableItem {
    constructor(...args) {
        super(...args);
    }
}

export class CraftingMaterial extends Item {
    constructor(...args) {
        super(...args);
    }
}

export class Quest extends Item {
    constructor(...args) {
        super(...args);
        this.maxStackSize = 1;
    }
}