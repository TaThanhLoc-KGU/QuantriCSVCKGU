import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserProfile, setUserProfile, addMember } from '@/lib/firestore'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return }
    setLoading(true)
    getUserProfile(user.uid)
      .then(p => { setProfile(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.uid])

  const saveProfile = async ({ name, role }) => {
    const color = Math.floor(Math.random() * 8)
    const ref = await addMember({ name, role, color, uid: user.uid })
    const memberId = ref.id
    const data = { name, role, memberId, color, uid: user.uid }
    await setUserProfile(user.uid, data)
    setProfile({ id: user.uid, ...data })
    return data
  }

  return { profile, loading, saveProfile }
}
