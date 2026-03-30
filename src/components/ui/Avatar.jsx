const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-rose-500',  'bg-amber-500',  'bg-cyan-500',
  'bg-pink-500',  'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
]

export function Avatar({ name = '', color = 0, size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  const sizeClass = size === 'sm'
    ? 'w-7 h-7 text-xs'
    : size === 'lg'
      ? 'w-10 h-10 text-base'
      : 'w-8 h-8 text-sm'

  return (
    <div
      className={`${sizeClass} ${COLORS[color % COLORS.length]} rounded-full flex items-center justify-center font-semibold text-white shrink-0`}
    >
      {initials || '?'}
    </div>
  )
}
