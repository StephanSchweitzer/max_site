'use client'

import { useState, useEffect } from 'react'

interface Image {
  id: number
  url: string
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState('')
  const [showImages, setShowImages] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)

  // Calculate next Friday at noon
  const getNextFridayNoon = () => {
    const now = new Date()
    const nextFriday = new Date()

    // Find next Friday
    const daysUntilFriday = (5 - now.getDay() + 7) % 7
    if (daysUntilFriday === 0 && now.getDay() === 5 && now.getHours() >= 12) {
      // If it's Friday after noon, get next Friday
      nextFriday.setDate(now.getDate() + 7)
    } else if (daysUntilFriday === 0) {
      // If it's Friday before noon, use today
      nextFriday.setDate(now.getDate())
    } else {
      nextFriday.setDate(now.getDate() + daysUntilFriday)
    }

    nextFriday.setHours(12, 0, 0, 0) // Set to noon
    return nextFriday
  }

  const targetDate = getNextFridayNoon()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft('Time\'s up!')
        loadImages()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const loadImages = async () => {
    try {
      const response = await fetch('/api/images')
      if (response.ok) {
        const imageData = await response.json()
        setImages(imageData)
        setShowImages(true)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setPasswordError('')

    try {
      const response = await fetch('/api/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const result = await response.json()

      if (result.valid) {
        loadImages()
        setPassword('')
      } else {
        setPasswordError('Incorrect password')
      }
    } catch (error) {
      setPasswordError('Error checking password')
      console.log(error)
    }

    setLoading(false)
  }

  return (
      <main className="container">
        <div className="content">
          <h1 className="message">Will we see the webscroller ? Or will we see more?</h1>

          <div className="timer">
            <h2>{timeLeft}</h2>
          </div>

          {!showImages && (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="password-input"
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className="password-btn">
                  {loading ? 'Checking...' : 'Submit'}
                </button>
                {passwordError && <p className="error">{passwordError}</p>}
              </form>
          )}

          {showImages && (
              <div className="images-container">
                <h2>Surprise! 🎉</h2>
                <div className="images-grid">
                  {images.map((image) => (
                      <img
                          key={image.id}
                          src={image.url}
                          alt={`Image ${image.id}`}
                          className="image"
                      />
                  ))}
                </div>
              </div>
          )}
        </div>
      </main>
  )
}