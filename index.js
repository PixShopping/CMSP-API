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
    });

    const page = await browser.newPage();

    await page.goto('https://cmspweb.ip.tv/'); // URL do site
  
    const ra = usuario.slice(0,12);
    const digito = usuario.slice(-1);
    
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const acesso = await page.waitForSelector('#access-student');
    if (acesso) {
      await page.click('#access-student');
    } else {
      console.log('botao acesso não encontrado')
    }
    
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.waitForSelector('#ra-student');
    await page.type('#ra-student', ra);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.waitForSelector('#digit-student');
    await page.type('#digit-student', digito);

    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    await page.waitForSelector('#password-student');
    await page.type('#password-student', senha);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Clique no botão de login (substitua o seletor apropriado)
    const logar = await page.waitForSelector('#btn-login-student');
    if (logar) {
      await page.click('#btn-login-student');
    } else {
      console.log('botao logar não encontrado')
    }

    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Espere segundos antes de continuar a execução
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    await page.screenshot({ path: 'screenshot.png' });

    /*const serie = await page.waitForSelector('#lproom_reccf9a77bbad38831-l');
    if (serie) {
      await page.click('#lproom_reccf9a77bbad38831-l');
    } else {
      console.log('botao serie não encontrado')
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const sala = await page.waitForSelector('#roomDetailConference');
    if (sala) {
      await page.click('#roomDetailConference');
    } else {
      console.log('botao sala não encontrado')
    }

    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Vitor Custódio da Silva, N° 36 está presente
    // Clica na sala de aula virtual
    await page.waitForSelector('#rpchntx');
    await page.type('#rpchntx', mensagem);
    await page.keyboard.press('Enter');*/

    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    await browser.close();

    return {
      status: `Mensagem ${mensagem} enviada com sucesso!`
    }
}


// ===== { ROTAS } ===== //

app.get('/presenca', (req, res) => {
  const usuario = req.query.usuario;
  const senha = decodeURIComponent(req.query.senha);
  const mensagem = decodeURIComponent(req.query.mensagem);
  
  // Verifica se o usuário e a senha foram fornecidos na URL
  if (!usuario || !senha || !mensagem) {
    return res.status(400).json({ error: 'Usuário, Senha e Mensagem são obrigatórios.' });
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