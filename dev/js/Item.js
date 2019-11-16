var itemsCounter = 0;

export default class Item{
    constructor(name, type, price, description){
        this.id = itemsCounter++;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
    }

}
