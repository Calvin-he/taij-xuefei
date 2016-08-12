import {Component} from '@angular/core';
import {ViewController, NavController, Events} from 'ionic-angular'
import {UserPage} from '../user/user'
import {UserService} from '../../business/service';
import {User} from '../../business/model';

@Component({
    template: `
    <ion-list>
      <button ion-item (click)="showUserPage()">新增用户</button>
      <button ion-item (click)="importFromAddressbook()">从通讯录导入用户</button>
      <button ion-item (click)="deleteUserInBatch()">批量删除</button>
      <button ion-item (click)="close()">关闭</button>
    </ion-list>
  `
})
export class UserListOperationPopover {
    constructor(private viewCtrl: ViewController, private nav: NavController, private events: Events) { }

    close() {
        this.viewCtrl.dismiss();
    }

    showUserPage(user) {
        this.viewCtrl.dismiss().then((data) => {
            this.nav.push(UserPage);
        })

    }

}


@Component({
    template: `
  <ion-content padding>
    <ion-list>
         <button ion-item  *ngFor="let item of items" (click)="selectUser(item)">
            <span>{{item.username}}</span> <span>{{item.phoneNum}}</span>
         </button>
    </ion-list>
    <button (click)="close()">取消</button>
  </ion-content>`
})
export class UserSelectionModal {
    private items:Array<User>
    constructor(private viewCtrl: ViewController, private userService:UserService) {
        userService.listAllUser().then((users)=>{
            this.items = users;
        });
    }

    close(){
        this.viewCtrl.dismiss();
    }

    selectUser(user){
        this.viewCtrl.dismiss(user);
    }
}