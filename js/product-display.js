const API_BASE_URL = "https://vn-authentic-be.onrender.com/api";

$(document).ready(function () {
    let products = [];

    // 1. Load sản phẩm từ JSON
    function loadProducts() {
        $.ajax({
            url: "https://vn-authentic-be.onrender.com/api/products",  // Đổi thành API của bạn
            method: "GET",
            dataType: "json",
            success: function (data) {
                products = data;
                displayProducts();
                console.log("Sản phẩm đã tải từ API:", products); // Debug
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Lỗi khi tải dữ liệu sản phẩm từ API:", textStatus, errorThrown);
                $(".running-product-grid, .tennis-product-grid").html(
                    "<p class='text-danger'>Không tải được dữ liệu sản phẩm từ API.</p>"
                );
            }
        });
    }


    // 2. Parse "2.100.000 VNĐ" -> 2100000
    function parsePrice(str) {
        return Number(str.replace(/[^0-9]/g, ""));
    }

    // 3. Tạo HTML cho mỗi product
    function createProductHTML(product) {
        // Options màu
        let colorSelect = "";
        if (Array.isArray(product.colors) && product.colors.length) {
            const opts = product.colors
                .map(
                    (c) =>
                        `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)
                        }</option>`
                )
                .join("");
            colorSelect = `
        <label class="form-label small">Màu:</label>
        <select class="form-select form-select-sm mb-2 color-select">
          <option value="">Chọn màu</option>
          ${opts}
        </select>`;
        }

        // Options size
        let sizeSelect = "";
        if (Array.isArray(product.sizes) && product.sizes.length) {
            const opts = product.sizes
                .map((s) => `<option value="${s}">${s}</option>`)
                .join("");
            sizeSelect = `
        <label class="form-label small">Size:</label>
        <select class="form-select form-select-sm mb-2 size-select">
          <option value="">Chọn size</option>
          ${opts}
        </select>`;
        }

        return `
      <div class="card product mb-3" data-id="${product.id}">
        <a href="product-detail.html?id=${product.id}">
          <img src="${product.image
            }" class="card-img-top" alt="${product.name}">
        </a>
        <div class="card-body">
          <h5 class="card-title product-name">${product.name}</h5>
          <p class="card-text product-price" data-price="${parsePrice(
                product.price
            )}">
            ${product.price}
          </p>
          <p class="card-text small text-truncate">${product.description}</p>
          ${colorSelect}
          ${sizeSelect}
          <button class="btn btn-primary add-to-cart w-100">Thêm vào giỏ</button>
        </div>
      </div>`;
    }

    // 4. Render ra 2 grid
    function displayProducts() {
        const runningContainer = $(".running-product-grid").empty();
        const tennisContainer = $(".tennis-product-grid").empty();

        // Lấy từ khóa lọc từ localStorage
        const filterKeyword = localStorage.getItem("filterKeyword") ?
            localStorage.getItem("filterKeyword").toLowerCase() :
            "";
        console.log("Từ khóa lọc:", filterKeyword); // Debug

        // Lấy khoảng giá từ localStorage
        const minPrice = localStorage.getItem("minPrice") ?
            Number(localStorage.getItem("minPrice")) :
            null;
        const maxPrice = localStorage.getItem("maxPrice") ?
            Number(localStorage.getItem("maxPrice")) :
            null;
        console.log("Khoảng giá:", { minPrice, maxPrice }); // Debug

        // Danh sách từ khóa hợp lệ
        const validCategories = ["chạy bộ", "tennis-pickleball"];
        const validBrands = ["nike", "adidas", "asics", "mizuno"];

        // Lọc sản phẩm
        let filteredProducts = products;

        // Lọc theo danh mục hoặc thương hiệu
        if (filterKeyword) {
            if (validCategories.includes(filterKeyword)) {
                const category =
                    filterKeyword === "chạy bộ" ? "Running" : "Tennis - Pickleball";
                filteredProducts = filteredProducts.filter(
                    (p) => p.category.toLowerCase() === category.toLowerCase()
                );
            } else if (validBrands.includes(filterKeyword)) {
                filteredProducts = filteredProducts.filter(
                    (p) => p.brand.toLowerCase() === filterKeyword
                );
            } else {
                // Nếu từ khóa không thuộc danh mục hoặc thương hiệu, tìm kiếm trong tên, thương hiệu, danh mục
                filteredProducts = filteredProducts.filter(
                    (p) =>
                        p.name.toLowerCase().includes(filterKeyword) ||
                        p.brand.toLowerCase().includes(filterKeyword) ||
                        p.category.toLowerCase().includes(filterKeyword)
                );
            }
        }

        // Lọc theo khoảng giá
        if (minPrice !== null || maxPrice !== null) {
            filteredProducts = filteredProducts.filter((p) => {
                const price = parsePrice(p.price);
                const meetsMin = minPrice !== null ? price >= minPrice : true;
                const meetsMax = maxPrice !== null ? price <= maxPrice : true;
                return meetsMin && meetsMax;
            });
        }

        // Hiển thị thông tin bộ lọc với hiệu ứng fade
        $("main.container .filter-info").remove();
        if (minPrice || maxPrice) {
            const filterInfo = $(
                `<div class="filter-info">Đang lọc giá từ ${minPrice ? minPrice.toLocaleString("vi-VN") : 0
                } đến ${maxPrice ? maxPrice.toLocaleString("vi-VN") : "vô cực"
                } VNĐ</div>`
            );
            $("main.container").prepend(filterInfo);
            filterInfo.hide().fadeIn(500);
        }

        // Phân loại sản phẩm theo danh mục để hiển thị
        const runningProducts = filteredProducts.filter(
            (p) => p.category === "Running"
        );
        const tennisProducts = filteredProducts.filter(
            (p) => p.category === "Tennis - Pickleball"
        );

        // Hiển thị sản phẩm Running
        if (runningProducts.length === 0) {
            runningContainer.append(
                '<div class="no-results">Không tìm thấy sản phẩm Running.</div>'
            );
        } else {
            runningProducts.forEach((p) =>
                runningContainer.append(createProductHTML(p))
            );
        }

        // Hiển thị sản phẩm Tennis - Pickleball
        if (tennisProducts.length === 0) {
            tennisContainer.append(
                '<div class="no-results">Không tìm thấy sản phẩm Tennis - Pickleball.</div>'
            );
        } else {
            tennisProducts.forEach((p) =>
                tennisContainer.append(createProductHTML(p))
            );
        }

        // Nếu không có sản phẩm nào, hiển thị thông báo chung
        if (runningProducts.length === 0 && tennisProducts.length === 0) {
            $("main.container").prepend(
                '<div class="no-results">Không tìm thấy sản phẩm nào phù hợp.</div>'
            );
        }
    }

    // 5. Xử lý thêm vào giỏ hàng
    $("main").on("click", ".add-to-cart", function () {
        const card = $(this).closest(".product");
        const id = card.data("id");

        // Lấy lựa chọn color / size (nếu có)
        const colorEl = card.find(".color-select");
        const sizeEl = card.find(".size-select");
        const color = colorEl.length ? colorEl.val() : null;
        const size = sizeEl.length ? sizeEl.val() : null;

        // Bắt validation nếu có dropdown nhưng chưa chọn
        if (colorEl.length && !color) {
            return alert("Vui lòng chọn màu.");
        }
        if (sizeEl.length && !size) {
            return alert("Vui lòng chọn size.");
        }

        // Lấy thông tin người dùng
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || !user.email) {
            alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
            window.location.href = "login.html";
            return;
        }

        // Gọi API để lấy thông tin sản phẩm
        $.ajax({
            url: `${API_BASE_URL}/products/${id}`,
            method: "GET",
            dataType: "json",
            success: function (product) {
                if (!product) {
                    alert("Sản phẩm không tồn tại!");
                    return;
                }

                const cartItem = {
                    productId: product.id,
                    name: product.name,
                    price: parsePrice(product.price),
                    image: product.image,
                    color: color,
                    size: size,
                    quantity: 1,
                };

                // Gọi API POST để thêm/cập nhật vào giỏ hàng
                $.ajax({
                    url: `${API_BASE_URL}/cart/item`,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(cartItem),
                    headers: {
                        authorization: user.email, // Dùng email như token giả lập
                    },
                    success: function () {
                        alert("Đã thêm sản phẩm vào giỏ hàng!");
                    },
                    error: function () {
                        alert("Lỗi khi thêm sản phẩm vào giỏ hàng!");
                    },
                });
            },
            error: function () {
                alert("Lỗi khi lấy dữ liệu sản phẩm!");
            },
        });
    });


    // 6. Xử lý tìm kiếm từ thanh tìm kiếm
    $("#search-form").on("submit", function (e) {
        e.preventDefault();
        const kw = $("#search-input").val().trim().toLowerCase();
        localStorage.setItem("filterKeyword", kw);
        window.location.href = "index.html";
    });

    // Kick off
    loadProducts();
});