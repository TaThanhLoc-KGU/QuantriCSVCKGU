import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, getDocs, query, where,
  getDoc, setDoc
} from 'firebase/firestore'
import { db } from './firebase'

// ── User profiles ───────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
export async function setUserProfile(uid, data) {
  return setDoc(doc(db, 'users', uid), data, { merge: true })
}

// ── Members ───────────────────────────────────────────────
export async function addMember(data) {
  return addDoc(collection(db, 'members'), data)
}
export async function updateMember(memberId, data) {
  return updateDoc(doc(db, 'members', memberId), data)
}
export async function deleteMember(memberId) {
  return deleteDoc(doc(db, 'members', memberId))
}

// ── Tasks ─────────────────────────────────────────────────
// scope: 'dept' = nhiệm vụ chung phòng | 'member' = cá nhân
export async function addTask(data) {
  return addDoc(collection(db, 'tasks'), {
    scope:  'member',
    ...data,
    status:    data.status || 'none',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
export async function updateTask(taskId, data) {
  return updateDoc(doc(db, 'tasks', taskId), { ...data, updatedAt: serverTimestamp() })
}
export async function updateTaskStatus(taskId, status) {
  return updateDoc(doc(db, 'tasks', taskId), { status, updatedAt: serverTimestamp() })
}
export async function deleteTask(taskId) {
  return deleteDoc(doc(db, 'tasks', taskId))
}

// ── Steps ─────────────────────────────────────────────────
export async function addStep(taskId, stepData) {
  return addDoc(collection(db, 'steps'), {
    taskId,
    ...stepData,
    status:    stepData.status || 'none',
    createdAt: serverTimestamp(),
  })
}
export async function updateStepStatus(stepId, status) {
  return updateDoc(doc(db, 'steps', stepId), { status })
}
export async function updateStep(stepId, data) {
  return updateDoc(doc(db, 'steps', stepId), data)
}
export async function deleteStep(stepId) {
  return deleteDoc(doc(db, 'steps', stepId))
}

// ── Reports ───────────────────────────────────────────────
export async function saveReport(data) {
  // data: { periodId, content, metadata: { tasksCount, ... } }
  // periodId is something like '2026-Q1' or '2026-M3'
  const q = query(collection(db, 'reports'), where('periodId', '==', data.periodId))
  const snap = await getDocs(q)
  
  if (snap.empty) {
    return addDoc(collection(db, 'reports'), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } else {
    return updateDoc(doc(db, 'reports', snap.docs[0].id), {
      content: data.content,
      metadata: data.metadata,
      updatedAt: serverTimestamp()
    })
  }
}

export async function getSavedReport(periodId) {
  const q = query(collection(db, 'reports'), where('periodId', '==', periodId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

// ── Report helpers (one-time reads) ───────────────────────
export async function fetchAllTasksOnce(year = 2026) {
  const snap = await getDocs(query(collection(db, 'tasks'), where('year', '==', year)))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
export async function fetchStepsForTasks(taskIds = []) {
  if (!taskIds.length) return []
  // Batch in chunks of 30 (Firestore 'in' limit)
  const chunks = []
  for (let i = 0; i < taskIds.length; i += 30) chunks.push(taskIds.slice(i, i + 30))
  const results = await Promise.all(
    chunks.map(chunk =>
      getDocs(query(collection(db, 'steps'), where('taskId', 'in', chunk)))
    )
  )
  return results.flatMap(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
}
