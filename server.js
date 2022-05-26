const db = require('./db');
const { conn, User, Message, syncAndSeed } = db;
const express = require('express');
const app = express();

app.use('/assets', express.static('assets'));

app.get('/', async(req, res, next)=> {
  try {
    const [ users, messages ] = await Promise.all([
      User.findAll(),
      Message.findAll()
    ]);
    res.send(`
      <html>
        <head>
          <title>Acme Mail</title>
          <link rel='stylesheet' href='/assets/my_styles.css' />
        </head>
        <body>
          <nav>
            <a href='/' class='selected'>Home</a>
            <a href='/users'>Users</a>
            <a href='/messages'>Messages</a>
          </nav>
          <p>
            We have ${ users.length } users and we have ${ messages.length } messages!
          </p>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/users', async(req, res, next)=> {
  try {
    const users = await User.findAll({
      include: [
        { model: Message, as: 'sent'},
        { model: Message, as: 'received'},
      ]
    });
    res.send(`
      <html>
        <head>
          <title>Acme Mail</title>
          <link rel='stylesheet' href='/assets/my_styles.css' />
        </head>
        <body>
          <nav>
            <a href='/'>Home</a>
            <a href='/users' class='selected'>Users</a>
            <a href='/messages'>Messages</a>
          </nav>
          <ul>
            ${
              users.map( user => {
                return `
                  <li>
                    ${ user.fullName } (${ user.userLevel })
                    <div>
                      Sent ${ user.sent.length } messages
                      <br />
                      Received ${ user.received.length } messages
                    </div>
                  </li>
                `;
              }).join('')
            }
          </ul>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

app.get('/messages', async(req, res, next)=> {
  try {
    const messages = await Message.findAll({
      include: [
        { model: User, as: 'to'},
        { model: User, as: 'from'},
      ]
    });
    res.send(`
      <html>
        <head>
          <title>Acme Mail</title>
          <link rel='stylesheet' href='/assets/my_styles.css' />
        </head>
        <body>
          <nav>
            <a href='/'>Home</a>
            <a href='/users'>Users</a>
            <a href='/messages' class='selected'>Messages</a>
          </nav>
          <ul>
            ${
              messages.map( message => {
                return `
                  <li>
                    ${ message.subject } from ${ message.from.firstName } to ${ message.to.firstName }
                  </li>
                `;
              }).join('')
            }
          </ul>
        </body>
      </html>
    `);
  }
  catch(ex){
    next(ex);
  }
});

const bootstrap = async()=> {
  try {
    await syncAndSeed();
    console.log('seeded data');
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  }
  catch(ex){
    console.log(ex);
  }
};

bootstrap();
