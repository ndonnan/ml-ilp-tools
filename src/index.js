const Ilp = require('@mojaloop/sdk-standard-components').Ilp;
const base64url = require('base64url');
const express = require('express');
const ilpPacket = require('ilp-packet');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => {
    const defaultQuoteRequest = `{
  "quoteId": "1d98b4d1-fc55-46d8-85d6-89c30caab446",
  "transactionId": "55d8206e-80b7-48c4-994c-d066401a0bc8",
  "payer": {
    "partyIdInfo": {
      "partyIdType": "MSISDN",
      "partyIdentifier": "22507008181",
      "fspId": "payerfsp"
    },
    "personalInfo": {
      "complexName": {
        "firstName": "Mats",
        "lastName": "Hagman"
      },
      "dateOfBirth": "1983-10-25"
    }
  },
  "payee": {
    "partyIdInfo": {
      "partyIdType": "MSISDN",
      "partyIdentifier": "22556999125",
      "fspId": "payeefsp"
    }
  },
  "amountType": "SEND",
  "amount": {
    "amount": "60",
    "currency": "USD"
  },
  "transactionType": {
    "scenario": "TRANSFER",
    "initiator": "PAYER",
    "initiatorType": "CONSUMER"
  },
  "note": "Testing"
}`;
    const defaultQuoteResponse = `{
    "transferAmount": {
        "currency": "USD",
        "amount": "60"
    },
    "note": "Test transfer"
}`;
    res.render('encode', { defaultQuoteRequest, defaultQuoteResponse });
});

app.post('/encode', (req, res) => {
    const ilp = new Ilp({ secret: req.body.ilpSecret });
    const result = ilp.getQuoteResponseIlp(JSON.parse(req.body.quoteRequest), JSON.parse(req.body.quoteResponse));
    res.render('encodeResult', { result });
});

app.get('/decode', (req, res) => {
    res.render('decode');
});

app.post('/decode', (req, res) => {
    const binaryPacket = Buffer.from(req.body.ilpPacket, 'base64');
    const packet = ilpPacket.deserializeIlpPacket(binaryPacket);
    const packetData = JSON.parse(base64url.decode(Buffer.from(packet.data.data, 'base64').toString()));
    packet.data.data = 'Truncated for display, see below...';
    res.render('decodeResult', { packet, packetData });
});

const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
