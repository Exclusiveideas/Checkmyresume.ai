const LiquidGlass = ({ 
  children, 
  className = '', 
  padding = '1rem',
  borderRadius = '2rem',
  hoverPadding,
  hoverBorderRadius,
  // onClick,
  style = {},
}) => {
  return (
    <>
      <div 
        className={`liquid-glass-wrapper ${className}`}
        // onClick={onClick}
        style={{
          '--padding': padding,
          '--border-radius': borderRadius,
          '--hover-padding': hoverPadding || padding,
          '--hover-border-radius': hoverBorderRadius || borderRadius,
          ...style
        }}
      >
        <div className="liquid-glass-effect" />
        <div className="liquid-glass-tint" />
        <div className="liquid-glass-shine" />
        <div className="liquid-glass-content">
          {children}
        </div>
      </div>
      
      <style jsx>{`
        .liquid-glass-wrapper {
          position: relative;
          display: inline-flex;
          overflow: hidden;
          cursor: pointer;
          padding: var(--padding);
          border-radius: var(--border-radius);
          box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 2.2);
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
          background: rgba(255, 255, 255, 0.2);
        }
        
        .liquid-glass-shine {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          // box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
          //   inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5);
        }
        
        .liquid-glass-content {
          position: relative;
          z-index: 3;
        }
      `}</style>
    </>
  );
};

export default LiquidGlass;