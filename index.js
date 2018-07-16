const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const jsonPayload = {
    "Base": [],
    "Intrigue": [],
    "Seaside": [],
    "Alchemy": [],
    "Prosperity": [],
    "Cornucopia": [],
    "Hinterlands": [],
    "Dark Ages": [],
    "Guilds": [],
    "Adventures": [],
    "Empires": [],
    "2nd": [],
    "Base Cards": []
};

const baseURL = 'http://dominion.diehrstraits.com/';

(async function execute() {
    const sets = Object.keys(jsonPayload);
    for (const set of sets) {
        const htmlString = await fetch(`${baseURL}?set=${set}`).then((res) => res.text());
        const $ = cheerio.load(htmlString);
        const cards = $('.card-container');

        for (const card of cards.toArray()) {
            const name = $(card).find('b').text();
            const cost = /^\s*(\$[0-9]+).*/.exec($(card).text())[1];
            const cardPictureRelativeLink = $(card).find('.card-link>.card-img').attr('src');
            const cardPictureAbsoluteLink = `${baseURL}${cardPictureRelativeLink}`;
            const pictureResponse = await fetch(cardPictureAbsoluteLink);
            const dest = fs.createWriteStream(cardPictureRelativeLink);
            pictureResponse.body.pipe(dest);

            jsonPayload[set] = [...jsonPayload[set], {
                name,
                cost,
                picture: cardPictureRelativeLink
            }];
        }
    }

    console.log(jsonPayload);
})()