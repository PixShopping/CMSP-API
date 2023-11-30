// BIBLIOTECAS
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs =  require('fs');

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

async function autoFillAndSubmitForm(usuario, senha, mensagem) {
    const browser = await puppeteer.launch({
        headless: true, // Torna o navegador visível
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
  
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (
        request.resourceType() === 'image' ||
        request.resourceType() === 'stylesheet'
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    await page.goto('https://cmspweb.ip.tv/'); // URL do site
  
    const ra = usuario.slice(0,12);
    const digito = usuario.slice(-1);
    
    await page.waitForSelector('#access-student');
    await page.click('#access-student');

    await page.waitForSelector('#ra-student');
    await page.type('#ra-student', ra);

    await page.waitForSelector('#digit-student');
    await page.type('#digit-student', digito);
    
    await page.waitForSelector('#password-student');
    await page.type('#password-student', senha);
    
    // Clique no botão de login (substitua o seletor apropriado)
    await page.waitForSelector('#btn-login-student');
    await page.click('#btn-login-student');
    
    // Espere segundos antes de continuar a execução
    await new Promise((resolve) => setTimeout(resolve, 20000));
    
    await page.waitForSelector('#lproom_reccf9a77bbad38831-l');
    await page.click('#lproom_reccf9a77bbad38831-l');

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.waitForSelector('#roomDetailConference');
    await page.click('#roomDetailConference');
    
    await new Promise((resolve) => setTimeout(resolve, 12000));

    // Vitor Custódio da Silva, N° 36 está presente
    // Clica na sala de aula virtual
    await page.waitForSelector('#rpchntx');
    await page.type('#rpchntx', mensagem);
    await page.keyboard.press('Enter');
    
    await browser.close();

    return {
      status: `Mensagem ${mensagem} enviada com sucesso!`
    }
}


// ===== { ROTAS } ===== //

app.get('/login', (req, res) => {
  const usuario = req.query.usuario;
  const senhaAlterada = req.query.senha;
  const mensagem = req.query.mensagem;
  const senha = decodeURIComponent(senhaAlterada);

  // Verifica se o usuário e a senha foram fornecidos na URL
  if (!usuario || !senha) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  // Chama a função para preencher o formulário e fazer login com os parâmetros recebidos
  autoFillAndSubmitForm(usuario, senha, mensagem)
    .then((data) => {
      return res.json(data);
    })
    .catch((error) => {
      console.error('Erro ao preencher o formulário e fazer login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    });
});

// Inicializa o servidor
app.listen(port, () => {
  console.log('Servidor está rodando na porta ' + port);
});