import React from 'react'
import { motion } from 'framer-motion'

const LYzrLogo = ({ size = 'default', animated = true, className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      variants={animated ? logoVariants : {}}
      initial="initial"
      whileHover={animated ? "hover" : {}}
      animate={animated ? "pulse" : {}}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="currentColor"
      >
        {/* L shape */}
        <motion.path
          d="M20 20 L20 80 L60 80 L60 60 L40 60 L40 40 L60 40 L60 20 Z"
          fill="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Y shape */}
        <motion.path
          d="M70 20 L80 20 L80 40 L90 40 L90 60 L80 60 L80 80 L70 80 L70 60 L60 60 L60 40 L70 40 Z"
          fill="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
        />
        
        {/* Connection line */}
        <motion.line
          x1="60"
          y1="50"
          x2="70"
          y2="50"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
      </svg>
    </motion.div>
  )
}

export default LYzrLogo
