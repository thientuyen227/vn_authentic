$(document).ready(function() {
    displayOrderHistory();
});

function updateOrderStatus() {
    // Hàm này được giữ nguyên nhưng không sử dụng để tự động cập nhật trạng thái
    // Vì đã có trang admin quản lý trạng thái
}

function displayOrderHistory() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const $orderList = $("#order-list");

    if (!user) {
        $orderList.html(
            '<div class="alert alert-warning text-center" role="alert">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>'
        );
        return;
    }

    const userOrdersKey = `orders_${user.email}`;
    let orders = JSON.parse(localStorage.getItem(userOrdersKey)) || [];

    $orderList.empty();

    if (orders.length === 0) {
        $orderList.html(
            '<div class="alert alert-info text-center" role="alert">Bạn chưa có đơn hàng nào.</div>'
        );
        return;
    }

    // Sắp xếp đơn hàng theo thời gian giảm dần (mới nhất lên đầu)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Tìm đơn hàng mới nhất để làm nổi bật
    const latestOrderDate = new Date(orders[0].date).getTime();

    orders.forEach((order, index) => {
                const orderDate = new Date(order.date);
                const currentTime = new Date();
                const timeDiff = (currentTime - orderDate) / (1000 * 60 * 60); // Tính chênh lệch thời gian (giờ)
                const canEdit = timeDiff <= 2 && order.status !== "cancelled"; // Chỉ cho phép chỉnh sửa trong 2 tiếng và chưa hủy
                const isLatest = orderDate.getTime() === latestOrderDate;

                const orderHtml = `
      <div class="card mb-3 ${
        isLatest ? "latest-order" : ""
      }" data-order-index="${index}">
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
              (item, itemIndex) => `
            <div class="order-item" data-item-index="${itemIndex}">
              <span>${item.name} (x${item.quantity}${
                item.color ? `, Màu: ${item.color}` : ""
              }${item.size ? `, Size: ${item.size}` : ""})</span>
              <span>${formatCurrency(item.price * item.quantity)}</span>
              ${
                canEdit
                  ? `<button class="btn btn-sm btn-outline-primary edit-item ms-2" data-item-index="${itemIndex}">Chỉnh sửa số lượng</button>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
          <div class="order-total mt-2">
            <strong>Tổng cộng:</strong> ${formatCurrency(order.total)}
          </div>
          ${
            canEdit
              ? `
            <button class="btn btn-sm btn-warning edit-customer-info mt-2">Thay đổi thông tin</button>
            <button class="btn btn-sm btn-danger cancel-order mt-2 ms-2">Hủy đơn hàng</button>
            <div class="edit-form">
              <h6>Chỉnh sửa thông tin khách hàng</h6>
              <input type="text" class="form-control edit-fullname" value="${order.fullName}" placeholder="Họ tên" required />
              <input type="tel" class="form-control edit-phone" value="${order.phone}" placeholder="Số điện thoại (10 số)" pattern="[0-9]{10}" required />
              <textarea class="form-control edit-address" placeholder="Địa chỉ" required>${order.address}</textarea>
              <button class="btn btn-sm btn-success save-customer-info mt-2">Lưu</button>
              <button class="btn btn-sm btn-secondary cancel-edit mt-2 ms-2">Hủy</button>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
    $orderList.append(orderHtml);
  });

  // Xử lý chỉnh sửa số lượng sản phẩm
  $orderList.on("click", ".edit-item", function () {
    const $orderCard = $(this).closest(".card");
    const orderIndex = $orderCard.data("order-index");
    const itemIndex = $(this).data("item-index");
    const currentQuantity = orders[orderIndex].items[itemIndex].quantity;
    let newQuantity = prompt("Nhập số lượng mới:", currentQuantity);

    // Kiểm tra nếu người dùng nhấn Cancel
    if (newQuantity === null) {
      return; // Thoát ngay nếu nhấn Cancel
    }

    // Chuyển đổi và kiểm tra giá trị
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      alert("Số lượng không hợp lệ! Vui lòng nhập một số nguyên lớn hơn 0.");
      return;
    }

    // Cập nhật số lượng và tổng cộng
    orders[orderIndex].items[itemIndex].quantity = newQuantity;
    orders[orderIndex].total = orders[orderIndex].items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    localStorage.setItem(userOrdersKey, JSON.stringify(orders));
    displayOrderHistory();
    alert("Cập nhật số lượng thành công!");
  });

  // Xử lý hủy đơn hàng
  $orderList.on("click", ".cancel-order", function () {
    const $orderCard = $(this).closest(".card");
    const orderIndex = $orderCard.data("order-index");
    if (confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      orders[orderIndex].status = "cancelled";
      localStorage.setItem(userOrdersKey, JSON.stringify(orders));
      displayOrderHistory();
      alert("Đã hủy đơn hàng!");
    }
  });

  // Xử lý hiển thị form chỉnh sửa thông tin khách hàng
  $orderList.on("click", ".edit-customer-info", function () {
    const $editForm = $(this).siblings(".edit-form");
    $editForm.slideDown();
  });

  // Xử lý lưu thông tin khách hàng
  $orderList.on("click", ".save-customer-info", function () {
    const $orderCard = $(this).closest(".card");
    const orderIndex = $orderCard.data("order-index");
    const $editForm = $(this).closest(".edit-form");

    const newFullName = $editForm.find(".edit-fullname").val().trim();
    const newPhone = $editForm.find(".edit-phone").val().trim();
    const newAddress = $editForm.find(".edit-address").val().trim();

    if (!newFullName || !newPhone || !newAddress) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!/^[0-9]{10}$/.test(newPhone)) {
      alert("Số điện thoại phải đúng 10 số (VD: 0901234567)!");
      return;
    }

    orders[orderIndex].fullName = newFullName;
    orders[orderIndex].phone = newPhone;
    orders[orderIndex].address = newAddress;
    localStorage.setItem(userOrdersKey, JSON.stringify(orders));
    displayOrderHistory();
    alert("Cập nhật thông tin khách hàng thành công!");
  });

  // Xử lý hủy chỉnh sửa thông tin
  $orderList.on("click", ".cancel-edit", function () {
    const $editForm = $(this).closest(".edit-form");
    $editForm.slideUp();
  });
}

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