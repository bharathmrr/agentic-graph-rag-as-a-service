import React, { useEffect, useRef } from 'react'

const EnhancedBackgroundAnimation = () => {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
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

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)` // Blue to cyan range
        })
      }
    }

    // Initialize stars
    const initStars = () => {
      starsRef.current = []
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01
        })
      }
    }

    initParticles()
    initStars()

    const animate = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars with twinkling effect
      starsRef.current.forEach(star => {
        star.opacity = 0.2 + Math.abs(Math.sin(timestamp * star.twinkleSpeed)) * 0.6
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      // Draw and update particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`)
        ctx.fill()

        // Add glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = particle.color
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw connections between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="enhanced-background-animation">
      {/* Animated gradient background */}
      <div className="gradient-bg" />
      
      {/* Canvas for particles and stars */}
      <canvas 
        ref={canvasRef}
        className="particle-canvas"
      />
      
      {/* Enhanced glow orbs */}
      <div className="glow-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
        <div className="orb orb-7" />
      </div>
      
      {/* Floating geometric shapes */}
      <div className="geometric-shapes">
        <div className="shape shape-triangle" />
        <div className="shape shape-circle" />
        <div className="shape shape-square" />
      </div>

      <style jsx>{`
        .enhanced-background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          overflow: hidden;
        }
        
        .gradient-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            #0a0a0a 0%,
            #1a1a2e 10%,
            #16213e 20%,
            #0f3460 35%,
            #533a7d 50%,
            #8b5cf6 65%,
            #1a1a2e 80%,
            #0f172a 90%,
            #0a0a0a 100%
          );
          background-size: 600% 600%;
          animation: gradientShift 30s ease infinite;
        }
        
        .gradient-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            ellipse at center,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(139, 92, 246, 0.05) 30%,
            transparent 70%
          );
          animation: pulseGradient 20s ease-in-out infinite;
        }
        
        .particle-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glow-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: pulse 12s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #3b82f6, transparent);
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #10b981, transparent);
          top: 50%;
          right: 10%;
          animation-delay: 4s;
        }
        
        .orb-3 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          bottom: 15%;
          left: 40%;
          animation-delay: 8s;
        }
        
        .orb-4 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #f59e0b, transparent);
          top: 30%;
          left: 70%;
          animation-delay: 2s;
        }
        
        .orb-5 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #ec4899, transparent);
          bottom: 40%;
          right: 30%;
          animation-delay: 6s;
        }
        
        .orb-6 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #06b6d4, transparent);
          top: 70%;
          left: 15%;
          animation-delay: 10s;
        }
        
        .orb-7 {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, #14b8a6, transparent);
          top: 25%;
          right: 40%;
          animation-delay: 3s;
        }
        
        .geometric-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .shape {
          position: absolute;
          opacity: 0.1;
          animation: float 20s linear infinite;
        }
        
        .shape-triangle {
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 25px solid #3b82f6;
          top: 20%;
          left: 80%;
          animation-delay: 0s;
        }
        
        .shape-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #10b981;
          top: 60%;
          left: 20%;
          animation-delay: 7s;
        }
        
        .shape-square {
          width: 25px;
          height: 25px;
          background: #8b5cf6;
          transform: rotate(45deg);
          top: 80%;
          left: 60%;
          animation-delay: 14s;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          20% { background-position: 100% 50%; }
          40% { background-position: 100% 100%; }
          60% { background-position: 50% 100%; }
          80% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulseGradient {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          33% {
            transform: scale(1.1);
            opacity: 0.6;
          }
          66% {
            transform: scale(0.9);
            opacity: 0.3;
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.1;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100px) translateX(50px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default EnhancedBackgroundAnimation
