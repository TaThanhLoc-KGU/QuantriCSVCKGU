import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'members')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side — tránh cần index
      data.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'vi'))
      setMembers(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return { members, loading }
}
