import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  image: string;
  name: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
}

interface User {
  email: string;
  [key: string]: any;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (!storedUser) {
      setUser(null);
      setCart([]);
      setTotalPrice(0);
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    if (!parsedUser.email) {
      setUser(null);
      setCart([]);
      setTotalPrice(0);
      return;
    }

    setUser(parsedUser);

    const cartKey = `cart_${parsedUser.email}`;
    const storedCart = localStorage.getItem(cartKey);
    const parsedCart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

    setCart(parsedCart);

    const total = parsedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  }, []);

  const formatPrice = (num: number): string => {
    return num.toLocaleString("vi-VN") + " VNĐ";
  };

  const handleQuantityChange = (index: number, value: number) => {
    if (!user) return;

    let qty = value;
    if (qty < 1 || isNaN(qty)) qty = 1;

    const newCart = [...cart];
    newCart[index] = { ...newCart[index], quantity: qty };

    setCart(newCart);
    updateCartStorage(newCart, user.email);
  };

  const handleRemove = (index: number) => {
    if (!user) return;

    const newCart = [...cart];
    newCart.splice(index, 1);

    setCart(newCart);
    updateCartStorage(newCart, user.email);
  };

  const updateCartStorage = (newCart: CartItem[], email: string) => {
    const cartKey = `cart_${email}`;
    localStorage.setItem(cartKey, JSON.stringify(newCart));

    const total = newCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const isLoggedIn = (): boolean => !!user;

  const handleCheckout = () => {
    if (!isLoggedIn()) {
      alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div>
      <table className="table" id="cart-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Màu</th>
            <th>Size</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!user ? (
            <tr>
              <td colSpan={7} className="text-center">
                Vui lòng đăng nhập để xem giỏ hàng.
              </td>
            </tr>
          ) : cart.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                Giỏ hàng trống.
              </td>
            </tr>
          ) : (
            cart.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <img src={item.image} width={70} alt={item.name} />
                </td>
                <td>{item.name}</td>
                <td>{item.color || "--"}</td>
                <td>{item.size || "--"}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="form-control quantity-input"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value))}
                  />
                </td>
                <td>{formatPrice(item.price * item.quantity)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemove(idx)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <h5>Tổng tiền: {formatPrice(totalPrice)}</h5>
        <button
          id="checkout-btn"
          className="btn btn-primary"
          disabled={!user || cart.length === 0}
          onClick={handleCheckout}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default Cart;
