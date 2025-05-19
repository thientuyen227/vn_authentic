$(document).ready(function() {
    // Xử lý hover cho dropdown-submenu
    $(".dropdown-submenu > a").on("click", function(e) {
        e.preventDefault();
        var submenu = $(this).next(".dropdown-menu");
        $(".dropdown-menu").not(submenu).hide();
        submenu.toggle();
        e.stopPropagation();
    });

    // Ẩn menu khi click ngoài
    $(document).on("click", function() {
        $(".dropdown-menu").hide();
    });
});

$(function() {
    $("#header-container").load("header.html", function() {
        console.log("Header loaded successfully");
    });
    $("#footer-container").load("footer.html", function() {
        console.log("Footer loaded successfully");
    });

    // Khôi phục giá trị bộ lọc giá từ localStorage
    const minPrice = localStorage.getItem("minPrice");
    const maxPrice = localStorage.getItem("maxPrice");
    if (minPrice) $("#min-price").val(minPrice);
    if (maxPrice) $("#max-price").val(maxPrice);

    // Tải phạm vi giá từ products.json
    loadPriceRange();
});

// Hàm tải phạm vi giá
function loadPriceRange() {
    $.getJSON("../data/products.json", function(data) {
        const prices = data.map((p) => parsePrice(p.price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        $("#min-price").attr(
            "placeholder",
            `VD: ${min.toLocaleString("vi-VN")} VNĐ`
        );
        $("#max-price").attr(
            "placeholder",
            `VD: ${max.toLocaleString("vi-VN")} VNĐ`
        );
    }).fail(function() {
        $("#min-price").attr("placeholder", "VD: 2000000");
        $("#max-price").attr("placeholder", "VD: 5000000");
    });
}

// Hàm parse giá (đã định nghĩa trong product-display.js)
function parsePrice(str) {
    return Number(str.replace(/[^0-9]/g, ""));
}

// Hàm xóa bộ lọc (cả danh mục/thương hiệu và giá)
function clearFilter() {
    localStorage.removeItem("filterKeyword");
    localStorage.removeItem("minPrice");
    localStorage.removeItem("maxPrice");
    $("#min-price").val("");
    $("#max-price").val("");
    window.location.reload();
}

// Hàm áp dụng bộ lọc giá
function applyPriceFilter() {
    const minPrice = $("#min-price").val();
    const maxPrice = $("#max-price").val();

    // Validate input
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
        alert("Giá tối thiểu không thể lớn hơn giá tối đa!");
        return;
    }
    if (
        (minPrice && Number(minPrice) < 0) ||
        (maxPrice && Number(maxPrice) < 0)
    ) {
        alert("Giá không được nhỏ hơn 0!");
        return;
    }

    // Lưu khoảng giá vào localStorage
    if (minPrice) localStorage.setItem("minPrice", minPrice);
    else localStorage.removeItem("minPrice");
    if (maxPrice) localStorage.setItem("maxPrice", maxPrice);
    else localStorage.removeItem("maxPrice");

    // Reload để áp dụng bộ lọc
    window.location.reload();
}

// Hàm xóa bộ lọc giá
function clearPriceFilter() {
    localStorage.removeItem("minPrice");
    localStorage.removeItem("maxPrice");
    $("#min-price").val("");
    $("#max-price").val("");
    window.location.reload();
}