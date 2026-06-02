# 🚀 Configurar Variáveis de Ambiente no Vercel

## Por que deu erro?

O backend tenta usar Supabase Storage para fazer upload de imagens, mas as variáveis de ambiente `SUPABASE_URL` e `SUPABASE_ANON_KEY` não estão configuradas no Vercel.

## Como Configurar?

### Opção 1: Via Dashboard Vercel (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Selecione seu projeto **ChamaObra**
3. Vá para **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
SUPABASE_URL = https://seu-projeto.supabase.co
SUPABASE_ANON_KEY = sua-chave-anonima-aqui
```

5. Clique em **Save**
6. Redeploy seu projeto (Settings → Deployments → Redeploy)

### Opção 2: Obter as Credenciais do Supabase

1. Acesse seu projeto no https://supabase.com
2. Vá para **Project Settings** → **API**
3. Copie:
   - **Project URL** → Cole como `SUPABASE_URL`
   - **anon public** → Cole como `SUPABASE_ANON_KEY`

### Opção 3: Via Variáveis Locais (.env)

Se quiser testar localmente antes de fazer deploy:

1. Crie arquivo `backend/.env`:
```env
DB_HOST=seu-host
DB_USER=seu-usuario
DB_NAME=seu-banco
DB_PORT=5432
DB_PASSWORD=sua-senha
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
JWT_SECRET=sua-chave-jwt
```

2. Execute: `npm install` e `npm run dev`

---

## Checklist

- [ ] Criei projeto no Supabase
- [ ] Copiei `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- [ ] Adicionei variáveis no Vercel Dashboard
- [ ] Fiz redeploy do projeto
- [ ] Testei login novamente

**Depois de fazer isso, o erro deve desaparecer!** ✅
