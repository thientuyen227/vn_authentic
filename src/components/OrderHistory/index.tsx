import React, { useEffect, useState } from "react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

interface Order {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: string;
  status: string;
  date: string;
  total: number;
  items: OrderItem[];
}

const getPaymentMethodText = (method: string) =>
  method === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Thanh toán chuyển khoản";

const getStatusText = (status: string) => {
  switch (status) {
    case "pending": return "Đang chờ xử lý";
    case "shipped": return "Đang vận chuyển";
    case "delivered": return "Đã giao hàng";
    case "cancelled": return "Đã hủy";
    default: return "Không xác định";
  }
};

const formatCurrency = (amount: number) => `${amount.toLocaleString("vi-VN")} VNĐ`;

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return;
    const parsedUser = JSON.parse(currentUser);
    setUser(parsedUser);
    const userOrdersKey = `orders_${parsedUser.email}`;
    const storedOrders = JSON.parse(localStorage.getItem(userOrdersKey) || "[]");
    setOrders(storedOrders.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const updateOrders = (newOrders: Order[]) => {
    if (!user) return;
    const userOrdersKey = `orders_${user.email}`;
    localStorage.setItem(userOrdersKey, JSON.stringify(newOrders));
    setOrders([...newOrders]);
  };

  const handleEditQuantity = (orderIndex: number, itemIndex: number) => {
    const newQuantity = prompt("Nhập số lượng mới:", orders[orderIndex].items[itemIndex].quantity.toString());
    if (newQuantity === null) return;
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity <= 0) return alert("Số lượng không hợp lệ!");

    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items[itemIndex].quantity = quantity;
    updatedOrders[orderIndex].total = updatedOrders[orderIndex].items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    updateOrders(updatedOrders);
    alert("Cập nhật số lượng thành công!");
  };

  const handleCancelOrder = (index: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    const updatedOrders = [...orders];
    updatedOrders[index].status = "cancelled";
    updateOrders(updatedOrders);
    alert("Đã hủy đơn hàng!");
  };

  const handleSaveCustomerInfo = (index: number, fullName: string, phone: string, address: string) => {
    if (!fullName || !phone || !address) return alert("Vui lòng điền đầy đủ thông tin!");
    if (!/^\d{10}$/.test(phone)) return alert("Số điện thoại phải đúng 10 số!");

    const updatedOrders = [...orders];
    updatedOrders[index].fullName = fullName;
    updatedOrders[index].phone = phone;
    updatedOrders[index].address = address;
    updateOrders(updatedOrders);
    alert("Cập nhật thông tin thành công!");
  };

  if (!user) return <div className="alert alert-warning text-center">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;
  if (orders.length === 0) return <div className="alert alert-info text-center">Bạn chưa có đơn hàng nào.</div>;

  const latestDate = new Date(orders[0].date).getTime();

  return (
    <div>
      {orders.map((order, i) => {
        const orderDate = new Date(order.date);
        const isLatest = orderDate.getTime() === latestDate;
        const timeDiff = (new Date().getTime() - orderDate.getTime()) / 3600000;
        const canEdit = timeDiff <= 2 && order.status !== "cancelled";

        return (
          <div className={`card mb-3 ${isLatest ? "latest-order" : ""}`} key={i}>
            <div className="card-header">
              Đơn hàng #{i + 1} - {orderDate.toLocaleDateString("vi-VN")} {orderDate.toLocaleTimeString("vi-VN")}
              <span className="ms-2">Trạng thái: {getStatusText(order.status)}</span>
            </div>
            <div className="card-body">
              <h5 className="card-title">Thông tin khách hàng</h5>
              <p><strong>Họ tên:</strong> {order.fullName}</p>
              <p><strong>Số điện thoại:</strong> {order.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.address}</p>
              <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
              <p><strong>Hình thức thanh toán:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
              <h5 className="card-title mt-3">Chi tiết đơn hàng</h5>
              {order.items.map((item, j) => (
                <div className="d-flex justify-content-between" key={j}>
                  <span>{item.name} (x{item.quantity}{item.color ? ", Màu: " + item.color : ""}{item.size ? ", Size: " + item.size : ""})</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                  {canEdit && (
                    <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => handleEditQuantity(i, j)}>Chỉnh sửa</button>
                  )}
                </div>
              ))}
              <div className="mt-2"><strong>Tổng cộng:</strong> {formatCurrency(order.total)}</div>
              {canEdit && (
                <div className="mt-3">
                  <button className="btn btn-sm btn-warning" onClick={() => handleSaveCustomerInfo(i, prompt("Họ tên", order.fullName) || order.fullName, prompt("SĐT", order.phone) || order.phone, prompt("Địa chỉ", order.address) || order.address)}>
                    Thay đổi thông tin
                  </button>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleCancelOrder(i)}>Hủy đơn hàng</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;