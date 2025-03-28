const cheerio = require('cheerio');
const Alpaca = require('@alpacahq/alpaca-trade-api');
const { apiKey, apiSecret } = require('./ApiKey/Api.js');
const API_KEY = apiKey;
const API_SECRET = apiSecret;
const PAPER = true; // for real trading set to false
const alpaca = new Alpaca({
  keyId: API_KEY,
  secretKey: API_SECRET,
  paper: PAPER // Set to false for live trading
});
async function buyStock(symbol, quantity) {
  try {
    const order = await alpaca.createOrder({
      symbol: symbol,
      qty: quantity,
      side: 'buy',
      type: 'market',
      time_in_force: 'gtc'
    });
    console.log('Order placed:', order);
  } catch (error) {
    console.error('Error placing order:', error);
  }
}
function convertDate(dateStr) {
  const months = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
  };
  
  const [month, day, year] = dateStr.replace(',', '').split(' ');
  return `${year}/${months[month]}/${parseInt(day)}`;
}

(async () => {
  const url = 'https://www.tipranks.com/calendars/stock-splits/upcoming';
  const response = await fetch(url);
  let reverseStocks = [];
  let count = 0;
  const $ = cheerio.load(await response.text());
  //console.log($.html());
  const reverse = $('span.truncate.textTransformcapitalize');
  const spans = $('span.minW0.flexrsc.blnone.h12.pl0.lineHeight3.truncate.w12') //const link = $('span').text();
  reverse.each((index, element) => { 
    const text = $(element).text().trim()
    if(text === "reverse"){
      reverseStocks.push(count);
    }
    count++;
  });
  count=0;
  let stocks = [];
  let links = [];
  spans.each((index, element) => { // gets every stock that's reverse spliting
    if(reverseStocks.includes(count)){
      const stock = $(element).find('a[data-link="stock"]').text();
      const link = $(element).find('a[data-link="stock"]').attr('href');
      //console.log(stock);
      stocks.push(stock);
      //console.log("https://www.tipranks.com"+link);
      links.push("https://www.tipranks.com"+link);
    }
    count++;
  });
  count = 0;
  let i = 0;
  $('tbody.rt-tbody').find('tr.rt-tr').each((index, element) => {
    const date = $(element).find('td span').first().text();  // Extract the first span in each row which holds the date
    if (date && reverseStocks.includes(count)) {
      let yourDate = new Date()
      const offset = yourDate.getTimezoneOffset()
      yourDate = new Date(yourDate.getTime() - (offset*60*1000))
      if(convertDate(date) != yourDate.toISOString().split('T')[0]){
        buyStock(stocks[i], 1);
      }
      console.log(date);
      console.log(stocks[i]);
      console.log(links[i]);
      i++;
    }
    count++;
  });

  
})();
