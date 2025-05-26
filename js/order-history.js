const API_BASE_URL = "https://vn-authentic-be.onrender.com";

$(document).ready(function () {
  displayOrderHistory();
});

function displayOrderHistory() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const $orderList = $("#order-list");

  if (!user) {
    $orderList.html(
      '<div class="alert alert-warning text-center" role="alert">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>'
    );
    return;
  }

  $.ajax({
    url: API_BASE_URL + "/api/order/history",
    method: "GET",
    headers: { Authorization: user.email },
    success: function (orders) {
      $orderList.empty();

      if (orders.length === 0) {
        $orderList.html(
          '<div class="alert alert-info text-center" role="alert">Bạn chưa có đơn hàng nào.</div>'
        );
        return;
      }

      orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestOrderDate = new Date(orders[0].date).getTime();
      localStorage.setItem("cachedOrders", JSON.stringify(orders));

      orders.forEach((order, index) => {
        const orderDate = new Date(order.date);
        const timeDiff = (new Date() - orderDate) / (1000 * 60 * 60);
        const canEdit = timeDiff <= 2 && order.status !== "cancelled";
        const isLatest = orderDate.getTime() === latestOrderDate;

        const orderHtml = `
          <div class="card mb-3 ${isLatest ? "latest-order" : ""}" data-order-id="${order._id}">
            <div class="card-header">
              Đơn hàng #${index + 1} - ${orderDate.toLocaleDateString("vi-VN")} ${orderDate.toLocaleTimeString("vi-VN")}
              <span class="order-status ms-2">Trạng thái: ${getStatusText(order.status)}</span>
            </div>
            <div class="card-body">
              <h5 class="card-title">Thông tin khách hàng</h5>
              <p><strong>Họ tên:</strong> ${order.fullName}</p>
              <p><strong>Số điện thoại:</strong> ${order.phone}</p>
              <p><strong>Địa chỉ:</strong> ${order.address}</p>
              <p><strong>Ghi chú:</strong> ${order.note || "Không có"}</p>
              <p><strong>Hình thức thanh toán:</strong> ${getPaymentMethodText(order.paymentMethod)}</p>
              <h5 class="card-title mt-3">Chi tiết đơn hàng</h5>
              ${order.items.map((item, itemIndex) => `
                <div class="order-item" data-item-index="${itemIndex}">
                  <span>${item.name} (x${item.quantity}${item.color ? `, Màu: ${item.color}` : ""}${item.size ? `, Size: ${item.size}` : ""})</span>
                  <span>${formatCurrency(item.price * item.quantity)}</span>
                  ${canEdit ? `<button class="btn btn-sm btn-outline-primary edit-item ms-2" data-item-index="${itemIndex}">Chỉnh sửa số lượng</button>` : ""}
                </div>
              `).join("")}
              <div class="order-total mt-2"><strong>Tổng cộng:</strong> ${formatCurrency(order.total)}</div>
              ${canEdit ? `
                <button class="btn btn-sm btn-warning edit-customer-info mt-2">Thay đổi thông tin</button>
                <button class="btn btn-sm btn-danger cancel-order mt-2 ms-2">Hủy đơn hàng</button>
                <div class="edit-form" style="display:none">
                  <h6>Chỉnh sửa thông tin khách hàng</h6>
                  <input type="text" class="form-control edit-fullname" value="${order.fullName}" placeholder="Họ tên" required />
                  <input type="tel" class="form-control edit-phone" value="${order.phone}" placeholder="Số điện thoại (10 số)" pattern="[0-9]{10}" required />
                  <textarea class="form-control edit-address" placeholder="Địa chỉ" required>${order.address}</textarea>
                  <button class="btn btn-sm btn-success save-customer-info mt-2">Lưu</button>
                  <button class="btn btn-sm btn-secondary cancel-edit mt-2 ms-2">Hủy</button>
                </div>
              ` : ""}
            </div>
          </div>
        `;
        $orderList.append(orderHtml);
      });
    },
    error: function () {
      $orderList.html(
        '<div class="alert alert-danger text-center" role="alert">Không thể tải lịch sử đơn hàng.</div>'
      );
    },
  });
}

// Chỉnh sửa số lượng sản phẩm
$(document).on("click", ".edit-item", function () {
  const $orderCard = $(this).closest(".card");
  const orderId = $orderCard.data("order-id");
  const itemIndex = $(this).data("item-index");

  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cachedOrders = JSON.parse(localStorage.getItem("cachedOrders") || "[]");
  const order = cachedOrders.find(o => o._id === orderId);
  if (!user || !order) return;

  const item = order.items[itemIndex];
  if (!item) return;

  let newQuantity = prompt("Nhập số lượng mới:", item.quantity);
  if (newQuantity === null) return;

  newQuantity = parseInt(newQuantity);
  if (isNaN(newQuantity) || newQuantity <= 0) return alert("Số lượng không hợp lệ!");

  $.ajax({
    url: API_BASE_URL + `/api/order/${orderId}/item/${item.productId}`,
    method: "PUT",
    contentType: "application/json",
    headers: { Authorization: user.email },
    data: JSON.stringify({ quantity: newQuantity }),
    success: () => {
      alert("Cập nhật số lượng thành công!");
      displayOrderHistory();
    },
    error: () => alert("Không thể cập nhật số lượng sản phẩm"),
  });
});

// Hủy đơn hàng
$(document).on("click", ".cancel-order", function () {
  const $orderCard = $(this).closest(".card");
  const orderId = $orderCard.data("order-id");
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;

  $.ajax({
    url: API_BASE_URL + `/api/order/${orderId}/cancel`,
    method: "PUT",
    headers: { Authorization: user.email },
    success: () => {
      alert("Đã hủy đơn hàng!");
      displayOrderHistory();
    },
    error: () => alert("Không thể hủy đơn hàng"),
  });
});

// Hiện form chỉnh sửa
$(document).on("click", ".edit-customer-info", function () {
  $(this).siblings(".edit-form").slideDown();
});
$(document).on("click", ".cancel-edit", function () {
  $(this).closest(".edit-form").slideUp();
});

// Lưu thông tin khách hàng
$(document).on("click", ".save-customer-info", function () {
  const $form = $(this).closest(".edit-form");
  const $orderCard = $(this).closest(".card");
  const orderId = $orderCard.data("order-id");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const fullName = $form.find(".edit-fullname").val().trim();
  const phone = $form.find(".edit-phone").val().trim();
  const address = $form.find(".edit-address").val().trim();

  if (!fullName || !phone || !address) return alert("Vui lòng điền đầy đủ thông tin!");
  if (!/^[0-9]{10}$/.test(phone)) return alert("Số điện thoại phải đúng 10 số!");

  $.ajax({
    url: API_BASE_URL + `/api/order/${orderId}/customer`,
    method: "PUT",
    contentType: "application/json",
    headers: { Authorization: user.email },
    data: JSON.stringify({ fullName, phone, address }),
    success: () => {
      alert("Cập nhật thông tin thành công!");
      displayOrderHistory();
    },
    error: () => alert("Không thể cập nhật thông tin khách hàng"),
  });
});

// Helpers
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
function getPaymentMethodText(method) {
  return method === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản";
}
function formatCurrency(value) {
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
