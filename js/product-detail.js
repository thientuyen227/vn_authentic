const API_BASE_URL = "https://vn-authentic-be.onrender.com/api";

$(document).ready(function() {
    // Tải header và footer
    $("#header-container").load("header.html");
    $("#footer-container").load("footer.html");

    // Lấy productId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = Number(urlParams.get("id"));
    console.log("Product ID từ URL:", productId);

    if (!productId) {
        $("#product-detail").html(
            '<p class="text-danger text-center">Không tìm thấy ID sản phẩm trong URL.</p>'
        );
        return;
    }

    // Gọi API lấy dữ liệu sản phẩm theo id
    $.ajax({
        url: `https://vn-authentic-be.onrender.com/api/products/${productId}`,
        method: "GET",
        dataType: "json",
        success: function(product) {
            if (!product || !product.id) {
                $("#product-detail").html(
                    '<p class="text-danger text-center">Sản phẩm không tồn tại.</p>'
                );
                return;
            }

            // Cập nhật thông tin sản phẩm
            $("#product-name").text(product.name);
            $("#product-price").text(
                parsePrice(product.price).toLocaleString("vi-VN") + " VNĐ"
            );
            $("#product-description").text(product.description || "Không có mô tả.");

            // Cập nhật dropdown màu sắc
            const colorSelect = $("#product-color");
            colorSelect.empty();
            if (Array.isArray(product.colors) && product.colors.length) {
                product.colors.forEach((color) => {
                    colorSelect.append(
                        `<option value="${color}">${
                          color.charAt(0).toUpperCase() + color.slice(1)
                        }</option>`
                    );
                });
            } else {
                colorSelect.append('<option value="">Không có màu</option>');
            }

            // Cập nhật dropdown kích thước
            const sizeSelect = $("#product-size");
            sizeSelect.empty();
            if (Array.isArray(product.sizes) && product.sizes.length) {
                product.sizes.forEach((size) => {
                    sizeSelect.append(`<option value="${size}">${size}</option>`);
                });
            } else {
                sizeSelect.append('<option value="">Không có kích thước</option>');
            }

            // Xử lý ảnh sản phẩm
            const thumbnails = product.images || [product.image];
            if (!thumbnails || thumbnails.length === 0) {
                console.error("Không có ảnh sản phẩm để hiển thị.");
                $("#carousel-images").html(
                    '<div class="carousel-item active"><img src="https://via.placeholder.com/500?text=No+Image" class="d-block w-100" alt="No Image"></div>'
                );
                return;
            }

            thumbnails.forEach((src) => {
                const img = new Image();
                img.src = src;
                img.onerror = () => {
                    img.src = "https://via.placeholder.com/500?text=Image+Not+Found";
                };
            });

            // Thêm ảnh vào carousel và thumbnail gallery
            const carouselImages = $("#carousel-images");
            const thumbnailGallery = $("#thumbnail-gallery");
            carouselImages.empty();
            thumbnailGallery.empty();

            thumbnails.forEach((thumb, index) => {
                const isActive = index === 0 ? "active" : "";
                const slideHtml = `
                    <div class="carousel-item ${isActive}">
                        <img src="${thumb}" class="d-block w-100" alt="Slide ${
                  index + 1
                }" 
                             onerror="this.src='https://via.placeholder.com/500?text=Image+Not+Found';">
                    </div>`;
                carouselImages.append(slideHtml);

                const thumbHtml = `
                    <img src="${thumb}" class="thumbnail ${isActive}" alt="Thumbnail ${
                  index + 1
                }" 
                         data-bs-slide-to="${index}" 
                         onerror="this.src='https://via.placeholder.com/80?text=Thumb+Not+Found';">`;
                thumbnailGallery.append(thumbHtml);
            });

            // Khởi tạo carousel với các tùy chọn
            $("#product-carousel").carousel({
                interval: 5000,
                wrap: true,
                pause: "hover",
            });

            // Xử lý sự kiện click trên thumbnail
            thumbnailGallery.find(".thumbnail").on("click", function() {
                const slideTo = $(this).data("bs-slide-to");
                $("#product-carousel").carousel(slideTo);
                thumbnailGallery.find(".thumbnail").removeClass("active");
                $(this).addClass("active");
            });

            // Đồng bộ thumbnail với carousel
            $("#product-carousel").on("slid.bs.carousel", function() {
                const activeIndex = $(this).find(".carousel-item.active").index();
                thumbnailGallery.find(".thumbnail").removeClass("active");
                thumbnailGallery
                    .find(`.thumbnail[data-bs-slide-to="${activeIndex}"]`)
                    .addClass("active");
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("Lỗi khi tải sản phẩm từ API:", textStatus, errorThrown);
            $("#product-detail").html(
                '<p class="text-danger text-center">Lỗi khi tải dữ liệu sản phẩm.</p>'
            );
        },
    });
});

function parsePrice(str) {
    return Number(str.replace(/[^0-9]/g, ""));
}
function addToCartDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    window.location.href = "login.html";
    return;
  }

  const color = $("#product-color").val();
  const size = $("#product-size").val();
  const quantity = parseInt($("#product-quantity").val());

  if (quantity <= 0) {
    alert("Số lượng phải lớn hơn 0!");
    return;
  }

  // Lấy chi tiết sản phẩm từ API (giữ nguyên)
  $.ajax({
    url: `${API_BASE_URL}/products/${productId}`,
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
        color,
        size,
        quantity,
      };

      // Gọi API POST thêm hoặc cập nhật giỏ hàng
      $.ajax({
        url: `${API_BASE_URL}/cart/item`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(cartItem),
        headers: {
          authorization: user.email, // gửi email làm token giả lập
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
}
