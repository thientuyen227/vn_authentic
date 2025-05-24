import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Home from "./pages/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/css/admin.css'
import './assets/css/cart.css'
import './assets/css/checkout.css'
import './assets/css/checkshoes.css'
import './assets/css/contact.css'
import './assets/css/footer.css'
import './assets/css/header.css'
import './assets/css/login.css'
import './assets/css/order-history.css'
import './assets/css/product-detail.css'
import './assets/css/signup.css'
import './assets/css/style.css'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Home />
    </>
  )
}

export default App
