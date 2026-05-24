function Methodology() {
  const steps = [
    { number: "01", title: "Diagnóstico do negócio", description: "Avaliação completa da situação atual: o que já funciona, o que está travado e onde estão as maiores oportunidades." },
    { number: "02", title: "Plano de ação", description: "Definição de prioridades, escopo do trabalho e direcionamento estratégico claro para os próximos ciclos." },
    { number: "03", title: "Encontros de consultoria", description: "Sessões de direcionamento, mentoria para a equipe e workshops práticos para construção conjunta de soluções." },
    { number: "04", title: "Acompanhamento da execução", description: "Suporte próximo na implementação: sprints de acompanhamento, revisão de entregas e ajustes em tempo real." },
    { number: "05", title: "Avaliação e novos ciclos", description: "Coleta de resultados, validação do que funcionou e planejamento das próximas etapas com base em dados reais." },
  ];
  return (
    <section id="metodologia" className="py-16 md:py-24" style={{ background: "rgba(17,19,26,0.4)" }}>
      <Container>
        <SectionHeader
          eyebrow="COMO TRABALHO"
          title="Um caminho claro, em 5 etapas."
          subtitle="Cada projeto se adapta ao momento e às prioridades da sua empresa, mas segue uma estrutura consistente."
        />
        <ol className="mt-12 space-y-6">
          {steps.map((s, i) => (
            <li key={s.number} className="relative grid gap-6 rounded-xl border border-[#272A33] bg-[#11131A] p-6 md:grid-cols-[auto_1fr] md:gap-10 md:p-8">
              <div className="flex items-start gap-4 md:flex-col md:gap-2">
                <span className="font-mono text-[40px] font-semibold leading-none text-[#60A5FA]">{s.number}</span>
                {i < steps.length - 1 ? <span aria-hidden="true" className="hidden h-12 w-px bg-[#272A33] md:block"></span> : null}
              </div>
              <div className="space-y-2 md:pt-2">
                <h3 className="msb-h3">{s.title}</h3>
                <p className="msb-body">{s.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

function Results() {
  const stats = [
    { value: "12+", label: "anos de experiência em marketing e tecnologia" },
    { value: "150+", label: "clientes atendidos em consultoria" },
    { value: "R$ 750k+", label: "em receita gerada na transição de cursos para o digital" },
    { value: "80k+", label: "seguidores conquistados no Instagram desde 2023" },
  ];
  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeader eyebrow="RESULTADOS" title="Números que mostram o caminho." />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-3 rounded-xl border border-[#272A33] bg-[#11131A] p-6 md:p-8">
              <span className="font-mono font-semibold leading-none text-[#F5F6F8]"
                style={{
                  fontSize: "clamp(2.5rem,6vw,3.5rem)",
                  letterSpacing: "-0.02em",
                  textShadow: "0 0 24px rgba(59,130,246,0.45), 0 0 1px rgba(59,130,246,0.5)",
                }}
              >
                {s.value}
              </span>
              <p className="msb-body">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-70"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(37,99,235,0.18), transparent 70%)",
        }}
      />
      <Container className="relative">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          <p className="msb-eyebrow">PRÓXIMO PASSO</p>
          <h2 className="msb-display">Vamos transformar estratégia em execução real?</h2>
          <p className="msb-body-lg">
            Em uma conversa de 30 minutos, entendo o contexto da sua empresa, identifico os
            principais gargalos e mostro por onde começar. Sem custo, sem compromisso.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary">
              Agendar diagnóstico gratuito
              <span className="msb-arrow">→</span>
            </Button>
            <Button variant="secondary"><span>💬</span> Falar pelo WhatsApp</Button>
          </div>
          <p className="text-sm text-[#71747E]">
            matheusboscariol@gmail.com <span className="mx-2 text-[#272A33]">·</span> +55 (19) 99907-8928
          </p>
        </div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#272A33] py-12">
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <BrandMark />
          <p className="text-sm text-[#71747E]">Consultoria em marketing, tecnologia e IA.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-[#A1A4AE] md:items-end">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href="mailto:matheusboscariol@gmail.com" className="hover:text-[#F5F6F8]">matheusboscariol@gmail.com</a>
            <span className="text-[#272A33]">·</span>
            <span>+55 (19) 99907-8928</span>
          </div>
          <div className="flex items-center gap-4 text-[#71747E]">
            <a className="hover:text-[#F5F6F8]" aria-label="LinkedIn">in</a>
            <a className="hover:text-[#F5F6F8]" aria-label="Instagram">ig</a>
          </div>
        </div>
      </Container>
      <Container className="mt-10">
        <p className="msb-caption">© 2026 Matheus Boscariol. Todos os direitos reservados.</p>
      </Container>
    </footer>
  );
}

window.Methodology = Methodology;
window.Results = Results;
window.FinalCTA = FinalCTA;
window.Footer = Footer;
