import cors from 'cors'
import { Router } from 'express'
import { prisma } from '../../config/prisma.js'
import { hashToken } from '../../utils/crypto.js'
import { streamProviderFile } from '../files/stream-file.js'

export const publicRouter = Router()
publicRouter.use(cors({ origin: '*' }))

const shareCache = new Map<string, { file: any; expires: number }>()
const CACHE_TTL_MS = 60_000 // 60 seconds cache for public share tokens

async function findSharedFile(token: string) {
  const cached = shareCache.get(token)
  if (cached && cached.expires > Date.now()) {
    return cached.file
  }

  const share = await prisma.fileShare.findFirst({
    where: { enabled: true, AND: [{ OR: [{ token }, { tokenHash: hashToken(token) }] }, { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }] },
    include: { file: { include: { connectedAccount: true } } },
  })
  if (!share || share.file.status !== 'active') throw new Error('Shared file not found')

  shareCache.set(token, { file: share.file, expires: Date.now() + CACHE_TTL_MS })
  return share.file
}

publicRouter.get('/files/:token', async (req, res, next) => {
  try {
    const file = await findSharedFile(String(req.params.token))
    const accept = (req.headers.accept ?? '').toLowerCase()
    if (accept.includes('image/') || accept.includes('video/') || accept.includes('audio/')) {
      return streamProviderFile(file, req.headers.range, res, { disposition: 'inline' })
    }
    return res.json({ file: { id: file.id, name: file.name, mimeType: file.mimeType, sizeBytes: file.sizeBytes.toString(), createdAt: file.createdAt } })
  } catch (error) {
    return next(error)
  }
})

publicRouter.get('/files/:token/download', async (req, res, next) => {
  try {
    const file = await findSharedFile(String(req.params.token))
    return streamProviderFile(file, req.headers.range, res, { disposition: 'attachment' })
  } catch (error) {
    return next(error)
  }
})

publicRouter.get('/files/:token/preview', async (req, res, next) => {
  try {
    const file = await findSharedFile(String(req.params.token))
    return streamProviderFile(file, req.headers.range, res, { disposition: 'inline' })
  } catch (error) {
    return next(error)
  }
})
