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
  private paidRecord:PaidRecord;
  private endDateCtrl:Control;

  constructor(private userService: UserService, private nav: NavController, params: NavParams, private events: Events) {
    this.paidRecord = params.get('item');
    this.endDateCtrl = new Control(moment(this.paidRecord.endDate).format('YYYY-MM-DD'));
  }

  onRemovePaidRecord() {
    this.userService.deletePaidRecord(this.paidRecord.id).then((data)=>{
      this.events.publish('paidrecord:delete', this.paidRecord);
      this.nav.pop();
    })
  }

}