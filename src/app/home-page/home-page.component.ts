import { PlaygroundService } from './playground.service';
import { ActionService } from './action.service';
import { Title } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './user.service';
import { GameService } from './game.service';
import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import * as _ from './constants';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  message = "";
  gameTitle = "";
  games = [];
  currentlyInGame = false;
  user = ""
  banner = ""
  game = null
  currentPlayer = {}
  latestMessage = ""

  nameStudy = ""
  nameHall = ""
  nameLounge = ""
  nameLibrary = ""
  nameBilliard = ""
  nameDining = ""
  nameConservatory = ""
  nameBallRoom = ""
  nameKitchen = ""
  nameA = ""
  nameB = ""
  nameC = ""
  nameD = ""
  nameE = ""
  nameF = ""
  nameG = ""
  nameH = ""
  nameI = ""
  nameJ = ""
  nameK = ""
  nameL = ""

  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth,
    public gameService: GameService,
    public userService: UserService,
    public actionsService: ActionService,
    public playgroundService: PlaygroundService) {

    this.message = ""
    this.gameTitle = ""
    this.game = null
    this.games = []
    this.currentlyInGame = false
    this.banner = ""
    this.latestMessage = ""
    this.afAuth.user.subscribe((user) => {
      this.user = user.email
    })
  }

  ngOnInit() {
    this.gameService.subscribeToMessages().snapshotChanges().pipe(
      map((doc) => {
        this.latestMessage = doc.payload.data()['message']
      })
    ).subscribe()

    this.userService.loadUser()

    let games = this.gameService.subscribeToGames();
    games.snapshotChanges()
      .pipe(
        map(change => {
          this.games = change.map(this.gameService.documentToDomainObject)
          let gamesIn = this.games.filter((game) => {
            return game.players.filter((player) => {
              return player.name === this.user;
            }).length !== 0
          });
          if (gamesIn.length == 0) {
            this.currentlyInGame = false
            this.banner = "Join a game to start!"
          } else {
            this.currentlyInGame = true;
            this.game = gamesIn[0]
            this.currentPlayer = this.game.players[this.game.turn]
          }
          this.setPlayerLocations();
        })
      ).subscribe()

  }

  sendMessage() {
    this.gameService.writeMessage(this.message)
  }

  createGame() {
    if (this.gameTitle === "") {
      this.banner = "Please Enter a Name first"
      return;
    }
    this.banner = "Game Created!"
    this.gameService.createGame(this.gameTitle)
  }

  clickCell(move: string) {
    let possibleMoves = this.actionsService.possibleMoves(this.currentPlayer['location'])
    if (this.currentlyInGame) {
      if (this.isMyTurn()) {
        if (possibleMoves.includes(move)) {
          this.banner = `Made your move to ${move}`
          this.gameService.movePlayer(move, this.currentPlayer, this.game);
          this.gameService.nextTurn(this.game);
        } else {
          this.banner = `Cannot move to ${move}`
        }
      } else {
        this.banner = `Not your turn`
      }
    } else {
      this.banner = `Not in a game but clicked on ${move}`
    }
  }

  joinGame(game) {
    this.afAuth.user.subscribe((user) => {
      this.user = user.email
    })
    if (this.currentlyInGame) {
      this.banner = "Can't Join the game, already in a game"
      return
    }
    this.banner = `Joined Game: ${game.title}`
    this.gameService.joinGame(game)
  }

  closeGame(game) {
    this.banner = "Just closed the game"
    this.gameService.closeGame(game);
  }

  isMyTurn() {
    return this.game.players[this.game.turn].name === this.user;
  }

  setPlayerLocations() {
    this.nameStudy = ""
    this.nameHall = ""
    this.nameLounge = ""
    this.nameLibrary = ""
    this.nameBilliard = ""
    this.nameDining = ""
    this.nameConservatory = ""
    this.nameBallRoom = ""
    this.nameKitchen = ""
    this.nameA = ""
    this.nameB = ""
    this.nameC = ""
    this.nameD = ""
    this.nameE = ""
    this.nameF = ""
    this.nameG = ""
    this.nameH = ""
    this.nameI = ""
    this.nameJ = ""
    this.nameK = ""
    this.nameL = ""

    this.game.players.forEach((player) => {
      console.log(player)
      switch (player.location) {
        case _.STUDY:
          this.nameStudy = player.character
          break;
        case _.HALL:
          this.nameHall = player.character
          break;
        case _.LOUNGE:
          this.nameLounge = player.character
          break;
        case _.LIBRARY:
          this.nameLibrary = player.character
          break;
        case _.BILLIARD:
          this.nameBilliard = player.character
          break;
        case _.DINING:
          this.nameDining = player.character
          break;
        case _.CONSERVATORY:
          this.nameConservatory = player.character
          break;
        case _.BALLROOM:
          this.nameBallRoom = player.character
          break;
        case _.KITCHEN:
          this.nameKitchen = player.character
          break;
        case _.HALL_A:
          this.nameA = player.character
          break;
        case _.HALL_B:
          this.nameB = player.character
          break;
        case _.HALL_C:
          this.nameC = player.character
          break;
        case _.HALL_D:
          this.nameD = player.character
          break;
        case _.HALL_E:
          this.nameE = player.character
          break;
        case _.HALL_F:
          this.nameF = player.character
          break;
        case _.HALL_G:
          this.nameG = player.character
          break;
        case _.HALL_H:
          this.nameH = player.character
          break;
        case _.HALL_I:
          this.nameI = player.character
          break;
        case _.HALL_J:
          this.nameJ = player.character
          break;
        case _.HALL_K:
          this.nameK = player.character
          break;
        case _.HALL_L:
          this.nameL = player.character
          break;
        default:
          console.log("Awk Broken");
          break;
      }
    })

  }
}
