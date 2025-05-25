const API_BASE_URL = "https://vn-authentic-be.onrender.com";

// Hàm sanitize input để chống XSS
function sanitizeInput(input) {
  return input.replace(/[<>&"']/g, function (m) {
    return { "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[m];
  });
}

// Hiển thị thông báo bằng Toast
function showMessage(message, type = "primary") {
  const toastEl = document.getElementById("toast");
  const toastBody = toastEl.querySelector(".toast-body");
  const toast = new bootstrap.Toast(toastEl);

  toastBody.textContent = message;
  toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.show();

  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.hide();
  }, 3000);
}

// Toggle between forms
function showRegister() {
  document.getElementById("login-form").classList.add("d-none");
  document.getElementById("forgot-password-form").classList.add("d-none");
  document.getElementById("register-form").classList.remove("d-none");
}

function showLogin() {
  document.getElementById("register-form").classList.add("d-none");
  document.getElementById("forgot-password-form").classList.add("d-none");
  document.getElementById("login-form").classList.remove("d-none");
}

function showForgotPassword() {
  document.getElementById("login-form").classList.add("d-none");
  document.getElementById("register-form").classList.add("d-none");
  document.getElementById("forgot-password-form").classList.remove("d-none");
}

// Register function (gọi API)
async function register() {
  const name = sanitizeInput(
    document.getElementById("register-name").value.trim()
  );
  const email = document.getElementById("register-email").value.trim();
  const address = sanitizeInput(
    document.getElementById("register-address").value.trim()
  );
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Reset lỗi
  document.querySelectorAll(".form-control").forEach((input) => {
    input.classList.remove("is-invalid");
  });
  document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
    feedback.textContent = "";
  });

  let valid = true;
  let errors = [];

  // Validation
  if (!name) {
    document.getElementById("register-name").classList.add("is-invalid");
    document.getElementById("register-name").nextElementSibling.textContent =
      "Vui lòng nhập họ và tên.";
    errors.push("Họ và tên không được để trống.");
    valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("register-email").classList.add("is-invalid");
    document.getElementById("register-email").nextElementSibling.textContent =
      "Vui lòng nhập email hợp lệ.";
    errors.push("Email không hợp lệ.");
    valid = false;
  }

  if (!address) {
    document.getElementById("register-address").classList.add("is-invalid");
    document.getElementById("register-address").nextElementSibling.textContent =
      "Vui lòng nhập địa chỉ.";
    errors.push("Địa chỉ không được để trống.");
    valid = false;
  }

  if (
    !password ||
    !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)
  ) {
    document.getElementById("register-password").classList.add("is-invalid");
    document.getElementById(
      "register-password"
    ).nextElementSibling.textContent =
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt (@$!%*?&).";
    errors.push("Mật khẩu không hợp lệ.");
    valid = false;
  }

  if (password !== confirmPassword) {
    document.getElementById("confirm-password").classList.add("is-invalid");
    document.getElementById("confirm-password").nextElementSibling.textContent =
      "Mật khẩu xác nhận không khớp.";
    errors.push("Mật khẩu xác nhận không khớp.");
    valid = false;
  }

  if (!valid) {
    showMessage(
      "Vui lòng kiểm tra lại thông tin: " + errors.join(" "),
      "danger"
    );
    return;
  }

  try {
    const res = await fetch(API_BASE_URL + '/api/authentication/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, address, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || 'Đăng ký thành công! Đang chuyển hướng...', 'success');
      setTimeout(() => {
        showLogin();
      }, 1500);
    } else {
      showMessage(data.message || 'Đăng ký thất bại!', 'danger');
      if (data.message && data.message.includes('đăng ký')) {
        document.getElementById("register-email").classList.add("is-invalid");
        document.getElementById("register-email").nextElementSibling.textContent = data.message;
      }
    }
  } catch (error) {
    showMessage('Lỗi kết nối tới server', 'danger');
  }
}

