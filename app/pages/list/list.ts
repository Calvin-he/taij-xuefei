import {Page, NavController, NavParams, Events} from 'ionic-angular';
import {ViewPaymentPage} from '../new-payment/view-payment';
import {PaidRecord, User} from '../../business/model';
import {UserService} from '../../business/service';
import {DateShowDirective} from '../../utils/date-show.directive';
import {NewPaymentPage} from '../new-payment/new-payment';
import {UserPage} from '../user/user';

@Page({
  templateUrl: 'build/pages/list/list.html',
  directives: [DateShowDirective]
})
export class ListPage {
  selectItem: PaidRecord;
  icons: string[];
  items: Array<PaidRecord>;

  constructor(private nav: NavController, navParams: NavParams, private userService:UserService, private events:Events) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectItem = navParams.get('selectItem');
  }

  ionViewWillEnter(){
    this.userService.listUnexpiredPaidRecord().then((paidRecordList) => {
      this.items = paidRecordList;
    });
  }

  viewPaidRecord(item) {
    this.nav.push(ViewPaymentPage, {
      item: item
    });
  }

  pushNewPaymentPage(){
    this.nav.push(NewPaymentPage);
  }

  showUserPage($event,user:User){
    $event.stopPropagation();
    this.nav.push(UserPage, {user:user});
  }

}
