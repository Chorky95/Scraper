const puppeteer = require('puppeteer');

(async function scrape() {
    const browser = await puppeteer.launch({ 
		headless: false,
		defaultViewport: null
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
			let counter = 0;
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
					title: filteredTitles[i],
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
    console.log(data);
 	await browser.close();
})();
