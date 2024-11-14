const cheerio = require('cheerio');
//const axios = require('axios');




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
      console.log(date);
      console.log(stocks[i]);
      console.log(links[i]);
      i++;
    }
    count++;
  });
})();
// Have to implement auto checking of rounding up
