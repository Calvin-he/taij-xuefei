
import {Component} from '@angular/core';
import {NavController, Toast} from 'ionic-angular';
import {UserService} from '../../business/service';
import {User, PaidRecord} from '../../business/model';
import {BackupService} from '../../business/backup';
/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
  providers: [BackupService]
})
export class SettingsPage {
  constructor(public nav: NavController, private userService: UserService, private backupService:BackupService) {
    
  }

  exportData() {
    this.backupService.backupData().then((msg)=>{
      this.nav.present(Toast.create({message: "备份数据成功", duration: 1500}));
    }, (err)=>{
      this.nav.present(Toast.create({message: "备份数据失败：" + err, duration:1500}));
    });
  }



  importData() {
    this.backupService.restoreData().then((msg)=>{
      this.nav.present(Toast.create({message: "恢复数据成功", duration: 1500}));
    },(err)=>{
       this.nav.present(Toast.create({message: "恢复数据失败：" + err, duration:1500}));
    });
  }

}
