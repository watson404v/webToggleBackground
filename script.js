const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

// トマト画像を事前に読み込み
const tomatoImage = new Image();
tomatoImage.src = 'tomato.png';

upload.addEventListener('change', handleImageUpload);

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // 顔検出設定
    const faceDetection = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });
    faceDetection.setOptions({ model: 'short', minDetectionConfidence: 0.5 });
    faceDetection.onResults(({ detections }) => {
      detections.forEach(({ locationData }) => {
        const { relativeBoundingBox } = locationData;
        const x = relativeBoundingBox.xMin * img.width;
        const y = relativeBoundingBox.yMin * img.height;
        const width = relativeBoundingBox.width * img.width;
        const height = relativeBoundingBox.height * img.height;

        // トマトを顔サイズに合わせて描画
        ctx.drawImage(tomatoImage, x, y, width, height);
      });

      downloadBtn.style.display = detections.length ? 'inline-block' : 'none';
    });

    // MediaPipeで処理
    const videoFrame = await createVideoFrameFromImage(img);
    await faceDetection.send({ image: videoFrame });
  };
}

// 画像 → VideoFrame変換
function createVideoFrameFromImage(image) {
  const offCanvas = document.createElement('canvas');
  offCanvas.width = image.width;
  offCanvas.height = image.height;
  offCanvas.getContext('2d').drawImage(image, 0, 0);
  return new ImageBitmap(offCanvas);
}

// ダウンロード機能
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'tomato_face.png';
  link.click();
});
