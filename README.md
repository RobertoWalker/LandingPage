# Backend local para o formulário de contato

Este backend minimal em Node.js/Express recebe submissões do formulário em `contato.html` e faz uma de duas coisas:

- Se variáveis SMTP estiverem configuradas, envia um email para o endereço configurado.
- Caso contrário, armazena as submissões em `submissions/submissions.json`.

Como usar (Windows PowerShell)

1. Instale dependências:

```powershell
cd 'c:\Users\Beto\Desktop\LandingPage'
npm install
```

2. Configure variáveis de ambiente (opcional para envio por email):

- Copie `.env.example` para `.env` e preencha com as informações do seu provedor SMTP, ou defina variáveis no ambiente.

3. Iniciar o servidor:

```powershell
# modo produção
npm start

# modo desenvolvimento (recarregamento automático)
npm run dev
```

4. Teste a integração:

- Abra o `index.html` no navegador:

```powershell
Start-Process 'c:\Users\Beto\Desktop\LandingPage\index.html'
```

- Clique em "Solicitar Orçamento" e envie o formulário. O frontend (arquivo `contato.html`) já aponta por padrão para `http://localhost:3000/api/contact`.

Observações

- Caso não queira configurar SMTP imediatamente, as submissões serão gravadas em `submissions/submissions.json`.
- Para enviar realmente por email, configure as variáveis `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` e `TO_EMAIL`.

Segurança e produção

- Para produção, use um processo manager (PM2) ou configure em um serviço de hospedagem com HTTPS.
- Proteja o endpoint de abusos (rate limit, reCAPTCHA) antes de publicar publicamente.
