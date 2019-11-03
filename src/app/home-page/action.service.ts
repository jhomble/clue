import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from './constants';

@Injectable({
    providedIn: 'root'
})
export class ActionService {

    user = null 

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
            case _.BALL_ROOM:
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
                return [_.HALL, _.BILLARD]
            case _.HALL_E:
                return [_.LOUNGE, _.DINING]
            case _.HALL_F:
                return [_.LIBRARY, _.BILLIARD]
            case _.HALL_G:
                return [_.BILLIARD, _.DINING]
            case _.HALL_H:
                return [_.LIBRARY, _.CONSERVATORY]
            case _.HALL_I:
                return [_.BILLIARD, _.BALL_ROOM]
            case _.HALL_J:
                return [_.DINING, _.KITCHEN]
            case _.HALL_K:
                return [_.CONSERVATORY, _.BALL_ROOM]
            case _.HALL_L:
                return [_.BALL_ROOM, _.KITCHEN]
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
}
