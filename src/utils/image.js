/**
 * Reads and optimizes an image file selected from the computer into a lightweight Data URL.
 * Resizes and compresses down to ~30-50KB so it fits within Firestore document boundaries
 * and loads immediately across all devices without needing separate bucket storage.
 */
export function processImageFile(file, maxWidth = 640, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file (PNG, JPG, WebP)'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Keep 16:9 or native aspect ratio scaled to maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to decode image file'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read image from computer'));
    reader.readAsDataURL(file);
  });
}
