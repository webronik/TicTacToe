import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {SinglePlayerPage} from '../single-player/single-player'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  singlePlayer = SinglePlayerPage;

  constructor(public navCtrl: NavController) {

  }

  goSinglePlayerPage() {
    this.navCtrl.push(SinglePlayerPage);
  }

}
