const fs = require('fs');
const { text } = require('stream/consumers');
const http = require('http');
const url = require('url');

// // Bloking synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written!');

// //Non-bloking asynchronous way
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1)=>{
//     if (err) return console.log('error!');
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2)=>{
//         console.log(data2);
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3)=>{
//             console.log(data3);

//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('Your file has been written')
//             })
//         })
//     })
// })
// SERVER
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const replaceTemplate = (template, product) => {
    let output = template.replace(/{%productName%}/g, product.productName);
    output = output.replace(/{%id%}/g, product.id);
    output = output.replace(/{%image%}/g, product.image);
    output = output.replace(/{%from%}/g, product.from);
    output = output.replace(/{%nutrients%}/g, product.nutrients);
    output = output.replace(/{%quantity%}/g, product.quantity);
    output = output.replace(/{%price%}/g, product.price);
    output = output.replace(/{%description%}/g, product.description);

    if (!product.organic) output = output.replace(/{%not-organic%}/g, 'not-organic');

    return output;
}
//Create a server
const server = http.createServer((req, res) => {
    const {query, pathname} = url.parse(req.url, true);
    //Overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {'Content-type': 'text/html'});

        const cardHtml = dataObj.map(element => replaceTemplate(tempCard,element));
        const output = tempOverview.replace('{%productCard%}', cardHtml);
        res.end(output);
    //Product page
    } else if (pathname === '/product') {
        res.writeHead(200, {'Content-type': 'text/html'});
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);

        res.end(output);
    //api
    } else if (pathname === '/api') {
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(data);
    //Not found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'Hello-world'
        });
        res.end('Page not found!');
    }
})

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000')
})