const LiquidGlass = ({
  children,
  className = '',
  padding = '1rem',
  borderRadius = '2rem',
  hoverPadding,
  hoverBorderRadius,
  style = {},
  noTint
}) => {
  return (
    <>
      <div
        className={`liquid-glass-wrapper ${className}`}
        style={{
          '--padding': padding,
          '--border-radius': borderRadius,
          '--hover-padding': hoverPadding || padding,
          '--hover-border-radius': hoverBorderRadius || borderRadius,
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          flex: 1,
          position: 'relative',
          padding: padding,
          borderRadius: borderRadius,
          overflow: 'hidden',
          ...style
        }}
      >
        <div className="liquid-glass-effect" />
        <div className="liquid-glass-tint" style={{ opacity: noTint ? 0 : 1 }} />
        <div className="liquid-glass-shine" />
        <div className="liquid-glass-content" style={{ display: 'flex', width: '100%', position: 'relative', zIndex: 3 }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        .liquid-glass-wrapper {
          position: relative;
          display: inline-flex;
          overflow: hidden;
          padding: var(--padding);
          border-radius: var(--border-radius);
          box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
          flex: 1;
          width: 100%
        }
        
        .liquid-glass-wrapper:hover {
          padding: var(--hover-padding);
          border-radius: var(--hover-border-radius);
        }
        
        .liquid-glass-effect {
          position: absolute;
          z-index: 0;
          inset: 0;
          backdrop-filter: blur(3px);
          filter: url(#glass-distortion);
          overflow: hidden;
          isolation: isolate;
        }
        
        .liquid-glass-tint {
          z-index: 1;
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.1);
        }
        
        .liquid-glass-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
        }
        
        .liquid-glass-content {
          position: relative;
          z-index: 3;
          display: flex;
          width: 100%;
        }
      `}</style>
    </>
  );
};

export default LiquidGlass;