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
  category: string
  theme: string
  base_score: number
  fine_tuned_score: number
  baseline_score: number
  delta: number
}

export type GridCols = 2 | 3 | 4
export type Theme = 'light' | 'dark'
export type SortBy = 'score_desc' | 'score_asc' | 'category' | 'temperature'
export type FilterCategory = 'all' | 'form' | 'card' | 'navbar' | 'mobile' | 'marketing' | 'data_display'
export type FilterTheme = 'all' | 'dark' | 'light'
