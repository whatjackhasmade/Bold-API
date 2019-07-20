const express = require("express");
const request = require("request");
const rp = require("request-promise");
const cheerio = require("cheerio");
const slugify = require("slugify");
const app = express();

app.get("/", (req, res) => {
	if (!req.query.category) throw new Error("No category provided");

	let category = req.query.category.toLowerCase();

	var url;

	if (category === "music")
		url = "https://www.groupon.co.uk/vouchers/festivals";
	if (category === "tech")
		url = "https://www.etsy.com/uk/featured/tech-trends-uk";
	if (category === "travel") url = "https://www.hotukdeals.com/tag/holiday";

	request(url, (error, response, html) => {
		if (!error) {
			var $ = cheerio.load(html);

			if (category === "music") {
				const products = $(`.deal-card`);
				const foundProducts = [];

				$(products).each(async function(i, prod) {
					const $ = cheerio.load(prod);
					const dealURL = $(`a.grpn-dc`);
					const threadImage = $(`.grpn-dc-img img`);
					const image = $(threadImage).attr(`src`);
					const url = $(dealURL).attr(`href`);

					let title = $(`.grpn-dc-title`).text();
					title = title.replace(/(\r\n|\n|\r)/gm, "");
					title = title.trim();

					let description = $(`.fc-description p`).text();
					description = description.replace(/(\r\n|\n|\r)/gm, "");
					description = description.trim();

					const slug = url.replace(`https://www.groupon.co.uk/deals/`, ``);

					const discountObject = $(`.wh-dc-price-discount`).children();

					const price = parseFloat(
						$(`.wh-dc-price-discount`)
							.text()
							.replace(`£`, ``)
					).toFixed(2);

					const id = (
						Number(String(Math.random()).slice(2)) + Date.now()
					).toString(36);

					foundProducts.push({
						id,
						category,
						description,
						image,
						price,
						slug,
						title,
						url
					});
				});

				// Send the JSON as a response to the client
				res.send(foundProducts);
			}

			if (category === "travel") {
				const products = $(`.thread--deal`);
				const foundProducts = [];

				$(products).each(async function(i, prod) {
					const $ = cheerio.load(prod);
					const threadURL = $(`.threadGrid-image a`);
					const threadImage = $(`.threadGrid-image img`);
					const image = $(threadImage).attr(`src`);
					const url = $(threadURL).attr(`href`);

					let title = $(`.thread-title a`).text();
					title = title.replace(/(\r\n|\n|\r)/gm, "");
					title = title.trim();

					const slug = url.replace(`https://www.hotukdeals.com/deals/`, ``);

					const price = parseFloat(
						$(`.thread-price`)
							.text()
							.replace(`£`, ``)
					).toFixed(2);

					const id = (
						Number(String(Math.random()).slice(2)) + Date.now()
					).toString(36);

					foundProducts.push({
						id,
						category,
						image,
						price,
						slug,
						title,
						url
					});
				});

				// Send the JSON as a response to the client
				res.send(foundProducts);
			}

			if (category === "tech") {
				const products = $(`a[href*="etsy.com/uk/listing"]`);
				const foundProducts = [];

				$(products).each(async function(i, prod) {
					const product = cheerio.load(prod);
					const url = $(prod).attr(`href`);

					const id = (
						Number(String(Math.random()).slice(2)) + Date.now()
					).toString(36);

					const price = parseFloat(product(`.currency-value`).text()).toFixed(
						2
					);

					let title = product(`h2`).text();
					title = title.replace(/(\r\n|\n|\r)/gm, "");
					title = title.trim();

					const slug = slugify(title).toLowerCase();

					// const images = await rp(url)
					// 	.then(htmlString => {
					// 		var $ = cheerio.load(htmlString);
					// 		const carousel = $(`.listing-page-image-carousel-component`);
					// 		let images = $(carousel).find(`.carousel-image`);
					// 		const gallery = $(images).each(function(i, image) {
					// 			return $(image).attr(`data-src`);
					// 		});
					// 		return gallery;
					// 	})
					// 	.catch(err => {
					// 		console.log(err);
					// 	});

					// console.log(images);

					if (title !== "" && price !== "NaN") {
						foundProducts.push({
							id,
							category,
							price,
							slug,
							title,
							url
						});
					}
				});

				// Send the JSON as a response to the client
				res.send(foundProducts);
			}
		}
	});
});

app.listen(process.env.PORT || 5000);

console.log(
	`API is running on http://localhost:${
		process.env.PORT ? process.env.PORT : 5000
	}`
);

module.exports = app;
