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
