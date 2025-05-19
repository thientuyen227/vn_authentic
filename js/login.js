// Hàm mã hóa mật khẩu
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// Hàm sanitize input để chống XSS
function sanitizeInput(input) {
  return input.replace(/[<>&"']/g, function (m) {
    return { "<": "<", ">": ">", "&": "&", '"': '"', "'": "'" }[m];
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

// Register function
function register() {
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

  // Get users from LocalStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    document.getElementById("register-email").classList.add("is-invalid");
    document.getElementById("register-email").nextElementSibling.textContent =
      "Email này đã được đăng ký.";
    showMessage("Email này đã được đăng ký!", "danger");
    return;
  }

  // Save new user with hashed password
  users.push({ name, email, address, password: hashPassword(password) });
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
  setTimeout(() => {
    showLogin();
  }, 1500);
}

// Login function
function login() {
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

  // Get users from LocalStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check credentials
  const user = users.find(
    (user) => user.email === email && user.password === hashPassword(password)
  );

  if (user) {
    showMessage(
      "Đăng nhập thành công! Đang chuyển hướng về trang chủ...",
      "success"
    );
    // Store logged-in user
    localStorage.setItem("currentUser", JSON.stringify(user));
    // Redirect to home page
    setTimeout(() => {
      window.location.replace("index.html");
    }, 1500);
  } else {
    document.getElementById("login-email").classList.add("is-invalid");
    document.getElementById("login-password").classList.add("is-invalid");
    document.getElementById("login-email").nextElementSibling.textContent =
      "Thông tin không hợp lệ.";
    document.getElementById("login-password").nextElementSibling.textContent =
      "Thông tin không hợp lệ.";
    showMessage("Email hoặc mật khẩu không đúng!", "danger");
  }
}

// Social login simulation
function socialLogin(provider) {
  const email = prompt(`Nhập email để mô phỏng đăng nhập với ${provider}:`);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Vui lòng nhập email hợp lệ!", "danger");
    return;
  }

  // Get users from LocalStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if user exists
  let user = users.find((user) => user.email === email);

  if (!user) {
    // Simulate new user registration
    user = {
      name: `User_${provider}`,
      email,
      address: "",
      password: hashPassword(`${provider}_default`),
    };
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
  }

  showMessage(
    `Đăng nhập với ${provider} thành công! Đang chuyển hướng...`,
    "success"
  );
  localStorage.setItem("currentUser", JSON.stringify(user));
  setTimeout(() => {
    window.location.replace("index.html");
  }, 1500);
}

// Reset password simulation
function resetPassword() {
  const email = document.getElementById("forgot-email").value.trim();

  // Reset lỗi
  document.getElementById("forgot-email").classList.remove("is-invalid");
  document.getElementById("forgot-email").nextElementSibling.textContent = "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("forgot-email").classList.add("is-invalid");
    document.getElementById("forgot-email").nextElementSibling.textContent =
      "Vui lòng nhập email hợp lệ.";
    showMessage("Vui lòng nhập email hợp lệ!", "danger");
    return;
  }

  // Get users from LocalStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email exists
  if (users.some((user) => user.email === email)) {
    showMessage(
      "Yêu cầu đặt lại mật khẩu đã được gửi! (Mô phỏng: kiểm tra email của bạn.)",
      "success"
    );
    setTimeout(() => {
      showLogin();
    }, 1500);
  } else {
    document.getElementById("forgot-email").classList.add("is-invalid");
    document.getElementById("forgot-email").nextElementSibling.textContent =
      "Email không tồn tại.";
    showMessage("Email không tồn tại!", "danger");
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
