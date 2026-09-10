const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();

const PORTA = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// ===============================
// CONEXÃO COM O SUPABASE
// ===============================

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);


// ===============================
// ROTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
    res.json({
        mensagem: "API do Quiz de Educação Física e Saúde funcionando!"
    });
});


// ===============================
// PERGUNTAS
// ===============================

const bancoPerguntas = require("./perguntas");

app.get("/api/perguntas", (req, res) => {
    res.json(bancoPerguntas);
});


// ===============================
// BUSCAR RANKING
// ===============================

app.get("/api/ranking", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("ranking")
            .select("*")
            .order("pontos", {
                ascending: false
            })
            .limit(10);

        if (error) {
            console.error("Erro ao buscar ranking:", error);

            return res.status(500).json({
                erro: "Não foi possível carregar o ranking."
            });
        }

        res.json(data);

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro interno do servidor."
        });
    }
});


// ===============================
// SALVAR RESULTADO
// ===============================

app.post("/api/ranking", async (req, res) => {

    try {

        const {
            nome,
            pontos,
            acertos,
            totalPerguntas
        } = req.body;


        // Verificar os dados recebidos

        if (
            !nome ||
            typeof pontos !== "number"
        ) {

            return res.status(400).json({
                erro: "Nome e pontuação são obrigatórios."
            });
        }


        // Criar resultado

        const novoResultado = {
            nome: nome,
            pontos: pontos,
            acertos: typeof acertos === "number"
                ? acertos
                : 0,
            total_perguntas:
                typeof totalPerguntas === "number"
                    ? totalPerguntas
                    : 0
        };


        // Salvar no Supabase

        const { data, error } = await supabase
            .from("ranking")
            .insert([novoResultado])
            .select();


        if (error) {

            console.error(
                "Erro ao salvar resultado:",
                error
            );

            return res.status(500).json({
                erro: "Não foi possível salvar o resultado."
            });
        }


        // Retornar resultado salvo

        res.status(201).json({
            mensagem: "Resultado salvo com sucesso!",
            resultado: data[0]
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: "Erro interno do servidor."
        });
    }
});


// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(
    PORTA,
    "0.0.0.0",
    () => {

        console.log(
            `API funcionando na porta ${PORTA}`
        );

    }
);