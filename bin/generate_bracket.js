// one time script for generating a bracket of days of the year
const moment = require('moment');
const prompt = require('prompt');
const clipboardy = require('clipboardy');

// from: https://stackoverflow.com/a/26185557
const getDateFromDayNum = (dayNum, year) => {
  const date = new Date();
  if (year) date.setFullYear(year);
  date.setMonth(0);
  date.setDate(0);
  // this is the time in milliseconds of 1/1/YYYY
  const timeOfFirst = date.getTime(); 
  const dayMilli = 1000 * 60 * 60 * 24;
  const dayNumMilli = dayNum * dayMilli;
  date.setTime(timeOfFirst + dayNumMilli);
  return date;
}

const createDayObj = (leap = true) => {
  // if we include leap day, bracket will have 366 days
  // otherwise, it will have 365
  const dayCount = (leap) ? 366 : 365;
  // generate array with sequential numbers in it
  const dayArray = Array.from(Array(dayCount).keys());
  // create object containing metadata abt each day
  // including the day expressed as a string
  const days = {};
  dayArray.map((d) => {
    // since array begins at 0, add 1 to line up w/ year days
    day = d + 1;
    // using 2019 as non-leap year and 2020 as leap-year 
    let year;
    if (leap) year = 2020;
    else year = 2019;
    // convert day of the year (1-365/366) to date object
    const dateAsObj = getDateFromDayNum(day, year);
    // convert JS date obj into moment date obj to make formatting easier
    const date = moment(dateAsObj); 
    days[d] = {
      date,
      // dont include year in string since this is a general poll for the best day in the year
      string: date.format('MMMM Do (M/D)'),
      eliminated: false,
      // when day is eliminated, keep track of what round it was eliminated in
      // and what group/poll it was eliminiated in
      eliminatedRound: undefined,
      eliminatedGroup: undefined,
    }
  });
  const out = {
    keys: dayArray,
    days,
  };
  return out;
}

const generateRound1 = (leap = true) => {
  const dateObj = createDayObj(leap);
  // generate  poll numbers for bracket
  const round = 1;
  // get non-excluded day indexes
  const daysInPlay = [];
  dateObj.keys.map((d) => {
    if (!dateObj.days[d].excluded) daysInPlay.push(d);
  });
  // generate group/poll numbers in groups of 4 since that's how many twitter allows
  daysInPlay.map((d) => {
    const group = Math.floor(d / 4);
    dateObj.days[d][`round${round}group`] = group;
  });
  return dateObj;
}

const bracket = generateRound1();

// collect days by group
const items = {
  //  part1: {},
  //  part2: {},
  //  part3: {},
  //  part4: {},
};
bracket.keys.map((d) => {
  const day = bracket.days[d];
  const group = day.round1group;
  // let part = '';
  // if (group < 25) part = 'part1'; 
  // else if (group >= 25 && group < 50) part = 'part2'; 
  // else if (group >= 50 && group < 75) part = 'part3'; 
  // else part = 'part4'; 
  // if (!items[part][group]) items[part][group] = { pollString: `${group + 1}/92`, pollItems: [day.string] };
  // else items[part][group].pollItems.push(day.string);
  if (!items[group]) items[group] = { pollString: `${group + 1}/92`, pollItems: [day.string] };
  else items[group].pollItems.push(day.string);
});

// make first tweet say something other than (X/N)
// items.part1[0].pollString = `VOTE FOR THE BEST 📅 DAY ROUND 1: THE INCREDIBLY CHAOTIC THREAD OF 92 POLLS CONTAINING ALL 365 DAYS + LEAP YEAR DAY. VOTE FOR YOUR FAVORITE DAYS AND THEY WILL ADVANCE TO ROUND 2`
items[0].pollString = `VOTE FOR THE BEST 📅 DAY ROUND 1: THE INCREDIBLY CHAOTIC THREAD OF 92 POLLS CONTAINING ALL 365 DAYS + LEAP YEAR DAY. VOTE FOR YOUR FAVORITE DAYS AND THEY WILL ADVANCE TO ROUND 2`

console.log(items);

// copy JSON to clipboard
clipboardy.writeSync(JSON.stringify(items));
