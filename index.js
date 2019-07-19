const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const slugify = require("slugify");
const app = express();

app.get("/", (req, res) => {
	if (!req.query.category) throw new Error("No category provided");

	let category = req.query.category.toLowerCase();

	var url;

	if (category === "tech")
		url = "https://www.etsy.com/uk/featured/tech-trends-uk";

	// The structure of our request call
	// The first parameter is our URL
	// The callback function takes 3 parameters, an error, response status code and the html
	request(url, (error, response, html) => {
		// First we'll check to make sure no errors occurred when making the request
		if (!error) {
			// Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
			var $ = cheerio.load(html);

			// Finally, we'll define the variable we're going to capture
			// We'll be using Cheerio's function to single out the necessary information
			// using DOM selectors which are normally found in CSS.

			if (category === "tech") {
				const products = $(`a[href*="etsy.com/uk/listing"]`);
				const foundProducts = [];

				$(products).each(function(i, prod) {
					const product = cheerio.load(prod);
					const url = $(prod).attr("href");

					const id = (
						Number(String(Math.random()).slice(2)) + Date.now()
					).toString(36);

					let price =
						product(`.currency-symbol`).text() +
						product(`.currency-value`).text();

					let title = product(`h2`).text();
					title = title.replace(/(\r\n|\n|\r)/gm, "");
					title = title.trim();

					const slug = slugify(title).toLowerCase();

					if (title !== "" && price !== "") {
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
