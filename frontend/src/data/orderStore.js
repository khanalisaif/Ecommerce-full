// Builds a plausible status history timeline for a seeded order, ending at
// its current status, anchored to the order's display date.
const STAGE_ORDER = ['Pending', 'Processing', 'Shipped', 'Delivered']

function parseOrderDate(dateStr) {
  // dateStr looks like "14 Aug 2026"
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export function buildStatusHistory(status, dateStr) {
  const endDate = parseOrderDate(dateStr)

  if (status === 'Cancelled') {
    // Cancelled orders had at least a Pending stage before being cancelled.
    const pendingDate = new Date(endDate)
    pendingDate.setDate(pendingDate.getDate() - 1)
    return [
      { status: 'Pending', timestamp: pendingDate.toISOString() },
      { status: 'Cancelled', timestamp: endDate.toISOString() },
    ]
  }

  const stageIndex = STAGE_ORDER.indexOf(status)
  const stages = stageIndex >= 0 ? STAGE_ORDER.slice(0, stageIndex + 1) : ['Pending']

  return stages.map((stage, i) => {
    const d = new Date(endDate)
    d.setDate(d.getDate() - (stages.length - 1 - i))
    return { status: stage, timestamp: d.toISOString() }
  })
}
