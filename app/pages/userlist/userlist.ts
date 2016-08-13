import {Page, NavController, NavParams, Events, Popover, ActionSheet, Alert} from 'ionic-angular';
import {ItemDetailsPage} from '../item-details/item-details';
import {User, PaidRecord} from '../../business/model';
import {UserService} from '../../business/service';
import {UserPage} from '../user/user';
import {NewPaymentPage} from '../new-payment/new-payment';
import { Clipboard } from 'ionic-native';
import { Contacts } from 'ionic-native';

@Page({
    templateUrl: 'build/pages/userlist/userlist.html'
})
export class UserListPage {
    private items: Array<User>;

    constructor(private nav: NavController, navParams: NavParams, private userService: UserService, private events: Events) {
    }


    ionViewWillEnter() {
        this.listUsers();
    }


    showUserPage(user?: User) {
        this.nav.push(UserPage, { user: user });
    }

    private listUsers() {
        return this.userService.listAllUser().then((users) => {
            this.items = users;
        });
    }

    // popoverOperations($event){
    //     let popover = Popover.create(UserListOperationPopover, {parentPage:this});
    //     this.nav.present(popover, {
    //         ev:$event
    //     });
    // }

    popoverUserOperations(user: User) {
        let actionSheet = ActionSheet.create({
            buttons: [
                {
                    text: "查看",
                    handler: () => {
                        this.nav.push(UserPage, { user: user });
                    }
                },
                {
                    text: "付学费",
                    handler: () => {
                        this.nav.push(NewPaymentPage, { user: user });
                    }
                },
                {
                    text: "复制",
                    handler: () => {
                        Clipboard.copy(user.username + " " + user.phoneNum);
                    }
                },
                {
                    text: "删除",
                    role: "destructive",
                    handler: () => {

                    }
                },
            ]
        });
        this.nav.present(actionSheet);
    }

    batchImportFromContracts() {
        Contacts.find(['displayName'], {
            filter: "",
            multiple: true,
            desiredFields: ['displayName', 'name', 'phoneNumbers'],
            hasPhoneNumber: true
        }).then((results) => {

            let contacts = [];
            for (let _i = 0; _i < results.length; _i++) {
                let c = results[_i];
                if (c.displayName && c.phoneNumbers.length > 0) {
                    contacts.push({
                        type: "checkbox",
                        label: c.displayName + " " + c.phoneNumbers[0].value,
                        value: _i
                    });
                }
            }

            let buttons = [
                {
                    text: "取消",
                    role: "cancel"
                }, {
                    text: "确认",
                    handler: (data) => {
                        for(let idx of data){
                            let c =  results[idx];
                            let user = new User(c.displayName, c.phoneNumbers[0].value);
                            this.userService.saveUser(user);
                        }

                    }
                }
            ];

            let alert = Alert.create({
                title: "从通讯录导入用户",
                inputs: contacts,
                buttons: buttons
            });
            this.nav.present(alert);
        });
    }
}



