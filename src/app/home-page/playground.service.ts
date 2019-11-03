import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PlaygroundService {

    constructor(private db: AngularFirestore, private afAuth: AngularFireAuth) {
        // This will run on load
        this.exampleFunction();
    }

    exampleFunction() {
        console.log("I RANNNN")
        // Write code here 
    }
}
