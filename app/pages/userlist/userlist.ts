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


    showUserPage($event, user?: User) {
        $event.stopPropagation();
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
                    text: "查看用户信息",
                    handler: () => {
                        actionSheet.dismiss().then(()=>{
                             this.nav.push(UserPage, { user: user });
                        });
                        return false;
                    }
                },
                {
                    text: "交学费",
                    handler: () => {
                        actionSheet.dismiss().then(()=>{
                            this.nav.push(NewPaymentPage, { user: user });
                        });
                        return false;
                    }
                },
                {
                    text: "复制",
                    handler: () => {
                        Clipboard.copy(user.username + " " + user.phoneNum);
                    }
                },
                {
                    text: "电话呼叫",
                    handler: () => {
                        window.location.href = "tel: " + user.phoneNum
                    }
                },
                {
                    text: "删除用户",
                    role: "destructive",
                    handler: () => {
                        let alert: Alert;

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
                                                this.userService.deleteUser(user.id).then((user) => {
                                                    this.events.publish("user:remove", user);
                                                    this.listUsers();
                                                });
                                            }

                                        }
                                    }
                                ]
                            });
                        }
                        this.nav.present(alert);
                    }
                }
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
                        for (let idx of data) {
                            let c = results[idx];
                            let user = new User(c.displayName, c.phoneNumbers[0].value);
                            this.userService.saveUser(user);
                        }
                        this.listUsers();
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



