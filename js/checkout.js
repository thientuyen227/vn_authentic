$(document).ready(function() {
            // Kiểm tra trạng thái đăng nhập
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

            // Lấy key giỏ hàng dựa trên email người dùng
            const cartKey = `cart_${user.email}`;
            let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            console.log("🔍 Cart data in checkout:", cart); // Debug

            // Hiển thị giỏ hàng
            displayCartSummary();

            $("#checkout-form").on("submit", function(e) {
                e.preventDefault();

                // Validate form
                if (!validateForm()) {
                    return;
                }

                // Đảm bảo người dùng đã đăng nhập (đã kiểm tra ở trên, nhưng để an toàn)
                if (!user) {
                    $("#message")
                        .removeClass("text-success")
                        .addClass("text-danger")
                        .text("Vui lòng đăng nhập để đặt hàng.");
                    return;
                }

                const fullName = $("#fullname").val().trim();
                const phone = $("#phone").val().trim();
                const address = $("#address").val().trim();
                const note = $("#note").val().trim();
                const paymentMethod = $("#payment-method").val();

                // Tạo thông tin đơn hàng
                const order = {
                    fullName,
                    phone,
                    address,
                    note,
                    paymentMethod,
                    items: cart,
                    total: calculateTotal(),
                    date: new Date().toISOString(),
                    userEmail: user.email,
                    status: "pending", // Thêm trạng thái mặc định
                };

                // Lưu lịch sử mua hàng theo email người dùng
                const userOrdersKey = `orders_${user.email}`;
                let orders = JSON.parse(localStorage.getItem(userOrdersKey)) || [];
                orders.push(order);
                localStorage.setItem(userOrdersKey, JSON.stringify(orders));

                // Xóa giỏ hàng sau khi đặt hàng
                localStorage.removeItem(cartKey); // Xóa đúng key

                // Hiển thị thông báo và chuyển hướng
                $("#message")
                    .removeClass("text-danger")
                    .addClass("text-success")
                    .text("Đặt hàng thành công! Chuyển hướng đến lịch sử mua hàng...");
                setTimeout(() => {
                    window.location.href = "order-history.html";
                }, 2000);

                // Ẩn mã QR nếu có
                $("#qr-code").hide();
            });

            // Hiển thị mã QR khi chọn thanh toán chuyển khoản
            $("#payment-method").on("change", function() {
                if ($(this).val() === "transfer") {
                    $("#qr-code").show();
                } else {
                    $("#qr-code").hide();
                }
            });

            // Hàm validate form
            function validateForm() {
                let isValid = true;
                $("#checkout-form .form-control").each(function() {
                    if ($(this).is(":required") && !$(this).val().trim()) {
                        $(this).addClass("is-invalid");
                        isValid = false;
                    } else {
                        $(this).removeClass("is-invalid");
                    }
                });

                if ($("#phone").val().trim() && !/^[0-9]{9,12}$/.test($("#phone").val())) {
                    $("#phone").addClass("is-invalid");
                    isValid = false;
                }

                if (!$("#payment-method").val()) {
                    $("#payment-method").addClass("is-invalid");
                    isValid = false;
                }

                return isValid;
            }

            // Hiển thị giỏ hàng
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
                        <span>${item.name} (x${item.quantity}${
          item.color ? `, Màu: ${item.color}` : ""
        }${item.size ? `, Size: ${item.size}` : ""})</span>
                        <span>${formatCurrency(
                          item.price * item.quantity
                        )}</span>
                    </div>
                `);
      });
      $cartSummary.append(
        `<div class="cart-item"><strong>Tổng cộng:</strong> <strong>${formatCurrency(
          calculateTotal()
        )}</strong></div>`
      );
    }
  }

  // Tính tổng tiền
  function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Định dạng tiền tệ
  function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  }
});