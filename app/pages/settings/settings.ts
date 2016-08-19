///<reference path="../../utils/FileSystem.d.ts"/>

import {Component} from '@angular/core';
import {NavController, Alert, Platform} from 'ionic-angular';
import {UserService} from '../../business/service';
import {User, PaidRecord} from '../../business/model'
/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
})
export class SettingsPage {
  private storeDirectory:string;
  private backFilename: string;

  constructor(public nav: NavController, private userService: UserService, platform:Platform) {
    if(platform.is('ios')){
      this.storeDirectory = window.cordova.file.syncedDataDirectory;
    }else{
      this.storeDirectory = window.cordova.file.externalDataDirectory;
    }
    this.backFilename = 'xuefei.json';
    
  }

  exportData() {
    window.resolveLocalFileSystemURL(this.storeDirectory, (dirEntry: DirectoryEntry) => {
      dirEntry.getFile(this.backFilename, { create: true, exclusive: false }, (fileEntry) => {
        fileEntry.createWriter((writer) => this.writeUserList(writer), this.handlerFileError)
      }, this.handlerFileError)
    }, this.handlerFileError);
  }


  private writeUserList(writer: FileWriter) {
    this.userService.listAllUser(false).then((users) => {
      writer.write(new Blob(['{"backupDate": "' + new Date().toISOString() + '",\n','"users": [']));
      for (let i = 0; i < users.length; i++) {
        this.userService.getPaidRecordsOfUser(users[i]).then((paidRecords) => {
          let us = JSON.stringify(this.user2JsonObj(users[i]));
          let tail = (i == users.length - 1) ? '\n]}' : ',\n';
          writer.write(new Blob([us, tail]));
        });
      }
    });
  }

  importData() {
    window.resolveLocalFileSystemURL(this.storeDirectory, (dirEntry: DirectoryEntry) => {
      dirEntry.getFile(this.backFilename, {create: false, exclusive: false}, (entry) => this.readFile2DB(entry),this.handlerFileError);
    });
  }

  private readFile2DB(fileEntry:FileEntry) {
      fileEntry.file((file)=>{
          let reader = new FileReader();
          let self = this;
          reader.onloadend = function() {
              let objs:any = JSON.parse(this.result);
              for(let obj of objs.users) {
                self.saveUser2DB(obj);
              }
          }
          reader.readAsText(file);
        });
  }


  private handlerFileError(err:FileError) {
    console.error("File error: " + err.code);
  }

  private user2JsonObj(user: User) {
    let obj = {
      username: user.username,
      phoneNum: user.phoneNum,
      createDate: user.createDate.toISOString(),
      paidRecords: []
    }

    for (let pr of user.paidRecords) {
      obj.paidRecords.push({
        amountOfPaid: pr.amountOfPaid,
        startDate: pr.startDate.toISOString(),
        endDate: pr.endDate.toISOString()
      });
    }
    return obj;
  }

  private saveUser2DB(obj) {
    let user = new User(obj.username, obj.phoneNum);
    user.createDate = new Date(obj.createDate);
    this.userService.saveUser(user).then((user) => {
      for (let pobj of obj.paidRecords) {
        let pr = new PaidRecord(user, pobj.amountOfPaid, new Date(pobj.startDate), new Date(pobj.endDate));
        this.userService.savePaidRecord(pr);
      }
    },(err)=>{
      console.warn(`导入用户失败：用户${user.username}已存在！`);
    });
  }
}