// Login function (gọi API)
async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  // Reset lỗi
  document.querySelectorAll(".form-control").forEach((input) => {
    input.classList.remove("is-invalid");
  });
  document.querySelectorAll(".invalid-feedback").forEach((feedback) => {
    feedback.textContent = "";
  });

  let valid = true;
  let errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("login-email").classList.add("is-invalid");
    document.getElementById("login-email").nextElementSibling.textContent =
      "Vui lòng nhập email hợp lệ.";
    errors.push("Email không hợp lệ.");
    valid = false;
  }

  if (!password) {
    document.getElementById("login-password").classList.add("is-invalid");
    document.getElementById("login-password").nextElementSibling.textContent =
      "Vui lòng nhập mật khẩu.";
    errors.push("Mật khẩu không được để trống.");
    valid = false;
  }

  if (!valid) {
    showMessage(
      "Vui lòng kiểm tra lại thông tin: " + errors.join(" "),
      "danger"
    );
    return;
  }

  try {
    const res = await fetch(API_BASE_URL + '/api/authentication/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || 'Đăng nhập thành công! Đang chuyển hướng...', 'success');

      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }

      setTimeout(() => {
        window.location.replace("index.html");
      }, 1500);
    } else {
      document.getElementById("login-email").classList.add("is-invalid");
      document.getElementById("login-password").classList.add("is-invalid");
      document.getElementById("login-email").nextElementSibling.textContent =
        data.message || "Thông tin không hợp lệ.";
      document.getElementById("login-password").nextElementSibling.textContent =
        data.message || "Thông tin không hợp lệ.";
      showMessage(data.message || "Email hoặc mật khẩu không đúng!", "danger");
    }
  } catch (error) {
    showMessage('Lỗi kết nối tới server', 'danger');
  }
}

// Social login simulation (giữ nguyên hoặc chỉnh sửa gọi API nếu muốn)
function socialLogin(provider) {
  const email = prompt(`Nhập email để mô phỏng đăng nhập với ${provider}:`);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Vui lòng nhập email hợp lệ!", "danger");
    return;
  }

  // Chỗ này giữ nguyên hoặc có thể gọi API tùy server bạn hỗ trợ
  showMessage(
    `Đăng nhập với ${provider} thành công! Đang chuyển hướng...`,
    "success"
  );
  localStorage.setItem(
    "currentUser",
    JSON.stringify({ name: `User_${provider}`, email, address: "" })
  );
  setTimeout(() => {
    window.location.replace("index.html");
  }, 1500);
}

// Reset password simulation (gọi API)
async function resetPassword() {
  const email = document.getElementById("forgot-email").value.trim();

  document.getElementById("forgot-email").classList.remove("is-invalid");
  document.getElementById("forgot-email").nextElementSibling.textContent = "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("forgot-email").classList.add("is-invalid");
    document.getElementById("forgot-email").nextElementSibling.textContent =
      "Vui lòng nhập email hợp lệ.";
    showMessage("Vui lòng nhập email hợp lệ!", "danger");
    return;
  }

  try {
    const res = await fetch(API_BASE_URL + '/api/authentication/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      showMessage(data.message || "Yêu cầu đặt lại mật khẩu đã được gửi! (Mô phỏng)", "success");
      setTimeout(() => {
        showLogin();
      }, 1500);
    } else {
      document.getElementById("forgot-email").classList.add("is-invalid");
      document.getElementById("forgot-email").nextElementSibling.textContent =
        data.message || "Email không tồn tại.";
      showMessage(data.message || "Email không tồn tại!", "danger");
    }
  } catch (error) {
    showMessage('Lỗi kết nối tới server', 'danger');
  }
}

// Toggle hiện/ẩn mật khẩu
$(document).ready(function () {
  $(".toggle-password").on("click", function () {
    const $input = $(this).closest(".mb-3").find("input");
    const type = $input.attr("type") === "password" ? "text" : "password";
    $input.attr("type", type);
    $(this).find("i").toggleClass("fa-eye fa-eye-slash");
  });
});
