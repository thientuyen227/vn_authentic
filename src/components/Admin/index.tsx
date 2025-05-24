import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  name: string;
  quantity: number;
  color?: string;
  size?: string;
  price: number;
}

interface Order {
  date: string;
  userEmail: string;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: "cod" | "bank";
  status: "pending" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
}

const ADMIN_USERNAME = "svauth";
const ADMIN_PASSWORD = "admin";

function formatCurrency(amount: number) {
  return amount.toLocaleString("vi-VN") + " VNĐ";
}

function getStatusText(status: Order["status"]) {
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

function getPaymentMethodText(method: Order["paymentMethod"]) {
  return method === "cod"
    ? "Thanh toán khi nhận hàng (COD)"
    : "Thanh toán chuyển khoản";
}

const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true");
      setMessage(null);
      onLogin();
    } else {
      setMessage("Tên đăng nhập hoặc mật khẩu không đúng!");
    }
  };

  return (
    <div id="login-container">
      <h2>Đăng nhập quản trị</h2>
      <form onSubmit={handleSubmit} id="login-form">
        <div>
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {message && <p style={{ color: "red" }}>{message}</p>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

const AdminOrders: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    const usersKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("orders_")
    );

    let allOrders: Order[] = [];
    usersKeys.forEach((key) => {
      const userOrders = localStorage.getItem(key);
      if (userOrders) {
        allOrders = allOrders.concat(JSON.parse(userOrders));
      }
    });

    allOrders.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setOrders(allOrders);
  }, []);

  // Lưu lại trạng thái của order
  const handleStatusChange = (orderDate: string, newStatus: Order["status"]) => {
    const usersKeys = Object.keys(localStorage).filter((k) =>
      k.startsWith("orders_")
    );

    for (const userKey of usersKeys) {
      const userOrdersRaw = localStorage.getItem(userKey);
      if (!userOrdersRaw) continue;

      const userOrders: Order[] = JSON.parse(userOrdersRaw);
      const orderIndex = userOrders.findIndex((o) => o.date === orderDate);
      if (orderIndex !== -1) {
        userOrders[orderIndex].status = newStatus;
        localStorage.setItem(userKey, JSON.stringify(userOrders));

        setMessage("Cập nhật trạng thái thành công!");
        // Reload orders để cập nhật UI
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.date === orderDate ? { ...o, status: newStatus } : o
          )
        );

        setTimeout(() => setMessage(null), 2000);
        break;
      }
    }
  };

  if (orders.length === 0) {
    return <div className="alert alert-info text-center">Không có đơn hàng nào.</div>;
  }

  return (
    <div id="orders-container">
      <h2>Danh sách đơn hàng</h2>
      {message && <div style={{ color: "green", marginBottom: "10px" }}>{message}</div>}
      <button id="logout-btn" className="btn btn-secondary mb-3" onClick={onLogout}>
        Đăng xuất
      </button>
      <div id="orders-list">
        {orders.map((order, idx) => {
          const orderDate = new Date(order.date);
          return (
            <div className="card mb-3" key={idx} data-order-index={idx}>
              <div className="card-header">
                Đơn hàng #{idx + 1} -{" "}
                {orderDate.toLocaleDateString("vi-VN")}{" "}
                {orderDate.toLocaleTimeString("vi-VN")}
                <span className="order-status ms-2">
                  Trạng thái: {getStatusText(order.status)}
                </span>
              </div>
              <div className="card-body">
                <h5 className="card-title">Thông tin khách hàng</h5>
                <p><strong>Email:</strong> {order.userEmail}</p>
                <p><strong>Họ tên:</strong> {order.fullName}</p>
                <p><strong>Số điện thoại:</strong> {order.phone}</p>
                <p><strong>Địa chỉ:</strong> {order.address}</p>
                <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
                <p><strong>Hình thức thanh toán:</strong> {getPaymentMethodText(order.paymentMethod)}</p>
                <h5 className="card-title mt-3">Chi tiết đơn hàng</h5>
                {order.items.map((item, i) => (
                  <div className="order-item" key={i}>
                    <span>
                      {item.name} (x{item.quantity}
                      {item.color ? `, Màu: ${item.color}` : ""}
                      {item.size ? `, Size: ${item.size}` : ""})
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="order-total mt-2">
                  <strong>Tổng cộng:</strong> {formatCurrency(order.total)}
                </div>
                <div className="edit-form">
                  <h6>Cập nhật trạng thái</h6>
                  <select
                    className="form-select"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.date, e.target.value as Order["status"])
                    }
                  >
                    <option value="pending">Đang chờ xử lý</option>
                    <option value="shipped">Đang vận chuyển</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(() =>
    localStorage.getItem("adminLoggedIn") === "true"
  );

  const logout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
  };

  return loggedIn ? (
    <AdminOrders onLogout={logout} />
  ) : (
    <AdminLogin onLogin={() => setLoggedIn(true)} />
  );
};

export default AdminPanel;
