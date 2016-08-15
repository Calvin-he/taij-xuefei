import {Page, NavController, NavParams, Events, Alert} from 'ionic-angular';
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

    ionViewWillEnter() {
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
        if (usernameCtrl.valid) {
            this.user.username = usernameCtrl.value;
            this.userService.saveUser(this.user).then((user) => {
                this.events.publish("user:update", user);
            })
        }
        return true;
    }

    onUpdateUserPhoneNum() {
        let phoneNumCtrl = this.form.controls['phoneNum'];
        if (phoneNumCtrl.valid) {
            this.user.phoneNum = phoneNumCtrl.value;
            this.userService.saveUser(this.user).then((user) => {
                this.events.publish("user:update", user);
            })
        }
        return true;
    }

    onRemoveUser() {
        let user = this.user;
        let alert: Alert = null;

        if (!user.isExpired) {
            alert = Alert.create({
                title: "提示",
                message: "用户'" + user.username + "'尚在有效学习期内, 您不能删除!",
                buttons: ['关闭']
            });

        } else {
            alert = Alert.create({
                title: "提示",
                message: "删除用户将删除该用户所有的缴费记录，确实要删除用户'" + user.username + "'吗?",
                buttons: [
                    {
                        text: "取消",
                        role: "cancel"
                    },
                    {
                        text: "确认",
                        handler: () => {
                            if (user.isExpired) {
                                let navTransition = alert.dismiss();
                                this.userService.deleteUser(user.id).then((user) => {
                                    this.events.publish("user:remove", user);
                                    navTransition.then(() => {
                                        this.nav.pop();
                                    });
                                });
                                return false;
                            }

                        }
                    }
                ]
            });
        }
        this.nav.present(alert);
    }

    pushNewPaymentPage() {
        this.nav.push(NewPaymentPage, { user: this.user });
    }

    viewPaidRecord(paidRecord) {
        this.nav.push(ViewPaymentPage, { item: paidRecord })
    }

    importFromContacts() {
        Contacts.pickContact().then((data) => {
            if (data && data.phoneNumbers.length > 0) {
                let phoneNum = data.phoneNumbers[0].value;
                let user = new User(data.displayName, phoneNum);
                this.userService.saveUser(user).then((data) => {
                    this.events.publish("user:create", user);
                    this.nav.pop();
                });
            }
        });
    }
}