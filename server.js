require('dotenv').config(); // já deve existir

const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');


// Criar conta de teste Ethereal
async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('Credenciais Ethereal criadas:');
  console.log('- Email:', testAccount.user);
  console.log('- Senha:', testAccount.pass);
  console.log('Ver emails em: https://ethereal.email');
  return testAccount;
}

const app = express();
const upload = multer(); // para receber multipart/form-data sem arquivos

// Servir arquivos estáticos da pasta atual (LandingPage)
app.use(express.static(__dirname));

// CORS só é necessário para APIs externas, mas mantido para flexibilidade
app.use(cors());

const PORT = process.env.PORT || 3000;

// Redireciona / para index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para receber o formulário
app.post('/api/contact', upload.none(), async (req, res) => {
  try {
    const { nome, email, assunto, mensagem } = req.body || {};

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios.' });
    }

    try {
      // Criar conta de teste se não existir
      const testAccount = await createTestAccount();

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true se usar 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // DEBUG: log básico (remova depois)
      console.log('SMTP_USER:', process.env.SMTP_USER ? '[ok]' : '[MISSING]');
      console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

      // Verifica conexão/auth com o servidor SMTP
      transporter.verify((err, success) => {
        if (err) {
          console.error('SMTP verify failed:', err);
        } else {
          console.log('SMTP ready to send');
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.TO_EMAIL,         // vai para betopmello2015@gmail.com
        replyTo: email,                  // permite responder direto para o remetente do formulário
        subject: `[Landing Page] ${assunto || 'Solicitação de Orçamento'} - ${nome}`,
        text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto || ''}\n\nMensagem:\n${mensagem || ''}`,
        html: `<p><strong>Nome:</strong> ${nome}</p><p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p><p><strong>Assunto:</strong> ${assunto || ''}</p><hr><p style="white-space:pre-wrap">${mensagem || ''}</p>`
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado! Ver em:', nodemailer.getTestMessageUrl(info));
      return res.json({ 
        ok: true, 
        message: 'Email enviado com sucesso! Visualize em: ' + nodemailer.getTestMessageUrl(info),
        previewUrl: nodemailer.getTestMessageUrl(info)
      });

    } catch (err) {
      console.error('Erro:', err);
      return res.status(500).json({ error: 'Erro ao enviar email' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
