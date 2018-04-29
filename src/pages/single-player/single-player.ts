import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-single-player',
  templateUrl: 'single-player.html',
})
export class SinglePlayerPage {

  board: number[];

  boardRows: number[] = [1, 2, 3];
  boardCols: number[] = [1, 2, 3];


  gameBoard: string[][];

  winCombination: number[][] = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]
  ];

  firstGamer = "FIRSTPLAYER";
  secondGamer = "SECONDPLAYER";
  firstGamerSymbol: string = 'x';
  secondGamerSymbol: string = '0';
  firstGamerNumber: number = 1;
  secondGamerNumber: number = 2;
  gamer: string;


  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {

  }

  ionViewDidLoad() {
    this.initialGameBoard();
  }


  // инициализация игровой доски - почистить сетку, установим первого игрока
  initialGameBoard() {
    this.gameBoard = [
      [null, null, null],
      [null, null, null],
      [null, null, null]
    ];

    this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let row of this.boardRows) {
      for (let col of this.boardCols) {
        document.getElementById(this.getCellId(row, col))
          .classList.remove('cell-background1', 'cell-background2');
      }
    }

    this.setGamer(this.firstGamer);
  }

  /**
   * Поиск оптимального хода
   *
   * @returns {number} - номер ячейки для хода
   */
  searchMove(): number {
    let cell: number = 0;
    let estimateMoveOpponent: number; // оценка хода соперника
    let estimateMove: number; // оценка своего хода
    for (let lc of this.winCombination) {
      estimateMoveOpponent = 0;
      estimateMove = 0;
      //console.log(lc)
      // цикл для поиска предвыиграшной комбинации - "занято две из трех ячеек"
      for (let pos of lc) {
        let boardPosVal = this.board[pos - 1];
        if (boardPosVal == this.firstGamerNumber) {
          estimateMoveOpponent += boardPosVal;
        } else if (boardPosVal == this.secondGamerNumber) {
          estimateMove += boardPosVal;
        }
      }

      //console.log("estimateMoveOpponent = "+estimateMoveOpponent+"; estimateMove = "+estimateMove)

      // если у оппонента следующий ход может быть выигрышным (две из трех ячеек по выиграшной линии отмечены), то займем свободную сами
      if (estimateMoveOpponent > this.firstGamerNumber) {
        for (let pos of lc) {
          if (this.board[pos - 1] == 0) {
            cell = pos;
          }
        }
        break;
      } else if (estimateMove > this.secondGamerNumber) {
        for (let pos of lc) {
          if (this.board[pos - 1] == 0) {
            cell = pos;
          }
        }
        break;
      }
    }

    // если нигде не нашли предвыиграшную комбинацию, то сходим рандомно
    if(cell == 0) {
      cell = this.freeCellGameBoard()
    }

    return cell;
  }

  // закрыть страницу
  goBack() {
    this.navCtrl.pop();
  }


  doConfirm(gamerSymbol: string) {
    let confirm = this.alertCtrl.create({
      title: 'УРАААА!!!',
      message: 'Победил   игрок ' + gamerSymbol,
      buttons: [
        {
          text: 'Уходим отсюда',
          handler: () => {
            this.goBack()
          }
        },
        {
          text: 'Сыграть еще раз',
          handler: () => {
            this.initialGameBoard();
          }
        }
      ]
    });
    confirm.present()
  }


  goPlay(cell: number) {
    console.log('игрок ' + this.firstGamer + ': id_' + cell);
    this.play(this.firstGamer, cell);
    if (this.getGamer() == this.secondGamer) {
      let cellBoard = this.searchMove(); //this.freeCellGameBoard();
      console.log('игрок ' + this.secondGamer + ': id_' + cellBoard);
      this.play(this.secondGamer, cellBoard);
    }
  }

  play(gamer: string, cell: number): void {
    if (this.checkCellIsEmpty(cell)) {
      // какими играет игрок
      let gamerNumber: number = this.getGamerNumber(gamer);
      this.setSymbolOnGameBoard(gamerNumber, cell);
      let className: string = this.getGamerClassName(gamer);
      // на какую ячейку ходит
      console.log("id_" + cell.toString())
      document.getElementById("id_" + cell.toString()).classList.add(className);
      // проверим, вдруг выиграл?
      if (this.isWinning(gamer)) {
        console.log('WIN!!!!!!!!!');
        this.doConfirm(gamerNumber.toString());
      } else { //TODO: дописать ничью..
        // передать ход другому
        this.setNextGamer();
      }
    } else {
      console.log('ячейка занята');
    }
    //this.gameBoardPrint();
    this.boardPrint();
  }


  /**
   *  Свободная ячейка
   *
   * @returns {number}
   */
  freeCellGameBoard(): number {
    /*
    let randomCell: number = this.randomInt(1, 9);

    console.log("randomCell = "+randomCell)


    if (this.checkCellIsEmpty(randomCell)){
      return randomCell;
    } else {
      this.checkCellIsEmpty(randomCell);
    }
    */
    for (let i = 0; i < this.board.length; i++) {
      // TODO: доработать, сейчас возвращает первую свободную
      if (this.board[i] == 0) {
        return ++i;
      }
    }
  }

  getRandomCell(){

  }

  randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /**
   *  Проверим выигрышной комбинации
   *
   * @param {string} gamer
   * @returns {boolean}
   */
  isWinning(gamer: string): boolean {
    let gamerNumber = this.getGamerNumber(gamer);
    let count: number;

    for (let lc of this.winCombination) {
      count = 0;
      for (let pos of lc) {
        let boardPosVal = this.board[pos - 1];
        if (boardPosVal == gamerNumber) {
          count++;
        }
        if (count == 3) {
          return true;
        }
      }
    }

    //console.log("count = "+count)
    return false;
  }

  setSymbolOnGameBoard(gamerSymbol: number, cell: number) {
    this.board[cell - 1] = gamerSymbol;
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

  /*getGamerSymbol(gamer: string): string {
    return gamer == this.firstGamer ? this.firstGamerSymbol : this.secondGamerSymbol;
  }*/
  getGamerNumber(gamer: string): number {
    return gamer == this.firstGamer ? this.firstGamerNumber : this.secondGamerNumber;
  }

  checkCellIsEmpty(cell: number): boolean {
    //return this.gameBoard[row - 1][col - 1] == null;
    return this.board[cell - 1] == 0;
  }

  /*getCellId(index: string): string {
    return 'id_' + index;
  }*/

  getCellId(row: number, col: number): string {
    return "id_" + this.getCellIndex(row, col).toString();
  }

  getCellIndex(row: number, col: number): number {
    let index: number;
    if (row == 1) {
      index = col;
    } else if (row == 2) {
      index = col + 3;
    } else {
      index = col + 6
    }
    return index;
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

  boardPrint(): void {
    let sb: string = '';
    for (let i in this.board) {
      sb += ' ' + this.board[i];
    }
    console.log(sb);
  }

}
