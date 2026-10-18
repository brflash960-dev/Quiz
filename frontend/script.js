// =====================================================
// CONFIGURAÇÃO
// =====================================================
const API_URL = "https://quiz-bcvk.onrender.com/api";

const SUPABASE_URL = "https://ootnndpvyhnoskfpdlgv.supabase.co";
const SUPABASE_KEY = "sb_publishable_DZjEvBr8mbfdLHlE4bk2Og_IfFedOt7";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// =====================================================
// LOGIN E CADASTRO
// =====================================================
function mostrarLogin() {
    document.getElementById("areaCadastro").style.display = "none";
    document.getElementById("areaLogin").style.display = "block";
    document.getElementById("textoLogin").textContent =
        "Entre na sua conta para jogar.";
}

function mostrarCadastro() {
    document.getElementById("areaLogin").style.display = "none";
    document.getElementById("areaCadastro").style.display = "block";
    document.getElementById("textoLogin").textContent =
        "Crie sua conta para começar.";
}

// =====================================================
// CADASTRAR USUÁRIO
// =====================================================
async function cadastrarUsuario() {
    const username = document.getElementById("username").value.trim().toLowerCase();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    if (!username || !email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password: senha,
            options: {
                data: { username }
            }
        });

        if (error) throw error;

        if (!data.user) {
            throw new Error("Não foi possível criar a conta.");
        }

        alert(
            "Cadastro enviado! Se o Supabase solicitar confirmação por e-mail, confirme sua conta antes de entrar."
        );

        document.getElementById("emailLogin").value = username;
        document.getElementById("senhaLogin").value = "";
        mostrarLogin();

    } catch (erro) {
        console.error("Erro no cadastro:", erro);

        if (
            erro.message.toLowerCase().includes("profiles_username_key") ||
            erro.message.toLowerCase().includes("duplicate key")
        ) {
            alert("Esse nome de usuário já está sendo utilizado.");
        } else if (
            erro.message.toLowerCase().includes("already registered")
        ) {
            alert("Esse e-mail já possui uma conta. Entre nela.");
        } else {
            alert("Não foi possível criar a conta: " + erro.message);
        }
    }
}

// =====================================================
// ENTRAR COM NOME DE USUÁRIO E SENHA
// =====================================================
async function entrarUsuario() {
    const username = document.getElementById("emailLogin").value.trim().toLowerCase();
    const senha = document.getElementById("senhaLogin").value;

    if (!username || !senha) {
        alert("Digite seu nome de usuário e sua senha.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/buscar-usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || "Usuário não encontrado.");
        }

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: resultado.email,
            password: senha
        });

        if (error) throw error;

        const { data: perfil, error: erroPerfil } = await supabaseClient
            .from("profiles")
            .select("username")
            .eq("id", data.user.id)
            .single();

        if (erroPerfil) throw erroPerfil;

        // Guarda o nome cadastrado para usar durante todo o jogo
        nomeJogador = perfil.username;

        document.getElementById("senhaLogin").value = "";

        alert("Login realizado com sucesso!");
        mostrarTela("inicio");

    } catch (erro) {
        console.error("Erro ao entrar:", erro);
        alert(
            erro.message === "Usuário não encontrado."
                ? "Nome de usuário não encontrado."
                : "Não foi possível entrar. Confira seu usuário e sua senha."
        );
    }
}

// =====================================================
// BANCO DE PERGUNTAS E VARIÁVEIS DO JOGO
// =====================================================
let bancoPerguntas = [];
const QUANTIDADE_PERGUNTAS = 20;

let perguntas = [];
let perguntaAtual = 0;
let pontos = 0;
let acertos = 0;
let nomeJogador = "";
let respostaSelecionada = false;

// =====================================================
// CARREGAR PERGUNTAS DA API
// =====================================================
async function carregarBancoPerguntas() {
    try {
        const resposta = await fetch(`${API_URL}/perguntas`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar perguntas da API.");
        }

        bancoPerguntas = await resposta.json();
        console.log("Perguntas carregadas pela API:", bancoPerguntas);

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível conectar com a API.");
    }
}

// =====================================================
// EMBARALHAR ARRAY
// =====================================================
function embaralhar(array) {
    const copia = [...array];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

// =====================================================
// MOSTRAR TELA
// =====================================================
function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
    });

    document.getElementById(id).classList.add("ativa");
}

// =====================================================
// INICIAR QUIZ
// =====================================================
function iniciarQuiz() {
    if (!nomeJogador) {
        alert("Faça login antes de começar.");
        mostrarTela("login");
        return;
    }

    if (bancoPerguntas.length === 0) {
        alert("As perguntas ainda não foram carregadas.");
        return;
    }

    perguntas = embaralhar(bancoPerguntas).slice(0, QUANTIDADE_PERGUNTAS);
    perguntaAtual = 0;
    pontos = 0;
    acertos = 0;
    respostaSelecionada = false;

    mostrarTela("quiz");
    carregarPergunta();
}

