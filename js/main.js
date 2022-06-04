import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import { getColorElementList, getColorListElement, getInActiveColorList, getPlayAgainButton } from './selector.js';
import { getRandomColorPairs, hidePlayAgainButton, setTimerText, showPlayAgainButton, createTimer, setBackgroundColor } from './utils.js';

// Global variables
let selections = [];
let gameStatus = GAME_STATUS.PLAYING;
let timer = createTimer({
    seconds: GAME_TIME,
    onChange: handleTimerChange,
    onFinish: handleTimerFinish,
})

function handleTimerChange(second) {
    setTimerText(second);
}

function handleTimerFinish() {
    // end game
    gameStatus = GAME_STATUS.FINISHED;
    setTimerText('Game over 😭');
    showPlayAgainButton();
}


// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
    const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus);
    const isClicked = liElement.classList.contains('active'); // trường hợp click 2 lần
    if (!liElement || isClicked || shouldBlockClick) return;

    // show color for clicked cell
    liElement.classList.add('active');

    // save clicked cell to selections
    selections.push(liElement);

    if (selections.length < 2) return;

    // check match
    const firstColor = selections[0].dataset.color; 
    const secondColor = selections[1].dataset.color; 
    const isMatch = firstColor === secondColor;

    if (isMatch) {
        // can use either first or second color (as they are the same)
        setBackgroundColor(firstColor)
        
        // check win
        const isWin = getInActiveColorList().length === 0;
        if (isWin) {
            // show replay
            showPlayAgainButton();
            // show you win
            setTimerText('You Win!🎉')
            timer.clear(); // trường hợp win trước 30s

            gameStatus = GAME_STATUS.FINISHED;
        }
        selections = [];
        return;
    }

    // in case of not match
    // remove active class for 2 li elements
    gameStatus = GAME_STATUS.BLOCKING;
    setTimeout(() => {
        selections[0].classList.remove('active');
        selections[1].classList.remove('active');

        // reset selections for the next turn
        selections = [];
        if (gameStatus !== GAME_STATUS.FINISHED) {
            gameStatus = GAME_STATUS.PLAYING;
        }       
    }, 500);
}   

function initColors() {
    // random 8 pairs of colors
    const colorList = getRandomColorPairs(PAIRS_COUNT);

    // bind to li > div.overlay
    const liList = getColorElementList();
    liList.forEach((liElement, index) => {
        liElement.dataset.color = colorList[index];

        const overlayElement = liElement.querySelector('.overlay');
        if (overlayElement) overlayElement.style.backgroundColor = colorList[index];
    })
}

function attachEventForColorList() {
  const ulElement = getColorListElement();
  if (!ulElement) return;

  // Event delegation
  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return;
    handleColorClick(event.target);
  })
}

function resetGame() {
    // reset global variables
    gameStatus = GAME_STATUS.PLAYING;
    selections = [];

    // reset DOM element
    // remove active class from li
    const colorElementList = getColorElementList();
    for (const colorElement of colorElementList) {
        colorElement.classList.remove('active');
    }

    // hide replay button
    hidePlayAgainButton();
    setTimerText('');

    // re-generate new colors
    initColors();

    // reset background color
    setBackgroundColor('goldenrod');

    // startTimer
    startTimer();
}

function attachEventForPlayAgainButton() {
    const playAgainButton = getPlayAgainButton();
    if(!playAgainButton) return;

    playAgainButton.addEventListener('click', resetGame);
}

function startTimer() {
    timer.start();
}

// main
(() => {
    // init colors
    initColors();

    // attach event for color list
    attachEventForColorList();

    attachEventForPlayAgainButton();

    startTimer();
})();

