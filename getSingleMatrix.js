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
   var myQuickFillValue = "Remix Meta";
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
   }, myQuickFillValue, OPPOSING_INDEX);
   
   await setQuickFill_new("Premier Cup Meta", 1);
   
   
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

function setQuickFill(theQuickFill, theIndex){
   // can't simply use native puppeteer since the <select> doesn't have a unique identifier to .select() on
   // need to enforce display = 'block' since PvPoke has all the options for all leagues present just hidden
   var myTestingFunction = (element) => element.innerHTML.indexOf(theQuickFill) !== -1 && element.style.display == 'block';
   var myQuickFillValuesArray = Array.prototype.slice.call(document.querySelectorAll('.quick-fill-select')[theIndex].children);
   var myQuickFillValuesIndex = myQuickFillValuesArray.findIndex(myTestingFunction);
   document.querySelectorAll('.quick-fill-select')[theIndex].selectedIndex = myQuickFillValuesIndex;
   document.querySelectorAll('.quick-fill-select')[theIndex].dispatchEvent(new Event('change'));
}

async function setQuickFill_new(theQuickFill, theIndex){
   //var myParent = await page.$eval('.poke-select-container', (p) => { return p; });
   //var myChildren = await page.$eval('.poke-select-container', (p) => { return p.children; });
   //console.log(myChildren);
   var mySelector = await buildQuickFillSelector(theIndex);
   var mySelectElement = await page.$(mySelector);
    // use .type since they don't have unique values (just the typing)
   await mySelectElement.type(theQuickFill);
   //console.log(myIndexWithinParent);
}

async function buildQuickFillSelector(theIndex){
   var myIndexWithinParent = await page.evaluateHandle((index) => {
      var myRelevantChildren = document.querySelectorAll('.poke-select-container .poke.multi');
      var myRelevantChild = myRelevantChildren[index];
      //var myQuickFillSelectElement = document.querySelectorAll('.quick-fill-select')[index]
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
