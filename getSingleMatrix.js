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
   await page.goto(myUrl);
      
   page.waitForSelector('.add-poke-btn', {visible: true});

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

async function setLeague(theLeague){
   mySelectElement = await page.$('select.league-select');
   await mySelectElement.type(theLeague);
}

function setQuickFill(theQuickFill, theIndex){
   // TODO: use proper puppeteer instead of JS
   // need to enforce display = 'block' since PvPoke has all the options for all leagues present just hidden
   var myTestingFunction = (element) => element.innerHTML.indexOf(theQuickFill) !== -1 && element.style.display == 'block';
   var myQuickFillsArray = Array.prototype.slice.call(document.querySelectorAll('.quick-fill-select')[theIndex].children);
   var myQuickFillsIndex = myQuickFillsArray.findIndex(myTestingFunction);
   document.querySelectorAll('.quick-fill-select')[theIndex].selectedIndex = myQuickFillsIndex;
   document.querySelectorAll('.quick-fill-select')[theIndex].dispatchEvent(new Event('change'));
}

function setShieldCount(theShieldCount, theIndex){
   // TODO: use proper puppeteer instead of JS
   document.querySelectorAll(".multi .shield-select")[theIndex].selectedIndex = theShieldCount;  
}
