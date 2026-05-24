function Header() {
  const [open, setOpen] = React.useState(false);
  const links = [
    { href: "#para-quem", label: "Para quem" },
    { href: "#pilares", label: "Como ajudo" },
    { href: "#metodologia", label: "Metodologia" },
    { href: "#sobre", label: "Sobre" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-[#272A33] bg-[#0A0B0F]/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <a href="#top"><BrandMark /></a>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[#A1A4AE] transition-colors hover:text-[#F5F6F8]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button variant="primary" className="!px-4 !py-2 !text-[13px]">Falar agora</Button>
        </div>
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#F5F6F8] md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </Container>
    </header>
  );
}

window.Header = Header;
