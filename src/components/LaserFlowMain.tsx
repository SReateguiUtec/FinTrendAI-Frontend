import React, { useRef } from 'react';
import { LaserFlow } from './ui/LaserFlow';
import RetroBloomberg from './RetroTerminal';

export function LaserFlowBoxExample() {
  const revealImgRef = useRef(null);

  return (
    <div
      className="relative h-[420px] overflow-hidden bg-[#0a0a0a] sm:h-[500px] md:h-[620px]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', `${x}px`);
          el.style.setProperty('--my', `${y}px`);
        }
      }}
      onMouseLeave={() => {
        const el = revealImgRef.current;
        if (el) {
          el.style.setProperty('--mx', '-9999px');
          el.style.setProperty('--my', '-9999px');
        }
      }}
    >
      <LaserFlow
        horizontalBeamOffset={0.0}
        verticalBeamOffset={0.0}
        color="#D4AF37"
      />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%)',
        width: '86%',
        height: '60%',
        backgroundColor: '#0a0a0a',
        backgroundImage: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.11) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        backgroundPosition: '0 0',
        borderRadius: '20px',
        border: '2px solid #D4AF37',
        overflow: 'hidden',
        zIndex: 6,
      }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '0.35rem',
            overflow: 'hidden',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            position: 'relative',
            minHeight: 0,
          }}
        >
          <div
            role="region"
            aria-label="Demo terminal de mercado"
            style={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              minHeight: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <RetroBloomberg />
          </div>
        </div>
      </div>

      {/* Reveal overlay — cubre todo el contenedor para que las coordenadas del mouse coincidan exactamente con la máscara */}
      <div
        ref={revealImgRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 8,
          mixBlendMode: 'lighten',
          pointerEvents: 'none',
          overflow: 'hidden',
          '--mx': '-9999px',
          '--my': '-9999px',
          WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.5) 150px, rgba(255,255,255,0) 220px)',
          maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 80px, rgba(255,255,255,0.5) 150px, rgba(255,255,255,0) 220px)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        } as React.CSSProperties & { '--mx': string; '--my': string }}
      >
        {/* Por encima del marco dorado (empieza en 50%): filas en la franja negra del laser */}
        <div
          style={{
            position: 'absolute',
            top: '24%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '72%',
            maxWidth: 'min(36rem, 92vw)',
            height: '38%',
            maxHeight: '240px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.2rem',
            padding: '0.3rem',
            boxSizing: 'border-box',
          }}
        >
          {[
            { ticker: 'AAPL', name: 'Apple Inc.', change: '+3.24%', price: '$189.42', up: true },
            { ticker: 'NVDA', name: 'NVIDIA Corp.', change: '+7.81%', price: '$875.20', up: true },
            { ticker: 'MSFT', name: 'Microsoft', change: '+1.05%', price: '$415.60', up: true },
            { ticker: 'TSLA', name: 'Tesla Inc.', change: '-2.33%', price: '$172.10', up: false },
            { ticker: 'AMZN', name: 'Amazon.com', change: '+4.17%', price: '$198.85', up: true },
          ].map(({ ticker, name, change, price, up }) => (
            <div key={ticker} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.3rem 0.45rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(212,175,55,0.07)',
              border: '1px solid rgba(212,175,55,0.15)',
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.72rem', color: '#D4AF37' }}>{ticker}</p>
                <p style={{ margin: 0, fontSize: '0.56rem', color: 'rgba(255,255,255,0.45)' }}>{name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.68rem', color: 'rgba(255,255,255,0.9)' }}>{price}</p>
                <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 700, color: up ? '#4ade80' : '#f87171' }}>{change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}