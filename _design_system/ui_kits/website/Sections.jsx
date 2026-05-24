function ForWhom() {
  const profiles = [
    {
      title: "Fundador de startup em fase de tração",
      description:
        "Você está construindo do zero e precisa estruturar marketing, vendas e operações para escalar sem perder o controle.",
    },
    {
      title: "Líder de PME em crescimento",
      description:
        "Sua empresa está crescendo, mas o marketing digital, os processos e as ferramentas não acompanharam essa evolução.",
    },
    {
      title: "Empresa pronta para integrar IA",
      description:
        "Você sabe que IA e automação podem destravar produtividade, mas não sabe por onde começar nem como integrar isso ao que já existe.",
    },
  ];
  return (
    <section id="para-quem" className="py-16 md:py-24">
      <Container>
        <SectionHeader eyebrow="PARA QUEM É" title="Se você reconhece sua empresa aqui, vamos conversar." />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {profiles.map((p) => (
            <Card key={p.title} className="flex flex-col gap-3">
              <h3 className="msb-h3">{p.title}</h3>
              <p className="msb-body">{p.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Pillars() {
  const pillars = [
    { icon: "◎", title: "Estratégia e direcionamento", description: "Definição de prioridades, clareza nos próximos passos e alinhamento das ações de marketing e operação com os objetivos do negócio." },
    { icon: "✦", title: "Marketing digital e conteúdo", description: "Organização da comunicação, estratégia de marketing e planejamento de conteúdo para fortalecer sua presença e gerar demanda." },
    { icon: "▣", title: "Processos, tecnologia e IA", description: "Estruturação de processos, escolha de ferramentas e implementação de IA e automações para gerar eficiência e dados confiáveis." },
    { icon: "⇌", title: "Integração marketing, vendas e atendimento", description: "Definição de fluxos e acordos de trabalho entre áreas-chave, eliminando retrabalho e perda de oportunidades." },
  ];
  return (
    <section id="pilares" className="py-16 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="A SOLUÇÃO"
          title="Uma consultoria que une estratégia, execução e tecnologia."
          subtitle="Trabalho com quatro pilares integrados para destravar o crescimento da sua empresa no digital."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {pillars.map((p) => (
            <Card key={p.title} className="flex flex-col gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: "rgba(37,99,235,0.1)", color: "#60A5FA", fontFamily: "Geist Mono, monospace", fontSize: "20px" }}>
                {p.icon}
              </span>
              <h3 className="msb-h3">{p.title}</h3>
              <p className="msb-body">{p.description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

window.ForWhom = ForWhom;
window.Pillars = Pillars;
