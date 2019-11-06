import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from './constants';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable({
    providedIn: 'root'
})
export class ActionService {

    user = null 

    characters = [_.PROFESSOR_PLUM, _.MISS_SCARLET, _.COLONEL_MUSTARD, _.MR_BODDY, _.MRS_WHITE, _.MRS_PEACOCK]
    rooms = [_.STUDY, _.LOUNGE, _.LIBRARY, _.KITCHEN,
    _.HALL, _.DINING, _.CONSERVATORY];
    weapons = [_.WRENCH, _.CANDLE_STICK, _.ROPE, _.LEAD_PIPE, _.DAGGER, _.REVOLVER];
    cards = [this.characters, this.rooms, this.weapons]

    constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {
       
        this.afAuth.user.subscribe((user) => {
            this.user = user.email
        })
        
    }

    possibleMoves(currentRoom) {
        switch(currentRoom) {
            case _.STUDY: 
                return [_.HALL_A, _.HALL_C, _.KITCHEN]
            case _.HALL:
                return [_.HALL_A, _.HALL_B, _.HALL_D]
            case _.LOUNGE:
                return [_.HALL_B, _.CONSERVATORY, _.HALL_E]
            case _.LIBRARY:
                return [_.HALL_C, _.HALL_F, _.HALL_H]
            case _.BILLIARD:
                return [_.HALL_D, _.HALL_F, _.HALL_G,_. HALL_I]
            case _.DINING:
                return [_.HALL_E, _.HALL_G, _.HALL_J]
            case _.CONSERVATORY:
                return [_.HALL_H, _.HALL_K, _.LOUNGE]
            case _.BALLROOM:
                return [_.HALL_I, _.HALL_K, _.HALL_L]
            case _.KITCHEN:
                return [_.HALL_J, _.HALL_L, _.STUDY]
            case _.HALL_A:
                return [_.STUDY, _.HALL]
            case _.HALL_B:
                return [_.HALL, _.LOUNGE]
            case _.HALL_C:
                return [_.STUDY, _.LIBRARY]
            case _.HALL_D:
                return [_.HALL, _.BILLIARD]
            case _.HALL_E:
                return [_.LOUNGE, _.DINING]
            case _.HALL_F:
                return [_.LIBRARY, _.BILLIARD]
            case _.HALL_G:
                return [_.BILLIARD, _.DINING]
            case _.HALL_H:
                return [_.LIBRARY, _.CONSERVATORY]
            case _.HALL_I:
                return [_.BILLIARD, _.BALLROOM]
            case _.HALL_J:
                return [_.DINING, _.KITCHEN]
            case _.HALL_K:
                return [_.CONSERVATORY, _.BALLROOM]
            case _.HALL_L:
                return [_.BALLROOM, _.KITCHEN]
            default: 
                console.log("Awk Broken");
        }
    }

    moves(currentRoom, otherPlayerLocations) {
        let moves = this.possibleMoves(currentRoom);
        return moves.filter((move) => {
            return !otherPlayerLocations.contains(move)
        })
    }

    // dealHands(deck){

    //     const result = this.db.firestore.collection('games').doc('Test').get();

    //     result.then(doc =>
    //     {
    //         let num_cards = this.cards.le
    //         let players = doc.data().players;

    //         let numPlayers = players.length;
    //         let index = 0;
    //         do {
    //             let left = ~~(Math.random() * this.cards.length);
    //             let card = 1 << left;
    //             if ((deck & card) === card) {
    //                 deck &= ~card;
    //                 //
    //                 let who = index % numPlayers;
    //                 players[+].hand |= card;
    //                 index++;
    //             }
    //             if (deck === 0) {
    //                 index = this.cards.length - 3;
    //             }
    //         } while (index < this.cards);

    //     }).catch(console.log)
    // }
}
