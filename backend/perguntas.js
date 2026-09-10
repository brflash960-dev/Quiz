const bancoPerguntas = [

    // ESPORTES
    {
        pergunta: "Quantos jogadores de cada equipe ficam em quadra no basquete?",
        alternativas: ["4 jogadores", "5 jogadores", "6 jogadores", "7 jogadores"],
        correta: 1
    },
    {
        pergunta: "Qual esporte utiliza uma rede dividindo a quadra e permite até três toques por equipe antes de devolver a bola?",
        alternativas: ["Vôlei", "Futebol", "Tênis", "Handebol"],
        correta: 0
    },
    {
        pergunta: "Em qual esporte é utilizada uma raquete e uma peteca?",
        alternativas: ["Tênis", "Badminton", "Tênis de mesa", "Squash"],
        correta: 1
    },
    {
        pergunta: "Quantos jogadores formam uma equipe de futebol em campo no início de uma partida?",
        alternativas: ["9", "10", "11", "12"],
        correta: 2
    },
    {
        pergunta: "Qual esporte é praticado em uma piscina e envolve diferentes estilos de natação?",
        alternativas: ["Natação", "Remo", "Polo", "Surfe"],
        correta: 0
    },
    {
        pergunta: "Qual modalidade esportiva é conhecida pelas técnicas de chute, soco e outras técnicas de combate?",
        alternativas: ["Ginástica", "Lutas", "Atletismo", "Ciclismo"],
        correta: 1
    },

    // ANATOMIA
    {
        pergunta: "Qual é o maior osso do corpo humano?",
        alternativas: ["Tíbia", "Fêmur", "Úmero", "Rádio"],
        correta: 1
    },
    {
        pergunta: "Qual órgão é responsável por bombear o sangue pelo corpo?",
        alternativas: ["Pulmão", "Cérebro", "Coração", "Fígado"],
        correta: 2
    },
    {
        pergunta: "Qual músculo está localizado na parte anterior do braço e participa da flexão do cotovelo?",
        alternativas: ["Bíceps", "Tríceps", "Trapézio", "Peitoral"],
        correta: 0
    },
    {
        pergunta: "Qual grupo muscular está localizado principalmente na parte anterior da coxa?",
        alternativas: ["Dorsais", "Quadríceps", "Panturrilha", "Peitorais"],
        correta: 1
    },
    {
        pergunta: "Qual sistema do corpo é responsável principalmente pelo transporte de oxigênio e nutrientes pelo organismo?",
        alternativas: ["Sistema circulatório", "Sistema digestório", "Sistema nervoso", "Sistema esquelético"],
        correta: 0
    },
    {
        pergunta: "Qual estrutura protege o cérebro?",
        alternativas: ["Esterno", "Crânio", "Fêmur", "Escápula"],
        correta: 1
    },

    // EXERCÍCIOS
    {
        pergunta: "Qual exercício é conhecido por trabalhar principalmente os músculos das pernas e glúteos?",
        alternativas: ["Agachamento", "Rosca direta", "Elevação lateral", "Flexão de punho"],
        correta: 0
    },
    {
        pergunta: "Qual exercício utiliza principalmente o peso do próprio corpo para trabalhar peito, braços e outros músculos?",
        alternativas: ["Flexão de braço", "Abdominal", "Caminhada", "Alongamento"],
        correta: 0
    },
    {
        pergunta: "Qual atividade é considerada um exercício predominantemente aeróbico?",
        alternativas: ["Corrida", "Rosca direta", "Supino", "Agachamento"],
        correta: 0
    },
    {
        pergunta: "Qual é uma finalidade comum do alongamento?",
        alternativas: [
            "Trabalhar exclusivamente a força máxima",
            "Auxiliar na flexibilidade",
            "Substituir todas as atividades físicas",
            "Aumentar diretamente a massa óssea"
        ],
        correta: 1
    },
    {
        pergunta: "Durante um exercício físico, o aquecimento é utilizado principalmente para:",
        alternativas: [
            "Preparar o corpo para a atividade",
            "Substituir o treino principal",
            "Eliminar a necessidade de hidratação",
            "Impedir qualquer aumento da frequência cardíaca"
        ],
        correta: 0
    },
    {
        pergunta: "Qual atividade utiliza movimentos repetitivos para deslocamento sobre uma bicicleta?",
        alternativas: ["Ciclismo", "Natação", "Vôlei", "Ginástica artística"],
        correta: 0
    },

    // ALIMENTAÇÃO
    {
        pergunta: "Qual nutriente é uma importante fonte de energia para o organismo?",
        alternativas: ["Carboidrato", "Água", "Mineral", "Fibra"],
        correta: 0
    },
    {
        pergunta: "Qual nutriente possui importante função na construção e manutenção dos tecidos do corpo?",
        alternativas: ["Proteína", "Água", "Sódio", "Fibra"],
        correta: 0
    },
    {
        pergunta: "Qual é uma função importante da água no organismo?",
        alternativas: [
            "Participar da hidratação e de diversas funções corporais",
            "Substituir todos os nutrientes",
            "Fornecer proteínas",
            "Substituir completamente os alimentos"
        ],
        correta: 0
    },
    {
        pergunta: "Qual opção representa uma alimentação mais variada e equilibrada?",
        alternativas: [
            "Apenas alimentos ultraprocessados",
            "Diversos grupos de alimentos em quantidades adequadas",
            "Somente alimentos ricos em açúcar",
            "Apenas alimentos ricos em gordura"
        ],
        correta: 1
    },
    {
        pergunta: "Qual destes alimentos é uma fonte de proteína?",
        alternativas: ["Ovo", "Refrigerante", "Açúcar", "Óleo"],
        correta: 0
    },
    {
        pergunta: "As frutas geralmente são importantes fontes de:",
        alternativas: ["Vitaminas e minerais", "Apenas proteínas", "Apenas gorduras", "Apenas cafeína"],
        correta: 0
    },

    // QUALIDADE DE VIDA
    {
        pergunta: "Qual hábito pode contribuir para uma melhor qualidade de vida?",
        alternativas: [
            "Praticar atividades físicas regularmente",
            "Dormir sempre poucas horas",
            "Evitar qualquer atividade física",
            "Substituir água por bebidas açucaradas"
        ],
        correta: 0
    },
    {
        pergunta: "O sedentarismo está relacionado principalmente a:",
        alternativas: [
            "Baixo nível de atividade física",
            "Prática diária de esportes",
            "Treinamento esportivo intenso",
            "Alto nível de mobilidade"
        ],
        correta: 0
    },
    {
        pergunta: "O descanso é importante para quem pratica exercícios porque:",
        alternativas: [
            "Contribui para a recuperação do organismo",
            "Elimina a necessidade de alimentação",
            "Impede qualquer adaptação ao exercício",
            "Substitui completamente o treinamento"
        ],
        correta: 0
    },
    {
        pergunta: "A prática regular de atividade física pode contribuir para:",
        alternativas: [
            "Melhora do condicionamento físico",
            "Aumento obrigatório do sedentarismo",
            "Redução permanente da mobilidade",
            "Eliminação da necessidade de descanso"
        ],
        correta: 0
    },
    {
        pergunta: "Qual destes hábitos está relacionado a um estilo de vida saudável?",
        alternativas: [
            "Manter alimentação equilibrada e praticar atividade física",
            "Passar o dia inteiro sentado",
            "Dormir pouco todos os dias",
            "Não beber água durante o dia"
        ],
        correta: 0
    },
    {
        pergunta: "Por que a hidratação é importante durante atividades físicas?",
        alternativas: [
            "Porque a água participa de diversas funções do organismo",
            "Porque substitui o treinamento",
            "Porque fornece todos os nutrientes necessários",
            "Porque elimina a necessidade de descanso"
        ],
        correta: 0
    }

];

module.exports = bancoPerguntas;