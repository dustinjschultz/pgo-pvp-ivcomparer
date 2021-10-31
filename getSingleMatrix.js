// Just getting this into a working state so I can run
// my one sorta-manual run through. I'll refactor and 
// further automate later if I find this valuable enough.

const puppeteer = require('puppeteer');
require('dotenv').config();



(async () => {
   const FRIENDLY_INDEX = 0;
   const OPPOSING_INDEX = 1;

   // TODO: get these properly
   var myLeague = "Ultra League (Level 50)"
   var myQuickfill = "Remix Meta";
   var myFriendlyShieldCount = 0; 
   var myOpposingShieldCount = 2; 
   
   //browser = await puppeteer.launch();
   browser = await puppeteer.launch({ headless: false });
   page = await browser.newPage();

   // ex: http://localhost/pvpoke/src/battle/matrix/
   var myUrl = `${process.env.PVPOKE_LOCALHOST_URL}battle/matrix/`;
   console.log(myUrl);
   await page.goto(myUrl);
      
   page.waitForSelector('.add-poke-btn', {visible: true});

   
   // addScriptTag so it can be used on the page
   // await page.addScriptTag({ content: `${setLeague}` });
   
   // await page.evaluateHandle((league) => {
      // setLeague(league);
   // }, myLeague);
   await setLeague(myLeague);
   
   
   // addScriptTag so it can be used on the page
   await page.addScriptTag({ content: `${setQuickFill}` });
   
   await page.evaluateHandle((quickfill, index) => {
      setQuickFill(quickfill, index);
   }, myQuickfill, OPPOSING_INDEX);
   
   
   // addScriptTag so it can be used on the page
   await page.addScriptTag({ content: `${setShieldCount}` });

   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, 0, FRIENDLY_INDEX);
   
   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, 2, OPPOSING_INDEX);
   
   setTimeout(() => {  console.log("World!"); }, 20000);

})();



function setLeague_old(theLeague){
   // We don't know the index of the league, so we have to figure it out
   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
   // https://stackoverflow.com/questions/9627289/javascript-check-if-div-contains-a-word
   var myTestingFunction = (element) => element.innerHTML.indexOf(theLeague) !== -1;
   var myLeaguesArray = Array.prototype.slice.call(document.querySelector('.league-select').children);
   var myLeagueIndex = myLeaguesArray.findIndex(myTestingFunction);
   document.querySelector('.league-select').selectedIndex = myLeagueIndex;
   // TODO the dispatchEvent here isn't working
   document.querySelector('.league-select').dispatchEvent(new Event('change'));
}


async function setLeague(theLeague){
   console.log('new setLeague')
   // await page.select('select.league-select', theLeague);
   mySelectElement = await page.$('select.league-select');
   await mySelectElement.type(theLeague);
}

function setQuickFill(theQuickFill, theIndex){
   // need to enforce display = 'block' since PvPoke has all the options for all leagues present just hidden
   var myTestingFunction = (element) => element.innerHTML.indexOf(theQuickFill) !== -1 && element.style.display == 'block';
   var myQuickFillsArray = Array.prototype.slice.call(document.querySelectorAll('.quick-fill-select')[theIndex].children);
   var myQuickFillsIndex = myQuickFillsArray.findIndex(myTestingFunction);
   document.querySelectorAll('.quick-fill-select')[theIndex].selectedIndex = myQuickFillsIndex;
   document.querySelectorAll('.quick-fill-select')[theIndex].dispatchEvent(new Event('change'));
}

function setShieldCount(theShieldCount, theIndex){
   document.querySelectorAll(".multi .shield-select")[theIndex].selectedIndex = theShieldCount;  
}
