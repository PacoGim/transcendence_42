import { FastifyReply, FastifyRequest } from 'fastify'
import { pipeline } from 'stream/promises'
import fs from "fs"
import path from "path"

export async function updateAvatar(req: FastifyRequest, reply: FastifyReply) {
  const data = await req.file()
  if (!data) return reply.code(400).send({ error: 'No file uploaded' })

  console.log('Mimetype upload:', data.mimetype) // utile pour debug

  const uploadDir = path.join(process.cwd(), 'dist/public/images/avatars')
  await fs.promises.mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, data.filename)

  await pipeline(
    data.file,
    fs.createWriteStream(filePath, { flags: 'w' })
  )

  return { ok: true, filename: data.filename, mimetype: data.mimetype }
}
