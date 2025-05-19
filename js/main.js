$(document).ready(function () {
    $.getJSON('../data/products.json', function(products) {
      const $productList = $('#product-list');
      $productList.empty();
  
      products.forEach(product => {
        const productHtml = `
          <div class="col-12 col-sm-6 col-md-3 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${product.image}" class="card-img-top" alt="${product.name}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-danger fw-bold">${product.price}</p>
                <p class="card-text">${product.description}</p>
                <a href="#" class="btn btn-primary mt-auto w-100">Mua ngay</a>
              </div>
            </div>
          </div>
        `;
        $productList.append(productHtml);
      });
    }).fail(function() {
      $('#product-list').html('<p class="text-danger text-center">Không thể tải dữ liệu sản phẩm.</p>');
    });
  });
  
