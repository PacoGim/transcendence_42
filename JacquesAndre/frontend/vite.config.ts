
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [    tailwindcss(),  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert/cert.pem"))
    },
    port: 5173,
    host: true,
    proxy: { '/api': 'https://localhost:3000' },
  }
})


// export default {
//   server: {
//     proxy: { '/api': 'http://localhost:3000' },
//   },
// }
