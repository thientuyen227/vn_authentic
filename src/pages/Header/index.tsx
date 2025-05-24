import React from "react";
import type { FormEvent } from "react";

const Header: React.FC = () => {
  // Hàm resetFilters thay thế cho onclick="resetFilters()"
  const resetFilters = (): void => {
    // TODO: thêm logic reset filter nếu cần
    console.log("Filters reset");
  };

  // Hàm xử lý submit form tìm kiếm
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("search-input") as HTMLInputElement;
    const query = input.value;
    console.log("Search query:", query);
    // TODO: xử lý tìm kiếm
  };

  return (
    <header className="bg-primary text-white p-3">
      <div className="container">
        <div className="header-top d-flex justify-content-between align-items-center">
          <div className="logo">
            <a
              href="index.html"
              className="text-white h4 text-decoration-none"
              onClick={resetFilters}
            >
              <img
                src="/image/common/logo.png" // Đường dẫn trong public folder
                alt="SvAuthentic Logo"
                style={{ height: 50 }}
              />
            </a>
          </div>

          <nav>
            <ul className="nav" id="main-menu">
              <li className="nav-item">
                <a href="index.html" className="nav-link text-white">
                  Trang chủ
                </a>
              </li>
              <li className="nav-item dropdown">
                <a
                  href="#"
                  className="nav-link dropdown-toggle text-white"
                  data-bs-toggle="dropdown"
                  role="button"
                  aria-expanded="false"
                >
                  Sản phẩm
                </a>
                <ul
                  className="dropdown-menu multi-level"
                  aria-labelledby="navbarDropdown"
                  id="product-dropdown"
                ></ul>
              </li>
              <li className="nav-item">
                <a href="cart.html" className="nav-link text-white">
                  Giỏ hàng
                </a>
              </li>
              <li className="nav-item">
                <a href="checkout.html" className="nav-link text-white">
                  Thanh toán
                </a>
              </li>
              <li className="nav-item">
                <a href="order-history.html" className="nav-link text-white">
                  Lịch sử mua hàng
                </a>
              </li>
              <li className="nav-item">
                <a href="checkshoes.html" className="nav-link text-white">
                  Check giày
                </a>
              </li>
              <li className="nav-item" id="user-info">
                <a href="login.html" className="nav-link text-white d-inline">
                  Đăng nhập
                </a>
                {" | "}
                <a href="login.html" className="nav-link text-white d-inline">
                  Đăng ký
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="search-bar mt-2">
          <form id="search-form" className="d-flex" onSubmit={handleSearchSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Tìm kiếm..."
              aria-label="Search"
              id="search-input"
              name="search-input"
            />
            <button className="btn btn-outline-light" type="submit">
              Tìm
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
