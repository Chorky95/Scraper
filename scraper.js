const puppeteer = require('puppeteer');

(async function scrape() {
    const browser = await puppeteer.launch({ 
		headless: false,
		defaultViewport: null
	});

    const page = await browser.newPage();
    await page.goto('https://lunch.hr/');

    let foodTitles = await page.evaluate(() => {

		//let dateButton = document.querySelectorAll('svg[class^="CalendarButton-module"]')[1];

		function removeDuplicates(arr) {
			return arr.filter((item,
				index) => arr.indexOf(item) === index);
		}

		function getTitles() {
			let buttons = document.querySelectorAll('div[class^="LunchButton-module"]');
			let foodTitles = [];
			
			buttons.forEach(button => {
				button.click();
				let titlesElement = document.body.querySelectorAll('h1');
				let titles = Object.values(titlesElement).map(title => {
					if(title.parentElement.className.includes('DailyLunchHero-module')) {
						return title.innerHTML;
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
		}
	  	return getTitles();
    });

    // logging 
    console.log(foodTitles);
  	await browser.close();
})();
