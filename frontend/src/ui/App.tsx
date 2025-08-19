import React from 'react'
import { AdminLessons } from '../pages/AdminLessons'

export const App: React.FC = () => {
  const [apiMessage, setApiMessage] = React.useState<string>('Loading...')

  React.useEffect(() => {
    fetch('/api/')
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message ?? JSON.stringify(data)))
      .catch(() => setApiMessage('Failed to reach API'))
  }, [])

  return (
    <div>
      <div style={{ padding: 12, background: '#0b1220', color: 'white', display: 'flex', gap: 12 }}>
        <strong>Comprog Platform</strong>
        <span style={{ opacity: 0.8 }}>API: {apiMessage}</span>
      </div>
      <AdminLessons />
    </div>
  )
}


