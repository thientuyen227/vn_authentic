import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import "bootstrap/dist/css/bootstrap.min.css";

interface User {
  name: string;
  email: string;
  address: string;
  password: string;
}

type ToastType = "primary" | "success" | "danger";

export default function AuthForms() {
  const [formView, setFormView] = useState<"login" | "register" | "forgot">("login");

  // Form states
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: "",
    type: "primary",
    visible: false,
  });

  // Hash password
  function hashPassword(password: string) {
    return CryptoJS.SHA256(password).toString();
  }

  // Sanitize input (simple version)
  function sanitizeInput(input: string) {
    return input.replace(/[<>&"']/g, (m) => {
      return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[m] || m;
    });
  }

  // Show toast message
  function showMessage(message: string, type: ToastType = "primary") {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }

  // Validators
  const validateRegister = () => {
    let newErrors: { [key: string]: string } = {};
    if (!registerData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên.";
    if (!registerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email))
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    if (!registerData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ.";
    if (
      !registerData.password ||
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(registerData.password)
    )
      newErrors.password =
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt (@$!%*?&).";
    if (registerData.password !== registerData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    let newErrors: { [key: string]: string } = {};
    if (!loginData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email))
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    if (!loginData.password) newErrors.password = "Vui lòng nhập mật khẩu.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForgot = () => {
    let newErrors: { [key: string]: string } = {};
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail))
      newErrors.email = "Vui lòng nhập email hợp lệ.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleRegister = () => {
    if (!validateRegister()) {
      showMessage("Vui lòng kiểm tra lại thông tin.", "danger");
      return;
    }

    // Get users
    let users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((u) => u.email === registerData.email)) {
      setErrors({ email: "Email này đã được đăng ký." });
      showMessage("Email này đã được đăng ký!", "danger");
      return;
    }

    const newUser: User = {
      name: sanitizeInput(registerData.name.trim()),
      email: registerData.email.trim(),
      address: sanitizeInput(registerData.address.trim()),
      password: hashPassword(registerData.password),
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");

    setTimeout(() => {
      setFormView("login");
      setRegisterData({ name: "", email: "", address: "", password: "", confirmPassword: "" });
      setErrors({});
    }, 1500);
  };

  const handleLogin = () => {
    if (!validateLogin()) {
      showMessage("Vui lòng kiểm tra lại thông tin.", "danger");
      return;
    }

    let users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (u) => u.email === loginData.email.trim() && u.password === hashPassword(loginData.password)
    );

    if (user) {
      showMessage("Đăng nhập thành công! Đang chuyển hướng về trang chủ...", "success");
      localStorage.setItem("currentUser", JSON.stringify(user));
      setTimeout(() => {
        window.location.replace("index.html");
      }, 1500);
    } else {
      setErrors({ email: "Thông tin không hợp lệ.", password: "Thông tin không hợp lệ." });
      showMessage("Email hoặc mật khẩu không đúng!", "danger");
    }
  };

  const handleForgotPassword = () => {
    if (!validateForgot()) {
      showMessage("Vui lòng kiểm tra lại thông tin.", "danger");
      return;
    }

    let users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((u) => u.email === forgotEmail.trim())) {
      showMessage(
        "Yêu cầu đặt lại mật khẩu đã được gửi! (Mô phỏng: kiểm tra email của bạn.)",
        "success"
      );
      setTimeout(() => {
        setFormView("login");
        setForgotEmail("");
        setErrors({});
      }, 1500);
    } else {
      setErrors({ email: "Email không tồn tại." });
      showMessage("Email không tồn tại!", "danger");
    }
  };

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});

  const togglePassword = (field: string) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Social login simulation
  const socialLogin = (provider: string) => {
    const email = prompt(`Nhập email để mô phỏng đăng nhập với ${provider}:`);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Vui lòng nhập email hợp lệ!", "danger");
      return;
    }

    let users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    let user = users.find((u) => u.email === email);

    if (!user) {
      user = {
        name: `User_${provider}`,
        email,
        address: "",
        password: hashPassword(`${provider}_default`),
      };
      users.push(user);
      localStorage.setItem("users", JSON.stringify(users));
    }

    showMessage(`Đăng nhập với ${provider} thành công! Đang chuyển hướng...`, "success");
    localStorage.setItem("currentUser", JSON.stringify(user));
    setTimeout(() => {
      window.location.replace("index.html");
    }, 1500);
  };

  return (
    <div className="container mt-4">
      {/* Toast */}
      <div
        className={`toast align-items-center text-white bg-${toast.type} border-0 position-fixed top-0 end-0 m-3 ${
          toast.visible ? "show" : "hide"
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ minWidth: 250, zIndex: 1055 }}
      >
        <div className="d-flex">
          <div className="toast-body">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
          ></button>
        </div>
      </div>

      {/* Form toggles */}
      <div className="mb-3 d-flex justify-content-center gap-3">
        <button
          className={`btn btn-outline-primary ${formView === "login" ? "active" : ""}`}
          onClick={() => {
            setFormView("login");
            setErrors({});
          }}
        >
          Đăng nhập
        </button>
        <button
          className={`btn btn-outline-primary ${formView === "register" ? "active" : ""}`}
          onClick={() => {
            setFormView("register");
            setErrors({});
          }}
        >
          Đăng ký
        </button>
        <button
          className={`btn btn-outline-primary ${formView === "forgot" ? "active" : ""}`}
          onClick={() => {
            setFormView("forgot");
            setErrors({});
          }}
        >
          Quên mật khẩu
        </button>
      </div>

      {/* Forms */}
      {formView === "login" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          noValidate
        >
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="login-email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="login-password" className="form-label">
              Mật khẩu
            </label>
            <input
              type={showPassword.loginPassword ? "text" : "password"}
              id="login-password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => togglePassword("loginPassword")}
            >
              <i className={`fa ${showPassword.loginPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
            <div className="invalid-feedback">{errors.password}</div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>

          <div className="mt-3 d-flex justify-content-center gap-3">
            <button type="button" className="btn btn-danger" onClick={() => socialLogin("Google")}>
              Đăng nhập với Google
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ backgroundColor: "#3b5998", borderColor: "#3b5998" }}
              onClick={() => socialLogin("Facebook")}
            >
              Đăng nhập với Facebook
            </button>
          </div>
        </form>
      )}

      {formView === "register" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          noValidate
        >
          <div className="mb-3">
            <label htmlFor="register-name" className="form-label">
              Họ và tên
            </label>
            <input
              type="text"
              id="register-name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="register-email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="register-email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="register-address" className="form-label">
              Địa chỉ
            </label>
            <input
              type="text"
              id="register-address"
              className={`form-control ${errors.address ? "is-invalid" : ""}`}
              value={registerData.address}
              onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
            />
            <div className="invalid-feedback">{errors.address}</div>
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="register-password" className="form-label">
              Mật khẩu
            </label>
            <input
              type={showPassword.registerPassword ? "text" : "password"}
              id="register-password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => togglePassword("registerPassword")}
            >
              <i className={`fa ${showPassword.registerPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
            <div className="invalid-feedback">{errors.password}</div>
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="register-confirm-password" className="form-label">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword.registerConfirmPassword ? "text" : "password"}
              id="register-confirm-password"
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
              onClick={() => togglePassword("registerConfirmPassword")}
            >
              <i className={`fa ${showPassword.registerConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Đăng ký
          </button>
        </form>
      )}

      {formView === "forgot" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword();
          }}
          noValidate
        >
          <div className="mb-3">
            <label htmlFor="forgot-email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="forgot-email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Gửi yêu cầu
          </button>
        </form>
      )}
    </div>
  );
}
