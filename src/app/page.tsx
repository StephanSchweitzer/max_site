'use client';

export default function UnderDevelopmentPage() {
    return (
        <>
            <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a, #581c87, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow: hidden;
          position: relative;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(4rem);
          opacity: 0.7;
          animation: pulse 3s ease-in-out infinite;
        }

        .bg-blob-1 {
          top: -1rem;
          left: -1rem;
          width: 18rem;
          height: 18rem;
          background: #8b5cf6;
          animation-delay: 0s;
        }

        .bg-blob-2 {
          bottom: -2rem;
          right: -1rem;
          width: 18rem;
          height: 18rem;
          background: #06b6d4;
          animation-delay: 2s;
        }

        .bg-blob-3 {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 18rem;
          height: 18rem;
          background: #ec4899;
          animation-delay: 4s;
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 64rem;
          margin: 0 auto;
        }

        .logo-container {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }

        .logo {
          position: relative;
          width: 6rem;
          height: 6rem;
          background: linear-gradient(135deg, #22d3ee, #8b5cf6);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: rotate(3deg);
          transition: transform 0.5s ease;
        }

        .logo:hover {
          transform: rotate(0deg);
        }

        .logo-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid white;
          border-radius: 0.5rem;
          animation: spin 2s linear infinite;
        }

        .logo-dot {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          width: 1.5rem;
          height: 1.5rem;
          background: #4ade80;
          border-radius: 50%;
          animation: bounce 1s infinite;
        }

        .main-title {
          font-size: 4rem;
          font-weight: bold;
          background: linear-gradient(to right, #22d3ee, #8b5cf6, #ec4899);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .subtitle {
          font-size: 1.5rem;
          color: #cbd5e1;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .card-text {
          color: #e2e8f0;
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .card-subtext {
          color: #cbd5e1;
          font-size: 1rem;
        }

        .progress-container {
          margin-bottom: 2rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 0.75rem;
          background: rgba(71, 85, 105, 0.5);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 85%;
          background: linear-gradient(to right, #06b6d4, #8b5cf6);
          border-radius: 9999px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: pulse 2s ease-in-out infinite;
        }

        .particle {
          position: absolute;
          width: 0.5rem;
          height: 0.5rem;
          background: white;
          border-radius: 50%;
          opacity: 0.2;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          pointer-events: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25%); }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 3rem;
          }
          .subtitle {
            font-size: 1.25rem;
          }
          .card {
            padding: 1.5rem;
          }
        }
      `}</style>

            <div className="container">
                {/* Animated background elements */}
                <div className="bg-blob bg-blob-1"></div>
                <div className="bg-blob bg-blob-2"></div>
                <div className="bg-blob bg-blob-3"></div>

                {/* Main content */}
                <div className="content">
                    {/* Logo/Icon area */}
                    <div className="logo-container">
                        <div className="logo">
                            <div className="logo-spinner"></div>
                            <div className="logo-dot"></div>
                        </div>
                    </div>

                    {/* Main heading */}
                    <h1 className="main-title">Coming Soon</h1>

                    {/* Subtitle */}
                    <p className="subtitle">Coming soon</p>

                    {/* Description */}
                    <div className="card">
                        <p className="card-text">This site is currently under construction.</p>
                        <p className="card-subtext">Check back soon for updates!</p>
                    </div>

                    {/* Progress bar */}
                    <div className="progress-container">
                        <div className="progress-header">
                            <span>Progress</span>
                            <span>85%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill"></div>
                        </div>
                    </div>
                </div>

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>
        </>
    );
}