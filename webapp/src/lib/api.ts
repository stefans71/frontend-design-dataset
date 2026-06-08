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
  hasPng?: number
  hasHtmlCompare?: number
}): Promise<{ items: ComponentWithScore[]; total: number }> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)))
  const res = await fetch(`${BASE}/components?${q}`)
  return res.json()
}

export async function getComponent(id: string): Promise<ComponentWithScore & {
  critique?: string
  improved_html?: string
  component_html?: string
}> {
  const res = await fetch(`${BASE}/components/${id}`)
  return res.json()
}

export async function getComponentNeighbors(id: string, opts?: { hasHtmlCompare?: boolean }): Promise<{ prev: string | null; next: string | null }> {
  const q = new URLSearchParams()
  if (opts?.hasHtmlCompare) q.set('hasHtmlCompare', '1')
  const qs = q.toString()
  const res = await fetch(`${BASE}/components/${id}/neighbors${qs ? `?${qs}` : ''}`)
  return res.json()
}

export async function getConversations(params: {
  type?: string
  domain?: string
  sort?: string
  page?: number
}): Promise<{ items: Conversation[]; total: number; domainCounts?: Record<string, number> }> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)))
  const res = await fetch(`${BASE}/conversations?${q}`)
  return res.json()
}

export async function getValidationResults(): Promise<ValidationResult[]> {
  const res = await fetch(`${BASE}/validation`)
  return res.json()
}

export async function getHarnessStats(): Promise<{
  total: number
  harness_avg: number
  raw_avg: number
  gpt_avg: number
  wins: number
  ties: number
  losses: number
}> {
  const res = await fetch(`${BASE}/harness-stats`)
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
