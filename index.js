const Parser = require('node-html-parser');
const fetch = require('node-fetch');
const BASE_URL = 'https://www.midi.cz';

const parseWeb = async page => {
  const response = await fetch(`${BASE_URL}/posun/${(page-1) * 40}`);
  const body = await response.text();
  const root = Parser.parse(body);
  const items = root.querySelectorAll('#mainCol .item');
  const data = items.map(item => {
    const text = item.querySelector('.text');
    const img = item.querySelector('.image img');

    const typeElem = text.querySelector('.druh span');
    const dateElem = text.querySelector('.date strong');
    const priceElem = text.querySelector('.table_info .priceBox');
    const adIdElem = text.querySelectorAll('.table_info tr .zvyraznit_bunku');
    const id = adIdElem[0].parentNode.childNodes[3].text;


    let type, date, price;

    if (priceElem) {
      price = priceElem.text
    }

    if (dateElem) {
      date = dateElem.text;
    }

    let dateParts = date.split(' ');
    dateParts = dateParts.map(item => item.replace('.', ''));
    dateParts = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${dateParts[3]}`

    if (typeElem) {
      type = typeElem.classNames[0];
    }

    let imgSrc;
    if (img) {
      imgSrc = img.getAttribute('src')
    }
    return {
      id,
      date: new Date(dateParts),
      imgSrc: `${BASE_URL}${imgSrc}`,
      type,
      price
    }
  })
  return data;
}

const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const page = req.query.page || 1;
  const data = await parseWeb(page);
  res.json(data)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})