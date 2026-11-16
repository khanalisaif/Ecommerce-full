export function compressImage(file, maxWidth = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d', { alpha: true })
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const isTransparent =
          file.type === 'image/png' ||
          file.type === 'image/webp' ||
          file.type === 'image/gif' ||
          file.type === 'image/svg+xml'

        if (isTransparent) {
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

        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = reject
      img.src = event.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
