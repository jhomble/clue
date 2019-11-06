import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from './constants';
const playersToPlay = 1

@Injectable({
    providedIn: 'root'
})

export class GameService {

    game = null;
    subscription;
    snapshot = false
    user = null
    characters = [_.PROFESSOR_PLUM, _.MISS_SCARLET, _.COLONEL_MUSTARD, _.MR_BODDY, _.MRS_WHITE, _.MRS_PEACOCK]
    rooms = [_.STUDY, _.LOUNGE, _.LIBRARY, _.KITCHEN,
    _.HALL, _.DINING, _.CONSERVATORY];
    weapons = [_.WRENCH, _.CANDLE_STICK, _.ROPE, _.LEAD_PIPE, _.DAGGER, _.REVOLVER];


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
        if (playersToPlay === 1) {
            full = true
        }
        this.db.collection('games').doc(name).set({
            title: name,
            full,
            players: [
                {
                    name: this.user,
                    location: _.STUDY, // TODO dont harcode
                    character: _.MISS_SCARLET // TODO dont harcode
                }],
            turn: 0
        })
    }

    initGame() {

        console.log('Initiate Game')
        //Retrieve current players from DB and add to players array
        //const result = this.db.firestore.collection('games').doc(this.game.title).get();
        const result = this.db.firestore.collection('games').doc('Test').get();

        //Retrieve data from firestore
        result.then(doc => {

            //Variables
            let count = 0
            let arr = []
            var users = []
            this.game = []

            // Instantiat game -> players list
            this.game.players = []

            //Add users to users list
            for (let i = 0; i < doc.data().users.length; i++){
                users.push(doc.data().users[i])
            }

            //Create Random list of numbers between 0 and users.length
            while (arr.length < users.length) {
                var r = Math.floor(Math.random() * users.length) + 1;
                if (arr.indexOf(r) === -1) arr.push(r);
            }

            //Create player objects
            users.forEach(user => {
                this.game.players.push({
                        name : user,
                        character: this.characters[arr[count]],
                        weapon: this.weapons[arr[count]],
                        room: this.rooms[arr[count]],
                        turn: 0,
                });
                count++;
            })

            //Select murderer at random
            this.game.push({ murderer: this.game.players[Math.floor(Math.random() * this.game.length)] });
			
            //Save to DB
            if (this.game) {
                //this.db.collection("games").doc("this.game.title").update(this.game)
                this.db.collection("games").doc("Test").update({ ...this.game}).then(doc =>
                {
                    console.log("Save to database!")
                }).catch(console.log)
            }

        }).catch(console.log)

    }

    documentToDomainObject = _ => {
        const object = _.payload.doc.data();
        object.id = _.payload.doc.id;
        return object;
    }

    joinGame(game) {
        console.log(game)
        if (game.players.length >= playersToPlay) {
            alert("Game is Full")
        } else {
            if (game.players.length >= (playersToPlay - 1)) {
                this.db.collection('games').doc(game.title).set({
                    title: game.title,
                    full: true,
                    players: [...game.players, {
                        name: this.user,
                        location: _.STUDY, // TODO dont harcode
                        character: _.MISS_SCARLET // TODO dont harcode
                    }],
                    turn: 0
                })
            } else {
                this.db.collection('games').doc(game.title).set({
                    title: game.title,
                    full: false,
                    players: [...game.players, {
                        name: this.user,
                        location: _.STUDY, // TODO dont harcode
                        character: _.MISS_SCARLET // TODO dont harcode
                    }],
                    turn: null
                })
            }
        }
    }

    nextTurn(game) {
        this.db.collection('games').doc(game.title).set({
            title: game.title,
            full: true,
            players: game.players,
            turn: (game.turn + 1) % (game.players.length)
        })
    }

    movePlayer(move, player, game) {
        game.players.forEach((x) => {
            if (x.name === player.name) {
                x.location = move
            }
        })

        this.db.collection('games').doc(game.title).set({
            title: game.title,
            full: true,
            players: game.players,
            turn: (game.turn + 1) % (game.players.length)
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
