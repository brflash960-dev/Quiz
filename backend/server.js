require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORTA = process.env.PORT || 3000;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    console.error("ERRO: Configure SUPABASE_URL e SUPABASE_SECRET_KEY.");
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

app.use(cors());
app.use(express.json());

const caminhoFrontend = path.join(__dirname, "..", "frontend");
app.use(express.static(caminhoFrontend));

app.get("/", (req, res) => {
    res.sendFile(path.join(caminhoFrontend, "index.html"));
});

// Buscar o e-mail pelo nome de usuário para realizar o login.
app.post("/api/buscar-usuario", async (req, res) => {
    try {
        const username = String(req.body.username || "")
            .trim()
            .toLowerCase();

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

// Carregar até 20 perguntas aleatórias.
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

// Consultar ranking em ordem decrescente de pontuação.
app.get("/api/ranking", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ranking")
            .select("*")
            .order("pontos", { ascending: false })
            .order("data", { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (erro) {
        console.error("Erro ao buscar ranking:", erro);
        res.status(500).json({
            erro: "Não foi possível carregar o ranking."
        });
    }
});

// Salvar somente a melhor pontuação da conta autenticada.
app.post("/api/ranking", async (req, res) => {
    try {
        const { nome, pontos, acertos, totalPerguntas, accessToken } =
            req.body;

        if (
            typeof nome !== "string" ||
            !nome.trim() ||
            typeof pontos !== "number" ||
            !Number.isFinite(pontos) ||
            !Number.isInteger(pontos) ||
            pontos < 0
        ) {
            return res.status(400).json({
                erro: "Nome e pontuação válida são obrigatórios."
            });
        }

        if (
            typeof accessToken !== "string" ||
            !accessToken.trim()
        ) {
            return res.status(401).json({
                erro: "Faça login novamente para salvar sua pontuação."
            });
        }

        // Validar o token com o Supabase Auth.
        const { data: authData, error: authError } =
            await supabase.auth.getUser(accessToken);

        if (authError || !authData.user) {
            return res.status(401).json({
                erro: "Sua sessão expirou. Entre na conta novamente."
            });
        }

        const userId = authData.user.id;

        // Conferir o nome de usuário registrado para essa conta.
        const { data: perfil, error: perfilError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", userId)
            .maybeSingle();

        if (perfilError) throw perfilError;

        if (
            !perfil ||
            perfil.username.toLowerCase() !== nome.trim().toLowerCase()
        ) {
            return res.status(403).json({
                erro: "O nome informado não corresponde à conta conectada."
            });
        }

        const { data: existente, error: buscaError } = await supabase
            .from("ranking")
            .select("id, pontos, acertos, total_perguntas, nome, data")
            .eq("user_id", userId)
            .maybeSingle();

        if (buscaError) throw buscaError;

        const quantidadeAcertos =
            Number.isInteger(acertos) && acertos >= 0 ? acertos : 0;

        const quantidadePerguntas =
            Number.isInteger(totalPerguntas) && totalPerguntas >= 0
                ? totalPerguntas
                : 0;

        // Se a pontuação existente for igual ou maior, preservar o recorde.
        if (existente && existente.pontos >= pontos) {
            return res.json({
                mensagem: "Sua melhor pontuação foi mantida.",
                ranking: existente
            });
        }

        let resultado;

        if (existente) {
            const { data, error } = await supabase
                .from("ranking")
                .update({
                    nome: perfil.username,
                    pontos,
                    acertos: quantidadeAcertos,
                    total_perguntas: quantidadePerguntas,
                    data: new Date().toISOString()
                })
                .eq("user_id", userId)
                .select()
                .single();

            if (error) throw error;

            resultado = data;
        } else {
            const { data, error } = await supabase
                .from("ranking")
                .insert({
                    user_id: userId,
                    nome: perfil.username,
                    pontos,
                    acertos: quantidadeAcertos,
                    total_perguntas: quantidadePerguntas
                })
                .select()
                .single();

            if (error) throw error;

            resultado = data;
        }

        res.json({
            mensagem: "Melhor pontuação salva com sucesso!",
            ranking: resultado
        });
    } catch (erro) {
        console.error("Erro ao salvar ranking:", erro);
        res.status(500).json({
            erro: "Não foi possível salvar o resultado."
        });
    }
});

app.listen(PORTA, "0.0.0.0", () => {
    console.log(`Servidor funcionando na porta ${PORTA}`);
});