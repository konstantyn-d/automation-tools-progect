// Course cover photos. One square photo per course in src/assets/covers/<slug>.jpg.
// Photos from Unsplash (unsplash.com), free to use under the Unsplash License.
// A course without a photo falls back to its pixel-art cover.
const files = import.meta.glob('../assets/covers/*.jpg', { eager: true, import: 'default' })

export const COVERS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace('.jpg', ''), url]),
)
