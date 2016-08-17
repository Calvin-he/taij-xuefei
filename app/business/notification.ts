import { LocalNotifications } from 'ionic-native';
import {PaidRecord} from './model';
import * as Moment from 'moment';

export class NotificationService {

    static scheduleWhenExpired(paidRecord: PaidRecord) {
            let remainingDays = paidRecord.remainingDays;
            if(remainingDays<=0 && remainingDays>=-2){
                let startDateStr = Moment(paidRecord.startDate).format('YYYY年MM月DD日');
                let alertDate = Moment().add(10,'seconds').toDate();
                LocalNotifications.schedule({
                    id: paidRecord.id,
                    title: "学费过期提醒",
                    text: `${paidRecord.user.username} 在 ${startDateStr} 交的学费已过期`,
                    at: alertDate,
                    data: {user_id: paidRecord.user.id}
                });
            }

            
    }

    static cancelExpiredNotification(paidRecord: PaidRecord) {
        LocalNotifications.cancel(paidRecord.id);
    }
}