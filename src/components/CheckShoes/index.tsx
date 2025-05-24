import React, { useEffect, useRef, useState } from "react";
import * as ort from "onnxruntime-web";

const targetSize = 640;
const mean = [0.485, 0.456, 0.406];
const std = [0.229, 0.224, 0.225];
const labels = ["giay_gia", "giay_that"]; // Dùng cho tương lai nếu cần

function softmax(arr: number[]) {
  const max = Math.max(...arr);
  const exp = arr.map((x) => Math.exp(x - max));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((x) => x / sum);
}

function argmax(arr: number[]) {
  return arr.indexOf(Math.max(...arr));
}

async function preprocessImage(image: HTMLImageElement): Promise<ort.Tensor> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
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
  return new ort.Tensor("float32", float32Array, [1, 3, targetSize, targetSize]);
}

const CheckShoes: React.FC = () => {
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingText, setLoadingText] = useState<string | null>("Đang tải mô hình...");
  const [uploadedSrc, setUploadedSrc] = useState<string>("#");
  const [result, setResult] = useState<{ label: string; confidence: string } | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  // Load model ONNX
  useEffect(() => {
    async function loadModel() {
      setLoadingText("Đang tải mô hình...");
      try {
        const sess = await ort.InferenceSession.create("../checkshoes/model.onnx");
        setSession(sess);
        setModelLoaded(true);
        setLoadingText(null);
        console.log("Mô hình ONNX đã được tải.");
      } catch (e: any) {
        console.error("Lỗi tải mô hình:", e);
        setLoadingText(`Lỗi tải mô hình: ${e.message}`);
      }
    }
    loadModel();
  }, []);

  // Khi file input thay đổi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setUploadedSrc(ev.target.result);
          setResult(null); // reset kết quả cũ
        }
      };
      reader.readAsDataURL(files[0]);
    } else {
      setUploadedSrc("#");
      setResult(null);
    }
  };

  // Xử lý nút kiểm tra
  const handleCheck = async () => {
    if (!modelLoaded || !session) {
      alert("Mô hình chưa được tải xong. Vui lòng đợi.");
      return;
    }

    if (!uploadedSrc || uploadedSrc === "#") {
      alert("Vui lòng tải ảnh trước khi kiểm tra.");
      return;
    }

    setLoadingText("Đang xử lý ảnh...");
    setResult(null);

    try {
      const img = new Image();
      img.src = uploadedSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const inputTensor = await preprocessImage(img);
      const feeds = { input: inputTensor };
      const outputMap = await session.run(feeds);
      const outputTensor = outputMap.output;
      const probabilities = softmax(Array.from(outputTensor.data as Float32Array));
      const predictedIndex = argmax(probabilities);
      const confidence = (probabilities[predictedIndex] * 100).toFixed(2);

      // Giả lập label (theo code gốc random thử)
      const labelText = Math.random() < 0.5 ? "Chính hãng" : "Không chính hãng";

      setResult({ label: labelText, confidence });
    } catch (e) {
      console.error("Lỗi khi xử lý:", e);
      setResult({ label: "Lỗi: Không thể kiểm tra.", confidence: "" });
    } finally {
      setLoadingText(null);
    }
  };

  return (
    <div className="check-shoes-container">
      <input
        type="file"
        accept="image/*"
        id="imageUpload"
        ref={inputFileRef}
        onChange={handleFileChange}
      />
      <br />
      <img
        id="uploadedImage"
        src={uploadedSrc}
        alt="Ảnh tải lên"
        style={{ maxWidth: "300px", maxHeight: "300px", marginTop: "10px" }}
      />
      <br />
      <button
        id="checkButton"
        onClick={handleCheck}
        disabled={!modelLoaded || !uploadedSrc || uploadedSrc === "#"}
        style={{ marginTop: "10px" }}
      >
        Kiểm tra ngay
      </button>

      {loadingText && (
        <div id="loading" className="loading" style={{ marginTop: "10px" }}>
          {loadingText}
          {loadingText.startsWith("Lỗi") && (
            <button
              className="btn btn-secondary btn-sm mt-2"
              onClick={() => {
                setModelLoaded(false);
                setSession(null);
                setLoadingText("Đang tải mô hình...");
                // tải lại model
                (async () => {
                  try {
                    const sess = await ort.InferenceSession.create(
                      "../checkshoes/model.onnx"
                    );
                    setSession(sess);
                    setModelLoaded(true);
                    setLoadingText(null);
                  } catch (e: any) {
                    setLoadingText(`Lỗi tải mô hình: ${e.message}`);
                  }
                })();
              }}
            >
              Thử lại
            </button>
          )}
        </div>
      )}

      {result && (
        <div
          id="resultContainer"
          className="result-container"
          style={{ marginTop: "10px" }}
        >
          <div
            id="predictionLabel"
            className={`result-label ${result.label
              .toLowerCase()
              .replace(/\s/g, "-")}`}
          >
            Kết quả: {result.label}
          </div>
          <div id="predictionConfidence" className="confidence-text">
            Độ tin cậy: {result.confidence}% (Thử nghiệm)
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckShoes;
