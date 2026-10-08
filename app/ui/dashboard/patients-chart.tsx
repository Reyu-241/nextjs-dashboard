'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { PatientsPerMonthRow } from '@/app/lib/data'

export default function PatientsChart({ rows }: { rows: PatientsPerMonthRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">No patient data available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
        <XAxis dataKey="label" label={{ value: 'Month', position: 'insideBottom', offset: -12 }} />
        <YAxis
          domain={[0, 'auto']}
          allowDecimals={false}
          label={{ value: 'New patients (count)', angle: -90, position: 'insideLeft' }}
        />
        <Bar dataKey="new_patients" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
