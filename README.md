# Lethícia Soares Doces

Sistema de gestão e cardápio digital para a doceria Lethícia Soares Doces, construído com Next.js (App Router), TypeScript, Tailwind CSS e Firebase (Firestore + Firebase Auth).

## Funcionalidades

**Cardápio digital (público)** — `/`
- Vitrine de produtos por categoria, com status aberto/fechado automático conforme o horário configurado.
- Carrinho de compras persistente (localStorage) e checkout com pedido automático: ao finalizar, o pedido já é salvo no Firestore e aparece no painel, sem depender de envio manual de WhatsApp. O WhatsApp fica disponível apenas como contato opcional.
- Visual inspirado em confeitarias delicadas: paleta creme/rosa bebê, fonte cursiva no nome da loja e sans-serif limpa no restante.

**Painel administrativo** — `/admin`
- Login com Firebase Auth (e-mail/senha) e sessão via cookie assinado (`firebase-admin` session cookies).
- Dashboard com pedidos do dia, total vendido e produtos mais pedidos.
- CRUD de categorias e produtos (com ficha técnica de insumos).
- Pedidos em formato kanban (Recebido → Em preparo → Pronto → Entregue), com alerta visual/sonoro de novo pedido.
- Configurações da loja: nome, logo, horário de funcionamento, WhatsApp, endereço, taxa de entrega, pedido mínimo e chave Pix.
- Clientes com histórico de pedidos e controle de fiado (saldo devedor, pagamentos parciais/totais).
- Financeiro: lançamentos de entradas/saídas, categorias financeiras, fluxo de caixa por período, contas a pagar e a receber, e relatório de lucro (receita − custo de insumos − despesas).
- Estoque de produtos e insumos, com baixa automática de insumos (via ficha técnica) e de produtos quando um pedido é criado.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Firebase Admin SDK (Firestore + sessão de autenticação) no servidor
- Firebase client SDK (Auth) no login do admin

## Configuração do Firebase

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com).
2. Ative o **Firestore Database** (modo produção) e o **Authentication** com o provedor E-mail/senha.
3. Crie o usuário do lojista em Authentication > Users (e-mail e senha usados para logar em `/admin/login`).
4. Em **Configurações do projeto > Contas de serviço**, gere uma nova chave privada — ela fornece `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY`.
5. Em **Configurações do projeto > Geral > Seus apps**, crie um app Web para obter as chaves `NEXT_PUBLIC_FIREBASE_*`.
6. Copie `.env.example` para `.env.local` e preencha todas as variáveis.

> A chave `FIREBASE_PRIVATE_KEY` deve manter as quebras de linha como `\n` (entre aspas), exatamente como vem no JSON da conta de serviço.

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para o cardápio digital e `http://localhost:3000/admin/login` para o painel administrativo.

Antes do primeiro uso, cadastre pelo menos uma categoria, um produto e configure a loja em `/admin/configuracoes` (nome, horário de funcionamento e WhatsApp) para que o cardápio público funcione corretamente.

## Build de produção

```bash
npm run build
npm run start
```