// =====================================================
// CARREGAR PERGUNTA
// =====================================================
function carregarPergunta() {
    respostaSelecionada = false;

    const pergunta = perguntas[perguntaAtual];

    document.getElementById("numeroPergunta").textContent =
        `Pergunta ${perguntaAtual + 1}/${perguntas.length}`;

    document.getElementById("pontuacao").textContent =
        `Pontos: ${pontos}`;

    document.getElementById("pergunta").textContent = pergunta.pergunta;

    const alternativas = document.getElementById("alternativas");
    alternativas.innerHTML = "";

    const alternativasEmbaralhadas = pergunta.alternativas.map(
        (texto, indice) => ({
            texto,
            correta: indice === pergunta.correta
        })
    );

    embaralhar(alternativasEmbaralhadas).forEach(alternativa => {
        const botao = document.createElement("button");
        botao.className = "alternativa";
        botao.textContent = alternativa.texto;

        botao.onclick = () => {
            selecionarResposta(alternativa.correta, botao);
        };

        alternativas.appendChild(botao);
    });

    document.getElementById("proxima").disabled = true;

    document.getElementById("progresso").style.width =
        `${(perguntaAtual / perguntas.length) * 100}%`;
}

// =====================================================
// SELECIONAR RESPOSTA
// =====================================================
function selecionarResposta(correta, botao) {
    if (respostaSelecionada) return;

    respostaSelecionada = true;

    const botoes = document.querySelectorAll(".alternativa");
    botoes.forEach(b => {
        b.disabled = true;
    });

    if (correta) {
        botao.classList.add("correta");
        pontos += 10;
        acertos++;
    } else {
        botao.classList.add("errada");

        const perguntaOriginal = perguntas[perguntaAtual];
        const textoCorreto =
            perguntaOriginal.alternativas[perguntaOriginal.correta];

        botoes.forEach(b => {
            if (b.textContent === textoCorreto) {
                b.classList.add("correta");
            }
        });
    }

    document.getElementById("pontuacao").textContent =
        `Pontos: ${pontos}`;

    document.getElementById("proxima").disabled = false;
}

// =====================================================
// PRÓXIMA PERGUNTA
// =====================================================
function proximaPergunta() {
    perguntaAtual++;

    if (perguntaAtual >= perguntas.length) {
        finalizarQuiz();
    } else {
        carregarPergunta();
    }
}

// =====================================================
// FINALIZAR QUIZ
// =====================================================
function finalizarQuiz() {
    document.getElementById("nomeResultado").textContent = nomeJogador;

    document.getElementById("pontuacaoFinal").textContent =
        `Pontuação: ${pontos} pontos`;

    document.getElementById("acertosFinal").textContent =
        `Acertos: ${acertos} de ${perguntas.length}`;

    const porcentagem = (acertos / perguntas.length) * 100;

    if (porcentagem >= 80) {
        document.getElementById("mensagemResultado").textContent =
            "Excelente! Você demonstrou ótimos conhecimentos.";
    } else if (porcentagem >= 50) {
        document.getElementById("mensagemResultado").textContent =
            "Muito bem! Continue estudando para melhorar.";
    } else {
        document.getElementById("mensagemResultado").textContent =
            "Continue estudando e tente novamente!";
    }

    document.getElementById("progresso").style.width = "100%";
    mostrarTela("resultado");
}

// =====================================================
// SALVAR RESULTADO NO RANKING
// =====================================================
async function salvarResultado() {
    try {
        const resposta = await fetch(`${API_URL}/ranking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: nomeJogador,
                pontos,
                acertos,
                totalPerguntas: perguntas.length
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao salvar resultado.");
        }

        alert("Resultado salvo no ranking!");
        mostrarRanking();

    } catch (erro) {
        console.error(erro);
        alert("Não foi possível salvar o resultado.");
    }
}

// =====================================================
// MOSTRAR RANKING
// =====================================================
async function mostrarRanking() {
    const lista = document.getElementById("listaRanking");

    lista.textContent = "Carregando ranking...";

    try {
        const resposta = await fetch(`${API_URL}/ranking`);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar ranking.");
        }

        const ranking = await resposta.json();
        lista.innerHTML = "";

        if (ranking.length === 0) {
            lista.textContent = "Nenhum resultado registrado ainda.";
        } else {
            ranking.forEach((jogador, indice) => {
                const item = document.createElement("div");
                item.className = "jogador-ranking";

                const nome = document.createElement("span");
                nome.textContent = `${indice + 1}º ${jogador.nome}`;

                const pontuacao = document.createElement("span");
                pontuacao.textContent = `${jogador.pontos} pts`;

                item.append(nome, pontuacao);
                lista.appendChild(item);
            });
        }

        mostrarTela("ranking");

    } catch (erro) {
        console.error(erro);
        lista.textContent = "Não foi possível carregar o ranking.";
        mostrarTela("ranking");
    }
}

// =====================================================
// VOLTAR AO INÍCIO
// Mantém o nome da conta conectado
// =====================================================
function voltarInicio() {
    mostrarTela("inicio");
}

// =====================================================
// CARREGAR PERGUNTAS AO ABRIR O SITE
// =====================================================
carregarBancoPerguntas();