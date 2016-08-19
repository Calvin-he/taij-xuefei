import {Page, NavController, NavParams, Events, Modal, Toast} from 'ionic-angular';
import { FormBuilder, ControlGroup, Validators, Control} from '@angular/common';
import * as moment from 'moment';

import {UserService} from '../../business/service';
import {User, PaidRecord} from '../../business/model';
import {ListPage} from '../list/list';
import {UserPage} from '../user/user';

@Page({
  templateUrl: 'build/pages/new-payment/new-payment.html'
})
export class NewPaymentPage {
  private form: ControlGroup;
  private userlist: Array<User>;

  constructor(fb: FormBuilder, private userService: UserService, private nav: NavController, params: NavParams, private events: Events) {
    let user:User = params.get('user');
    let userId = user?user.id:'';

    this.form = fb.group({
      userId: [userId, Validators.required],
      amountOfPaid: [1000, Validators.required],
      startDate: [moment().format('YYYY-MM-DD'), Validators.required],
      amountOfMonth: [3, Validators.required]
    });
    events.subscribe('user:create', (data)=>{
      let user = data[0];
      let userControl = <Control>this.form.controls['userId'];
      userControl.updateValue(user.id);
    });
  }

    /***
   * callback method
   */
  ionViewWillEnter(){
    this.userService.listAllUser(false).then((userlist) => {
      this.userlist = userlist;
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      console.log('invalid form values');
      return false;
    }
    console.debug(this.form.value);
    let values = this.form.value;
    let amountOfPaid: number = values.amountOfPaid,
      startDate: Date = moment(values.startDate, 'YYYY-MM-DD').toDate(),
      amountOfMonth: number = values.amountOfMonth;

    let user = this.userlist.find((user)=>{
      return values.userId==user.id;
    });
    console.debug("Create Payment for user: ", user);
    var endDate = moment(startDate).add(amountOfMonth, 'months').add(1, "days").toDate();
    this.createPaidRecord(user, amountOfPaid, startDate, endDate);

    return true;
  }

  newUserPage(){
    this.nav.push(UserPage);
}

  private createPaidRecord(user: User, amountOfPaid, startDate, endDate) {
    let pc: PaidRecord = new PaidRecord(user, amountOfPaid, startDate, endDate);
    this.userService.savePaidRecord(pc).then((record) => {
      this.nav.pop().then((data) => {
        this.events.publish('paidrecord:create', record);
      });
    }, (err)=>{
      let datestr = moment(startDate).format('MM月DD日');
      this.nav.present(Toast.create({message: `创建失败：${user.username}在${datestr}已经创建过一条缴费记录。`, duration: 1500}));
    });
  }
}
