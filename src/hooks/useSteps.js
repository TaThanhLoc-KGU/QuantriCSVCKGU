import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function useSteps(taskId = null) {
  const [steps, setSteps]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!taskId) {
      setSteps([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'steps'),
      where('taskId', '==', taskId),
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setSteps(data)
      setLoading(false)
    })

    return () => unsub()
  }, [taskId])

  return { steps, loading }
}

export function useAllSteps(taskIds = []) {
  const [stepsByTask, setStepsByTask] = useState({})

  useEffect(() => {
    if (!taskIds.length) {
      setStepsByTask({})
      return
    }

    const unsubs = taskIds.map((tid) => {
      const q = query(
        collection(db, 'steps'),
        where('taskId', '==', tid),
      )
      return onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setStepsByTask(prev => ({ ...prev, [tid]: data }))
      })
    })

    return () => unsubs.forEach(u => u())
  }, [taskIds.join(',')])

  return stepsByTask
}
