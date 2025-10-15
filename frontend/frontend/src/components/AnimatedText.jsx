import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const AnimatedText = ({ 
  text, 
  className = "", 
  delay = 0, 
  duration = 0.05,
  gradient = false,
  typewriter = false,
  fadeIn = false,
  slideUp = false,
  glow = false
}) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (typewriter && text) {
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          setCurrentIndex(currentIndex + 1)
        }
      }, duration * 1000)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, text, typewriter, duration])

  const baseClasses = `${className} ${
    gradient ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' : ''
  } ${
    glow ? 'drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : ''
  }`

  if (typewriter) {
    return (
      <motion.span
        className={baseClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay }}
      >
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="ml-1"
        >
          |
        </motion.span>
      </motion.span>
    )
  }

  if (fadeIn) {
    return (
      <motion.span
        className={baseClasses}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.8 }}
      >
        {text}
      </motion.span>
    )
  }

  if (slideUp) {
    return (
      <motion.span
        className={baseClasses}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {text}
      </motion.span>
    )
  }

  // Character-by-character animation
  return (
    <span className={baseClasses}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + index * duration,
            duration: 0.3,
            type: "spring",
            stiffness: 100
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  )
}

export default AnimatedText
