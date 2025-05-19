$(document).ready(function () {
  // Hàm sanitize input để chống XSS
  function sanitizeInput(input) {
    return input
      ? input.replace(/[<>&"']/g, function (m) {
          return {
            "<": "&lt;",
            ">": "&gt;",
            "&": "&amp;",
            '"': "&quot;",
            "'": "&#39;",
          }[m];
        })
      : "";
  }

  // Hàm cập nhật header (tên người dùng và đăng xuất)
  function updateHeader() {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    const $userInfo = $("#user-info");
    if (user && user.name) {
      $userInfo.html(
        `<div class="user-info-container">
                    <span class="nav-link text-white d-inline user-greeting">Xin chào, ${sanitizeInput(
                      user.name
                    )}</span> |
                    <button class="btn btn-outline-light btn-sm logout-btn" id="logout-btn">Đăng xuất</button>
                </div>`
      );
      $("#logout-btn").on("click", function () {
        localStorage.removeItem("currentUser");
        window.location.replace("index.html");
      });
    } else {
      $userInfo.html(
        '<a href="login.html" class="nav-link text-white d-inline">Đăng nhập</a> | ' +
          '<a href="signup.html" class="nav-link text-white d-inline">Đăng ký</a>'
      );
    }
  }

  // Load dropdown sản phẩm từ products.json
  $.getJSON("../data/products.json", function (data) {
    const productDropdown = $("#product-dropdown");
    const categories = {};

    data.forEach((product) => {
      if (!categories[product.category]) {
        categories[product.category] = {};
      }
      if (!categories[product.category][product.brand]) {
        categories[product.category][product.brand] = [];
      }
      categories[product.category][product.brand].push(
        sanitizeInput(product.name)
      );
    });

    for (const category in categories) {
      const categoryItem = $('<li class="dropdown-submenu"></li>');
      const categoryLink = $(
        '<a href="#" class="dropdown-item dropdown-toggle">' +
          (category === "Running" ? "Chạy bộ" : "Tennis - Pickleball") +
          "</a>"
      );
      const brandDropdown = $('<ul class="dropdown-menu"></ul>');

      categoryLink.on("click", function (e) {
        e.preventDefault();
        const filterValue =
          category === "Running" ? "chạy bộ" : "tennis-pickleball";
        localStorage.setItem("filterKeyword", filterValue);
        window.location.href = "index.html";
      });

      for (const brand in categories[category]) {
        const brandItem = $('<li class="dropdown-submenu"></li>');
        const brandLink = $(
          '<a href="#" class="dropdown-item dropdown-toggle">' +
            sanitizeInput(brand) +
            "</a>"
        );
        const modelDropdown = $('<ul class="dropdown-menu"></ul>');

        brandLink.on("click", function (e) {
          e.preventDefault();
          const filterValue = brand.toLowerCase();
          localStorage.setItem("filterKeyword", filterValue);
          window.location.href = "index.html";
        });

        categories[category][brand].forEach((model) => {
          const modelItem = $(
            '<li><a href="#" class="dropdown-item">' +
              sanitizeInput(model) +
              "</a></li>"
          );
          modelDropdown.append(modelItem);
        });

        brandItem.append(brandLink);
        brandItem.append(modelDropdown);
        brandDropdown.append(brandItem);
      }

      categoryItem.append(categoryLink);
      categoryItem.append(brandDropdown);
      productDropdown.append(categoryItem);
    }

    // Initialize Bootstrap dropdown
    $(".dropdown-toggle").dropdown();
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("Lỗi khi tải products.json:", textStatus, errorThrown);
  });

  // Xử lý tìm kiếm
  $("#search-form").on("submit", function (e) {
    e.preventDefault();
    const searchTerm = $("#search-input").val().trim().toLowerCase();
    console.log("Tìm kiếm với:", searchTerm);
    if (searchTerm) {
      localStorage.setItem("filterKeyword", searchTerm);
      window.location.href = "index.html";
    }
  });

  // Gọi hàm cập nhật header khi trang tải
  updateHeader();
});

// Hàm reset bộ lọc khi nhấp vào logo
function resetFilters() {
  localStorage.removeItem("filterKeyword");
  localStorage.removeItem("minPrice");
  localStorage.removeItem("maxPrice");
  window.location.href = "index.html";
}
