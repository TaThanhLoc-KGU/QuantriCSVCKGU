import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Single global hook — fetches ALL tasks for 2026
// Components filter client-side (memberId, scope, month, quarter)
export function useTasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('year', '==', 2026))

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => {
        if ((a.quarter ?? 0) !== (b.quarter ?? 0)) return (a.quarter ?? 0) - (b.quarter ?? 0)
        if ((a.month   ?? 0) !== (b.month   ?? 0)) return (a.month   ?? 0) - (b.month   ?? 0)
        return (a.order ?? 999) - (b.order ?? 999)
      })
      setTasks(data)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  return { tasks, loading }
}
