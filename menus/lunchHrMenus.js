const fs = require('fs');
const chromium = require('chrome-aws-lambda');

function getData() {
	let data = (async function scrape() {
		console.log('Getting menus...');

		const browser = await chromium.puppeteer.launch({ 
			args: ['--no-sandbox', "--disabled-setupid-sandbox"],
			defaultViewport: null,
			executablePath: await chromium.executablePath,
			headless: true,
			ignoreHTTPSErrors: true,
			ignoreDefaultArgs: ['--disable-extensions']

		});

		const page = await browser.newPage();
		await page.goto('https://lunch.hr/');

		let data = await page.evaluate(() => {
			
			let today = new Date();

			let dayNumber = document.body.querySelectorAll('div[class^="CalendarButton-module"]')[3];
			
			function formatDate(date) {
				let yyyy = date.getFullYear();
				
				let dd = dayNumber.innerHTML.padStart(2, '0');
				let mm = dayNumber.innerHTML < date.getDate() ? String(date.getMonth() + 2).padStart(2, '0') : String(date.getMonth() + 1).padStart(2, '0');
				
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
			}

			data = data.filter((day, index, self) => 
				index === self.findIndex((t) => (
					t.date === day.date
				))
			)

		//	console.log(data);
			
			return data;
		});

		// logging 
		await browser.close();
		
		return data;
	})();

	data.then((value) => {
		const jsonContent = JSON.stringify(value);

		fs.writeFile("./lunchHR.json", jsonContent, 'utf8', function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		}); 
	});

};

getData();