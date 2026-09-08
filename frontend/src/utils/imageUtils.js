/**
 * Compresses an image File to a JPEG base64 data-URL.
 * Images are scaled down so neither dimension exceeds maxDim (default 900px),
 * then re-encoded at the given quality (default 0.82).
 *
 * This keeps MongoDB sitecontents documents small enough to stay well under
 * the 16 MB BSON document size limit even when many images are stored.
 *
 * @param {File} file
 * @param {{ maxDim?: number, quality?: number }} [options]
 * @returns {Promise<string>} compressed JPEG data-URL
 */
export function compressImageFile(file, { maxDim = 900, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
