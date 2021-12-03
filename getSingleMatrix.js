// Just getting this into a working state so I can run
// my one sorta-manual run through. I'll refactor and 
// further automate later if I find this valuable enough.

const puppeteer = require('puppeteer');
require('dotenv').config();
const AddMonData = require('./addMonClass.js');


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
   await setShieldCount(myFriendlyShieldCount, FRIENDLY_INDEX);
   await setShieldCount(myOpposingShieldCount, OPPOSING_INDEX);
      
   let myAddMonData = new AddMonData('a', 'b', 'c', 'd', 1, 2, 3);
   console.log(myAddMonData);
         
   setTimeout(() => {  console.log("World!"); }, 20000);

})();

async function setLeague(theLeague){
   var mySelectElement = await page.$('select.league-select');
   // use .type since they don't have unique values (just the typing)
   await mySelectElement.type(theLeague);
}

async function setQuickFill(theQuickFill, theIndex){
   var mySelector = await buildQuickFillSelector(theIndex);
   await page.select(mySelector, theQuickFill);
}

async function buildQuickFillSelector(theIndex){
   // this one's funny because we have to leverage :nth-child
   // because we can't build a unique selector without it
   // to find the applicable :nth-child, need to go to the shared 
   // ancestor (.poke-select-container), and find the index within 
   // the child list of the immediate child (.poke.multi) that 
   // contains the element we care about (.quick-fill-select)
   var myIndexWithinParent = await getIndexWithinParent('.poke-select-container', '.poke.multi', theIndex);   
   var myNthChildNumber = myIndexWithinParent + 1;
   return '.poke-select-container .poke.multi:nth-child(' + myNthChildNumber + ') .quick-fill-select';
}

async function getIndexWithinParent(theSingularParentSelector, theSiblingsSelector, theZeroIndexedOccurence){
   // this lets us get the index within the parent of a given selector
   // ex: parent class 'z', with children ['a', 'b', 'c', 'a', 'b', 'c']
   // to get the 1st b's index: getIndexWithinParent('z', 'b', 0) == 1
   // to get the 2nd b's index: getIndexWithinParent('z', 'b', 1) == 4
   // useful for combining with .nth-child when you don't know the position in the parent
   var myIndexWithinParent = await page.evaluateHandle((parent, child, index) => {
      var myRelevantChildren = document.querySelectorAll(parent + " " + child);
      var myRelevantChild = myRelevantChildren[index];
      var myParent = myRelevantChild.parentNode;
      return Array.prototype.indexOf.call(myParent.children, myRelevantChild);
   }, theSingularParentSelector, theSiblingsSelector, theZeroIndexedOccurence);

   // not clue why I have to do ._remoteObject.value to get my number but whatever
   return myIndexWithinParent._remoteObject.value;
}

async function setShieldCount(theShieldCount, theIndex){
   var mySelector = await buildShieldSelector(theIndex);
   await page.select(mySelector, theShieldCount.toString());
}

async function buildShieldSelector(theIndex){
   var myIndexWithinParent = await getIndexWithinParent('.poke-select-container', '.poke.multi', theIndex);   
   var myNthChildNumber = myIndexWithinParent + 1;
   return '.poke-select-container .poke.multi:nth-child(' + myNthChildNumber + ') .shield-select';
}

// async function addPokemon
