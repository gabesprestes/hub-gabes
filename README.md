# Hub Gabes

Hub pessoal na mesma premissa do hub do Alan:

- **Frontend estático** (Next.js → pasta `out/`)
- **GitHub Pages** para hospedar o site
- **Gist privado** como “banco” de dados (JSON)
- Login com **Personal Access Token** com scope **`gist` apenas**

## Módulos

- Prioridades da semana
- Pendências (Liderança / Quality / CSAT / Pessoal)
- Notas
- Links rápidos em caixinhas

## Desenvolvimento local

```bash
cd ~/Projects/hub-gabes
npm install
npm run dev
```

Abra http://localhost:3000

## Publicar no GitHub

1. Crie um repositório **público** chamado `hub-gabes` (Pages no plano free precisa ser público; os **dados** ficam no Gist privado).
2. No Terminal:

```bash
cd ~/Projects/hub-gabes
git add .
git commit -m "Initial Hub Gabes (Pages + Gist)"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/hub-gabes.git
git push -u origin main
```

3. No GitHub do repo: **Settings → Pages**
   - Source: **GitHub Actions**
4. Aguarde o workflow **Deploy Hub to GitHub Pages** ficar verde.
5. URL: `https://SEU_USUARIO.github.io/hub-gabes/`

Se o nome do repo for outro, altere `repo` em `next.config.ts`.

## Token (login)

1. GitHub → Settings → Developer settings → Personal access tokens
2. Gere um token com scope **`gist` apenas**
3. No hub, cole o token na tela de login

O hub cria/busca um Gist privado com a descrição definida em `GIST_DESCRIPTION` (`src/lib/types.ts`).

## Segurança

- Não commite o token
- Não compartilhe o token
- Repo pode ser público (só o código); dados ficam no Gist privado
