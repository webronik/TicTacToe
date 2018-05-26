import {Component} from '@angular/core';
import {AlertController, NavController, NavParams, ToastController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  board: number[];

  boardRows: number[] = [1, 2, 3];
  boardCols: number[] = [1, 2, 3];


  gameBoard: string[][];

  winCombination: number[][] = [
    [1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]
  ];

  firstGamer = "FIRSTPLAYER";
  secondGamer = "SECONDPLAYER";
  firstGamerSymbol: string = 'X';
  secondGamerSymbol: string = 'O';
  firstGamerNumber: number = 1;
  secondGamerNumber: number = 2;
  gamer: string;
  finishGame: FinishGame;


  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, public toastCtrl: ToastController) {

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
    this.setStatus(true);
  }

  // закрыть страницу
  goBack() {
    this.navCtrl.pop();
  }


  doConfirm(gamerSymbol: string) {
    let msgWin: string, msgDraw: string, titleWin: string, titleDraw: string;
    msgWin = gamerSymbol == "1" ? 'Молодец, ты победил!' : 'Ну ты лузер, ты проиграл!';
    msgDraw = 'Ничья!!!';
    let toast = this.toastCtrl.create({
      message: this.finishGame.finishType == 'WIN' ? msgWin : msgDraw,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      this.initialGameBoard();
    });

    toast.present();
  }

  cellIsNotEmpty() {
    let alert = this.alertCtrl.create({
      title: 'Ячейка занята!',
      subTitle: 'Эта ячейка уже занята, сходите на другую!',
      buttons: ['OK']
    });
    alert.present();
  }


  goPlay(cell: number) {
    this.play(this.getGamer(), cell);
    if (this.getGamer() == this.secondGamer) {
      let cellBoard = this.searchMove();
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
      document.getElementById("id_" + cell.toString()).classList.add(className);
      // проверим, на выигрыш или ничью
      this.finishGame = this.checkFinishGame(gamer);
      if (this.finishGame.isFinish) {
        this.doConfirm(gamerNumber.toString());
      } else {
        // передать ход другому
        this.setNextGamer();
        this.setStatus();
      }
    } else {
      this.cellIsNotEmpty();
    }
    this.boardPrint();
  }

  /**
   * Установить статус в игре
   *
   * @param {boolean} isInitial - true, если начало игры
   */
  setStatus(isInitial?: boolean): void {
    this.delShadowClassScoreBoard();
    let gamerSymbol = this.getGamerSymbol();
    let status = isInitial ? 'Начните играть!' : 'Ходит ' + gamerSymbol;
    document.getElementById('status_game').innerHTML = '<p>' + status + '</p>';
    document.getElementById('gamer'+ (isInitial ? this.firstGamerSymbol : gamerSymbol)).classList.add('shadow');
  }

  /**
   * Удалить тень вокруг табло счета
   */
  delShadowClassScoreBoard(): void {
    document.getElementById('gamer'+this.firstGamerSymbol).classList.remove('shadow');
    document.getElementById('gamer'+this.secondGamerSymbol).classList.remove('shadow');
  }

  /**
   * Получить "символ" игрока
   *
   * @returns {string}
   */
  getGamerSymbol(): string {
    return this.getGamer() == this.firstGamer ? this.firstGamerSymbol : this.secondGamerSymbol;
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
      // цикл для поиска предвыиграшной комбинации - "занято две из трех ячеек"
      for (let pos of lc) {
        let boardPosVal = this.board[pos - 1];
        if (boardPosVal == this.firstGamerNumber) {
          estimateMoveOpponent += boardPosVal;
        } else if (boardPosVal == this.secondGamerNumber) {
          estimateMove += boardPosVal;
        }
      }

      // TODO: дописать ход на выигрыш, если два-два..
      // если у оппонента следующий ход может быть выигрышным (две из трех ячеек по выиграшной линии отмечены), то займем свободную сами
      if (estimateMoveOpponent > this.firstGamerNumber && estimateMove != this.secondGamerNumber) {
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
    if (cell == 0) {
      cell = this.getFreeCellRandom()
    }

    return cell;
  }

  /**
   *  Свободная ячейка рандомно
   *
   * @returns {number}
   */
  getFreeCellRandom(): number {
    let randomCell: number;
    let cellValue: number = 1;
    while (cellValue != 0) {
      randomCell = this.getRandomInt(1, 9);
      cellValue = this.board[randomCell - 1];
    }
    return randomCell;
  }

  /**
   * Подучить рандомно целое число в диапазоне от min до max
   *
   * @param min
   * @param max
   * @returns {any}
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   *  Проверить на выигрышную комбинацию или на ничью
   *
   * @param {string} gamer
   * @returns {boolean}
   */
  checkFinishGame(gamer: string): FinishGame {
    let gamerNumber = this.getGamerNumber(gamer);
    let count: number;

    // проверка на выиграш одного из участников
    for (let lc of this.winCombination) {
      count = 0;
      for (let pos of lc) {
        let boardVal = this.board[pos - 1];
        if (boardVal == gamerNumber) {
          count++;
        }
        if (count == 3) {
          return new FinishGame(true, "WIN"); // TODO: Переделать на enum FinishGame
        }
      }
    }

    // проверка на ничью
    let isCheckFreeCell: boolean = false;
    for (let boardVal of this.board) {
      if (boardVal == 0) {
        isCheckFreeCell = true;
      }
    }

    if (!isCheckFreeCell) {
      return new FinishGame(true, "DRAW"); // TODO: Переделать на enum FinishGame
    }

    //console.log("count = "+count)
    return new FinishGame(false, null);
  }

  /**
   * Установить символ на игровую доску
   *
   * @param {number} gamerSymbol
   * @param {number} cell
   */
  setSymbolOnGameBoard(gamerSymbol: number, cell: number) {
    this.board[cell - 1] = gamerSymbol;
  }

  /**
   * Получить игрока
   *
   * @returns {string}
   */
  getGamer(): string {
    return this.gamer;
  }

  /**
   * Установить игрока
   * @param {string} gamer
   */
  setGamer(gamer: string): void {
    this.gamer = gamer;
  }

  /**
   * Назначить ход следующему игроку
   */
  setNextGamer(): void {
    this.setGamer(this.getGamer() != this.secondGamer ? this.secondGamer : this.firstGamer);
  }

  getGamerClassName(gamer: string): string {
    return gamer == this.firstGamer ? 'cell-background1' : 'cell-background2';
  }


  getGamerNumber(gamer: string): number {
    return gamer == this.firstGamer ? this.firstGamerNumber : this.secondGamerNumber;
  }

  checkCellIsEmpty(cell: number): boolean {
    return this.board[cell - 1] == 0;
  }


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

class FinishGame {
  isFinish: boolean;
  finishType: string;

  constructor(isFinish: boolean, finishType: string) {
    this.isFinish = isFinish;
    this.finishType = finishType;
  }
}
