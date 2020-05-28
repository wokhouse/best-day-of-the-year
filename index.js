require('dotenv').config();
const puppeteer = require('puppeteer');
const items = require('./items');

const username = process.env.USERNAME;
const password = process.env.PASSWORD;

function delay(time) {
   return new Promise(function(resolve) {
       setTimeout(resolve, time)
   });
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 10);
        });
    });
}

const login = async (page) => {
  // log in to twitter
  await page.goto('https://twitter.com/login')

  const usernameSelector = '.css-1dbjc4n:nth-child(6) > .css-1dbjc4n > .css-1dbjc4n > .css-1dbjc4n > .css-901oao > .r-30o5oe'
  await page.waitForSelector(usernameSelector);
  await page.click(usernameSelector);
  await page.type(usernameSelector, username);

  const passwordSelector = '.css-1dbjc4n:nth-child(7) > .css-1dbjc4n > .css-1dbjc4n > .css-1dbjc4n > .css-901oao > .r-30o5oe'
  await page.waitForSelector(passwordSelector)
  await page.click(passwordSelector);
  await page.type(passwordSelector, password)

  const loginButtonSelector = '.r-13qz1uu:nth-child(3) > .css-1dbjc4n > .css-1dbjc4n > .css-18t94o4 > .css-901oao'
  await page.waitForSelector(loginButtonSelector);
  await page.click(loginButtonSelector);

  await page.waitForNavigation();

  console.log(`Logged in successfully to: ${username}`);
};

const pause = 100;

const addTweet = async (page, index) => {
  const { pollString, pollItems } = items[index];
  console.log(`writing tweet: ${index + 1} / 92`);
  // press add tweet button
  await page.mouse.click(589, 739);
  // wait for page to load
  await delay(pause);
  // scroll down to expose new tweet button
  await autoScroll(page);
  // type tweet body
  await page.keyboard.type(pollString);
  // add poll
  await page.mouse.click(190, 733);
  // type option one
  await page.keyboard.type(pollItems[0]);
  await page.keyboard.press('Tab');
  // type option two
  await page.keyboard.type(pollItems[1]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  // type option three
  await page.keyboard.type(pollItems[2]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  // type option four
  await page.keyboard.type(pollItems[3]);
  // scroll down to expose new tweet button
  await autoScroll(page);

  return addTweet(page, index + 1);
};

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  // set device size to one tweet height
  await page.setViewport({
    width: 640,
    height: 766,
    deviceScaleFactor: 1,
  });

  // using login helper function
  await login(page);

  // new tweet
  await page.goto('https://twitter.com/compose/tweet')

  // *** add poll to tweet ***
  const i = 0;
  const { pollString, pollItems } = items[i];
  console.log(`writing tweet: ${i + 1} / 92`);
  // wait for page to load
  await delay(pause);
  // type tweet body
  await page.mouse.click(139, 86);
  await page.keyboard.type(pollString);
  // add poll
  await page.mouse.click(183, 262);
  // type option one
  await page.keyboard.type(pollItems[0]);
  await page.keyboard.press('Tab');
  // type option two
  await page.keyboard.type(pollItems[1]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  // type option three
  await page.keyboard.type(pollItems[2]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  // type option four
  await page.keyboard.type(pollItems[3]);

  // recursively add the rest of the tweets
  await addTweet(page, i + 1);
  console.log('complete!');
};

main();

//.map(k => console.log(items[k].pollString));;
