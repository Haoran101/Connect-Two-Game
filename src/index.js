import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app.js'
import { MAX_HEIGHT, MAX_WIDTH, ICON,  MAPS}  from './app.js'

const height = MAX_HEIGHT;
const width = MAX_WIDTH;
const icons = ICON;
let appPage = 'start';

class Square extends React.Component {
  
  render(props){
    const showImage = (this.props.img !== 'undefined.png').toString();
    return (
      
      <button className='square'
      value = {this.props.value}
      id = {this.props.id}
      isprev = {this.props.isprev}
      iscurr = {this.props.iscurr}
      img = {this.props.img}
      istip = {this.props.istip}
      onClick={ () => this.props.onClick()}
      >
        <img className = 'icon' 
        src={`${process.env.PUBLIC_URL}/assets/img/${this.props.img}`} alt={this.props.value} show= {showImage}
        />
      </button>)
  }
}

const e = React.createElement;

class Map extends React.Component {

  renderSquare(pattern, keyString, prev, curr, tip){
    const icon = icons[pattern[keyString]] + '.png';
    let tipItems;
    if (tip !== 'null' && tip !== null){
      tipItems = tip.split('&');
    }
    if (tipItems && (tipItems.includes(keyString))){
      return (
        <Square
          className = 'square'
          value = {pattern[keyString]} 
          id = {keyString}
          key = {keyString}
          onClick = {() => this.props.onClick(keyString)}
          isprev = {(keyString === prev && prev !== null && prev !== undefined).toString()}
          iscurr = {(keyString === curr && curr !== null && curr !== undefined).toString()}
          istip = 'true'
          img = {icon}
        >
        </Square>
      );
    } else {
      return (
        <Square
          className = 'square'
          value = {pattern[keyString]} 
          id = {keyString}
          key = {keyString}
          onClick = {() => this.props.onClick(keyString)}
          isprev = {(keyString === prev && prev !== null && prev !== undefined).toString()}
          iscurr = {(keyString === curr && curr !== null && curr !== undefined).toString()}
          istip = 'false'
          img = {icon}
        >
        </Square>
      );
    }
    
  }

  render(props){
    const pattern = this.props.version.map;
    const prev = this.props.prev;
    const curr = this.props.curr;
    const tip = this.props.tiptool;
    let i = 0;
    let rowsRendered = [];
    while (i<height){
      let newRow = [];
      let j = 0;
      while (j<width){
        let pos = [i,j];
        let keyString = fetchKeyString(pos);
        pattern[keyString] = (keyString in pattern)? pattern[keyString] : 'null';

        let square = this.renderSquare(pattern, keyString, prev, curr, tip);
        newRow.push(square);
        j++;
      }
      rowsRendered.push(e('div', {className: 'board-row', id:`${i}`} , newRow));
      i++;
    }
    return e('div', {className: 'board-container'}, rowsRendered);
  }
}



