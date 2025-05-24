import React, { useEffect, useRef, useState } from "react";
import "../../assets/css/header.css";

const Menu: React.FC = () => {
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenSubmenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDropdownClick = (
    index: number,
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light"
      ref={dropdownRef}
    >
      <div className="container">
        <a className="navbar-brand" href="#">
          VNauthentic
        </a>
        <ul className="navbar-nav">
          <li className="nav-item dropdown-submenu">
            <a
              href="#"
              onClick={(e) => handleDropdownClick(0, e)}
              className="nav-link dropdown-toggle"
            >
              Danh mục
            </a>
            {openSubmenu === 0 && (
              <ul className="dropdown-menu show">
                <li>
                  <a className="dropdown-item" href="#">
                    Running
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Tennis
                  </a>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Menu;
