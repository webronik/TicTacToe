import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-single-player',
  templateUrl: 'single-player.html',
})
export class SinglePlayerPage {

  boardRows: number[] = [1, 2, 3];
  boardCols: number[] = [1, 2, 3];

  gameBoard: string[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];

  firstGamer = "FIRSTPLAYER";
  secondGamer = "SECONDPLAYER";
  firstGamerSymbol: string = 'x';
  secondGamerSymbol: string = '0';
  gamer: string;


  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  goBack() {
    this.navCtrl.pop();
  }



  goPlay(row: number, col: number) {
    console.log('игрок '+this.firstGamer+': id_'+row+''+col);
    this.play(this.firstGamer, row, col);
    if (this.getGamer() == this.secondGamer) {
      let freeCellGameBoard = this.freeCellGameBoard();
      console.log('игрок '+this.secondGamer+': id_'+freeCellGameBoard.row+''+freeCellGameBoard.col);
      this.play(this.secondGamer, freeCellGameBoard.row, freeCellGameBoard.col);
    }
  }

  play(gamer: string, row: number, col: number): void {
    if (this.checkCellIsEmpty(row, col)) {
      // какими играет игрок
      let gamerSymbol: string = this.getGamerSymbol(gamer);
      this.setSymbolOnGameBoard(gamerSymbol, row, col);
      // на какую ячейку ходит
      let itemId: string = this.getCellId(row + '' + col);
      let className: string = this.getGamerClassName(gamer);
      document.getElementById(itemId).classList.add(className);
      //проверим, вдруг выиграл?
      if (!this.isWinning(gamer)){
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      } else {
        // передать ход другому
        this.setNextGamer();
      }
    } else {
      console.log('ячейка занята');
    }
    this.gameBoardPrint();
  }


  freeCellGameBoard(): CellGameBoard{
    for (let row of this.boardRows) {
      for (let col of this.boardCols) {
        if (this.gameBoard[row-1][col-1] == null){
          return new CellGameBoard(row, col);
        }
      }
    }
  }


  isWinning(gamer: string): boolean {
    let gamerSymbol = this.getGamerSymbol(gamer);

    return true;
  }

  setSymbolOnGameBoard(gamerSymbol: string, row: number, col: number){
    this.gameBoard[row - 1][col - 1] = gamerSymbol;
  }

  getGamer(): string {
    return this.gamer;
  }

  setGamer(gamer: string): void {
    this.gamer = gamer;
  }

  setNextGamer(): void {
    this.setGamer(this.getGamer() != this.secondGamer ? this.secondGamer : this.firstGamer);
  }

  getGamerClassName(gamer: string): string {
    return gamer == this.firstGamer ? 'cell-background1' : 'cell-background2';
  }

  getGamerSymbol(gamer: string): string {
    return gamer == this.firstGamer ? this.firstGamerSymbol : this.secondGamerSymbol;
  }

  checkCellIsEmpty(row: number, col: number): boolean {
    return this.gameBoard[row - 1][col - 1] == null;
  }

  getCellId(index: string): string {
    return 'id_' + index;
  }

  gameBoardPrint(): void {
    let bg: string = '';
    let bgrow: string;
    for (let i of this.boardRows) {
      bgrow = '';
      for (let j of this.boardCols) {
        bgrow += ' ' + this.gameBoard[i - 1][j - 1]
      }
      bg += bgrow + '\n';
    }
    console.log(bg);
  }

}


class CellGameBoard {
  row: number;
  col: number;
  constructor(row: number, col: number){
    this.row = row;
    this.col = col;
  }
}
