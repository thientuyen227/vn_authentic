const API_BASE_URL = "https://vn-authentic-be.onrender.com";

$(document).ready(function () {

    function formatPrice(num) {
        return num.toLocaleString("vi-VN") + " VNĐ";
    }

    function getCurrentUser() {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    async function fetchCart() {
        const user = getCurrentUser();
        if (!user) return null;

        try {
            const res = await fetch(API_BASE_URL + "/api/cart", {
                headers: {
                    Authorization: user.email,
                },
            });
            if (!res.ok) throw new Error("Không lấy được giỏ hàng");
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async function updateCartItem(item) {
        const user = getCurrentUser();
        if (!user) return false;

        try {
            const res = await fetch(API_BASE_URL + "/api/cart/item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: user.email,
                },
                body: JSON.stringify(item),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async function removeCartItem(productId) {
        const user = getCurrentUser();
        if (!user) return false;

        try {
            const res = await fetch(API_BASE_URL + `/api/cart/item/${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: user.email,
                },
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    async function loadCart() {
        const $tbody = $("#cart-table tbody");
        $tbody.empty();

        if (!isLoggedIn()) {
            $tbody.append(
                `<tr><td colspan="7" class="text-center">Vui lòng đăng nhập để xem giỏ hàng.</td></tr>`
            );
            $("#total-price").text("0 VNĐ").prop("disabled", true);
            $("#checkout-btn").prop("disabled", true);
            return;
        }

        const cart = await fetchCart();
        if (!cart || cart.length === 0) {
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
          <tr data-product-id="${item.productId}">
              <td><img src="${item.image}" width="70" alt="${item.name}"></td>
              <td>${item.name}</td>
              <td>${item.color || "--"}</td>
              <td>${item.size || "--"}</td>
              <td>
                  <input type="number" min="1" class="form-control quantity-input" value="${item.quantity}">
              </td>
              <td>${formatPrice(itemTotal)}</td>
              <td><button class="btn btn-danger btn-sm btn-remove">Xóa</button></td>
          </tr>
      `);
        });

        $("#total-price").text(formatPrice(total));
        $("#checkout-btn").prop("disabled", false);
    }

    $("#cart-table").on("change", ".quantity-input", async function () {
        const $tr = $(this).closest("tr");
        const productId = $tr.data("product-id");
        let qty = parseInt($(this).val());
        if (isNaN(qty) || qty < 1) qty = 1;

        const item = {
            productId,
            quantity: qty,
            name: $tr.find("td:nth-child(2)").text(),
            color: $tr.find("td:nth-child(3)").text() === "--" ? null : $tr.find("td:nth-child(3)").text(),
            size: $tr.find("td:nth-child(4)").text() === "--" ? null : $tr.find("td:nth-child(4)").text(),
            price: parseInt(
                $tr.find("td:nth-child(6)").text().replace(/[^\d]/g, "")
            ) / qty,
            image: $tr.find("td:nth-child(1) img").attr("src"),
        };

        const success = await updateCartItem(item);
        if (!success) alert("Cập nhật giỏ hàng thất bại!");
        else loadCart();
    });

    $("#cart-table").on("click", ".btn-remove", async function () {
        const productId = $(this).closest("tr").data("product-id");
        if (!productId) return;

        const success = await removeCartItem(productId);
        if (!success) alert("Xóa sản phẩm thất bại!");
        else loadCart();
    });

    $("#checkout-btn").on("click", function () {
        if (!isLoggedIn()) {
            alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
            window.location.href = "login.html";
            return;
        }
        window.location.href = "checkout.html";
    });

    loadCart();
});
