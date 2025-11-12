/**
 * Frases reflexivas e dicas de mindfulness para o Modo Reflexão
 * Cada frase é pensada para promover bem-estar, autoconhecimento e cuidado humano
 */

export const dailyReflections = [
  {
    text: "Respire fundo. Pequenas pausas constroem grandes resultados.",
    category: "Mindfulness",
  },
  {
    text: "Você não precisa ser perfeito para ser valioso. Cada progresso conta.",
    category: "Autocompaixão",
  },
  {
    text: "O bem-estar não é um destino, é uma jornada diária de autocuidado.",
    category: "Bem-estar",
  },
  {
    text: "Permita-se sentir. Suas emoções são válidas e importantes.",
    category: "Inteligência Emocional",
  },
  {
    text: "Um dia de cada vez. Pequenos passos levam a grandes transformações.",
    category: "Persistência",
  },
  {
    text: "Você merece momentos de paz. Reserve tempo para si mesmo.",
    category: "Autocuidado",
  },
  {
    text: "O trabalho é importante, mas você é mais importante que o trabalho.",
    category: "Equilíbrio",
  },
  {
    text: "Celebre suas pequenas vitórias. Elas são sementes de grandes conquistas.",
    category: "Gratidão",
  },
  {
    text: "Está tudo bem não estar bem. Pedir ajuda é um sinal de força, não fraqueza.",
    category: "Resiliência",
  },
  {
    text: "Seu bem-estar mental é uma prioridade, não um luxo.",
    category: "Saúde Mental",
  },
  {
    text: "Pausas não são perda de tempo. São investimento em produtividade sustentável.",
    category: "Produtividade",
  },
  {
    text: "Você é mais forte do que imagina. Cada desafio superado te torna mais resiliente.",
    category: "Força Interior",
  },
  {
    text: "Conecte-se com o presente. O agora é onde a vida acontece.",
    category: "Mindfulness",
  },
  {
    text: "Seu valor não está no que você produz, mas em quem você é.",
    category: "Autoestima",
  },
  {
    text: "Cuidar de si mesmo não é egoísmo. É a base para cuidar dos outros.",
    category: "Autocuidado",
  },
];

/**
 * Retorna a frase do dia baseada na data atual
 * Usa o dia do ano (1-365) para selecionar uma frase do array
 * @returns {Object} Objeto com text e category
 */
export const getDailyReflection = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
  
  // Usa o dia do ano como índice (módulo para garantir que está no range)
  const index = (dayOfYear - 1) % dailyReflections.length;
  
  return dailyReflections[index];
};

