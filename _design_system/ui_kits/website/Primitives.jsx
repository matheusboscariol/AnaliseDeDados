// Container.jsx — max-width wrapper
function Container({ children, className = "" }) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-6 md:px-8 ${className}`}>
      {children}
    </div>
  );
}

// SectionHeader.jsx — eyebrow + h2 + optional subtitle
function SectionHeader({ eyebrow, title, subtitle, align = "left" }) {
  const a = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <header className={`max-w-3xl space-y-4 ${a}`}>
      <p className="msb-eyebrow">{eyebrow}</p>
      <h2 className="msb-h1">{title}</h2>
      {subtitle ? <p className="msb-body-lg">{subtitle}</p> : null}
    </header>
  );
}

// Button.jsx — primary / secondary / ghost
function Button({ variant = "primary", children, href, className = "", ...rest }) {
  const base = "msb-btn";
  const v = `msb-btn--${variant}`;
  const Tag = href ? "a" : "button";
  return (
    <Tag className={`${base} ${v} ${className}`} href={href} {...rest}>
      {children}
    </Tag>
  );
}

// Eyebrow with leading bar
function EyebrowBar({ children }) {
  return (
    <span className="msb-eyebrow inline-flex items-center gap-[10px]">
      <span className="inline-block h-px w-6 bg-[#60A5FA]"></span>
      {children}
    </span>
  );
}

// Card.jsx
function Card({ children, className = "" }) {
  return <div className={`msb-card ${className}`}>{children}</div>;
}

// Brand mark — small symbol for header/footer
function BrandMark({ size = 18 }) {
  return (
    <span className="inline-flex items-center gap-[10px] font-mono text-[13px] font-medium tracking-tight text-[#F5F6F8]">
      <span
        style={{ width: 6, height: 6, borderRadius: 999, background: "#2563EB", boxShadow: "0 0 12px rgba(37,99,235,0.6)" }}
      ></span>
      <span>matheus<span style={{ color: "#60A5FA" }}>.</span>boscariol</span>
    </span>
  );
}

Object.assign(window, { Container, SectionHeader, Button, EyebrowBar, Card, BrandMark });
