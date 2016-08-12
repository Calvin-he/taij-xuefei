
import * as moment from 'moment';

export class User {
    public paidRecordList:Array<PaidRecord>;
    public createDate:Date;

    constructor(public username:String, public phoneNum:String, public id?:number){
        if(!id){
            this.createDate = new Date();
        }
    }

    getLatestPaidRecord(){

    }

}

export class PaidRecord {
    public periodUnit = 'month';

    
    constructor(public user:User, public amountOfPaid:number, public startDate:Date, public endDate:Date, public id?:number){
    }
     
    isExpired():Boolean{
        return false;
    }


}