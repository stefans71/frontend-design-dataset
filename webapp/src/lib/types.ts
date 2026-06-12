export interface Component {
  id: string
  prompt: string
  temperature: number
  run: string
  suffix: string
  model: string
  created_at: string
  has_html: boolean
  has_improved: boolean
  has_desktop_png: boolean
  has_mobile_png: boolean
  has_critique: boolean
}

export interface EvalScore {
  component_id: string
  visual_score: number
  alignment_score: number
  interactivity_score: number
  total: number
  stage_a_pass: boolean
}

export interface ComponentWithScore extends Component {
  score?: EvalScore
  total?: number
  visual_score?: number
  alignment_score?: number
  interactivity_score?: number
  v1_raw_total?: number
  v1_raw_visual?: number
  v1_raw_alignment?: number
  v1_raw_interactivity?: number
  harness_total?: number
  harness_visual?: number
  harness_alignment?: number
  harness_interactivity?: number
  has_html_compare?: boolean
  category: string
  theme: 'dark' | 'light'
}

export interface Conversation {
  id: string
  type: 'qualifying_conversation' | 'immediate_conversation'
  domain: string
  persona: string
  turn_count: number
  messages: Message[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ValidationResult {
  id: string
  component: string
  component_id: string
  prompt: string
  category: string
  theme: string
  base_score: number
  fine_tuned_score: number
  baseline_score: number
  delta: number
  fine_tuned_critique?: string
  base_critique?: string
}

export interface Qwen27bComponent {
  id: string
  prompt: string
  temperature: number
  run: string
  category: string
  theme: 'dark' | 'light'
  q5_html?: string
  q8_va_html?: string
  q8_vb_html?: string
  q8_vc_html?: string
  q5_score?: number
  q8_va_score?: number
  q8_vb_score?: number
  q8_vc_score?: number
  q8_va_critique?: string
  q8_vb_critique?: string
  q8_vc_critique?: string
}

export type GridCols = 2 | 3 | 4
export type Theme = 'light' | 'dark'
export type SortBy = 'score_desc' | 'score_asc' | 'category' | 'temperature' | 'id_asc' | 'id_desc'
export type FilterCategory = 'all' | 'form' | 'card' | 'navbar' | 'mobile' | 'marketing' | 'data_display'
export type FilterTheme = 'all' | 'dark' | 'light'
