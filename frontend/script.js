// =====================================================
// CONFIGURAÇÃO DA API
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

    document.getElementById("areaCadastro").style.display =
        "none";

    document.getElementById("areaLogin").style.display =
        "block";

    document.getElementById("textoLogin").textContent =
        "Entre na sua conta para jogar.";

}


function mostrarCadastro() {

    document.getElementById("areaLogin").style.display =
        "none";

    document.getElementById("areaCadastro").style.display =
        "block";

    document.getElementById("textoLogin").textContent =
        "Crie sua conta para começar.";

}


// =====================================================
// CADASTRAR USUÁRIO
// =====================================================

async function cadastrarUsuario() {

    const username =
        document.getElementById("username")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const senha =
        document.getElementById("senha")
            .value;


    if (!username || !email || !senha) {

        alert(
            "Preencha todos os campos."
        );

        return;

    }


    if (senha.length < 6) {

        alert(
            "A senha deve ter pelo menos 6 caracteres."
        );

        return;

    }


    try {

        // Cria a conta no Supabase Auth
        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: senha

            });


        if (error) {

            throw error;

        }


        if (!data.user) {

            throw new Error(
                "Não foi possível criar o usuário."
            );

        }


        // Salva o nome de usuário na tabela profiles
        const { error: erroPerfil } =
            await supabase
                .from("profiles")
                .insert({

                    id: data.user.id,

                    username: username

                });


        if (erroPerfil) {

            throw erroPerfil;

        }


        alert(
            "Conta criada com sucesso!"
        );


        document.getElementById("emailLogin").value =
            email;


        mostrarLogin();


    } catch (erro) {

        console.error(
            "Erro ao cadastrar:",
            erro
        );


        alert(
            "Não foi possível criar a conta: " +
            erro.message
        );

    }

}


// =====================================================
// ENTRAR NA CONTA
// =====================================================

async function entrarUsuario() {

    const email =
        document.getElementById("emailLogin")
            .value
            .trim();

    const senha =
        document.getElementById("senhaLogin")
            .value;


    if (!email || !senha) {

        alert(
            "Digite seu e-mail e sua senha."
        );

        return;

    }


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: senha

            });


        if (error) {

            throw error;

        }


        // Busca o perfil do usuário
        const { data: perfil, error: erroPerfil } =
            await supabase
                .from("profiles")
                .select("username")
                .eq("id", data.user.id)
                .single();


        if (erroPerfil) {

            throw erroPerfil;

        }


        // Usa o nome do perfil no quiz
        nomeJogador =
            perfil.username;


        alert(
            "Login realizado com sucesso!"
        );


        mostrarTela("inicio");


    } catch (erro) {

        console.error(
            "Erro ao entrar:",
            erro
        );


        alert(
            "E-mail ou senha incorretos."
        );

    }

}
// =====================================================
// BANCO DE PERGUNTAS
// As perguntas agora vêm da API
// =====================================================

let bancoPerguntas = [];


// Quantidade de perguntas em cada partida
const QUANTIDADE_PERGUNTAS = 20;


// =====================================================
// VARIÁVEIS DO JOGO
// =====================================================

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

        const resposta = await fetch(
            `${API_URL}/perguntas`
        );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar perguntas da API."
            );

        }


        bancoPerguntas = await resposta.json();


        console.log(
            "Perguntas carregadas pela API:",
            bancoPerguntas
        );


    } catch (erro) {

        console.error(erro);


        alert(
            "Não foi possível conectar com a API."
        );

    }

}


// =====================================================
// EMBARALHAR ARRAY
// =====================================================

function embaralhar(array) {

    const copia = [...array];


    for (
        let i = copia.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [copia[i], copia[j]] =
            [copia[j], copia[i]];

    }


    return copia;

}


// =====================================================
// MOSTRAR TELA
// =====================================================

function mostrarTela(id) {

    document
        .querySelectorAll(".tela")
        .forEach(tela => {

            tela.classList.remove("ativa");

        });


    document
        .getElementById(id)
        .classList.add("ativa");

}


// =====================================================
// INICIAR QUIZ
// =====================================================

async function iniciarQuiz() {

    nomeJogador =
        document
            .getElementById("nomeJogador")
            .value
            .trim();


    if (nomeJogador === "") {

        alert(
            "Digite seu nome para começar!"
        );

        return;

    }


    if (bancoPerguntas.length === 0) {

        alert(
            "As perguntas ainda não foram carregadas."
        );

        return;

    }


    // Escolhe 20 perguntas aleatórias
    perguntas =
        embaralhar(bancoPerguntas)
            .slice(
                0,
                QUANTIDADE_PERGUNTAS
            );


    // Reinicia o jogo
    perguntaAtual = 0;
    pontos = 0;
    acertos = 0;


    mostrarTela("quiz");


    carregarPergunta();

}


// =====================================================
// CARREGAR PERGUNTA
// =====================================================

