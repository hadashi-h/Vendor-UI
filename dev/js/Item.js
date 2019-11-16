var itemsCounter = 0;

class Item{
    constructor(name, type, price, description){
        this.id = itemsCounter++;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
    }

}
export class DisassemblableItem extends Item{

}

export class Weapon extends DisassemblableItem{

}

export class Consumable extends DisassemblableItem{
    
}

export class CraftingMaterial extends Item{
    
}

export class Quest extends Item{
    
}