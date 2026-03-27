const stats = [
  { number: '10,000+', label: 'Meetings analyzed' },
  { number: '98%', label: 'Accuracy rate' },
  { number: '<5 min', label: 'Process time' },
  { number: '9', label: 'Languages supported' },
]

export function StatsSection() {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl font-bold tracking-tight">{stat.number}</div>
            <div className="mt-1 text-sm text-primary-foreground/70">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
