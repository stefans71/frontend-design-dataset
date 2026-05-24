import type { ComponentWithScore, Conversation, ValidationResult } from './types'

const BASE = '/api'

export async function getComponents(params: {
  category?: string
  theme?: string
  minScore?: number
  maxScore?: number
  sort?: string
  page?: number
  limit?: number
}): Promise<{ items: ComponentWithScore[]; total: number }> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)))
  const res = await fetch(`${BASE}/components?${q}`)
  return res.json()
}

export async function getComponent(id: string): Promise<ComponentWithScore & {
  critique?: string
}> {
  const res = await fetch(`${BASE}/components/${id}`)
  return res.json()
}

export async function getConversations(params: {
  type?: string
  page?: number
}): Promise<{ items: Conversation[]; total: number }> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)))
  const res = await fetch(`${BASE}/conversations?${q}`)
  return res.json()
}

export async function getValidationResults(): Promise<ValidationResult[]> {
  const res = await fetch(`${BASE}/validation`)
  return res.json()
}

export async function getStats(): Promise<{
  total_components: number
  total_conversations: number
  avg_score: number
  categories: Record<string, number>
}> {
  const res = await fetch(`${BASE}/stats`)
  return res.json()
}
