import { PlaygroundService } from './playground.service';
import { ActionService } from './action.service';
import { Title } from '@angular/platform-browser';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from './user.service';
import { GameService } from './game.service';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import * as _ from './constants';
import { MatSelectModule } from '@angular/material/select';

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

  selectedCharacter = ''
  selectedWeapon = ''
  selectedRoom = ''
  outOfGame = false
  wonGame = false
  newCards = []
  whoseTurn = ''
  hasMoved = false
  hasSuggested = false
  hasAccused = false

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
    this.whoseTurn = ''

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
            this.currentPlayer = this.game.players.find((player) => {
              return player.name === this.user
            })
            this.newCards = this.currentPlayer['newCards']
            this.whoseTurn = this.game.players[this.game.turn].name

            this.setPlayerLocations();
          }
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

  endTurn() {
    this.hasMoved = false;
    this.hasSuggested = false;
    this.gameService.nextTurn(this.game);
  }

  clickCell(move: string) {
    if (this.hasMoved) {
      this.banner = 'Already moved this round'
      return
    }
    let location = this.game.characters.find((character) => {
      return this.currentPlayer['character'] === character.character;
    })
    let possibleMoves = this.actionsService.possibleMoves(location.room)
    if (this.currentlyInGame) {
      if (this.isMyTurn()) {
        if (possibleMoves.includes(move)) {
          this.banner = `Made your move to ${move}`
          this.gameService.movePlayer(move, this.currentPlayer['character'], this.game);
          this.hasMoved = true
          //this.gameService.nextTurn(this.game);
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

    this.game.characters.forEach((character) => {
      switch (character.room) {
        case _.STUDY:
          this.nameStudy = `${this.nameStudy} \n ${character.character}`
          break;
        case _.HALL:
          this.nameHall = `${this.nameHall}  ${character.character}`
          break;
        case _.LOUNGE:
          this.nameLounge = `${this.nameLounge}  ${character.character}`
          break;
        case _.LIBRARY:
          this.nameLibrary = `${this.nameLibrary}  ${character.character}`
          break;
        case _.BILLIARD:
          this.nameBilliard = `${this.nameBilliard}  ${character.character}`
          break;
        case _.DINING:
          this.nameDining = `${this.nameDining}  ${character.character}`
          break;
        case _.CONSERVATORY:
          this.nameConservatory = `${this.nameConservatory}  ${character.character}`
          break;
        case _.BALLROOM:
          this.nameBallRoom = `${this.nameBallRoom}  ${character.character}`
          break;
        case _.KITCHEN:
          this.nameKitchen = `${this.nameKitchen}  ${character.character}`
          break;
        case _.HALL_A:
          this.nameA = `${this.nameA}  ${character.character}`
          break;
        case _.HALL_B:
          this.nameB = `${this.nameB}  ${character.character}`
          break;
        case _.HALL_C:
          this.nameC = `${this.nameC}  ${character.character}`
          break;
        case _.HALL_D:
          this.nameD = `${this.nameD}  ${character.character}`
          break;
        case _.HALL_E:
          this.nameE = `${this.nameE}  ${character.character}`
          break;
        case _.HALL_F:
          this.nameF = `${this.nameF}  ${character.character}`
          break;
        case _.HALL_G:
          this.nameG = `${this.nameG}  ${character.character}`
          break;
        case _.HALL_H:
          this.nameH = `${this.nameH}  ${character.character}`
          break;
        case _.HALL_I:
          this.nameI = `${this.nameI}  ${character.character}`
          break;
        case _.HALL_J:
          this.nameJ = `${this.nameJ}  ${character.character}`
          break;
        case _.HALL_K:
          this.nameK = `${this.nameK}  ${character.character}`
          break;
        case _.HALL_L:
          this.nameL = `${this.nameL}  ${character.character}`
          break;
        default:
          console.log("Awk Broken");
          break;
      }
    })

  }

  makeSuggestion() {
    if (this.selectedCharacter === '' ||
      this.selectedRoom === '' ||
      this.selectedWeapon === '') {
      this.banner = 'Fill out all Suggestions';
      return;
    }

    if (this.selectedRoom !== this.game.characters.find((character) => {
      return this.currentPlayer['character'] === character.character;
    }).room) {
      this.banner = 'Can only accuse someone in your room!'
      return
    }
    this.hasSuggested = true
    this.gameService.movePlayer(this.game.characters.find((character) => {
      return this.currentPlayer['character'] === character.character;
    }).room, this.selectedCharacter, this.game)

    let otherPlayers = this.game.players.filter((character) => {
      return this.currentPlayer['character'] !== character.character;
    })

    console.log(otherPlayers)
    let otherCards = otherPlayers.flatMap((x) => {
      return x.cards
    })

    console.log(otherCards)

    if (otherCards.includes(this.selectedCharacter)) {
      this.gameService.addCard(this.game, this.user, this.selectedCharacter)
      return
    }

    if (otherCards.includes(this.selectedRoom)) {
      this.gameService.addCard(this.game, this.user, this.selectedRoom)
      return
    }

    if (otherCards.includes(this.selectedWeapon)) {
      this.gameService.addCard(this.game, this.user, this.selectedWeapon)
      return
    }

    this.banner = 'No one had any of your suggestions...hint* hint*'
  }

  makeAccusation() {
    if (this.selectedCharacter === '' ||
      this.selectedRoom === '' ||
      this.selectedWeapon === '') {
      this.banner = 'Fill out all Accusations';
      return;
    }

    let murderer = this.game.murderer;
    if (this.selectedCharacter === murderer.name &&
      this.selectedRoom === murderer.room &&
      this.selectedWeapon === murderer.weapon) {
      this.wonGame = true
      this.closeGame(this.game)
      return;
    } else {
      this.banner = 'Sorry you guessed wrong'
      this.outOfGame = true;
      return;
    }
  }

  // returns boolean
  isInRoom() {
    let location = this.game.characters.find((character) => {
      return this.currentPlayer['character'] === character.character;
    })
    switch (location.room) {
      case _.STUDY:
      case _.LOUNGE:
      case _.LIBRARY:
      case _.BILLIARD:
      case _.DINING:
      case _.CONSERVATORY:
      case _.BALLROOM:
      case _.KITCHEN:
      case _.HALL:
        return true;
      default:
        return false;
    }
  }
}
