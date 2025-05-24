import React from "react";
import Menu from "../../components/Menu";  
import Header from "../Header";      // import component menu của bạn
import bannerImg from "../../assets/image/common/bia.png";

interface Props {
  clearFilter: () => void;
  applyPriceFilter: () => void;
  clearPriceFilter: () => void;
}

const Home: React.FC<Props> = ({
  clearFilter,
  applyPriceFilter,
  clearPriceFilter,
}) => {
  return (
    <>
      {/* Header */}
      <div id="header-container">
        <Header />
      </div>

      {/* Banner */}
      <section className="banner my-4">
        <div className="container">
          <img
            src={bannerImg}
            alt="Banner SvAuthentic"
            className="img-fluid rounded"
          />
        </div>
      </section>

      {/* Main content */}
      <main className="container">
        <div className="filter-clear mb-3">
          <button className="btn btn-secondary" onClick={clearFilter}>
            Xóa bộ lọc
          </button>
          <button className="btn btn-danger ms-2" onClick={clearFilter}>
            Reset tất cả
          </button>
        </div>

        <div className="price-filter mb-4">
          <label htmlFor="min-price" className="me-2">
            Giá từ:
          </label>
          <input
            type="number"
            id="min-price"
            className="form-control d-inline-block"
            placeholder="Đang tải..."
            style={{ width: "120px" }}
          />

          <label htmlFor="max-price" className="mx-2">
            đến:
          </label>
          <input
            type="number"
            id="max-price"
            className="form-control d-inline-block"
            placeholder="Đang tải..."
            style={{ width: "120px" }}
          />

          <button className="btn btn-primary ms-3" onClick={applyPriceFilter}>
            Lọc giá
          </button>
          <button className="btn btn-secondary ms-2" onClick={clearPriceFilter}>
            Xóa bộ lọc giá
          </button>
        </div>

        <section id="running-products" className="product-section mb-5">
          <h2 className="section-title">Running</h2>
          <div className="product-grid running-product-grid">{/* Render sản phẩm ở đây hoặc trong component con */}</div>
        </section>

        <section id="tennis-products" className="product-section">
          <h2 className="section-title">Tennis - Pickleball</h2>
          <div className="product-grid tennis-product-grid">{/* Render sản phẩm */}</div>
        </section>
      </main>

      {/* Footer */}
      <div id="footer-container">
        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Home;
