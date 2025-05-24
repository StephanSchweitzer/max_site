'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Image {
  id: number
  url: string
  data: string // base64 data URL
  filename: string
  contentType: string
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState('')
  const [showImages, setShowImages] = useState(false)
  const [images, setImages] = useState<Image[]>([])
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false) // New loading state for images
  const [selectedImage, setSelectedImage] = useState<Image | null>(null) // For fullsize modal

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
        loadImages() // No password needed after countdown
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate]) // Added targetDate to dependencies

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  // Updated loadImages to use batch endpoint
  const loadImages = async (passwordToUse?: string) => {
    setLoadingImages(true) // Start loading
    try {
      let response

      if (passwordToUse) {
        // Use POST method to send password in body
        response = await fetch('/api/batch-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: passwordToUse }),
        })
      } else {
        // No password (countdown expired)
        response = await fetch('/api/batch-images')
      }

      if (response.ok) {
        const result = await response.json()
        setImages(result.images) // Images now include base64 data
        setShowImages(true)
      } else {
        console.error('Failed to load images:', response.status)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoadingImages(false) // End loading
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
        // Pass the valid password to loadImages
        await loadImages(password)
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
          <h1 className="message">Max funny pics countdown, or videogame he made 10 years ago?</h1>

          <div className="timer">
            <h2>{timeLeft}</h2>
          </div>

          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
            }

            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 1rem;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .loading-container p {
              margin: 0;
              font-size: 1.1rem;
              color: #666;
            }

            .image-container {
              position: relative;
              border-radius: 8px;
              overflow: hidden;
              transition: transform 0.2s ease;
            }

            .image-container:hover {
              transform: scale(1.05);
            }

            .image {
              border-radius: 8px;
              transition: all 0.2s ease;
            }

            .modal-backdrop {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              cursor: pointer;
            }

            .modal-content {
              position: relative;
              background: white;
              border-radius: 12px;
              padding: 20px;
              max-width: 95vw;
              max-height: 95vh;
              cursor: default;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .modal-close {
              position: absolute;
              top: 10px;
              right: 15px;
              background: none;
              border: none;
              font-size: 30px;
              cursor: pointer;
              color: #666;
              z-index: 1001;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: all 0.2s ease;
            }

            .modal-close:hover {
              background-color: #f0f0f0;
              color: #333;
            }

            .modal-image {
              border-radius: 8px;
            }
          `}</style>

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

          {loadingImages && (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading images...</p>
              </div>
          )}

          {showImages && !loadingImages && (
              <div className="images-container">
                <h2>Surprise! 🎉</h2>
                <div className="images-grid">
                  {images.map((image) => (
                      <div key={image.id} className="image-container">
                        <Image
                            src={image.data} // Use base64 data URL directly
                            alt={`Image ${image.id}`}
                            className="image"
                            width={300}
                            height={200}
                            style={{ objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setSelectedImage(image)}
                        />
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Fullsize Image Modal */}
          {selectedImage && (
              <div className="modal-backdrop" onClick={() => setSelectedImage(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button
                      className="modal-close"
                      onClick={() => setSelectedImage(null)}
                      aria-label="Close modal"
                  >
                    ×
                  </button>
                  <Image
                      src={selectedImage.data}
                      alt={`Fullsize image ${selectedImage.id}`}
                      width={800}
                      height={600}
                      style={{ objectFit: 'contain', maxWidth: '90vw', maxHeight: '90vh' }}
                      className="modal-image"
                  />
                </div>
              </div>
          )}
        </div>
      </main>
  )
}