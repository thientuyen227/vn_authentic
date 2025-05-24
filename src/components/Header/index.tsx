import React, { useEffect, useState } from "react";

interface Product {
  category: string;
  brand: string;
  name: string;
}

interface User {
  name: string;
  email?: string;
  address?: string;
}

function sanitizeInput(input: string): string {
  return input
    ? input.replace(/[<>&"']/g, (m) => {
        return {
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#39;",
        }[m] || m;
      })
    : "";
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<
    Record<string, Record<string, string[]>>
  >({});

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    else setUser(null);
  }, []);

  useEffect(() => {
    fetch("../data/products.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products.json");
        return res.json();
      })
      .then((data: Product[]) => {
        const cats: Record<string, Record<string, string[]>> = {};

        data.forEach(({ category, brand, name }) => {
          if (!cats[category]) cats[category] = {};
          if (!cats[category][brand]) cats[category][brand] = [];
          cats[category][brand].push(sanitizeInput(name));
        });

        setCategories(cats);
      })
      .catch((error) => {
        console.error("Lỗi khi tải products.json:", error);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.replace("index.html");
  };

  const navigateWithFilter = (filterKeyword: string) => {
    localStorage.setItem("filterKeyword", filterKeyword);
    window.location.href = "index.html";
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.search as HTMLInputElement;
    const searchTerm = input.value.trim().toLowerCase();
    if (searchTerm) {
      localStorage.setItem("filterKeyword", searchTerm);
      window.location.href = "index.html";
    }
  };

  return (
    <header>
      <nav>
        <div id="user-info" className="user-info-container">
          {user && user.name ? (
            <>
              <span className="nav-link text-white d-inline user-greeting">
                Xin chào, {sanitizeInput(user.name)}
              </span>{" "}
              |{" "}
              <button
                className="btn btn-outline-light btn-sm logout-btn"
                id="logout-btn"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <a href="login.html" className="nav-link text-white d-inline">
                Đăng nhập
              </a>{" "}
              |{" "}
              <a href="signup.html" className="nav-link text-white d-inline">
                Đăng ký
              </a>
            </>
          )}
        </div>

        <ul id="product-dropdown" className="dropdown-menu">
          {Object.entries(categories).map(([category, brands]) => (
            <li className="dropdown-submenu" key={category}>
              <a
                href="#"
                className="dropdown-item dropdown-toggle"
                onClick={(e) => {
                  e.preventDefault();
                  const filterValue =
                    category === "Running" ? "chạy bộ" : "tennis-pickleball";
                  navigateWithFilter(filterValue);
                }}
              >
                {category === "Running" ? "Chạy bộ" : "Tennis - Pickleball"}
              </a>
              <ul className="dropdown-menu">
                {Object.entries(brands).map(([brand, models]) => (
                  <li className="dropdown-submenu" key={brand}>
                    <a
                      href="#"
                      className="dropdown-item dropdown-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        navigateWithFilter(brand.toLowerCase());
                      }}
                    >
                      {sanitizeInput(brand)}
                    </a>
                    <ul className="dropdown-menu">
                      {models.map((model) => (
                        <li key={model}>
                          <a href="#" className="dropdown-item">
                            {model}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <form id="search-form" onSubmit={onSearchSubmit}>
          <input
            id="search-input"
            name="search"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="form-control"
          />
          <button type="submit" className="btn btn-primary">
            Tìm kiếm
          </button>
        </form>
      </nav>
    </header>
  );
};

export default Header;

export function resetFilters() {
  localStorage.removeItem("filterKeyword");
  localStorage.removeItem("minPrice");
  localStorage.removeItem("maxPrice");
  window.location.href = "index.html";
}
