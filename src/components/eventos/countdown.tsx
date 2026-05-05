import { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string
  label?: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculate(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground rounded-lg w-16 h-16 flex items-center justify-center text-2xl font-bold tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</span>
    </div>
  )
}

export default function Countdown({ targetDate, label = 'Faltan' }: CountdownProps) {
  const target = new Date(targetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calculate(target)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const isOver = Object.values(timeLeft).every(v => v === 0)

  if (isOver) {
    return <p className="text-muted-foreground text-sm">El evento ya comenzó</p>
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-3">
        <Unit value={timeLeft.days} label="días" />
        <Unit value={timeLeft.hours} label="horas" />
        <Unit value={timeLeft.minutes} label="min" />
        <Unit value={timeLeft.seconds} label="seg" />
      </div>
    </div>
  )
}
