/**
 * Compresses an image File to a base64 data-URL.
 * Preserves alpha transparency for PNG, WebP, GIF, and SVG formats.
 * For transparent formats, uses image/webp (which retains full alpha transparency)
 * or falls back to image/png so background NEVER turns black.
 * For standard non-transparent formats (like JPEG), uses image/jpeg compression.
 *
 * @param {File} file
 * @param {{ maxDim?: number, quality?: number }} [options]
 * @returns {Promise<string>} compressed data-URL
 */
export function compressImageFile(file, { maxDim = 1200, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d', { alpha: true })
        // Clear canvas with transparent pixels (alpha = 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const isTransparentFormat =
          file.type === 'image/png' ||
          file.type === 'image/webp' ||
          file.type === 'image/gif' ||
          file.type === 'image/svg+xml'

        if (isTransparentFormat) {
          // WebP supports 8-bit alpha transparency with high compression.
          // If unsupported, fallback cleanly to PNG.
          try {
            const webpUrl = canvas.toDataURL('image/webp', quality)
            if (webpUrl && webpUrl.startsWith('data:image/webp')) {
              resolve(webpUrl)
              return
            }
          } catch {}
          resolve(canvas.toDataURL('image/png'))
          return
        }

        // Standard non-transparent photos
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
