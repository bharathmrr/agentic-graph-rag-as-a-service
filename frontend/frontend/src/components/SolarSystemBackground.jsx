import React, { useEffect, useRef } from 'react'
import './SolarSystemBackground.css'

const SolarSystemBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let stars = []
    let particles = []

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.radius = Math.random() * 1.5 + 0.5
        this.speed = Math.random() * 0.3 + 0.1
        this.opacity = Math.random() * 0.7 + 0.5  // Brighter stars
        this.twinkleSpeed = Math.random() * 0.03 + 0.02  // Faster twinkling
      }

      update() {
        // Twinkle effect
        this.opacity += this.twinkleSpeed
        if (this.opacity > 1 || this.opacity < 0.5) {  // Higher minimum opacity
          this.twinkleSpeed = -this.twinkleSpeed
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.fill()
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    // Create moving particles (planets/comets)
    class Particle {
      constructor() {
        this.angle = Math.random() * Math.PI * 2
        this.radius = Math.random() * 300 + 200
        this.speed = Math.random() * 0.001 + 0.0005
        this.size = Math.random() * 3 + 2
        this.color = this.getRandomColor()
        this.centerX = canvas.width / 2
        this.centerY = canvas.height / 2
        this.trail = []
      }

      getRandomColor() {
        const colors = [
          'rgba(99, 102, 241, 0.8)',   // Purple
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(16, 185, 129, 0.8)',   // Green
          'rgba(245, 158, 11, 0.8)',   // Orange
          'rgba(139, 92, 246, 0.8)',   // Violet
          'rgba(236, 72, 153, 0.8)',   // Pink
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.angle += this.speed
        
        // Add to trail
        this.trail.push({
          x: this.centerX + Math.cos(this.angle) * this.radius,
          y: this.centerY + Math.sin(this.angle) * this.radius
        })
        
        // Limit trail length
        if (this.trail.length > 30) {
          this.trail.shift()
        }
      }

      draw() {
        const x = this.centerX + Math.cos(this.angle) * this.radius
        const y = this.centerY + Math.sin(this.angle) * this.radius

        // Draw trail
        if (this.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(this.trail[0].x, this.trail[0].y)
          
          for (let i = 1; i < this.trail.length; i++) {
            ctx.lineTo(this.trail[i].x, this.trail[i].y)
          }
          
          ctx.strokeStyle = this.color.replace('0.8', '0.2')
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(x, y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
        
        // Add glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size * 3)
        gradient.addColorStop(0, this.color)
        gradient.addColorStop(1, this.color.replace('0.8', '0'))
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }

    // Initialize
    const init = () => {
      stars = []
      particles = []
      
      // Create stars
      for (let i = 0; i < 200; i++) {
        stars.push(new Star())
      }
      
      // Create particles
      for (let i = 0; i < 8; i++) {
        particles.push(new Particle())
      }
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)' // Lighter fade for more visible trails
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      stars.forEach(star => {
        star.update()
        star.draw()
      })

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    init()
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="solar-system-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)',
          pointerEvents: 'none'
        }}
      />
      <div className="solar-system-overlay" />
    </>
  )
}

export default SolarSystemBackground