function carregarPergunta() {

    respostaSelecionada = false;


    const pergunta =
        perguntas[perguntaAtual];


    document
        .getElementById("numeroPergunta")
        .textContent =
        `Pergunta ${perguntaAtual + 1}/${perguntas.length}`;


    document
        .getElementById("pontuacao")
        .textContent =
        `Pontos: ${pontos}`;


    document
        .getElementById("pergunta")
        .textContent =
        pergunta.pergunta;


    const alternativas =
        document.getElementById(
            "alternativas"
        );


    alternativas.innerHTML = "";


    // Embaralha as alternativas
    const alternativasEmbaralhadas =
        pergunta.alternativas.map(
            (texto, indice) => ({

                texto: texto,

                correta:
                    indice === pergunta.correta

            })
        );


    const alternativasFinal =
        embaralhar(
            alternativasEmbaralhadas
        );


    alternativasFinal.forEach(
        alternativa => {

            const botao =
                document.createElement(
                    "button"
                );


            botao.className =
                "alternativa";


            botao.textContent =
                alternativa.texto;


            botao.onclick = () => {

                selecionarResposta(
                    alternativa.correta,
                    botao
                );

            };


            alternativas.appendChild(
                botao
            );

        }
    );


    document
        .getElementById("proxima")
        .disabled = true;


    const porcentagem =
        (perguntaAtual /
            perguntas.length) * 100;


    document
        .getElementById("progresso")
        .style.width =
        `${porcentagem}%`;

}


// =====================================================
// SELECIONAR RESPOSTA
// =====================================================

function selecionarResposta(
    correta,
    botao
) {

    if (respostaSelecionada) {

        return;

    }


    respostaSelecionada = true;


    const botoes =
        document.querySelectorAll(
            ".alternativa"
        );


    botoes.forEach(b => {

        b.disabled = true;

    });


    if (correta) {

        botao.classList.add(
            "correta"
        );


        pontos += 10;

        acertos++;


    } else {

        botao.classList.add(
            "errada"
        );


        // Procura a alternativa correta
        botoes.forEach(b => {

            const perguntaOriginal =
                perguntas[perguntaAtual];


            if (
                b.textContent ===
                perguntaOriginal
                    .alternativas[
                        perguntaOriginal.correta
                    ]
            ) {

                b.classList.add(
                    "correta"
                );

            }

        });

    }


    document
        .getElementById("pontuacao")
        .textContent =
        `Pontos: ${pontos}`;


    document
        .getElementById("proxima")
        .disabled = false;

}


// =====================================================
// PRÓXIMA PERGUNTA
// =====================================================

function proximaPergunta() {

    perguntaAtual++;


    if (
        perguntaAtual >=
        perguntas.length
    ) {

        finalizarQuiz();

    } else {

        carregarPergunta();

    }

}


// =====================================================
// FINALIZAR QUIZ
// =====================================================

function finalizarQuiz() {

    document
        .getElementById("nomeResultado")
        .textContent =
        nomeJogador;


    document
        .getElementById("pontuacaoFinal")
        .textContent =
        `Pontuação: ${pontos} pontos`;


    document
        .getElementById("acertosFinal")
        .textContent =
        `Acertos: ${acertos} de ${perguntas.length}`;


    const porcentagem =
        (acertos /
            perguntas.length) * 100;


    if (porcentagem >= 80) {

        document
            .getElementById(
                "mensagemResultado"
            )
            .textContent =
            "Excelente! Você demonstrou ótimos conhecimentos.";


    } else if (porcentagem >= 50) {

        document
            .getElementById(
                "mensagemResultado"
            )
            .textContent =
            "Muito bem! Continue estudando para melhorar.";


    } else {

        document
            .getElementById(
                "mensagemResultado"
            )
            .textContent =
            "Continue estudando e tente novamente!";

    }


    document
        .getElementById("progresso")
        .style.width =
        "100%";


    mostrarTela("resultado");

}


// =====================================================
// SALVAR RESULTADO NA API
// =====================================================

async function salvarResultado() {

    try {

        const resposta =
            await fetch(
                `${API_URL}/ranking`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            nome:
                                nomeJogador,

                            pontos:
                                pontos,

                            acertos:
                                acertos,

                            totalPerguntas:
                                perguntas.length

                        })

                }
            );


        const dados =
            await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                "Erro ao salvar resultado."
            );

        }


        alert(
            "Resultado salvo no ranking!"
        );


        mostrarRanking();


    } catch (erro) {

        console.error(erro);


        alert(
            "Não foi possível salvar o resultado."
        );

    }

}


// =====================================================
// MOSTRAR RANKING
// =====================================================

async function mostrarRanking() {

    const lista =
        document.getElementById(
            "listaRanking"
        );


    lista.innerHTML =
        `<div class="sem-ranking">
            Carregando ranking...
        </div>`;


    try {

        const resposta =
            await fetch(
                `${API_URL}/ranking`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar ranking."
            );

        }


        const ranking =
            await resposta.json();


        lista.innerHTML = "";


        if (ranking.length === 0) {

            lista.innerHTML =
                `<div class="sem-ranking">
                    Nenhum resultado registrado ainda.
                </div>`;


        } else {

            ranking.forEach(
                (jogador, indice) => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "jogador-ranking";


                    item.innerHTML = `
                        <span>
                            <span class="posicao">
                                ${indice + 1}º
                            </span>

                            ${jogador.nome}
                        </span>

                        <span>
                            ${jogador.pontos} pts
                        </span>
                    `;


                    lista.appendChild(
                        item
                    );

                }
            );

        }


        mostrarTela("ranking");


    } catch (erro) {

        console.error(erro);


        lista.innerHTML =
            `<div class="sem-ranking">
                Não foi possível carregar o ranking.
            </div>`;


        mostrarTela("ranking");

    }

}


// =====================================================
// VOLTAR AO INÍCIO
// =====================================================

function voltarInicio() {

    document
        .getElementById("nomeJogador")
        .value = "";


    mostrarTela("inicio");

}


// =====================================================
// CARREGAR AS PERGUNTAS AO ABRIR O SITE
// =====================================================

carregarBancoPerguntas();