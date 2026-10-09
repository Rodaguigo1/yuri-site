// Exercícios demo — espelha a tabela public.exercicios
// Quando Supabase estiver configurado, app.html/admin.html buscam de lá.
const MOCK_EXERCICIOS = [
  {id:"m1", nome:"Flexão de braço", grupo:"peito", nivel:"iniciante", descricao:"Base de empurrar, faz em qualquer lugar.", execucao:"1. Prancha, mãos na linha do peito.\n2. Desça até quase encostar o peito.\n3. Empurre. Joelhos no chão para regredir.", erros_comuns:"Quadril caído, mão muito à frente.", video_url:""},
  {id:"m2", nome:"Supino reto com halteres", grupo:"peito", nivel:"todos", descricao:"Peitoral, ombros e tríceps.", execucao:"1. Pés no chão.\n2. Desça até 90° no cotovelo.\n3. Suba sem travar.", erros_comuns:"Arquear demais a lombar.", video_url:"https://www.youtube.com/watch?v=rT7DgCr-3pg"},
  {id:"m3", nome:"Puxada alta", grupo:"costas", nivel:"todos", descricao:"Dorsais e bíceps.", execucao:"1. Pegada aberta.\n2. Puxe até o peito.\n3. Volte controlado.", erros_comuns:"Balançar o tronco.", video_url:""},
  {id:"m4", nome:"Remada curvada", grupo:"costas", nivel:"intermediario", descricao:"Dorsais e trapézio.", execucao:"1. Tronco ~45°.\n2. Puxe ao abdômen.\n3. Escápulas juntas.", erros_comuns:"Arredondar a lombar.", video_url:""},
  {id:"m5", nome:"Agachamento livre", grupo:"pernas", nivel:"todos", descricao:"Quadríceps, glúteos e core.", execucao:"1. Pés na largura do ombro.\n2. Quadril pra trás e pra baixo.\n3. Joelho segue a ponta do pé.", erros_comuns:"Joelho entrando pra dentro.", video_url:""},
  {id:"m6", nome:"Afundo", grupo:"pernas", nivel:"iniciante", descricao:"Unilateral, ótimo pra casa.", execucao:"1. Passo à frente.\n2. Desça até 90/90.\n3. Troque o lado.", erros_comuns:"Tronco inclinado pra frente.", video_url:""},
  {id:"m7", nome:"Desenvolvimento com halteres", grupo:"ombros", nivel:"todos", descricao:"Deltóides.", execucao:"1. Sentado, core firme.\n2. Empurre acima da cabeça.\n3. Desça até a orelha.", erros_comuns:"Arquear a lombar.", video_url:""},
  {id:"m8", nome:"Rosca direta", grupo:"biceps", nivel:"todos", descricao:"Bíceps.", execucao:"1. Cotovelos fixos.\n2. Suba sem balançar.\n3. Desça em 2s.", erros_comuns:"Roubar com o ombro.", video_url:""},
  {id:"m9", nome:"Tríceps testa", grupo:"triceps", nivel:"todos", descricao:"Tríceps.", execucao:"1. Deitado.\n2. Desça até a testa.\n3. Estenda.", erros_comuns:"Abrir os cotovelos.", video_url:""},
  {id:"m10", nome:"Prancha", grupo:"abdomen", nivel:"todos", descricao:"Core.", execucao:"1. Cotovelos no chão.\n2. Corpo reto.\n3. Segure 30-60s.", erros_comuns:"Quadril alto ou caído.", video_url:""},
  {id:"m11", nome:"Elevação pélvica", grupo:"gluteos", nivel:"todos", descricao:"Glúteos e posterior.", execucao:"1. Costas apoiadas.\n2. Suba o quadril.\n3. Segure 1s em cima.", erros_comuns:"Hiperestender a lombar.", video_url:""},
  {id:"m12", nome:"Polichinelo", grupo:"cardio", nivel:"iniciante", descricao:"Aquecimento.", execucao:"Ritmo constante 30-60s.", erros_comuns:"-", video_url:""},
];

const MOCK_PLANOS = [
  {id:"p1", nome:"Start em Casa - Iniciante", objetivo:"iniciante_casa", nivel:"iniciante", dias_por_semana:3, descricao:"Só peso corporal, 30min."},
  {id:"p2", nome:"Hipertrofia Academia - ABC", objetivo:"hipertrofia", nivel:"intermediario", dias_por_semana:5, descricao:"Divisão clássica pra massa."},
  {id:"p3", nome:"Secar - Fullbody + Cardio", objetivo:"emagrecimento", nivel:"todos", dias_por_semana:4, descricao:"Fullbody + cardio."},
];

// Login demo: aluno / admin
const MOCK_USERS = [
  {email:"demo@yuri.com", senha:"123456", nome:"Aluno Demo", role:"aluno"},
  {email:"admin@yuri.com", senha:"admin", nome:"Yuri", role:"admin"},
];

