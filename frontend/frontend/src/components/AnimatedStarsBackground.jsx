import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const AnimatedStarsBackground = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const starsRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    const createStars = () => {
      const stars = []
      const numStars = 150
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4, // Fast horizontal movement
          vy: (Math.random() - 0.5) * 4, // Fast vertical movement
          size: Math.random() * 3 + 1,
          brightness: Math.random() * 0.8 + 0.2,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.1 + 0.05
        })
      }
      
      starsRef.current = stars
    }

    createStars()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      )
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.1)')
      gradient.addColorStop(0.5, 'rgba(30, 41, 59, 0.3)')
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.8)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      starsRef.current.forEach((star, index) => {
        // Update position
        star.x += star.vx
        star.y += star.vy
        
        // Wrap around screen
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0
        
        // Update twinkle
        star.twinkle += star.twinkleSpeed
        
        // Draw star
        const alpha = star.brightness * (0.5 + 0.5 * Math.sin(star.twinkle))
        ctx.save()
        ctx.globalAlpha = alpha
        
        // Create star glow effect
        const glowGradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 4
        )
        glowGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        glowGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
        glowGradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)')
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw star core
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      })

      // Draw connection lines between nearby stars
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const star1 = starsRef.current[i]
          const star2 = starsRef.current[j]
          const distance = Math.sqrt(
            Math.pow(star1.x - star2.x, 2) + Math.pow(star1.y - star2.y, 2)
          )
          
          if (distance < 100) {
            const alpha = (100 - distance) / 100 * 0.3
            ctx.save()
            ctx.globalAlpha = alpha
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(star1.x, star1.y)
            ctx.lineTo(star2.x, star2.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 pointer-events-none z-0"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </motion.div>
  )
}

export default AnimatedStarsBackground
