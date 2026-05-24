function Hero() {
  const trustItems = [
    "Formação USP",
    "12+ anos em tech",
    "Ex-RD Station",
    "Ex-Olist",
    "150+ clientes atendidos",
  ];
  return (
    <section id="top" className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-32">
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Blue radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.18), transparent 70%)",
        }}
      />
      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
        style={{ background: "linear-gradient(to bottom, transparent, #0A0B0F)" }}
      />

      <Container className="relative">
        <div className="max-w-4xl space-y-8">
          <EyebrowBar>Consultoria em marketing, tecnologia e IA</EyebrowBar>

          <h1 className="msb-display">
            Da estratégia à execução: marketing, processos e IA para empresas em crescimento.
          </h1>

          <p className="msb-body-lg max-w-2xl">
            Ajudo fundadores e líderes a organizar marketing digital, integrar processos e
            usar IA para transformar planos em resultados reais. Sem achismo, sem desperdício
            de tempo.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="primary">
              Agendar diagnóstico gratuito
              <span className="msb-arrow">→</span>
            </Button>
            <Button variant="secondary">
              <span>💬</span>
              Falar pelo WhatsApp
            </Button>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-[#71747E]">
            {trustItems.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                <span>{item}</span>
                {i < trustItems.length - 1 ? (
                  <span aria-hidden="true" className="text-[#272A33]">·</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

window.Hero = Hero;
