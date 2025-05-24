import React, { useEffect, useState } from 'react';

interface Product {
  name: string;
  price: string;
  description: string;
  image: string;
}

const Main: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/products.json')
      .then((response) => {
        if (!response.ok) throw new Error('Lỗi khi tải dữ liệu sản phẩm');
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch(() => setError('Không thể tải dữ liệu sản phẩm.'));
  }, []);

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  return (
    <div className="row" id="product-list">
      {products.map((product, index) => (
        <div className="col-12 col-sm-6 col-md-3 mb-4" key={index}>
          <div className="card h-100 shadow-sm">
            <img src={product.image} className="card-img-top" alt={product.name} />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text text-danger fw-bold">{product.price}</p>
              <p className="card-text">{product.description}</p>
              <a href="#" className="btn btn-primary mt-auto w-100">Mua ngay</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Main;
