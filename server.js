const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://mongo:27017/mongodb_nodejs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const DataSchema = new mongoose.Schema({
    name: String,
    email: String,
    isCrawled: { type: Boolean, default: false }
});
const Data = mongoose.model('Data', DataSchema);

app.get('/crawl', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/');
        const html = response.data;
        const $ = cheerio.load(html);

        const crawledData = [];

        $('table tbody tr').each((index, element) => {
            const name = $(element).find('td:nth-child(1)').text();
            const email = $(element).find('td:nth-child(2)').text();
            crawledData.push({ name, email, isCrawled: true });
        });

        await Data.insertMany(crawledData);

        console.log('Crawling data sukses!');
        res.redirect('/');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred during crawling.');
    }
});

app.get('/', async (req, res) => {
    const data = await Data.find();
    let dataHtml = `
        <h2 class="mt-4">Stored Data</h2>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Source</th>
                </tr>
            </thead>
            <tbody>
    `;
    data.forEach(item => {
        dataHtml += `
            <tr>
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.isCrawled ? 'Hasil Crawl' : 'Hasil Input'}</td>
            </tr>
        `;
    });
    dataHtml += `
            </tbody>
        </table>
    `;

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Form Input</title>
            <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container mt-5">
                <h1 class="mb-4">Form Input</h1>
                <form action="/submit" method="POST">
                    <div class="form-group">
                        <label for="name">Name:</label>
                        <input type="text" class="form-control" id="name" name="name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" class="form-control" id="email" name="email">
                    </div>
                    <button type="submit" class="btn btn-primary">Submit</button>
                    <a href="/crawl" class="btn btn-secondary">Crawl</a>
                </form>
                ${dataHtml}
            </div>
        </body>
        </html>
    `);
});

app.post('/submit', async (req, res) => {
    const { name, email } = req.body;
    const newData = new Data({ name, email });
    await newData.save();
    res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
