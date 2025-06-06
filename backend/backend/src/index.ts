import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./config/ormconfig"; // ou "./data-source", conforme sua organização
import usuarioRoutes from "./routes/Usuario.routes";
import authRoutes from "./routes/Auth.routes";
import settingRoutes from "./routes/UsuarioSettings.routes";
import comentarioRoutes from "./routes/Comentario.routes";
import materialRoutes from "./routes/Materiais.routes";
import likeRoutes from "./routes/Like.routes";
import categoriaRoutes from "./routes/Categoria.route";
import bcrypt from "bcrypt";
import { Role, Usuario } from "./entity/Usuario";
import { Categoria } from "./entity/Categoria";


const app = express();

// Configuração do CORS (ajuste as opções conforme necessário)
app.use(cors());
app.options("*", cors());

// Middleware para converter o body das requisições em JSON
app.use(express.json());

// Rotas da aplicação
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/comentario", comentarioRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/categoria", categoriaRoutes);

// Defina a porta do servidor
const PORT = process.env.PORT || 3000;

// Inicializando a conexão com o banco e iniciando o servidor
AppDataSource.initialize()
    .then(async () => {
        console.log("Banco de dados conectado!");
        await seedAdminUser();
        await seedCategorias();
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((error) => console.error("Erro ao conectar ao banco de dados:", error));

async function seedAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPassword = process.env.ADMIN_PASSWORD!; 

    const userRepository = AppDataSource.getRepository(Usuario);
    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
        const adminUser = userRepository.create({
            email: adminEmail,
            nome: "Administrador",
            apelido: "admin1",
            senha: bcrypt.hashSync(adminPassword, 8),
            role: Role.ADMIN,
        });
        await userRepository.save(adminUser);
        console.log("Usuário admin padrão criado.");
    } else {
        console.log("Usuário admin já existe.");
    }
}

async function seedCategorias() {
    const categoriaRepo = AppDataSource.getRepository(Categoria);
    const count = await categoriaRepo.count();

    if (count === 0) {
        const categorias = [
            { nome: "Programação", descricao: "Área de desenvolvimento" },
            { nome: "Cibersegurança", descricao: "Área de segurança digital" },
            { nome: "Design", descricao: "Área de design visual e UX/UI" },
            { nome: "Dados", descricao: "Área de análise e ciência de dados" },
        ];

        for (const cat of categorias) {
            const nova = categoriaRepo.create(cat);
            await categoriaRepo.save(nova);
        }

        console.log("✅ Categorias iniciais criadas!");
    } else {
        console.log("ℹ️ Categorias já existem.");
    }
}


export default app;