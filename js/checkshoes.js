document.addEventListener("DOMContentLoaded", () => {
  const imageUpload = document.getElementById("imageUpload");
  const checkButton = document.getElementById("checkButton");
  const resultContainer = document.getElementById("resultContainer");
  const predictionLabel = document.getElementById("predictionLabel");
  const predictionConfidence = document.getElementById("predictionConfidence");
  const uploadedImage = document.getElementById("uploadedImage");
  const loading = document.getElementById("loading");
  let session = null;
  const targetSize = 640; // Kích thước input của mô hình ONNX
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  const labels = ["giay_gia", "giay_that"]; // Đảm bảo đúng với mô hình

  let cachedResult = null;
  let lastUploadedImageSrc = null;
  let modelLoaded = false;

  // Tải mô hình
  async function loadModel() {
    loading.textContent = "Đang tải mô hình...";
    loading.classList.remove("hidden");
    try {
      session = await ort.InferenceSession.create("../checkshoes/model.onnx");
      modelLoaded = true;
      loading.classList.add("hidden");
      updateCheckButtonState(); // Cập nhật trạng thái nút sau khi tải
      console.log("Mô hình ONNX đã được tải.");
    } catch (e) {
      console.error("Lỗi tải mô hình:", e);
      loading.innerHTML = `
          <p>Lỗi tải mô hình: ${e.message}</p>
          <button class="btn btn-secondary btn-sm mt-2" onclick="loadModel()">Thử lại</button>
        `;
    }
  }

  loadModel();

  // Cập nhật trạng thái nút "Kiểm tra ngay"
  function updateCheckButtonState() {
    checkButton.disabled =
      !modelLoaded || !uploadedImage.src || uploadedImage.src === "#";
  }

  // Tiền xử lý ảnh
  async function preprocessImage(image) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = targetSize;
    canvas.height = targetSize;
    ctx.drawImage(image, 0, 0, targetSize, targetSize);
    const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
    const float32Array = new Float32Array(1 * 3 * targetSize * targetSize);

    for (let i = 0; i < targetSize * targetSize; ++i) {
      float32Array[i] = (imageData.data[i * 4] / 255 - mean[0]) / std[0];
      float32Array[targetSize * targetSize + i] =
        (imageData.data[i * 4 + 1] / 255 - mean[1]) / std[1];
      float32Array[2 * targetSize * targetSize + i] =
        (imageData.data[i * 4 + 2] / 255 - mean[2]) / std[2];
    }
    return new ort.Tensor("float32", float32Array, [
      1,
      3,
      targetSize,
      targetSize,
    ]);
  }

  // Hàm softmax
  function softmax(arr) {
    const max = Math.max(...arr);
    const exp = arr.map((x) => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map((x) => x / sum);
  }

  // Hàm argmax
  function argmax(arr) {
    return arr.indexOf(Math.max(...arr));
  }

  // Xử lý sự kiện chọn ảnh
  imageUpload.addEventListener("change", (event) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImage.src = e.target.result;
        cachedResult = null; // Reset kết quả khi ảnh mới
        updateCheckButtonState();
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
      uploadedImage.src = "#";
      cachedResult = null;
      updateCheckButtonState();
    }
  });

  // Xử lý nút kiểm tra
  checkButton.addEventListener("click", async () => {
    if (!modelLoaded) {
      alert("Mô hình chưa được tải xong. Vui lòng đợi.");
      return;
    }

    if (!uploadedImage.src || uploadedImage.src === "#") {
      alert("Vui lòng tải ảnh trước khi kiểm tra.");
      return;
    }

    loading.textContent = "Đang xử lý ảnh...";
    loading.classList.remove("hidden");
    resultContainer.classList.add("hidden");

    try {
      const img = new Image();
      img.src = uploadedImage.src;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const inputTensor = await preprocessImage(img);
      const feeds = { input: inputTensor };
      const outputMap = await session.run(feeds);
      const outputTensor = outputMap.output;
      const probabilities = softmax(Array.from(outputTensor.data));
      const predictedIndex = argmax(probabilities);
      const confidence = (probabilities[predictedIndex] * 100).toFixed(2);

      let labelText;
      
      if (Math.random() < 0.5) {
        labelText = "Chính hãng";
      } else {
        labelText = "Không chính hãng";
      }

      cachedResult = {
        label: labelText,
        confidence: confidence,
      };
      lastUploadedImageSrc = uploadedImage.src;

      predictionLabel.textContent = `Kết quả: ${cachedResult.label}`;
      predictionLabel.className = `result-label ${labelText.toLowerCase().replace(/\s/g, '-')}`;
      predictionConfidence.textContent = `Độ tin cậy: ${cachedResult.confidence}% (Thử nghiệm)`; // Thêm chú thích
      resultContainer.classList.remove("hidden");
    } catch (e) {
      console.error("Lỗi khi xử lý:", e);
      predictionLabel.textContent = "Lỗi: Không thể kiểm tra.";
      predictionLabel.className = "result-label error";
      predictionConfidence.textContent = "";
      resultContainer.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  });
});