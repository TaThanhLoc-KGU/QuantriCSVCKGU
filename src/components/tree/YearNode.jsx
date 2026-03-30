import { QuarterNode } from './QuarterNode'

// members prop → unified mode (PlanView)
// memberId prop → member-specific mode (MemberView)
export function YearNode({ year = 2026, tasks = [], members, memberId }) {
  const quarters   = [1, 2, 3, 4]
  const doneCount  = tasks.filter(t => t.status === 'done').length
  const totalCount = tasks.length

  return (
    <div className="year-node">
      <div className="year-header">
        <span className="text-base font-bold text-gray-50">Năm {year}</span>
        <span className="ml-3 text-xs text-gray-500">
          {totalCount > 0
            ? `${doneCount}/${totalCount} hoàn thành`
            : 'Chưa có nhiệm vụ'}
        </span>
      </div>

      <div>
        {quarters.map(q => (
          <QuarterNode
            key={q}
            quarter={q}
            tasks={tasks.filter(t => t.quarter === q)}
            members={members}
            memberId={memberId}
          />
        ))}
      </div>
    </div>
  )
}
