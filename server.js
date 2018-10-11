var express = require('express');
var bodyParser = require("body-parser");
var fetch = require('node-fetch');


var app = express();
var port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.post('/', function (req, res) {
    fetch('https://www.amazon.com/dp/' + req.body.asin)
        .then(res => res.text())
        .then(body => {
            const rank = parseRank(body);
            const category = parseCategory(body);
            const dimensions = parseDimensions(body);
            if (rank === 0 && category === '' && dimensions === '') {
                res.status(404).json({ success: false });
            } else {
                res.json({ rank, category, dimensions });
            }
        }).catch(() => {
            res.status(404).json({ success: false });
        });
});

app.listen(port, () => console.log(`server started listen on port ${port}`));

var parseRank = function (body) {
    const [rankWithPrefix = ''] = body.match(/#\d+(,|\d)*\sin?/) || [];
    const [rankString = ''] = rankWithPrefix.match(/\d+(,|\d)*/) || [];
    const rank = parseInt(rankString.replace(',', '')) || 0;

    return rank;
}

var parseCategory = function (body) {
    const [categoryWithPrefix = ''] = body.match(/data-category=".+?"/) || [];
    const [categoryWithQuote = ''] = categoryWithPrefix.match(/\".+\"/) || [];
    const category = categoryWithQuote.replace(/\"/g, '') || '';

    return category;
}

var parseDimensions = function (body) {
    const [dimensions = ''] = body.match(/\d+(\d|\.)*\sx\s\d+(\d|\.)*\sx\s\d+(\d|\.)*\sinches?/) || [];

    return dimensions;
}

