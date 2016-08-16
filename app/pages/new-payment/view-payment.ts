import {Page, NavController, NavParams, Events, Modal, Alert} from 'ionic-angular';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import * as moment from 'moment';
import {UserService} from '../../business/service';
import {NotificationService} from '../../business/notification';
import {PaidRecord} from '../../business/model';
import {DateShowDirective} from '../../utils/date-show.directive';

@Page({
  templateUrl: 'build/pages/new-payment/view-payment.html',
  directives: [DateShowDirective]
})
export class ViewPaymentPage {
  private paidRecord: PaidRecord;
  private endDateCtrl: Control;

  constructor(private userService: UserService, private nav: NavController, params: NavParams, private events: Events) {
    this.paidRecord = params.get('item');
    let endDateStr = moment(this.paidRecord.endDate).format('YYYY-MM-DD');
    this.endDateCtrl = new Control(endDateStr);
  }

  onRemovePaidRecord() {
    let msg = (!this.paidRecord.isExpired())?"此次缴费尚未过期，确认要删除吗？":"确认要删除吗?";
    let alert = Alert.create({
      title: "删除提示",
      message: msg,
      buttons:[
        {
          text: "取消",
          role: "cancel"
        },
        {
          text: "确认",
          handler: ()=>{
           let navTransition = alert.dismiss();
           this.userService.deletePaidRecord(this.paidRecord.id).then((data) => {
              this.events.publish('paidrecord:delete', this.paidRecord);
              navTransition.then(()=>{
                this.nav.pop();
                NotificationService.cancelExpiredNotification(this.paidRecord);
              });
          });
          }
        }
      ]
    });
    this.nav.present(alert);
    
  }

  onUpdateEnddate() {
    if (this.endDateCtrl.valid) {
      console.log(this.endDateCtrl.value);
      let ed = moment(this.endDateCtrl.value, 'YYYY-MM-DD').toDate();
      if (ed != this.paidRecord.endDate) {
        this.paidRecord.endDate = ed;
        this.userService.savePaidRecord(this.paidRecord).then((data) => {
          this.events.publish("paidrecord:update", this.paidRecord);
          NotificationService.updateExpiredNotification(this.paidRecord);
        });
      }
    }
  }

  get endDateStr() {
    return moment(this.paidRecord.endDate).format('YYYY-MM-DD');
  }
}