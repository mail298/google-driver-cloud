import { prisma } from '../config/prisma.js'
import { hashPassword } from '../utils/password.js'

async function main() {
  const email = process.argv[2]?.trim()
  const newPassword = process.argv[3]?.trim()

  if (!email || !newPassword) {
    console.log('\n🔐 Drive9 Password Reset Tool')
    console.log('Usage: npm run reset-password -- <email> <newPassword>\n')
    console.log('Example: npm run reset-password -- user@example.com MyNewPassword123\n')
    process.exit(1)
  }

  if (newPassword.length < 8) {
    console.error('❌ Error: Password baru minimal 8 karakter.')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`❌ Error: Pengguna dengan email "${email}" tidak ditemukan.`)
    process.exit(1)
  }

  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  console.log(`\n✅ Berhasil! Password untuk pengguna "${user.email}" (${user.name}) telah diperbarui.`)
}

main()
  .catch((e) => {
    console.error('❌ Gagal mereset password:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
