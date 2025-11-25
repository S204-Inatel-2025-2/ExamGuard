# ExamGuard Frontend

Front-end do sistema de monitoramento de exames ExamGuard, que tem como objetivo auxiliar professores e fiscalizadores de prova a detectar atitudes tidas como suspeitas de alunos que estão realizando exames.

A versão web e já integrada ao Backend está disponível e pode ser encontrada no link abaixo
[![Live Demo](https://img.shields.io/badge/Live-Demo-orange?style=for-the-badge)](https://examguard.site/)

## Features
- 🔒 Login e Registro de Usuários
- 🔄 Dashboard com registro de momentos 
- 📖 Upload video 

## Tecnologias
- 🔄 Uso de React Router
- 🔒 TypeScript por padrão
- 🎉 TailwindCSS para estilização
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Instale as dependências:

```bash
npm install
```

### Development

Inicie o server de development com:

```bash
npm run dev
```

Sua aplicação estará disponível em `http://localhost:5173`.

## Build para a produção

Criação:

```bash
npm run build
```

## Deployment

### Docker Deployment

Para buildar e rodar usando docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```
A aplicação containerizada pode ser deployada para qualquer plataforma que permita Docker, incluindo:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

Se você é familiar com deployar aplicações Node, o servidor integrado ao app está pronto para produção
Faça o deploy do output de 'npm run build'

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

Built with ❤️ using React Router.
