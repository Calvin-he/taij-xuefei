import {Page, NavController, NavParams, Events} from 'ionic-angular';
import { FormBuilder, ControlGroup, Validators } from '@angular/common';

import {UserService} from '../../business/service';
import {User, PaidRecord} from '../../business/model';
import {DateShowDirective} from '../../utils/date-show.directive';
import {NewPaymentPage} from '../new-payment/new-payment';
import {ViewPaymentPage} from '../new-payment/view-payment';
import { Contacts } from 'ionic-native';


@Page({
    templateUrl: 'build/pages/user/user.html',
    directives: [DateShowDirective]
})
export class UserPage {
    private form: ControlGroup;
    private user: User;

    constructor(fb: FormBuilder, private userService: UserService, private nav: NavController, navParams: NavParams, private events: Events) {
        let user = navParams.get('user');
        if (user == null) {
            //create new user
            this.user = new User("", "");
        } else {
            //update user
            this.user = user;
        }
        this.form = fb.group({
            username: [this.user.username, Validators.required],
            phoneNum: [this.user.phoneNum, Validators.required]
        });
    }

    ionViewWillEnter(){
        this.userService.getPaidRecordsOfUser(this.user).then((paidRecords) => {
            this.user.paidRecordList = paidRecords;
        });
    }

    onCreateUser() {
        if (!this.form.valid) {
            console.log('invalid form values');
            return false;
        }
        let values = this.form.value;
        let user: User = new User(values.username, values.phoneNum);
        this.userService.saveUser(user).then((user) => {
            this.nav.pop().then((data) => {
                this.events.publish("user:create", user);
            });
        });
    }

    onUpdateUsername() {
        let usernameCtrl = this.form.controls['username'];
        if(usernameCtrl.valid){
            this.user.username = usernameCtrl.value;
            this.userService.saveUser(this.user).then((user)=>{
                this.events.publish("user:update", user);
                usernameCtrl.pristine = true;
            })
        }
        return true;
    }

    onUpdateUserPhoneNum() {
        let phoneNumCtrl = this.form.controls['phoneNum'];
        if(phoneNumCtrl.valid){
            this.user.phoneNum = phoneNumCtrl.value;
            this.userService.saveUser(this.user).then((user)=>{
                this.events.publish("user:update", user);
            })
        }
        return true;
    }

    onRemoveUser(){
        this.userService.deleteUser(this.user.id).then((data)=>{
            this.events.publish("user:delete", this.user);
            this.nav.pop();
        });
    }

    pushNewPaymentPage() {
        this.nav.push(NewPaymentPage, {user:this.user});
    }

    viewPaidRecord(paidRecord){
        this.nav.push(ViewPaymentPage, {item: paidRecord})
    }

    importFromContacts(){
        Contacts.pickContact().then((data) => {
            if(data && data.phoneNumbers.length>0){
                let phoneNum = data.phoneNumbers[0].value;
                let user = new User(data.displayName, phoneNum);
                this.userService.saveUser(user).then((data)=>{
                    this.events.publish("user:create", user);
                    this.nav.pop();
                });
            }
        });
    }
}