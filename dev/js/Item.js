export default class Item{
    constructor(id, name, type, price, description){
        this.id = id;
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
    }

    getItemTemplate(){
        let div = document.createElement('div');
        let itemTemplate = '' +
        '<div class="item ' + this.type + '" data-price=" '+ this.price + '">' +
          '<div class="item-content">' +
                this.name + ' ' + this.price +
             // '<div class="item-quantity">'+ this.quantity +'</div>' +
              '<div class="item-more">'+ 
                  '<h5>' + this.name + '</h5>' +
                  '<h6>' + this.price + '</h6>' +
                  '<p>' + this.description + '</p>' +
              '</div>' +
          '</div>' +
        '</div>';
        div.innerHTML = itemTemplate;
        return div.firstChild;
    }
}
