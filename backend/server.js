app.post("/api/buscar-usuario", async (req, res) => {
    try {
        const username = String(
            req.body.username || ""
        ).trim();

        if (!username) {
            return res.status(400).json({
                erro: "Digite seu nome de usuário."
            });
        }

        // Procura o nome de usuário cadastrado
        const { data: perfil, error } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (error) {
            throw error;
        }

        if (!perfil) {
            return res.status(404).json({
                erro: "Usuário não encontrado."
            });
        }

        // Recupera o e-mail associado à conta
        const { data, error: erroAuth } =
            await supabase.auth.admin.getUserById(
                perfil.id
            );

        if (erroAuth) {
            throw erroAuth;
        }

        if (!data.user || !data.user.email) {
            return res.status(404).json({
                erro: "Conta não encontrada."
            });
        }

        res.json({
            email: data.user.email
        });

    } catch (erro) {
        console.error(
            "Erro ao buscar usuário:",
            erro
        );

        res.status(500).json({
            erro: "Não foi possível verificar o usuário."
        });
    }
});

app.listen(PORTA, "0.0.0.0", () => {
    console.log(`Servidor funcionando na porta ${PORTA}`);
});