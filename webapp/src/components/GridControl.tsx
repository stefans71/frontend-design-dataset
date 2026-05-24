import type { GridCols } from '@/lib/types'

export default function GridControl({ cols, onChange }: { cols: GridCols; onChange: (c: GridCols) => void }) {
  return <div>{cols} cols <button onClick={() => onChange(cols === 4 ? 2 : (cols + 1) as GridCols)}>toggle</button></div>
}
