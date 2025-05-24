import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  colors?: string[];
  sizes?: string[];
  category: string;
  brand: string;
}

const parsePrice = (str: string): number => Number(str.replace(/[^0-9]/g, ""));

const ProductDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string>("");

  const productId = Number(searchParams.get("id"));

  useEffect(() => {
    if (!productId) {
      setError("Không tìm thấy ID sản phẩm trong URL.");
      return;
    }

    fetch("../data/products.json")
      .then((res) => res.json())
      .then((data: Product[]) => {
        const foundProduct = data.find((p) => p.id === productId);
        if (!foundProduct) {
          setError("Sản phẩm không tồn tại.");
        } else {
          setProduct(foundProduct);
        }
      })
      .catch(() => setError("Lỗi khi tải dữ liệu sản phẩm."));
  }, [productId]);

  if (error) return <p className="text-danger text-center">{error}</p>;
  if (!product) return <p className="text-center">Đang tải...</p>;

  const thumbnails = product.images?.length ? product.images : [product.image];

  return (
    <div id="product-detail">
      <h1 id="product-name">{product.name}</h1>
      <p id="product-price">
        {parsePrice(product.price).toLocaleString("vi-VN")} VNĐ
      </p>
      <p id="product-description">{product.description || "Không có mô tả."}</p>

      <label htmlFor="product-color">Màu sắc:</label>
      <select id="product-color" className="form-select">
        {product.colors?.length ? (
          product.colors.map((color) => (
            <option key={color} value={color}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </option>
          ))
        ) : (
          <option value="">Không có màu</option>
        )}
      </select>

      <label htmlFor="product-size">Kích thước:</label>
      <select id="product-size" className="form-select">
        {product.sizes?.length ? (
          product.sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))
        ) : (
          <option value="">Không có kích thước</option>
        )}
      </select>

      <label htmlFor="product-quantity">Số lượng:</label>
      <input type="number" id="product-quantity" className="form-control" defaultValue={1} min={1} />

      <button className="btn btn-primary mt-3" onClick={() => addToCartDetail(product)}>
        Thêm vào giỏ hàng
      </button>

      <div id="carousel-images" className="carousel slide">
        <div className="carousel-inner">
          {thumbnails.map((thumb, index) => (
            <div className={`carousel-item ${index === 0 ? "active" : ""}`} key={index}>
              <img
                src={thumb}
                className="d-block w-100"
                alt={`Slide ${index + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/500?text=Image+Not+Found";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function addToCartDetail(product: Product) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = Number(urlParams.get("id"));

  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!user) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    window.location.href = "login.html";
    return;
  }

  const color = (document.getElementById("product-color") as HTMLSelectElement)?.value;
  const size = (document.getElementById("product-size") as HTMLSelectElement)?.value;
  const quantity = parseInt(
    (document.getElementById("product-quantity") as HTMLInputElement)?.value
  );

  if (quantity <= 0) {
    alert("Số lượng phải lớn hơn 0!");
    return;
  }

  const cartItem = {
    id: product.id,
    name: product.name,
    price: parsePrice(product.price),
    image: product.image,
    color,
    size,
    quantity,
  };

  const cartKey = `cart_${user.email}`;
  const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
  const idx = cart.findIndex(
    (item: any) =>
      item.id === cartItem.id &&
      item.color === cartItem.color &&
      item.size === cartItem.size
  );

  if (idx > -1) {
    cart[idx].quantity += quantity;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem(cartKey, JSON.stringify(cart));
  alert("Đã thêm sản phẩm vào giỏ hàng!");
}

export default ProductDetail;