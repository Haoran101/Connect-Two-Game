import React, { Component, createElement } from 'react';
import ReactDOM from 'react-dom';
import Game from './index.js'
import './app.css'

export const MAX_HEIGHT = 9;
export const MAX_WIDTH = 15;
export const ICON = ['boluo','caomei','juzi','liulian','mihoutao','sangshen','xigua','yezi','shanzha','pingguo','li','ningmeng','huolongguo','putao','lanmei'];

export const MAPS = {
             0: [[5,5], [5,6]],
             1: [[1,4] , [1,5] , [1,9] , [1,10] , [1,11] , [1,12] , [1,13] , [2,3] , [2,4] , [2,5] ,  [2,9] , [2,10] , [2,11] , [2,12] , [2,13] , [3,2] , [3,3] , [3,4] , [3,5] ,  [3,9] , [3,10] , [3,11] , [3,12] , [3,13] ,[4,1] , [4,2] , [4,3] , [4,4] , [4,5] ,  [4,9] , [4,10] , [4,11] , [4,12] , [4,13] , [5,1] , [5,2] , [5,3] , [5,4] , [5,5] ,  [5,9] , [5,10] , [5,11] , [5,12] , [6,1] , [6,2] , [6,3] , [6,4] , [6,5] ,  [6,9] , [6,10] , [6,11] , [7,1] , [7,2] , [7,3] , [7,4] , [7,5] ,  [7,9] , [7,10]], 
            //  2: [[1,1] , [3,1], [5,1] , [7,1] , [9,1] , [11,1], [13,1], [2,2] , [4,2] , [6,2], [8,2], [10,2], [12,2], [1,3] , [3,3] , [5,3], [7,3] , [9,3] , [11,3], [13,3], [2,4] , [4,4] , [6,4] , [8,4] , [10,4], [12,4], [1,5] , [3,5] , [5,5] , [7,5] , [9,5], [11,5], [13,5], [2,6] , [4,6] , [6,6], [8,6], [10,6], [12,6], [1,7], [3,7] , [5,7] , [7,7] , [9,7] , [11,7], [13,7], ],
            //  3: [[2,1], [3,1], [4,1], [5,1], [6,1], [7,1], [8,1], [9,1], [10,1], [11,1], [12,1], [1,2], [3,2], [4,2], [5,2], [6,2], [7,2], [8,2], [9,2], [10,2], [11,2], [13,2], [1,3], [2,3], [4,3], [5,3], [6,3], [7,3], [8,3], [9,3], [10,3], [12,3], [13,3], [1,4], [2,4], [3,4], [5,4], [6,4], [7,4], [8,4], [9,4], [11,4], [12,4], [13,4], [1,5], [2,5], [3,5], [4,5], [6,5], [7,5], [8,5], [10,5], [11,5], [12,5], [13,5], [1,6], [2,6], [3,6], [4,6], [5,6], [7,6], [9,6], [10,6], [11,6], [12,6], [13,6], [1,7], [2,7], [3,7], [4,7], [5,7], [6,7], [8,7], [9,7], [10,7], [11,7], [12,7], [13,7], ]
            };

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentLevel : 0,
            currentPage : 'start',
        }
    }

    handleStart(){
        console.log(this.state.currentLevel);
        this.setState({
            currentLevel: this.state.currentLevel,
            currentPage: 'game',
        });
    }

    render(props) {
        let currentPage = this.state.currentPage;
        const renderPage = () => {
            if (currentPage === 'start' || currentPage === 'next' || currentPage === 'restart'){
                return <button className = 'start' onClick={() => this.handleStart()}> {currentPage} </button>;
            }
            else {
                console.log(this.state.currentLevel);
                console.log(MAPS[this.state.currentLevel]);
                return (
                <Game className='main-game' level = {this.state.currentLevel} emptyMap = {MAPS[this.state.currentLevel]} setState = {p => this.setState(p)}/>);
            }
        }

        return (
            <div className='all'>
            <h1 className='Title'> Connect 2 </h1>
            <div className = 'board'>
                {renderPage()}
            </div>
            <canvas id='canvas' height='325' width='650'></canvas>
          </div>
        );
    }
}

class RealApp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentPage: 'start',
            currentLevel: 0,
        }
    }

    handleStart(next){
        let nextLevel = 0;
        if (next === 'next'){
            nextLevel = this.state.currentLevel + 1;
        } 
        this.setState({
            currentPage: 'game',
            currentLevel: nextLevel,
        });
    }

    render(props){
        let currentPage = this.state.currentPage;
        const pageRender = () => {
            if (currentPage === 'start'){
                return <button className = 'start' onClick={() => this.handleStart('start')}> start </button>;
            } if (currentPage === 'game'){
                return <Game className='main-game' level = {this.state.currentLevel} setState = {p => this.setState(p)}/>;
            } if (currentPage === 'next'){
                return <button className = 'start' onClick={() => this.handleStart('next')}> next </button>;
            } if (currentPage === 'restart') {
                return <button className = 'start' onClick={() => this.handleStart('restart')}> restart </button>;
            }
        }

        return(
            <div className='all'>
            <h1 className='Title'> Connect 2 </h1>
            <div className = 'board'>
            {pageRender()}
            </div>
            <canvas id='canvas' height='325' width='650'></canvas>
          </div>
        );
    }
}

export default App;

ReactDOM.render(
    <App />,
    document.getElementById('root')
  );