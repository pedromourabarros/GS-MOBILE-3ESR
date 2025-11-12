/**
 * Sistema de IA Simulada para Mensagens Motivacionais Personalizadas
 * Analisa as médias de humor e estresse para fornecer mensagens contextualizadas
 */

// Mensagens para diferentes cenários baseados em humor e estresse
const messageCategories = {
  // Alto humor, baixo estresse (melhor cenário)
  excellent: [
    "Incrível! Você está em um ótimo momento! Continue mantendo esse equilíbrio! 🌟",
    "Parabéns! Seu bem-estar está excelente. Você está no caminho certo! 💪",
    "Fantástico! Você encontrou um equilíbrio perfeito. Continue assim! ✨",
    "Você está brilhando! Seu humor e controle do estresse estão perfeitos! 🎯",
  ],
  // Bom humor, estresse moderado
  good: [
    "Você está indo bem! Continue cuidando do seu bem-estar! 💙",
    "Ótimo progresso! Seu humor está positivo. Mantenha o foco! 🚀",
    "Você está no caminho certo! Pequenos ajustes podem melhorar ainda mais! 🌈",
    "Bom trabalho! Continue registrando e acompanhando sua evolução! 📈",
  ],
  // Humor médio, estresse moderado
  moderate: [
    "Cada dia é uma nova oportunidade! Continue monitorando seu bem-estar! 🌸",
    "Você está fazendo um ótimo trabalho ao se conhecer melhor! 📝",
    "Respire fundo e siga em frente! O autoconhecimento é o primeiro passo! 🧘",
    "Continue registrando! Você está construindo um futuro melhor! 🏗️",
  ],
  // Humor baixo ou estresse alto (precisa de atenção)
  needsAttention: [
    "Você não está sozinho nessa jornada! Cuide-se e peça ajuda se precisar! 🤝",
    "Momentos difíceis passam, você permanece forte! Respire e continue! 💪",
    "Seu bem-estar mental é uma prioridade! Considere fazer uma pausa! 🧠",
    "Você é mais forte do que imagina! Pequenos passos levam a grandes mudanças! ⭐",
  ],
  // Estresse muito alto (alerta)
  highStress: [
    "Respire fundo! Seu bem-estar é importante. Considere técnicas de relaxamento! 😊",
    "Você merece momentos de paz! Tente fazer uma pausa e se cuidar! 🌸",
    "Está tudo bem não estar bem. Peça ajuda se precisar! Você não está sozinho! 💙",
    "Cuide-se! Seu bem-estar é prioridade. Considere conversar com alguém! 🤝",
  ],
};

/**
 * Retorna uma mensagem motivacional personalizada e humanizada baseada em análise contextual
 * IA simulada que adapta a linguagem conforme o contexto do usuário
 * 
 * @param {number} avgMood - Média de humor (1-5)
 * @param {number} avgStress - Média de estresse (1-5)
 * @param {number} currentMood - Humor do registro atual (1-5)
 * @param {number} currentStress - Estresse do registro atual (1-5)
 * @param {number} totalEntries - Total de registros
 * @param {number} streak - Dias consecutivos
 * @returns {string} - Mensagem motivacional humanizada e contextual
 */
export const getPersonalizedMotivationalMessage = (
  avgMood, 
  avgStress, 
  currentMood, 
  currentStress,
  totalEntries = 0,
  streak = 0
) => {
  // Se não houver histórico suficiente
  if (!avgMood || !avgStress || totalEntries === 0) {
    return "Bem-vindo ao WorkWell! Cada registro é um passo importante no seu autocuidado. Continue assim! 🌟";
  }

  // Análise de tendências
  const moodChange = currentMood - avgMood;
  const stressChange = currentStress - avgStress;
  
  // Mensagens baseadas em contexto específico
  let message = '';

  // Prioriza estresse alto (mais crítico) - linguagem empática
  if (avgStress >= 4 || currentStress >= 4) {
    if (stressChange > 0.5) {
      message = `Percebi que seu nível de estresse aumentou hoje. Isso é completamente normal, e o importante é que você está se observando. Que tal fazer uma pausa de 5 minutos para respirar? Você merece esse cuidado. 💙`;
    } else if (stressChange < -0.5) {
      message = `Ótimo! Seu estresse diminuiu em relação à média. Você está encontrando formas de se equilibrar — isso é autocuidado em ação! Continue assim! 🌿`;
    } else {
      message = `Seu nível de estresse está alto. Lembre-se: está tudo bem não estar bem. Considere técnicas de respiração ou uma conversa com alguém de confiança. Você não está sozinho nessa. 🤝`;
    }
  }
  // Alto humor e baixo estresse - celebração
  else if (avgMood >= 4 && avgStress <= 2) {
    if (moodChange > 0.3) {
      message = `Incrível! Você está em um momento excelente! Seu humor melhorou e o estresse está controlado. Isso mostra que você está encontrando seu equilíbrio. Continue mantendo esses hábitos! ✨`;
    } else {
      message = `Você está mantendo um ótimo equilíbrio entre humor e estresse. Isso é autocuidado consistente — algo essencial no trabalho do futuro. Parabéns! 🎯`;
    }
  }
  // Bom humor - encorajamento
  else if (avgMood >= 3.5 && avgStress <= 3) {
    if (moodChange > 0.3) {
      message = `Seu humor está melhorando! Isso é um sinal positivo. Continue cuidando de si mesmo — pequenos passos diários fazem toda a diferença. 💪`;
    } else {
      message = `Você está indo bem! Seu bem-estar está em um bom caminho. Manter essa constância é uma forma poderosa de autocuidado. Continue assim! 🌈`;
    }
  }
  // Humor baixo ou estresse moderado-alto - suporte
  else if (avgMood <= 2.5 || avgStress >= 3.5) {
    if (moodChange < -0.3) {
      message = `Vejo que seu humor está mais baixo hoje. Dias difíceis fazem parte da jornada, e o importante é que você está se observando. Considere fazer algo que te traz alegria, mesmo que pequeno. Você é mais forte do que imagina. 💙`;
    } else if (stressChange > 0.3) {
      message = `Seu estresse aumentou um pouco. Que tal fazer uma pausa? Pequenos momentos de descanso são essenciais. Você está fazendo um ótimo trabalho ao monitorar seu bem-estar. 🧘`;
    } else {
      message = `Você está passando por um momento mais desafiador. Lembre-se: isso é temporário. Continue registrando e se observando — autoconhecimento é o primeiro passo para mudanças positivas. 🌱`;
    }
  }
  // Caso padrão (moderado) - encorajamento geral
  else {
    if (streak >= 7) {
      message = `Você está mantendo uma ótima constância com ${streak} dias consecutivos! Isso mostra comprometimento com seu bem-estar. Continue nesse ritmo! 🔥`;
    } else if (moodChange > 0.2) {
      message = `Seu humor melhorou hoje! Pequenas melhorias diárias são significativas. Continue se observando e cuidando de si mesmo. 📈`;
    } else {
      message = `Você está no caminho certo ao monitorar seu bem-estar regularmente. Cada registro é um ato de autocuidado. Continue assim! 📝`;
    }
  }

  return message;
};

/**
 * Retorna uma mensagem motivacional aleatória (fallback)
 * Mantida para compatibilidade com código antigo
 * @returns {string} - Mensagem motivacional
 */
export const getRandomMotivationalMessage = () => {
  const allMessages = Object.values(messageCategories).flat();
  const randomIndex = Math.floor(Math.random() * allMessages.length);
  return allMessages[randomIndex];
};

