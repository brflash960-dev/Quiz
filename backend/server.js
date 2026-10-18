require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORTA = process.env.PORT || 3000;

// =====================================================
// CONFIGURAÇÃO DO SUPABASE
// =====================================================
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("ERRO: Configure SUPABASE_URL e SUPABASE_SECRET_KEY.");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

// =====================================================
// MIDDLEWARES E FRONTEND
// =====================================================
app.use(cors());
app.use(express.json());

const caminhoFrontend = path.join(__dirname, "..", "frontend");

app.use(express.static(caminhoFrontend));

app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "index.html"));
});

// =====================================================
// BUSCAR E-MAIL PELO NOME DE USUÁRIO
// =====================================================
app.post("/api/buscar-usuario", async (req, res) => {
    try {
        const username = String(req.body.username || "").trim().toLowerCase();

        if (!username) {
            return res.status(400).json({
                erro: "Digite seu nome de usuário."
            });
        }

        const { data: perfil, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (error) throw error;

        if (!perfil) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        const { data, error: erroAuth } =
            await supabase.auth.admin.getUserById(perfil.id);

        if (erroAuth) throw erroAuth;

        if (!data.user || !data.user.email) {
            return res.status(404).json({
                erro: "Conta não encontrada."
            });
        }

        res.json({ email: data.user.email });

    } catch (erro) {
        console.error("Erro ao buscar usuário:", erro);

        res.status(500).json({
            erro: "Não foi possível verificar o usuário."
        });
    }
});

// =====================================================
// LISTAR PERGUNTAS
// =====================================================
app.get("/api/perguntas", (req, res) => {
    try {
        const perguntas = require("./perguntas");

        if (!Array.isArray(perguntas)) {
            return res.status(500).json({
                erro: "O banco de perguntas está em formato inválido."
            });
        }

        const embaralhadas = [...perguntas];

        for (let i = embaralhadas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [embaralhadas[i], embaralhadas[j]] =
                [embaralhadas[j], embaralhadas[i]];
        }

        res.json(embaralhadas.slice(0, 20));

    } catch (erro) {
        console.error("Erro ao carregar perguntas:", erro);

        res.status(500).json({
            erro: "Não foi possível carregar as perguntas."
        });
    }
});

// =====================================================
// LISTAR RANKING
// =====================================================
app.get("/api/ranking", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ranking")
            .select("*")
            .order("pontos", { ascending: false });

        if (error) throw error;

        res.json(data);

    } catch (erro) {
        console.error("Erro ao buscar ranking:", erro);

        res.status(500).json({
            erro: "Não foi possível carregar o ranking."
        });
    }
});

// =====================================================
// SALVAR RESULTADO
// =====================================================
app.post("/api/ranking", async (req, res) => {
    try {
        const { nome, pontos, acertos, totalPerguntas } = req.body;

        if (
            typeof nome !== "string" ||
            !nome.trim() ||
            typeof pontos !== "number"
        ) {
            return res.status(400).json({
                erro: "Nome e pontuação são obrigatórios."
            });
        }

        const { data, error } = await supabase
            .from("ranking")
            .insert({
                nome: nome.trim(),
                pontos,
                acertos: acertos || 0,
                total_perguntas: totalPerguntas || 0
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);

    } catch (erro) {
        console.error("Erro ao salvar ranking:", erro);

        res.status(500).json({
            erro: "Não foi possível salvar o resultado."
        });
    }
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================
app.listen(PORTA, "0.0.0.0", () => {
    console.log(`Servidor funcionando na porta ${PORTA}`);
});