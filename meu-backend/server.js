// Importar dependências
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');

// Conexão com MongoDB
const uri = "mongodb+srv://lazarodourado2007:lazarodourado2007@cluster0.zftyrs9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Inicializar o app express
const app = express();
app.use(bodyParser.json());

// Função para conectar e salvar os dados no MongoDB
async function salvarConversa(idUsuario, mensagemUsuario, mensagemBot) {
    try {
        await client.connect();
        const database = client.db("BancoDeDados");
        const bancodedados = database.collection("bancodedados");

        // Criação do documento que será salvo
        const conversa = {
            idUsuario: idUsuario,
            mensagemUsuario: mensagemUsuario,
            mensagemBot: mensagemBot,
            data: new Date()
        };

        // Inserção da conversa no banco
        await bancodedados.insertOne(conversa);
        console.log("Conversa salva no MongoDB!");

    } catch (error) {
        console.error("Erro ao salvar conversa:", error);
    } finally {
        await client.close();
    }
}

// Rota para receber os dados do front-end
app.post('/api/chat-historico', async (req, res) => {
  const MensagemUsuario = req.body.Usuario; // Nome corrigido para pegar do body corretamente
  const MensagemBot = req.body.Chat; // Nome corrigido para pegar a resposta do bot

  const idUsuario = await getMyPublicIP(); // Corrige o nome da variável aqui
  
  // Verifica se foi possível obter o IP
  if (!idUsuario) {
      return res.status(500).send('Erro ao obter o IP do usuário');
  }

  await salvarConversa(idUsuario, MensagemUsuario, MensagemBot); // Agora chama com as variáveis corretas
  res.status(200).send('Conversa salva com sucesso!');
});

// Iniciar o servidor
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

// Função para enviar os dados para o backend
async function enviarDados() {
  const idUsuario = await getMyPublicIP(); // Obtem o IP aqui
  const mensagemUsuario = document.getElementById("mensagem").value; // Obtém a mensagem do usuário
  const mensagemBot = "Resposta do bot"; // Aqui, coloque a resposta correta do bot

  if (!idUsuario) {
      console.error('Erro: não foi possível obter o IP do usuário.');
      return;
  }

  await fetch('/api/chat-historico', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          ID: idUsuario, // Certifique-se de que `idUsuario` está sendo obtido corretamente
          Usuario: mensagemUsuario,
          Chat: mensagemBot
      })
  }).then(response => response.json())
    .then(data => console.log("Conversa enviada com sucesso:", data))
    .catch(error => console.error("Erro ao enviar conversa:", error));
}

// Função para obter o IP público
async function getMyPublicIP() {
  try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
  } catch (error) {
      console.error("Erro ao obter IP", error);
      return null;
  }
}

// Exemplo de como chamar a função enviarDados quando necessário
document.getElementById("myButton").addEventListener("click", enviarDados);

async function getMyPublicIP(params) {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("erro ao obter ip", error);
    return null
  }
}