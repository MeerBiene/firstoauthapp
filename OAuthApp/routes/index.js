var express = require('express');
const OAuthClient = require ('disco-oauth')
var router = express.Router();
const config = require('../config.json')


let oauthClient = new OAuthClient(config.client_id, config.client_secret)

oauthClient.setScopes(['identify'])
oauthClient.setRedirect('http://localhost:3000/login')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'OAuth', url: `${oauthClient.authCodeLink}` });
});

router.get('/login/', async (req, res) =>{
  let code = req.query.code;
  if (code == undefined) {
    res.send("Auth code is not defined")
  } else {
    let key = await oauthClient.getAccess(req.query.code).catch(console.error);
    res.cookies.set('key', key);
    
    let user = await oauthClient.getUser(key)

    res.redirect('/user/')
  }

});

router.get('/user/', async (req, res) => {
  let key = req.cookies.get('key')
  if (key) {
    let user = await oauthClient.getUser(key);
    let guilds = await oauthClient.getGuilds(key).then(guilds => { 
      if (guilds.has(`${config.guild_id}`) == true ){
        const notifier = "Successful";
        res.render('user', {
          name: user.username,
          id: user.id,
          verifier: notifier
        })
      } else {
        const notifier = "Unsuccessful";
        res.render('user', {
          name: user.username,
          id: user.id,
          verifier: notifier
        })
      }
    })
  }
 
});

module.exports = router;
