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

		dateButton.addEventListener('click', e => {
			console.log('clicked body');
		});

		let clickEvent = new Event('click', { bubbles: true, cancelable: false});

		function removeDuplicates(arr) {
			return arr.filter((item,
				index) => arr.indexOf(item) === index);
		}

		function getFoodNames() {
			let buttons = document.querySelectorAll('div[class^="LunchButton-module"]');
			let foodTitles = [];
			
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
			});

			return removeDuplicates(foodTitles);
		};

		for (let i = 0; i <= 5; i++) {

			let dailyData = {
				date: formatDate(today),
				foods: getFoodNames()
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
