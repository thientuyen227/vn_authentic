const API_BASE_URL = "https://vn-authentic-be.onrender.com";

$(document).ready(function () {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user || !user.email) {
        $("#message")
            .removeClass("text-success")
            .addClass("text-danger")
            .text("Vui lòng đăng nhập để tiếp tục thanh toán.");
        $("#checkout-form").hide();
        $("#cart-summary").hide();
        return;
    }


    let cart = [];

    // Lấy giỏ hàng từ API backend
    fetch(`${API_BASE_URL}/api/cart`, {
        method: "GET",
        headers: {
            Authorization: user.email,
        },
    })
        .then((res) => {
            if (!res.ok) throw new Error("Lỗi khi tải giỏ hàng");
            return res.json();
        })
        .then((data) => {
            cart = data; // Giả sử data là mảng sản phẩm trong giỏ hàng
            console.log("🛒 Cart from API:", cart);
            displayCartSummary();
        })
        .catch((err) => {
            console.error("❌ Lỗi lấy giỏ hàng:", err);
            $("#message")
                .removeClass("text-success")
                .addClass("text-danger")
                .text("Không thể tải giỏ hàng.");
            $("#checkout-form").hide();
            $("#cart-summary").hide();
        });

    displayCartSummary();

    $("#checkout-form").on("submit", function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        const fullName = $("#fullname").val().trim();
        const phone = $("#phone").val().trim();
        const address = $("#address").val().trim();
        const note = $("#note").val().trim();
        const paymentMethod = $("#payment-method").val();

        const order = {
            fullName,
            phone,
            address,
            note,
            paymentMethod,
            items: cart,
            total: calculateTotal(),
        };

        fetch(`${API_BASE_URL}/api/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: user.email, // dùng email làm "token" giả lập
            },
            body: JSON.stringify(order),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Lỗi khi gửi đơn hàng");
                return res.json();
            })
            .then((data) => {
                console.log("✅ Order success:", data);
                localStorage.removeItem(cartKey);

                $("#message")
                    .removeClass("text-danger")
                    .addClass("text-success")
                    .text("Đặt hàng thành công! Chuyển hướng đến lịch sử mua hàng...");
                setTimeout(() => {
                    window.location.href = "order-history.html";
                }, 2000);

                $("#qr-code").hide();
            })
            .catch((err) => {
                console.error("❌ Error placing order:", err);
                $("#message")
                    .removeClass("text-success")
                    .addClass("text-danger")
                    .text("Lỗi khi đặt hàng. Vui lòng thử lại sau.");
            });
    });

    $("#payment-method").on("change", function () {
        if ($(this).val() === "transfer") {
            $("#qr-code").show();
        } else {
            $("#qr-code").hide();
        }
    });

    function validateForm() {
        let isValid = true;
        $("#checkout-form .form-control").each(function () {
            if ($(this).is(":required") && !$(this).val().trim()) {
                $(this).addClass("is-invalid");
                isValid = false;
            } else {
                $(this).removeClass("is-invalid");
            }
        });

        const phoneVal = $("#phone").val().trim();
        if (phoneVal && !/^[0-9]{9,12}$/.test(phoneVal)) {
            $("#phone").addClass("is-invalid");
            isValid = false;
        }

        if (!$("#payment-method").val()) {
            $("#payment-method").addClass("is-invalid");
            isValid = false;
        }

        return isValid;
    }

    function displayCartSummary() {
        const $message = $("#message");
        const $cartSummary = $("#cart-summary");

        if (cart.length === 0) {
            $message
                .removeClass("text-success")
                .addClass("text-danger")
                .text("Giỏ hàng của bạn đang trống.");
            $("#checkout-form").hide();
            $cartSummary.hide();
        } else {
            $message.empty();
            $("#checkout-form").show();
            $cartSummary.empty().show();
            cart.forEach((item) => {
                $cartSummary.append(`
          <div class="cart-item">
              <span>${item.name} (x${item.quantity}${item.color ? `, Màu: ${item.color}` : ""
                    }${item.size ? `, Size: ${item.size}` : ""})</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
          </div>
        `);
            });
            $cartSummary.append(`
        <div class="cart-item">
            <strong>Tổng cộng:</strong> <strong>${formatCurrency(calculateTotal())}</strong>
        </div>
      `);
        }
    }

    function calculateTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    function formatCurrency(amount) {
        return amount.toLocaleString("vi-VN") + " VNĐ";
    }
});