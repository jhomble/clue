import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActionService } from './action.service';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from './constants';
const playersToPlay = 2

@Injectable({
    providedIn: 'root'
})

export class GameService {

    actionsService: ActionService;
    game = null;
    subscription;
    snapshot = false
    user = null

    subscribeToMessages() {
        return this.db.collection('messages').doc('messages');
    }

    subscribeToGames() {
        return this.db.collection('games');
    }

    writeMessage(text: string) {
        this.db.collection('messages').doc("messages").set({
            message: text
        }).then((data) => {
            console.log('wrote message', data)
        }).catch((err) => {
            console.log('error writing message', err)
        })
    }

    createGame(name: string) {
        console.log("name", name)
        let full = false;
        // if (playersToPlay === 1) {
        //     full = true
        // }

        this.db.collection('games').doc(name).set({
            title: name,
            full : full,
            users : [],
            players: [],
            characters: [],
            murderer : {
                name : "",
				room : "", 
                weapon: "",
            },
        })
    }

    joinGame(game) {
        console.log(game)
        if (game.players.length >= playersToPlay) {
            alert("Game is Full")
        } else {
            // if (game.players.length >= (playersToPlay - 1)) {
                
                this.db.collection('games').doc(game.title).get()
                .toPromise()
                .then(doc => {
                    const users = [];

                    for (let i = 0; i < doc.data().users.length; i++){
                        console.log()
                        users.push(doc.data().users[i])
                    }

                    //Push new user
                    users.push(this.user)
                    this.db.collection('games').doc(game.title).update({
                        users : users
                    })
                    console.log(this.user + " added to game!")

                    if (game.users.length + 1 >= playersToPlay)
                    {
                        this.initGame(game);
                    }
                }).catch(console.log)

                // this.db.collection('games').doc(game.title).set({
                //     title: game.title,
                //     full: true,
                //     players: [...game.players, {
                //         name: this.user,
                //         location: _.STUDY, // TODO dont harcode
                //         character: _.MISS_SCARLET // TODO dont harcode
                //     }],
                //     turn: 0
                // })
            // } else {
                // this.db.collection('games').doc(game.title).set({
                //     title: game.title,
                //     full: false,
                //     players: [...game.players, {
                //         name: this.user,
                //         location: _.STUDY, // TODO dont harcode
                //         character: _.MISS_SCARLET // TODO dont harcode
                //     }],
                //     turn: null
                // })
            // }
        }
    }

    addCard(game, name, card) {
        let players = game.players
        players.forEach((player) => {
            if (player.name === name) {
                player.newCards.push(card);
            }
        })
        this.db.collection('games').doc(game.title).update({
            players
        })
    }

    initGame(game) {

        const result = this.db.firestore.collection('games').doc(game.title).get();

        let characters = [_.PROFESSOR_PLUM, _.MISS_SCARLET, _.COLONEL_MUSTARD, _.MR_BODDY, _.MRS_WHITE, _.MRS_PEACOCK]
        let rooms = [_.STUDY, _.LOUNGE, _.LIBRARY, _.KITCHEN,
            _.HALL, _.DINING, _.CONSERVATORY];
        let weapons = [_.WRENCH, _.CANDLE_STICK, _.ROPE, _.LEAD_PIPE, _.DAGGER, _.REVOLVER];

        result.then(doc => {

             //Variables
             let users = []
             let players = []
             var deck = [];
            
            let mCharacter = characters[Math.floor(Math.random() * characters.length)]
            let mRoom = rooms[Math.floor(Math.random() * rooms.length)]
            let mWeapon = weapons[Math.floor(Math.random() * weapons.length)]

            //Create murderer at random
            let murderer = {
                name : mCharacter,
                room : mRoom,
                weapon : mWeapon,
            };

            characters = characters.filter((x) => {
                return x !== mCharacter
            })
            
            rooms = rooms.filter((x) => {
                return x !== mRoom
            })

            weapons = weapons.filter((x) => {
                return x !== mWeapon
            })

            //Concat characters, weapons and rooms to create deck
            deck = deck.concat(characters, weapons, rooms);

            //Add users to users list
            for (let i = 0; i < doc.data().users.length; i++){
                console.log()
                users.push(doc.data().users[i])
            }

            //Assign players and deal hands
            players = this.dealHands(deck, this.assignPlayers(users,characters))
            
            //Update game model
            this.db.collection("games").doc(game.title).update({
                turn: 0,
                players : players,
                murderer : murderer,
                characters : this.assignCharacterLocations(rooms, characters),
            })
        }).catch(console.log)
    }

    assignCharacterLocations(rooms, characters){
        //Variables
        let count = 0
        let arr = []
        let characterLocation = []

        while (arr.length < characters.length) {
            var r = Math.floor(Math.random() * characters.length) + 1;
            if (arr.indexOf(r) === -1) arr.push(r);
        }

        characters.forEach(character => {
            characterLocation.push({
                character : character,
                room : rooms[arr[count]]
            })
            count++
        });

        return characterLocation
    }

    assignPlayers(users, characters) {

        //Variables
        let count = 0
        let players = [];
        let arr = []
        
        //Create random list of unique indexes for each users
        while (arr.length < users.length) {
            var r = Math.floor(Math.random() * users.length) + 1;
            if (arr.indexOf(r) === -1) arr.push(r);
        }

        //Assign player to user
        users.forEach(user => {
            players.push({
                    name : user,
                    character: characters[arr[count]],
                    cards : [],
                    newCards: [],
            });
            count++;
        })
        return players;
    }

    dealHands(cards, players){

        //Shuffle deck
        let deck = this.shuffle(cards);

        //Pass out cards
        while (deck.length !== 0) {
           for (let i = 0; i < players.length; i++) {
               if (deck.length > 0) {
                    players[i].cards.push(deck.pop())
               }
                
            }
        }

        //Return players with cards
        return  players;
    }

    shuffle(deck: [] ){
        for (let i = deck.length - 1; i > 0; i--) {
           let j = Math.floor(Math.random() * (i + 1));
           let swap = deck[i];
           deck[i] = deck[j];
           deck[j] = swap;
       }
       return deck;
    }

    documentToDomainObject = _ => {
        const object = _.payload.doc.data();
        object.id = _.payload.doc.id;
        return object;
    }

    nextTurn(game) {
        this.db.collection('games').doc(game.title).set({
            title: game.title,
            full: true,
            players: game.players,
            murderer: game.murderer,
            characters: game.characters,
            users: game.users,
            turn: (game.turn + 1) % (game.players.length)
        })
    }

    movePlayer(move, character, game) {
        game.characters.forEach((x) => {
            if (x.character === character) {
                x.room = move
            }
        })

        this.db.collection('games').doc(game.title).set({
            title: game.title,
            full: true,
            murderer: game.murderer,
            players: game.players,
            users: game.users,
            characters: game.characters,
            turn: game.turn
        })
    }

    closeGame(game) {
        this.db.collection('games').doc(game.title).delete().then((data) => {
            //alert(`${game.title} has been closed`)
        })
    }

    dispose() {
        this.subscription.unsubscribe();
        this.game = null;
    }

    constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {

        this.afAuth.user.subscribe((user) => {
            console.log("This email is logged in", user.email)
            this.user = user.email
        })

    }
}
