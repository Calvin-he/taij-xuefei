import {Page, NavController, NavParams, Events, Popover} from 'ionic-angular';
import {ItemDetailsPage} from '../item-details/item-details';
import {User, PaidRecord} from '../../business/model';
import {UserService} from '../../business/service';
import {UserPage} from '../user/user';
import {UserListOperationPopover} from './subcomponent'

@Page({
  templateUrl: 'build/pages/userlist/userlist.html'
})
export class UserListPage {
    private items:Array<User>;

    constructor(private nav: NavController, navParams: NavParams, private userService:UserService, private events:Events) {
    }


    ionViewWillEnter(){
        this.listUsers();
    }


    showUserPage(user?:User){
        this.nav.push(UserPage, {user: user});
    }

    private listUsers(){
        return this.userService.listAllUser().then((users) => {
            this.items = users;
        });
    }

    popoverOperations($event){
        let popover = Popover.create(UserListOperationPopover, {parentPage:this});
        this.nav.present(popover, {
            ev:$event
        });
    }
}



