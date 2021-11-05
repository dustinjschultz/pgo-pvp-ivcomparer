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
   var myQuickFillValue = "remixultra";
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
   await setQuickFill(myQuickFillValue, OPPOSING_INDEX);
   
   // TODO: refactor setShieldCount the same way setQuickFill works
   // maybe even refactor the getSelector method to generalize it
   
   // addScriptTag so it can be used on the page
   await page.addScriptTag({ content: `${setShieldCount}` });

   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, myFriendlyShieldCount, FRIENDLY_INDEX);
   
   await page.evaluateHandle((count, index) => {
      setShieldCount(count, index);
   }, myOpposingShieldCount, OPPOSING_INDEX);
   
   setTimeout(() => {  console.log("World!"); }, 20000);

})();

async function setLeague(theLeague){
   var mySelectElement = await page.$('select.league-select');
   // use .type since they don't have unique values (just the typing)
   await mySelectElement.type(theLeague);
}

async function setQuickFill(theQuickFill, theIndex){
   var mySelector = await buildQuickFillSelector(theIndex);
   var mySelectElement = await page.$(mySelector);
    // use .type since they don't have unique values (just the typing)
    // TODO: DON'T use .type, it doesn't work
   //await mySelectElement.type(theQuickFill);
   await page.select(mySelector, theQuickFill);
}

async function buildQuickFillSelector(theIndex){
   // this one's funny because we have to leverage :nth-child
   // because we can't build a unique selector without it
   // to find the applicable :nth-child, need to go to the shared 
   // ancestor (.poke-select-container), and find the index within 
   // the child list of the immediate child (.poke.multi) that 
   // contains the element we care about (.quick-fill-select)
   var myIndexWithinParent = await page.evaluateHandle((index) => {
      var myRelevantChildren = document.querySelectorAll('.poke-select-container .poke.multi');
      var myRelevantChild = myRelevantChildren[index];
      var myParent = myRelevantChild.parentNode;
      return Array.prototype.indexOf.call(myParent.children, myRelevantChild);
   }, theIndex);
   
   // not clue why I have to do ._remoteObject.value to get my number but whatever
   var myNthChildNumber = myIndexWithinParent._remoteObject.value + 1;
   return '.poke-select-container .poke.multi:nth-child(' + myNthChildNumber + ') .quick-fill-select';
}

function setShieldCount(theShieldCount, theIndex){
   // can't simply use native puppeteer since the <select> doesn't have a unique identifier to .select() on
   document.querySelectorAll(".multi .shield-select")[theIndex].selectedIndex = theShieldCount;
   document.querySelectorAll(".multi .shield-select")[theIndex].dispatchEvent(new Event('change'));
}
