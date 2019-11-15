var vendorInventory = new Muuri('.vendor-inventory', {
    dragEnabled: true,
    dragContainer: document.body,
    dragSort: function () {
      return [vendorInventory, userInventory]
    }
  });
  
  var userInventory = new Muuri('.user-inventory', {
    dragEnabled: true,
    dragContainer: document.body,
    dragSort: function () {
      return [vendorInventory, userInventory]
    }
  });