import React, { useEffect, useState } from "react";

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
}

interface User {
  email: string;
  [key: string]: any;
}

interface Order {
  fullName: string;
  phone: string;
  address: string;
  note: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  date: string;
  userEmail: string;
  status: string;
}

const Checkout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "danger" | "" }>({ text: "", type: "" });
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [showQRCode, setShowQRCode] = useState(false);

  // Load user & cart on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      setMessage({ text: "Vui lòng đăng nhập để tiếp tục thanh toán.", type: "danger" });
      return;
    }
    const parsedUser: User = JSON.parse(storedUser);
    if (!parsedUser.email) {
      setMessage({ text: "Vui lòng đăng nhập để tiếp tục thanh toán.", type: "danger" });
      return;
    }
    setUser(parsedUser);

    const cartKey = `cart_${parsedUser.email}`;
    const storedCart = localStorage.getItem(cartKey);
    const parsedCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];
    if (parsedCart.length === 0) {
      setMessage({ text: "Giỏ hàng của bạn đang trống.", type: "danger" });
    }
    setCart(parsedCart);
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hide QR code if payment method changes
    if (name === "paymentMethod") {
      setShowQRCode(value === "transfer");
    }
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    else if (!/^[0-9]{9,12}$/.test(formData.phone)) newErrors.phone = true;
    if (!formData.address.trim()) newErrors.address = true;
    if (!formData.paymentMethod) newErrors.paymentMethod = true;

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Calculate total price
  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user) {
      setMessage({ text: "Vui lòng đăng nhập để đặt hàng.", type: "danger" });
      return;
    }

    if (cart.length === 0) {
      setMessage({ text: "Giỏ hàng của bạn đang trống.", type: "danger" });
      return;
    }

    const order: Order = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      note: formData.note.trim(),
      paymentMethod: formData.paymentMethod,
      items: cart,
      total: calculateTotal(),
      date: new Date().toISOString(),
      userEmail: user.email,
      status: "pending",
    };

    const userOrdersKey = `orders_${user.email}`;
    const storedOrders = localStorage.getItem(userOrdersKey);
    const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
    orders.push(order);
    localStorage.setItem(userOrdersKey, JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem(`cart_${user.email}`);
    setCart([]);

    setMessage({ text: "Đặt hàng thành công! Chuyển hướng đến lịch sử mua hàng...", type: "success" });

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "/order-history"; // bạn sửa đường dẫn phù hợp
    }, 2000);

    setShowQRCode(false);
  };

  return (
    <div>
      {message.text && (
        <div className={`message ${message.type === "danger" ? "text-danger" : "text-success"}`} style={{ marginBottom: 20 }}>
          {message.text}
        </div>
      )}

      {cart.length > 0 && user && (
        <>
          <div id="cart-summary" style={{ marginBottom: 20 }}>
            {cart.map((item, idx) => (
              <div key={idx} className="cart-item" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  {item.name} (x{item.quantity}
                  {item.color ? `, Màu: ${item.color}` : ""}
                  {item.size ? `, Size: ${item.size}` : ""})
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="cart-item" style={{ fontWeight: "bold", marginTop: 10 }}>
              Tổng cộng: {formatCurrency(calculateTotal())}
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label htmlFor="fullname">Họ và tên *</label>
              <input
                type="text"
                id="fullname"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label htmlFor="address">Địa chỉ nhận hàng *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label htmlFor="note">Ghi chú</label>
              <textarea id="note" name="note" value={formData.note} onChange={handleChange} className="form-control" />
            </div>

            <div className="form-group" style={{ marginBottom: 10 }}>
              <label htmlFor="payment-method">Phương thức thanh toán *</label>
              <select
                id="payment-method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className={`form-control ${errors.paymentMethod ? "is-invalid" : ""}`}
                required
              >
                <option value="">-- Chọn phương thức --</option>
                <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                <option value="transfer">Chuyển khoản</option>
                {/* Thêm các phương thức khác nếu cần */}
              </select>
            </div>

            {showQRCode && (
              <div id="qr-code" style={{ marginBottom: 10 }}>
                {/* Bạn có thể chèn hình QR code ở đây */}
                <img src="/path-to-qr-code.png" alt="QR Code chuyển khoản" style={{ maxWidth: "200px" }} />
              </div>
            )}

            <button type="submit" className="btn btn-primary">
              Đặt hàng
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Checkout;
