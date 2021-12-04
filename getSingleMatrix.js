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
      
   let myAddMonData = new AddMonData('alakazam', 'PSYCHO_CUT', 'PSYCHIC', 'FUTURE_SIGHT', 1, 10, 11);
   console.log(myAddMonData);
   
   await inputAddMonData(myAddMonData, FRIENDLY_INDEX);
   
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
      console.log(myRelevantChildren);
      console.log(myRelevantChild);
      console.log(myParent);
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

async function triggerAddPokemonModal(theIndex){
   // "+ Add Pokemon" on the page, NOT the "Add Pokemon" within the modal,
   // that one is classed "save-poke"
   var mySelector = await buildAddPokemonSelector(theIndex);   
   await clickViaJavascript(mySelector);
}

async function clickViaJavascript(theSelector){
   // sometimes the built in page.click won't work, so use this
   
   await page.evaluateHandle((selector) => {
      var myElement = document.querySelector(selector);
      myElement.click();
   }, theSelector);
}

async function setInputViaJavascript(theInputSelector, theInputValue){
   await page.evaluateHandle((selector, newValue) => {
      var myElement = document.querySelector(selector);
      myElement.value = newValue;
      myElement.dispatchEvent(new Event("change"));
   }, theInputSelector, theInputValue);
}

async function buildAddPokemonSelector(theIndex){
   var myIndexWithinParent = await getIndexWithinParent('.poke-select-container', '.poke.multi', theIndex);   
   var myNthChildNumber = myIndexWithinParent + 1;
   return '.poke-select-container .poke.multi:nth-child(' + myNthChildNumber + ') .add-poke-btn';
}

async function inputAddMonData(theAddMonData, theIndex){
   await triggerAddPokemonModal(theIndex);
   
   await page.select('.modal .poke-select', theAddMonData.name);  
   await page.select('.modal .move-select.fast', theAddMonData.fastMove);  
   
   var myFirstChargedMoveInputSelector = await buildChargedMoveInputSelector(0);
   await page.select(myFirstChargedMoveInputSelector, theAddMonData.chargeMove1);  
   var mySecondChargedMoveInputSelector = await buildChargedMoveInputSelector(1);
   await page.select(mySecondChargedMoveInputSelector, theAddMonData.chargeMove2);  

   await clickViaJavascript('.modal .advanced');
   await setInputViaJavascript('.modal input.iv[iv=atk]', theAddMonData.ivAttack);
   await setInputViaJavascript('.modal input.iv[iv=def]', theAddMonData.ivDefence);
   await setInputViaJavascript('.modal input.iv[iv=hp]', theAddMonData.ivHp);
   
   await clickViaJavascript('.modal .save-poke.button');
}

async function buildChargedMoveInputSelector(theIndex){
   var myIndexWithinParent = await getIndexWithinParent('.modal .move-select-container', '.move-select.charged', theIndex);
   var myNthChildNumber = myIndexWithinParent + 1;
   return '.modal .move-select-container .move-select.charged:nth-child(' + myNthChildNumber + ')'
}
