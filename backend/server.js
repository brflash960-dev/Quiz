require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORTA = process.env.PORT || 3000;

// Verifica se as informações do Supabase existem
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("ERRO: As variáveis do Supabase não foram configuradas.");
    process.exit(1);
}

// Conexão com o Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

app.use(cors());
app.use(express.json());

// Caminho da pasta frontend
const caminhoFrontend = path.join(__dirname, "..", "frontend");
app.use(express.static(caminhoFrontend));

app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "index.html"));
});

// Faz o servidor abrir o site do quiz
app.use(express.static(caminhoFrontend));

// ROTA PRINCIPAL
app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "index.html"));
});
// Faz o servidor abrir o site do quiz
app.use(express.static(caminhoFrontend));

// Importa as perguntas
const bancoPerguntas = require("./perguntas");

// ===============================
// ROTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "index.html"));
});

// ===============================
// API DE PERGUNTAS
// ===============================

app.get("/api/perguntas", (req, res) => {
    const perguntasSorteadas = [...bancoPerguntas]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

    res.json(perguntasSorteadas);
});

// ===============================
// API DO RANKING - BUSCAR
// ===============================

app.get("/api/ranking", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ranking")
            .select("*")
            .order("pontos", { ascending: false })
            .limit(10);

        if (error) {
            console.error("Erro ao buscar ranking:", error);
            return res.status(500).json({
                erro: "Não foi possível carregar o ranking."
            });
        }

        res.json(data || []);

    } catch (erro) {
        console.error("Erro:", erro);

        res.status(500).json({
            erro: "Erro interno ao carregar o ranking."
        });
    }
});

// ===============================
// API DO RANKING - SALVAR
// ===============================

app.post("/api/ranking", async (req, res) => {
    try {
        const {
            nome,
            pontos,
            acertos,
            totalPerguntas
        } = req.body;

        // Verificação dos dados
        if (!nome || typeof pontos !== "number") {
            return res.status(400).json({
                erro: "Nome e pontuação são obrigatórios."
            });
        }

        // Salva no Supabase
        const { data, error } = await supabase
            .from("ranking")
            .insert({
                nome: nome.trim(),
                pontos: pontos,
                acertos: acertos || 0,
                total_perguntas: totalPerguntas || 0
            })
            .select()
            .single();

        if (error) {
            console.error("Erro ao salvar ranking:", error);

            return res.status(500).json({
                erro: "Não foi possível salvar o resultado."
            });
        }

        res.status(201).json({
            mensagem: "Resultado salvo com sucesso!",
            resultado: data
        });

    } catch (erro) {
        console.error("Erro:", erro);

        res.status(500).json({
            erro: "Erro interno ao salvar o resultado."
        });
    }
});

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORTA, "0.0.0.0", () => {
    console.log(`Servidor funcionando na porta ${PORTA}`);
});