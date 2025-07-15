import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilPage() {
  const sessionToken = cookies().get('studio_session')?.value
  if (!sessionToken) return redirect('/login')

  const session = await prisma.session.findFirst({
    where: { token: sessionToken },
    include: { user: true }
  })
  if (!session || !session.user) return redirect('/login')
  const user = session.user

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-white">
        <h1 className="text-3xl font-bold text-yellow-500 mb-8 text-center">Mon profil</h1>
        <div className="mb-4">
          <span className="font-semibold">Prénom :</span> {user.firstName}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Nom :</span> {user.lastName}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Email :</span> {user.email}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Rôle :</span> {user.role}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Membre depuis :</span> {new Date(user.memberSince).toLocaleDateString('fr-FR')}
        </div>
        
        <div className="mt-8 space-y-3">
          <Link
            href="/blog"
            className="block w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors text-center"
          >
            Voir le blog
          </Link>
          
          <Link
            href="/logout"
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
          >
            Se déconnecter
          </Link>
        </div>
      </div>
    </main>
  )
} 