// ---- Montagem automática da semana ----
// Entrada: {dias: 2..6, objetivo, local}
// Saída: [{titulo, foco, grupos:[...], exercicios:[{...ex, series, repeticoes, descanso_seg}]}]
function montarSemanaAuto({dias = 3, objetivo = "hipertrofia", local = "academia"} = {}) {
  const pool = (g) => MOCK_EXERCICIOS.filter(e => e.grupo === g);
  const pick = (g, n) => pool(g).slice(0, n);
  // em casa: prioriza peso corporal
  const emCasa = local === "casa";
  const cfg = {
    hipertrofia: {series: 4, reps: "8-12", desc: 90},
    emagrecimento: {series: 3, reps: "12-15", desc: 45},
    forca: {series: 5, reps: "4-6", desc: 180},
    iniciante_casa: {series: 3, reps: "10-12", desc: 60},
    mobilidade: {series: 2, reps: "30s", desc: 30},
  }[objetivo] || {series: 3, reps: "10-12", desc: 60};

  const mount = (list) => list.map(e => ({...e, series: cfg.series, repeticoes: cfg.reps, descanso_seg: cfg.desc}));

  const FULL_A = [...pick("peito",1), ...pick("costas",1), ...pick("pernas",2), ...pick("abdomen",1), ...pick("cardio", emCasa?1:0)];
  const FULL_B = [...pick("ombros",1), ...pick("biceps",1), ...pick("triceps",1), ...pick("gluteos",1), ...pick("pernas",1), ...pick("abdomen",1)];
  const FULL_C = [...pick("peito",1), ...pick("costas",1), ...pick("ombros",1), ...pick("pernas",1), ...pick("biceps",1), ...pick("cardio",1)];

  const models = {
    2: [
      {titulo:"A - Fullbody", foco:"Corpo todo", ex: FULL_A},
      {titulo:"B - Fullbody", foco:"Corpo todo", ex: FULL_B},
    ],
    3: [
      {titulo:"A - Fullbody empurrar + perna", foco:"Peito/Ombro/Perna", ex: FULL_A},
      {titulo:"B - Puxar + core", foco:"Costas/Braço/Core", ex: FULL_B},
      {titulo:"C - Fullbody + cardio", foco:"Condicionamento", ex: FULL_C},
    ],
    4: [
      {titulo:"A - Superior empurrar", foco:"Peito/Ombro/Tríceps", ex: mount([...pick("peito",2), ...pick("ombros",1), ...pick("triceps",1), ...pick("abdomen",1)])},
      {titulo:"B - Inferior", foco:"Perna/Glúteo", ex: mount([...pick("pernas",3), ...pick("gluteos",1), ...pick("cardio",1)])},
      {titulo:"C - Superior puxar", foco:"Costas/Bíceps", ex: mount([...pick("costas",2), ...pick("biceps",1), ...pick("ombros",1), ...pick("abdomen",1)])},
      {titulo:"D - Fullbody", foco:"Corpo todo", ex: mount(FULL_C)},
    ],
    5: [
      {titulo:"A - Peito + Tríceps", foco:"Empurrar", ex: mount([...pick("peito",2), ...pick("ombros",1), ...pick("triceps",1)])},
      {titulo:"B - Costas + Bíceps", foco:"Puxar", ex: mount([...pick("costas",2), ...pick("biceps",1), ...pick("abdomen",1)])},
      {titulo:"C - Pernas", foco:"Quadríceps/Glúteo", ex: mount([...pick("pernas",3), ...pick("gluteos",1)])},
      {titulo:"D - Ombros + Core", foco:"Deltóide/Core", ex: mount([...pick("ombros",2), ...pick("peito",1), ...pick("abdomen",1)])},
      {titulo:"E - Fullbody + Cardio", foco:"Condicionamento", ex: mount(FULL_C)},
    ],
    6: [
      {titulo:"A - Peito", foco:"Peito", ex: mount(pick("peito",2))},
      {titulo:"B - Costas", foco:"Costas", ex: mount(pick("costas",2))},
      {titulo:"C - Pernas", foco:"Perna", ex: mount([...pick("pernas",3), ...pick("gluteos",1)])},
      {titulo:"D - Ombros", foco:"Ombro", ex: mount(pick("ombros",2))},
      {titulo:"E - Braços", foco:"Bíceps/Tríceps", ex: mount([...pick("biceps",1), ...pick("triceps",1), ...pick("abdomen",1)])},
      {titulo:"F - Cardio + Core", foco:"Condicionamento", ex: mount([...pick("cardio",1), ...pick("abdomen",1), ...pick("pernas",1)])},
    ],
  };
  const sel = models[dias] || models[3];
  return sel.map(d => ({titulo: d.titulo, foco: d.foco, exercicios: Array.isArray(d.ex[0]) ? d.ex : mount(d.ex)}));
}
