import React, { useRef } from 'react';
import { LaserFlow } from './ui/LaserFlow';
import BloombergTerminal from './BloombergTerminal';

export function LaserFlowBoxExample() {
  const revealImgRef = useRef(null);

  return (
    <div
      style={{
        height: '620px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a0a0a'
      }}
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
        top: '49.5%',
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
            padding: '0.5rem',
            overflow: 'hidden',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Franja superior: flex centra el texto; no afecta al terminal */}
          <div
            style={{
              position: 'absolute',
              top: '1.2rem',
              left: 0,
              right: 0,
              padding: '0 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            <p
              className="text-[0.65rem] md:text-[0.95rem]"
              style={{
                margin: 0,
                maxWidth: 'min(42rem, 100%)',
                textAlign: 'center',
                fontFamily: "'Share Tech Mono', ui-monospace, monospace",
                fontWeight: 500,
                letterSpacing: '0.06em',
                lineHeight: 1.45,
                color: 'rgba(255, 235, 190, 0.95)',
                textWrap: 'balance',
              }}
            >
              Fintrend analiza el mercado y te da recomendaciones para tu inversión.
            </p>
          </div>
          <div aria-hidden style={{ position: 'relative', zIndex: 2 }}>
            <BloombergTerminal />
          </div>
        </div>
      </div>

      {/* Reveal overlay — cubre todo el contenedor para que las coordenadas del mouse coincidan exactamente con la máscara */}
      <div
        ref={revealImgRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
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
        {/* Contenido posicionado igual que el card para que el reveal coincida */}
        <div style={{
          position: 'absolute',
          top: '26%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%',
          height: '40%',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.25rem',
        }}>
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