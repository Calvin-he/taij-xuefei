import {Page, NavController, NavParams, Events, Modal} from 'ionic-angular';
import { FormBuilder, ControlGroup, Validators, Control } from '@angular/common';
import * as moment from 'moment';
import {UserService} from '../../business/service';
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
    this.userService.deletePaidRecord(this.paidRecord.id).then((data) => {
      this.events.publish('paidrecord:delete', this.paidRecord);
      this.nav.pop();
    })
  }

  onUpdateEnddate() {
    if (this.endDateCtrl.valid) {
      console.log(this.endDateCtrl.value);
      let ed = moment(this.endDateCtrl.value, 'YYYY-MM-DD').toDate();
      if (ed != this.paidRecord.endDate) {
        this.paidRecord.endDate = ed;
        this.userService.savePaidRecord(this.paidRecord).then((data) => {
          this.events.publish("paidrecord:update", this.paidRecord);
        });
      }
    }
  }

  get endDateStr() {
    return moment(this.paidRecord.endDate).format('YYYY-MM-DD');
  }

  get remainingDays() {
    let mdate = moment(this.paidRecord.endDate).startOf('date'),
      now = moment().startOf('date');
    let diffDays = (mdate.unix() - now.unix()) / (24 * 3600);
    return diffDays;
  }
}