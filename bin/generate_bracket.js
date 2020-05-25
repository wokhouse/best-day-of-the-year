// one time script for generating a bracket of days of the year
const moment = require('moment');

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

const generate = (leap = true) => {
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
    }
  });
  const out = {
    keys: dayArray,
    data: days,
  };
  return out;
}

module.exports = { generate };
