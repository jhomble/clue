import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    user = null;
    subscription;
    snapshot = false
    constructor(private afAuth: AngularFireAuth) { }

    loadUser() {
        this.afAuth.user.subscribe((user) => {
            console.log("This email is logged in", user.email)
        })
    }
}
