$(document).ready(function() {
    function formatPrice(num) {
        return num.toLocaleString("vi-VN") + " VNĐ";
    }

    // Kiểm tra trạng thái đăng nhập
    function isLoggedIn() {
        return !!localStorage.getItem("currentUser");
    }

    // Lấy key giỏ hàng dựa trên email người dùng
    function getCartKey() {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user || !user.email) {
            return null; // Nếu chưa đăng nhập, trả về null
        }
        return `cart_${user.email}`;
    }

    function loadCart() {
        const cartKey = getCartKey();
        const $tbody = $("#cart-table tbody");
        $tbody.empty();

        // Nếu chưa đăng nhập, hiển thị thông báo yêu cầu đăng nhập
        if (!cartKey) {
            $tbody.append(
                `<tr><td colspan="7" class="text-center">Vui lòng đăng nhập để xem giỏ hàng.</td></tr>`
            );
            $("#total-price").text("0 VNĐ").prop("disabled", true);
            $("#checkout-btn").prop("disabled", true);
            return;
        }

        const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        console.log("🔍 Cart data:", cart); // Thêm log để kiểm tra

        if (cart.length === 0) {
            $tbody.append(
                `<tr><td colspan="7" class="text-center">Giỏ hàng trống.</td></tr>`
            );
            $("#total-price").text("0 VNĐ").prop("disabled", true);
            $("#checkout-btn").prop("disabled", true);
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            $tbody.append(`
                <tr data-index="${index}">
                    <td><img src="${item.image}" width="70" alt="${
        item.name
      }"></td>
                    <td>${item.name}</td>
                    <td>${item.color || "--"}</td>
                    <td>${item.size || "--"}</td>
                    <td>
                        <input type="number" min="1" class="form-control quantity-input" value="${
                          item.quantity
                        }">
                    </td>
                    <td>${formatPrice(itemTotal)}</td>
                    <td><button class="btn btn-danger btn-sm btn-remove">Xóa</button></td>
                </tr>
            `);
        });

        $("#total-price").text(formatPrice(total));
        $("#checkout-btn").prop("disabled", false);
    }

    // Change quantity
    $("#cart-table").on("change", ".quantity-input", function() {
        const cartKey = getCartKey();
        if (!cartKey) return; // Nếu chưa đăng nhập, không làm gì

        const idx = +$(this).closest("tr").data("index");
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let qty = parseInt($(this).val());
        if (isNaN(qty) || qty < 1) qty = 1;
        cart[idx].quantity = qty;
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
    });

    // Remove item
    $("#cart-table").on("click", ".btn-remove", function() {
        const cartKey = getCartKey();
        if (!cartKey) return; // Nếu chưa đăng nhập, không làm gì

        const idx = +$(this).closest("tr").data("index");
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        cart.splice(idx, 1);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
    });

    // Checkout
    $("#checkout-btn").on("click", function() {
        if (!isLoggedIn()) {
            alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
            window.location.href = "login.html";
            return;
        }
        window.location.href = "checkout.html";
    });

    loadCart();
});