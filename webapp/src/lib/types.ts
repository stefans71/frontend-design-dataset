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
  score: EvalScore
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
  component: string
  category: string
  base_score: number
  finetuned_score: number
  delta: number
}

export type GridCols = 2 | 3 | 4
export type Theme = 'light' | 'dark'
export type SortBy = 'score_desc' | 'score_asc' | 'category' | 'temperature'
export type FilterCategory = 'all' | 'form' | 'card' | 'navbar' | 'mobile' | 'marketing' | 'data_display'
export type FilterTheme = 'all' | 'dark' | 'light'
