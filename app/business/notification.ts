import { LocalNotifications } from 'ionic-native';
import {PaidRecord} from './model';
import * as Moment from 'moment';

export class NotificationService {

    static updateExpiredNotification(paidRecord: PaidRecord) {
        let startDateStr = Moment(paidRecord.startDate).format('YYYY年MM月DD日');
        let alertDate = new Date(paidRecord.endDate.getTime() + 19*3600000); //alert at 19：00
        LocalNotifications.schedule({
            id: paidRecord.id,
            title: "学费过期提醒",
            text: `${paidRecord.user.username} 在 ${startDateStr} 交的学费已过期`,
            at: alertDate
        });

    }

    static cancelExpiredNotification(paidRecord: PaidRecord) {
        LocalNotifications.cancel(paidRecord.id);
    }
}