import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as fs from 'fs';
import chromium from 'chrome-aws-lambda';

export default function getData() {


	let data = (async function scrape() {
		console.log('asdasd');

		const browser = await chromium.puppeteer.launch({ 
			executablePath: await chromium.executablePath,
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			headless: chromium.headless,
		});

		const page = await browser.newPage();
		await page.goto('https://lunch.hr/');

		let data = await page.evaluate(() => {
			
			// WIP
			let today = new Date();

			function getNextWorkDay(date) {
				let day = date.getDay(), add = 1;
				if (day === 5) add = 3;
				else if (day === 6) add = 2;
				date.setDate(date.getDate() + add);
				
				return date;
			};	
			
			function formatDate(date) {
				let dd = String(date.getDate()).padStart(2, '0');
				let mm = String(date.getMonth() + 1).padStart(2, '0');
				let yyyy = date.getFullYear();

				return dd + '.' + mm + '.' + yyyy + '.';
			}

			let data = [];

			let dateButton = document.body.querySelectorAll('svg[class^="CalendarButton-module"]')[1];

			dateButton.addEventListener('click', e => {});

			let clickEvent = new Event('click', { bubbles: true, cancelable: false});

			function removeDuplicates(arr) {
				return arr.filter((item,
					index) => arr.indexOf(item) === index);
			}

			function getFoods() {
				let buttons = document.querySelectorAll('div[class^="LunchButton-module"]');
				let foodTitles = [];
				let images = [];
				let menuItems = {};
				let menus = ['A', 'B', 'C', 'D', 'E'];
				let allMenus = [];

				buttons.forEach(button => {
					button.click();
					let titlesElement = document.body.querySelectorAll('h1');
					let titles = Object.values(titlesElement).map(title => {
						if(title.parentElement.className.includes('DailyLunchHero-module')) {
							return title.innerHTML.replaceAll(/amp;/gi,'');
						} else {
							return;
						}
					});

					let filteredTitles = titles.filter((title) => {
						if(title) {
							return title;
						}					
					});
					
					foodTitles.push(...filteredTitles);

					let imageElements = document.body.querySelectorAll('div[class^="DailyLunchHero-module"]');

					let urlRegex = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/;

					let divsWithBackgroundImage = Array.from(imageElements).filter((imageElement) => {
						let backgroundImage = getComputedStyle(imageElement).getPropertyValue("background-image");
						return (backgroundImage.match(urlRegex));
					});

					divsWithBackgroundImage.forEach(div => {
						style = div.currentStyle || window.getComputedStyle(div, false);
						url = style.backgroundImage.slice(4, -1).replace(/"/g, "");
						images.push(url);
					});
				});

				images = removeDuplicates(images);

				foodTitles = removeDuplicates(foodTitles);

				for (let i = 0; i < menus.length; i++) {
					menuItems = {
						menu: menus[i],
						title: foodTitles[i],
						image: images[i]
					}

					allMenus.push(menuItems);
				}

				return allMenus;
			};

			for (let i = 0; i <= 5; i++) {

				let dailyData = {
					date: formatDate(today),
					foods: getFoods()
				}

				data.push(dailyData);

				if(i < 5) {
					dateButton.dispatchEvent(clickEvent);
				}

				getNextWorkDay(today);
			}

			return data;
		});

		// logging 
		await browser.close();

		return data;
	})();

	data.then((value) => {
		
		// defining the Express app
		const app = express();

		// adding Helmet to enhance your Rest API's security
		app.use(helmet());

		// using bodyParser to parse JSON bodies into JS objects
		app.use(bodyParser.json());

		// enabling CORS for all requests
		app.use(cors());

		// adding morgan to log HTTP requests
		app.use(morgan('combined'));

		// defining an endpoint to return data
		app.get('/', (req, res) => {
			res.send(value);
		});

		// write to json file
		// const fs = require('fs');
		const jsonContent = JSON.stringify(value);

		fs.writeFile("./menus.json", jsonContent, 'utf8', function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		}); 

		//Starting the local server
		// app.listen(3001, () => {
		// 	console.log('listening on port 3001');
		// });
	});

};