import { Router } from 'express'
import { prisma } from '../../config/prisma.js'
import { requireApiKey, type ApiKeyRequest } from '../../middleware/api-key.middleware.js'
import { handleUpload } from '../uploads/upload.routes.js'

export const publicApiRouter = Router()

// Upload file endpoint
publicApiRouter.post('/v1/uploads', requireApiKey('files:upload'), handleUpload)

// List folders endpoint
publicApiRouter.get('/v1/folders', requireApiKey('files:upload'), async (req: ApiKeyRequest, res, next) => {
  try {
    const parentId = req.query.parentId ? String(req.query.parentId) : undefined
    const q = req.query.q ? String(req.query.q).trim() : undefined

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user!.id,
        deletedAt: null,
        ...(parentId !== undefined ? { parentId: parentId === 'null' || parentId === 'root' ? null : parentId } : {}),
        ...(q ? { name: { contains: q } } : {})
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        color: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    })

    return res.json({ status: 'ok', count: folders.length, folders })
  } catch (error) {
    return next(error)
  }
})

async function resolveFolderPath(userId: string, pathStr: string): Promise<string | null> {
  const parts = pathStr.split('/').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null

  let currentParentId: string | null = null
  for (const part of parts) {
    const folderMatch: { id: string } | null = await prisma.folder.findFirst({
      where: { userId, name: part, parentId: currentParentId, deletedAt: null },
      select: { id: true }
    })
    if (!folderMatch) return null
    currentParentId = folderMatch.id
  }
  return currentParentId
}

// List files endpoint
publicApiRouter.get('/v1/files', requireApiKey('files:upload'), async (req: ApiKeyRequest, res, next) => {
  try {
    let folderId = req.query.folderId ? String(req.query.folderId) : undefined
    const folderPath = req.query.folderPath ? String(req.query.folderPath) : undefined
    const q = req.query.q ? String(req.query.q).trim() : undefined

    if (!folderId && folderPath) {
      const resolvedId = await resolveFolderPath(req.user!.id, folderPath)
      if (!resolvedId) {
        return res.json({ status: 'ok', count: 0, files: [] })
      }
      folderId = resolvedId
    }

    const files = await prisma.file.findMany({
      where: {
        userId: req.user!.id,
        status: 'active',
        ...(folderId ? { folderId } : {}),
        ...(q ? { name: { contains: q } } : {})
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        provider: true,
        providerFileId: true,
        folderId: true,
        folder: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedFiles = files.map((file) => {
      const isGoogle = file.provider === 'google_drive' && file.providerFileId
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes.toString(),
        folderId: file.folderId,
        folderName: file.folder?.name ?? null,
        provider: file.provider,
        viewUrl: isGoogle ? `https://drive.google.com/file/d/${file.providerFileId}/view` : null,
        downloadUrl: isGoogle ? `https://drive.google.com/uc?id=${file.providerFileId}&export=download` : null,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      }
    })

    return res.json({ status: 'ok', count: formattedFiles.length, files: formattedFiles })
  } catch (error) {
    return next(error)
  }
})
