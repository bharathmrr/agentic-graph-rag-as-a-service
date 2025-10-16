import React from 'react'

const BackgroundAnimation = () => {
  return (
    <div className="background-animation">
      {/* Animated gradient background */}
      <div className="gradient-bg" />
      
      {/* Floating particles */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
      
      {/* Glow orbs */}
      <div className="glow-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      
      <style jsx>{`
        .background-animation {
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
            #1a1a2e 25%,
            #16213e 50%,
            #0f3460 75%,
            #0a0a0a 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: float linear infinite;
        }
        
        .particle:nth-child(odd) {
          background: rgba(59, 130, 246, 0.4);
        }
        
        .particle:nth-child(3n) {
          background: rgba(16, 185, 129, 0.4);
        }
        
        .glow-orbs {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.3;
          animation: pulse 8s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #3b82f6, transparent);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #10b981, transparent);
          top: 60%;
          right: 20%;
          animation-delay: 3s;
        }
        
        .orb-3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          bottom: 20%;
          left: 50%;
          animation-delay: 6s;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

export default BackgroundAnimation
