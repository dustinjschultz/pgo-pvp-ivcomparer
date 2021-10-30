// Just getting this into a working state so I can run
// my one sorta-manual run through. I'll refactor and 
// further automate later if I find this valuable enough.

const puppeteer = require('puppeteer');
require('dotenv').config();



(async () => {
   const FRIENDLY_INDEX = 0;
   const OPPOSING_INDEX = 1;

   //browser = await puppeteer.launch();
   browser = await puppeteer.launch({ headless: false });
   page = await browser.newPage();

   // ex: http://localhost/pvpoke/src/battle/matrix/
   var myUrl = `${process.env.PVPOKE_LOCALHOST_URL}battle/matrix/`;
   console.log(myUrl);
   await page.goto(myUrl);
      
   page.waitForSelector('.add-poke-btn', {visible: true});

   // addScriptTag so it can be used on the page
   await page.addScriptTag({ content: `${setShieldCount}` });
   
   var myFriendlyShieldCount = 0; // TODO: get these properly;
   var myOpposingShieldCount = 2; 
   
   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, 0, FRIENDLY_INDEX);
   
   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, 2, OPPOSING_INDEX);
   
   setTimeout(() => {  console.log("World!"); }, 20000);

})();


function setShieldCount(theShieldCount, theIndex){
   document.querySelectorAll(".multi .shield-select")[theIndex].selectedIndex = theShieldCount;  
}