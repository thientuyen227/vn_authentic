const API_BASE_URL = "https://vn-authentic-be.onrender.com";

$(document).ready(function () {
  const adminUsername = "svauth";
  const adminPassword = "admin";

  // Kiểm tra đăng nhập
  if (!localStorage.getItem("adminLoggedIn")) {
    $("#login-container").show();
    $("#orders-container").hide();
  } else {
    $("#login-container").hide();
    $("#orders-container").show();
    displayOrders();
  }

  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    const username = $("#username").val();
    const password = $("#password").val();

    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem("adminLoggedIn", "true");
      $("#login-container").hide();
      $("#orders-container").show();
      displayOrders();
    } else {
      $("#message")
        .removeClass("text-success")
        .addClass("text-danger")
        .text("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  });

  // Gọi API để lấy danh sách đơn hàng
  function displayOrders() {
  $.ajax({
    url: API_BASE_URL + "/api/admin/orders",
    method: "GET",
    headers: {
      Authorization: "svauth:admin",
    },
    success: function (allOrders) {
      $("#orders-list").empty();

      if (!allOrders || allOrders.length === 0) {
        $("#orders-list").html(
          '<div class="alert alert-info text-center">Không có đơn hàng nào.</div>'
        );
        return;
      }

      // Sắp xếp
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      allOrders.forEach((order, index) => {
        const orderDate = new Date(order.createdAt);
        const orderHtml = `
          <div class="card mb-3" data-order-id="${order._id}">
            <div class="card-header">
              Đơn hàng #${index + 1} - ${orderDate.toLocaleDateString(
          "vi-VN"
        )} ${orderDate.toLocaleTimeString("vi-VN")}
              <span class="order-status ms-2">Trạng thái: ${getStatusText(
                order.status
              )}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">Thông tin khách hàng</h5>
              <p><strong>Email:</strong> ${order.userEmail}</p>
              <p><strong>Họ tên:</strong> ${order.fullName}</p>
              <p><strong>Số điện thoại:</strong> ${order.phone}</p>
              <p><strong>Địa chỉ:</strong> ${order.address}</p>
              <p><strong>Ghi chú:</strong> ${order.note || "Không có"}</p>
              <p><strong>Hình thức thanh toán:</strong> ${getPaymentMethodText(
                order.paymentMethod
              )}</p>
              <h5 class="card-title mt-3">Chi tiết đơn hàng</h5>
              ${order.items
                .map(
                  (item) => `
                    <div class="order-item">
                      <span>${item.name} (x${item.quantity}${
          item.color ? `, Màu: ${item.color}` : ""
        }${item.size ? `, Size: ${item.size}` : ""})</span>
                      <span>${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  `
                )
                .join("")}
              <div class="order-total mt-2">
                <strong>Tổng cộng:</strong> ${formatCurrency(order.total)}
              </div>
              <div class="edit-form">
                <h6>Cập nhật trạng thái</h6>
                <select class="form-select status-select" data-order-id="${order._id}">
                  <option value="pending" ${order.status === "pending" ? "selected" : ""
          }>Đang chờ xử lý</option>
                  <option value="shipped" ${order.status === "shipped" ? "selected" : ""
          }>Đang vận chuyển</option>
                  <option value="delivered" ${order.status === "delivered" ? "selected" : ""
          }>Đã giao hàng</option>
                </select>
                <button class="btn btn-sm btn-success save-status mt-2" data-order-id="${order._id}">Lưu</button>
              </div>
            </div>
          </div>
        `;
        $("#orders-list").append(orderHtml);
      });
    },
    error: function () {
      $("#orders-list").html(
        '<div class="alert alert-danger text-center">Lỗi khi tải đơn hàng.</div>'
      );
    },
  });
}


  // Cập nhật trạng thái đơn
  $(document).on("click", ".save-status", function () {
    const orderId = $(this).data("order-id");
    const newStatus = $(`select[data-order-id="${orderId}"]`).val();

    $.ajax({
      url: API_BASE_URL + `/api/admin/orders/${orderId}/status`,
      method: "PUT",
      headers: {
        Authorization: "svauth:admin",
      },
      contentType: "application/json",
      data: JSON.stringify({ status: newStatus }),
      success: function () {
        $("#message")
          .removeClass("text-danger")
          .addClass("text-success")
          .text("Cập nhật trạng thái thành công!");
        setTimeout(() => {
          $("#message").empty();
          displayOrders();
        }, 2000);
      },
      error: function () {
        $("#message")
          .removeClass("text-success")
          .addClass("text-danger")
          .text("Cập nhật thất bại!");
      },
    });
  });

  // Đăng xuất
  $("#logout-btn").on("click", function () {
    localStorage.removeItem("adminLoggedIn");
    location.reload();
  });

  function getPaymentMethodText(method) {
    return method === "cod"
      ? "Thanh toán khi nhận hàng (COD)"
      : "Thanh toán chuyển khoản";
  }

  function getStatusText(status) {
    switch (status) {
      case "pending":
        return "Đang chờ xử lý";
      case "shipped":
        return "Đang vận chuyển";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  }

  function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  }
});
