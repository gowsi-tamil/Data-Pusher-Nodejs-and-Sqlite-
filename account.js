const express = require('express');
const router = express.Router();
const { Account, Destination } = require('./models');
const { v4: uuidv4 } = require('uuid');

const https = require('https');



router.post('/server/incoming_data', async(req, res) => {
    const data = req.body;
    const appSecretToken = req.headers['cl-x-token'];
  
    if (!appSecretToken) {
      return res.status(401).json({ message: 'Un Authenticate' });
    }
  
    
   
    const account = await Account.findOne({ where: { appSecretToken: appSecretToken } });
    console.log(account)

  
    const destinations = await Destination.findAll({
      where: {
        accountId: account.dataValues.id,
      },
    });
 

    const promises = destinations.map(destination => {
      const options = {
        method: destination.method,
        headers: destination.headers
      };
      
      if (destination.method === 'GET') {
        options.path = `${destination.url}?data=${encodeURIComponent(JSON.stringify(data))}`;
      } else {
        options.url = destination.url;
        options.body = JSON.stringify(data);
      }
      
      return new Promise((resolve, reject) => {

        const req = https.request(destination.url, options, (res) => {
          let responseBody = '';

          res.on('data', (chunk) => {
            responseBody += chunk;
          });
          
          res.on('end', () => {
            resolve(responseBody);
          });
        });
        
        req.on('error', (err) => {

          reject(err);
        });
        
        if (destination.method === 'POST' || destination.method === 'PUT') {
          req.write(options.body);
        }
        
        req.end();
      });
    });
  
    Promise.all(promises)
      .then(() => {
        res.json({ message: 'Data received successfully' });
      })
      .catch((err) => {
        console.log(err)
        res.status(500).json({ message: 'Failed to send data to destinations' });
      });
  });


  


// GET all accounts
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.findAll();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



router.get('/accounts/:accountId', async (req, res) => {
  const accountId = req.params.accountId;
  try {
    const account = await Account.findOne({ where: { accountId: accountId } });
    if (!account) {
      res.status(404).send('Account not found');
    } else {
      res.json(account);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET an account by appSecretToken
router.get('/accounts/token/:appSecretToken', async (req, res) => {
    const appSecretToken = req.params.appSecretToken;
    try {
      const account = await Account.findOne({ where: { appSecretToken } });
      if (!account) {
        res.status(404).send('Account not found');
      } else {
        res.json(account);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  

// CREATE an account
router.post('/accounts', async (req, res) => {
  const { email, accountId, accountName, website } = req.body;
  try {
    const account = await Account.create({
      email,
      accountId,
      accountName,
      website,
    });
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



router.put('/accounts/:accountId', async (req, res) => {
  const accountId = req.params.accountId;
  const { email, accountName, website } = req.body;
  try {
    const account = await Account.findOne({ where: { accountId } });
    if (!account) {
      res.status(404).send('Account not found');
    } else {
      account.email = email;
      account.accountName = accountName;
      account.website = website;
      await account.save();
      res.json(account);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE an account by ID
router.delete('/accounts/:accountId', async (req, res) => {
  const accountId = req.params.accountId;
  try {
   // const account = await Account.findOne({ where: { accountId } });
    const account = await Account.findOne({ where: { accountId: accountId } });
  //  res.json(account);

   // console.log(account)
    const id1= account.dataValues.id;
    const account1 = await Destination.destroy({ where: { accountId: id1 } });
  

    
    if (!account) {
      res.status(404).send('Account not found');
    } else {
      await account.destroy();
      res.send('Account deleted successfully');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// GET all destinations for an account
router.get('/accounts/:accountId/destinations', async (req, res) => {
  const accountId = req.params.accountId;
 
    const destinations = await Account.findOne({
      where: {
        accountId: accountId,
      },
    });
    console.log(destinations)
 

  try {
    const destinations1 = await Destination.findAll({
      where: {
        accountId: destinations.dataValues.id,
      },
    });
   // console.log(destinations1.dataValues.id)
    res.json(destinations1);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET a destination for an account by ID
router.get('/accounts/:accountId/destinations/:destinationId', async (req, res) => {
  const accountId = req.params.accountId;
  const destinationId = req.params.destinationId;
  try {
    const destination = await Destination.findOne({
      where: {
        accountId: accountId,
        id: destinationId,
      },
    });
    if (!destination) {
      res.status(404).send('Destination not found');
    } else {
      res.json(destination);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


 
// CREATE a destination for an account
router.post('/accounts/:accountId/destinations', async (req, res) => {
    const accountId1 = req.params.accountId;
    const { url, httpMethod,headers } = req.body;
   // const id =569
   const account = await Account.findOne({ where: { accountId: accountId1 } });
   console.log(account)

    if (!account) {
      throw new Error(`Account with accountId ${accountId1} not found`);
    }
    const accountId = account.dataValues.id

    try {
      const destination = await Destination.create({
        // id,
        url,
        httpMethod,
       headers,
       accountId,
     
    });
       res.json(destination);
    } catch (err) {
      console.error(err);
       res.status(500).send('Server Error');
    }
  });



  
// UPDATE a destination for an account
router.put('/accounts/:accountId/destinations/:destinationId', async (req, res) => {
    const accountId = req.params.accountId;
    const destinationId = req.params.destinationId;
    const { url, httpMethod,headers } = req.body;
    const destinations = await Account.findOne({
      where: {
        accountId: accountId,
      },
    });
  //  console.log(destinations)
 

  

    try {
      const destination = await Destination.findOne({
        where: {
          accountId : destinations.dataValues.id,
          id: destinationId,
        },
      });
      if (!destination) {
        res.status(404).send('Destination not found');
      } else {
        destination.url = url;
        destination.httpMethod = httpMethod;
        destination.headers = headers;

        await destination.save();
        res.json(destination);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });



  // DELETE a destination for an account
router.delete('/accounts/:accountId/destinations/:destinationId', async (req, res) => {
    const accountId = req.params.accountId;
    const destinationId = req.params.destinationId;

    const destinations = await Account.findOne({
      where: {
        accountId: accountId,
      },
    });
  //  console.log(destinations)
 

  

    try {
      const destination = await Destination.findOne({
        where: {
          accountId : destinations.dataValues.id,
          id: destinationId,
        },
      });
      if (!destination) {
        res.status(404).send('Destination not found');
      } else {
        await destination.destroy();
        res.status(204).send("deleted");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });





module.exports = router;
