import React, { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  colors?: string[];
  sizes?: string[];
  category: string;
  brand: string;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
};

type User = {
  email: string;
};

const parsePrice = (str: string): number => Number(str.replace(/[^0-9]/g, ""));

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [color, setColor] = useState<string>("");
  const [size, setSize] = useState<string>("");

  const handleAddToCart = () => {
    if (product.colors?.length && !color) return alert("Vui lòng chọn màu.");
    if (product.sizes?.length && !size) return alert("Vui lòng chọn size.");

    const user: User | null = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user?.email) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      window.location.href = "login.html";
      return;
    }

    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: parsePrice(product.price),
      image: product.image,
      color,
      size,
      quantity: 1,
    };

    const cartKey = `cart_${user.email}`;
    const cart: CartItem[] = JSON.parse(localStorage.getItem(cartKey) || "[]");
    const idx = cart.findIndex(
      (i) => i.id === item.id && i.color === item.color && i.size === item.size
    );

    if (idx > -1) cart[idx].quantity += 1;
    else cart.push(item);

    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="card product mb-3" data-id={product.id}>
      <a href={`product-detail.html?id=${product.id}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </a>
      <div className="card-body">
        <h5 className="card-title product-name">{product.name}</h5>
        <p className="card-text product-price">{product.price}</p>
        <p className="card-text small text-truncate">{product.description}</p>

        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <>
            <label className="form-label small">Màu:</label>
            <select
              className="form-select form-select-sm mb-2"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">Chọn màu</option>
              {product.colors.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </>
        )}

        {Array.isArray(product.sizes) && product.sizes.length > 0 && (
          <>
            <label className="form-label small">Size:</label>
            <select
              className="form-select form-select-sm mb-2"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="">Chọn size</option>
              {product.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </>
        )}

        <button className="btn btn-primary add-to-cart w-100" onClick={handleAddToCart}>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

const ProductDisplay: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("../data/products.json")
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => alert("Không tải được dữ liệu sản phẩm."));
  }, []);

  const filterKeyword = localStorage.getItem("filterKeyword")?.toLowerCase() || "";
  const minPrice = Number(localStorage.getItem("minPrice")) || null;
  const maxPrice = Number(localStorage.getItem("maxPrice")) || null;

  const isMatch = (product: Product): boolean => {
    const keyword = filterKeyword;
    if (keyword) {
      const isCategory = ["chạy bộ", "tennis-pickleball"].includes(keyword);
      const isBrand = ["nike", "adidas", "asics", "mizuno"].includes(keyword);

      if (isCategory) {
        const category = keyword === "chạy bộ" ? "Running" : "Tennis - Pickleball";
        if (product.category.toLowerCase() !== category.toLowerCase()) return false;
      } else if (isBrand) {
        if (product.brand.toLowerCase() !== keyword) return false;
      } else {
        const searchTarget = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
        if (!searchTarget.includes(keyword)) return false;
      }
    }

    const price = parsePrice(product.price);
    const meetsMin = minPrice ? price >= minPrice : true;
    const meetsMax = maxPrice ? price <= maxPrice : true;
    return meetsMin && meetsMax;
  };

  const filtered = products.filter(isMatch);
  const running = filtered.filter((p) => p.category === "Running");
  const tennis = filtered.filter((p) => p.category === "Tennis - Pickleball");

  return (
    <>
      {minPrice || maxPrice ? (
        <div className="filter-info">
          Đang lọc giá từ {minPrice?.toLocaleString("vi-VN") || 0} đến{" "}
          {maxPrice?.toLocaleString("vi-VN") || "vô cực"} VNĐ
        </div>
      ) : null}

      <section className="product-section">
        <h2 className="section-title">Running</h2>
        <div className="product-grid running-product-grid">
          {running.length > 0 ? (
            running.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="no-results">Không tìm thấy sản phẩm Running.</div>
          )}
        </div>
      </section>

      <section className="product-section">
        <h2 className="section-title">Tennis - Pickleball</h2>
        <div className="product-grid tennis-product-grid">
          {tennis.length > 0 ? (
            tennis.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="no-results">Không tìm thấy sản phẩm Tennis - Pickleball.</div>
          )}
        </div>
      </section>

      {running.length === 0 && tennis.length === 0 && (
        <div className="no-results">Không tìm thấy sản phẩm nào phù hợp.</div>
      )}
    </>
  );
};

export default ProductDisplay;
