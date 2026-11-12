import sharp from 'sharp'

const src = 'public/icons/icon-source.svg'
const jobs = [
    ['public/icons/icon-192.png', 192],
    ['public/icons/icon-512.png', 512],
    ['public/icons/icon-maskable-512.png', 512],
]

for (const [out, size] of jobs) {
    await sharp(src, { density: 384 }).resize(size, size).png().toFile(out)
    console.log('dibuat:', out)
}