class Tools extends React.Component {
  render(props){
    return (
      <div className='toolbar'>
        <button className='tool'>
        TIP
          <img src={`${process.env.PUBLIC_URL}/assets/tools/bulb.png`} 
          alt='tip' onClick={() => this.props.onClick('tip')}></img>
          
        </button>
        <button className='tool'>
        RESET
         <img src={`${process.env.PUBLIC_URL}/assets/tools/reset.png`} 
         alt='reset' onClick={() => this.props.onClick('reset')}></img>
        </button>
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    const emptyMap = this.props.emptyMap;
    const pattern = createMap(emptyMap);
    const sameValueMap = patternToSameValueMap(pattern);
    const mapWithEmpty = fillMapWithEmpty(pattern, width, height);
    const extendMap = getExtendMap(mapWithEmpty);
    const goodPairs = calculateGoodPairs(extendMap, sameValueMap);
    console.log('a new game!');
    this.state = {
      history : [
        {
          map: pattern, //postion [x,y]  => id
          sameValueMap: sameValueMap,
          extendMap: extendMap,
          goodPairs : goodPairs, //[start, end] => [start, path, path, path, end]  (all positions)
        },
      ],
      prevSelection: null,
      currSelection: null,
      tiptool: null,
  }
}

  handleClick(pos){
    const history = this.state.history.slice();
    const currentEntry = history[history.length - 1];
    const pattern = currentEntry.map;
    const goodPairs = currentEntry.goodPairs;  
    //check whether there is a valid pair selected
    const curr = pos;
    const prev = this.state.currSelection;
    
    //not a valid click area
    if (pattern[pos]==='null') {
      return;}
    //valid click
    if (pos!== prev){
      const currPair = curr + '&' + prev;
      if (!(currPair in goodPairs)){
        //not paired
        this.setState(
          {prevSelection: this.state.currSelection,
           currSelection: pos,
          tiptool: null});
      } else{
        //patterns paired
        this.drawLine(goodPairs[currPair]);
        let newPattern = Object.assign({}, pattern);
        //update pattern
        newPattern[prev] = 'null';
        newPattern[curr] = 'null';
        //do some motions here
        const sameValueMap = patternToSameValueMap(newPattern);
        const mapWithEmpty = fillMapWithEmpty(newPattern, width, height);
        const extendMap = getExtendMap(mapWithEmpty);
        const newGoodPairs = calculateGoodPairs(extendMap, sameValueMap);
        this.setState({
          history : history.concat([
            {map: newPattern, sameValueMap: sameValueMap, goodPairs: newGoodPairs}
          ]),
          currSelection : null,
          prevSelection : null,
          tiptool: null,
        }
        );
        const withValue = Object.keys(newPattern).filter(pos => newPattern[pos]!=='null');
        if (Object.keys(newGoodPairs).length === 0 && withValue.length === 0){
          this.props.setState({currentPage: 'next', currentLevel: parseInt(this.props.level) + 1});
        } if (Object.keys(newGoodPairs).length === 0 && withValue.length > 0){ 
          alert('No valid pairs left! Reset pattern automatically!');
          this.resetPattern();
        }
      } 
    }
  }
    
  useTools(tool){
    if (tool === 'tip'){
      //show a tip
      this.useTip();
    } else {
      //reset pattern
      this.resetPattern();
    }
  }

  useTip(){
    const history = this.state.history.slice();
    const currentEntry = history[history.length - 1];
    const goodPairs = currentEntry.goodPairs;
    const tipPair = Object.keys(goodPairs)[0];
    this.setState({tiptool: tipPair,})
    this.drawLine(goodPairs[tipPair]);
  }

  resetPattern(){
    const history = this.state.history.slice();
    const currentEntry = history[history.length - 1];
    const currPattern = currentEntry.map;
    const newPattern = {};
    const sameValueMap = currentEntry.sameValueMap;
    //get all current values
    let allValues = [];
    for (var key in sameValueMap){
      for (var i=0; i<sameValueMap[key].length; i++)
      allValues.push(key);
    }
    let randomOrder = shuffleArray(allValues);
    for (var pos in currPattern){
      newPattern[pos] = (currPattern[pos] === 'null')? 'null' : randomOrder.pop();
    }
    const newSameValueMap = patternToSameValueMap(newPattern);
    const newExtendMap = getExtendMap(newPattern);
    const newGoodPairs = calculateGoodPairs(newExtendMap, newSameValueMap);
    this.setState({
      history : history.concat([{
        map: newPattern, sameValueMap: newSameValueMap, extendMap: newExtendMap, goodPairs: newGoodPairs,
      }]),
      prevSelection: null,
      currSelection: null,
      tiptool: null
    })
  }

  drawLine(allPaths){
    const c = document.getElementById('canvas');
    const ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "#e7eaf9";
    for (var i=0; i< allPaths.length - 1; i++){
      const start = allPaths[i];
      const end = allPaths[i+1];
      ctx.moveTo(getLocation(start).x,getLocation(start).y);
      ctx.lineTo(getLocation(end).x,getLocation(end).y);
    }
    ctx.stroke();
    setTimeout(() => { ctx.clearRect(0, 0, c.width, c.height);; }, 100);
  }

  render(props){
    console.log('start game render');
    const history = this.state.history.slice();
    const currentEntry = history[history.length - 1];
    
    return (
      <div className='game'>
        <Map version={currentEntry}
      onClick = {(pos) => this.handleClick(pos)}
      prev = {this.state.prevSelection}
      curr = {this.state.currSelection}
      tiptool = {this.state.tiptool}>
      </Map>
      <Tools
      onClick = {(tool) => this.useTools(tool)}>
      </Tools>
      </div> 
    );
  }
}

const maxPairs = icons.length;

function createMap(emptyMap){
  let total = emptyMap.length;
  let numOfId = Math.min(total/2, maxPairs);
  let map = {};
  let availableId = {};
  let defaultPairsPerId = Math.floor((total/2)/numOfId);
  let remainder = (total % numOfId) / 2;
  for (var j=0; j <numOfId; j++){
    availableId[j] = (remainder > 0)? (defaultPairsPerId+1)*2: defaultPairsPerId*2;
    remainder--;
  }

  for (var i = 0; i < total; i++){
    let pos = emptyMap[i];
    let keyString = fetchKeyString(pos);
    let randomId = Math.floor(Math.random()*numOfId);
    while ((keyString in map) || availableId[randomId] === 0) {
      randomId = Math.floor(Math.random()*numOfId);
    }
    map[keyString] = randomId;
    availableId[randomId]--;
  }
  return map; 
}

function patternToSameValueMap(pattern){
  let sameValueMap = {};
  for (var pos in pattern){
    let value = pattern[pos];
    if (value === 'null') continue;
    sameValueMap[value] = (!sameValueMap[value])? [pos] : sameValueMap[value].concat([pos]);
  }
  return sameValueMap;
}

function getLocation(keyString){
  const x = deconstruct(keyString).second*35 + 117 -35;
  const y = deconstruct(keyString).first*35 + 62 - 35;
  return {x: x, y: y};
}

function fillMapWithEmpty(pattern, width, height){
  let newPattern = {};
  var i = 0;
  while (i < height){
      var j = 0;
      while (j < width){
        let pos = [i,j];
        let keyString = fetchKeyString(pos);
        newPattern[keyString] = (keyString in pattern)? pattern[keyString] : 'null';
        j++;
      }
      i++;
    }
    return newPattern;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array;
}

function getExtendMap(pattern){
  let extendMap = {};
  for (var keyString in pattern){
    extendMap[keyString] = fourDirectionExtend(pattern, keyString);
  }
  return extendMap;
}

function calculateGoodPairs(extendMap, sameValueMap){
  let goodPairs = {};
  for (var key in sameValueMap){
    let positions = sameValueMap[key];
    //console.log(positions);
    for (var i=0; i< positions.length; i++){
      for (var j = 0; j < positions.length; j++){
        if (i !== j) {
          let connection = connectLine(positions[i], positions[j], extendMap);
          if (connection !== undefined && connection !== null){
            goodPairs[positions[i]+'&'+positions[j]] = connection;
          }}}} }
  return goodPairs;
}

function fetchKeyString(pos){
  let firstEle = pos[0];
  let secEle = pos[1];
  return '[' + firstEle + '@' + secEle + ']';
}

function deconstruct(keyString){
  return ({ first: parseInt(keyString.substring(keyString.indexOf('[') + 1, keyString.indexOf('@'))),
          second : parseInt(keyString.substring(keyString.indexOf('@') + 1, keyString.indexOf(']')))})
}

function fourDirectionExtend(map, keyString){
  const x = deconstruct(keyString).second;
  const y = deconstruct(keyString).first;
  let availableDot = [];
  //Go up
  let upper = y - 1;
  while (upper >= 0){
    let goUp = fetchKeyString([upper, x]);
    if (map[goUp] === 'null'){
      availableDot.push((goUp));
      upper--;
    } else {break;}
  }

  //Go down
  let lower = y + 1;
  while (lower < height){
    let goDown = fetchKeyString([lower, x]);
    if (map[goDown] === 'null'){
      availableDot.push((goDown));
      lower++;
    } else {break;}
  }

  //Go right
  let right = x + 1;
  while (right < width){
    let goRight = fetchKeyString([y, right]);
    if (map[goRight] === 'null'){
      availableDot.push((goRight));
      right++;
    } else {break;}
  }

  //Go left
  let left = x - 1;
  while (left >= 0){
    let goLeft = fetchKeyString([y, left]);
    if (map[goLeft] === 'null'){
      availableDot.push((goLeft));
      left--;
    } else {break;}
  }

  return availableDot;
}

function connectLine(curr, prev, extendMap){
  //console.log('This pair is ' + curr + '  and  ' + prev);
  //console.log(extendMap);
  const currExtend = extendMap[curr];
  //console.log('current Extend : ' + currExtend);
  const prevExtend = extendMap[prev];
  //console.log('prev Extend : ' + prevExtend);
  const currFirst = deconstruct(curr).first;
  const currSec = deconstruct(curr).second;
  const prevFirst = deconstruct(prev).first;
  const prevSec = deconstruct(prev).second;
  if (currFirst === prevFirst && (Math.abs(currSec - prevSec) === 1)){
    //console.log('next to!');
    return [curr, prev];
  }
  if (currSec === prevSec && (Math.abs(currFirst - prevFirst) === 1)){
    //console.log('next to!');
    return [curr, prev];
  }
  if (!currExtend) return null;
  if (!prevExtend) return null;

  for (var i=0; i<currExtend.length; i++){
    for (var j=0; j<prevExtend.length; j++){
      //console.log(currExtend[i]);
      //console.log(extendMap[prevExtend[j]]);
      const currExFirst = deconstruct(currExtend[i]).first;
      const currExSec = deconstruct(currExtend[i]).second;
      const prevExFirst = deconstruct(prevExtend[j]).first;
      const prevExSec = deconstruct(prevExtend[j]).second;
        if (currExtend[i]  === prevExtend[j]){
          return [ curr, currExtend[i], prev ];
        } else {
          if ((currExFirst === prevExFirst) && (extendMap[prevExtend[j]].includes(currExtend[i]))) {
            return [curr, currExtend[i], prevExtend[j], prev];
          } if ((currExSec === prevExSec) && (extendMap[prevExtend[j]].includes(currExtend[i]))){
            return [curr, currExtend[i], prevExtend[j], prev];
          }
        } 
    }
  }
  return null;
}

export default Game;

// ReactDOM.render(
//   <Game />,
//   document.getElementById('root')
// );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals