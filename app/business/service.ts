import {Injectable} from '@angular/core';
import { Storage, SqlStorage } from 'ionic-angular';
import * as moment from 'moment';
import {User, PaidRecord} from './model'


@Injectable()
export class UserService {
    private storage: Storage;

    constructor() {
        this.storage = new Storage(SqlStorage, { name: 'xuefei_v1' });
        //this.storage.query("DROP TABLE IF EXISTS User");
        this.storage.query(`CREATE TABLE IF NOT EXISTS User(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL, 
                    phoneNum TEXT UNIQUE NOT NULL,
                    createDate TEXT NOT NULL,
                    image Blob,
                    comment text
                    )`);

        //this.storage.query(`INSERT INTO User(username, phoneNum,createDate) VALUES('Alice', '18888888888', '20160731212130')`);

        //this.storage.query("DROP TABLE IF EXISTS PaidRecord");
        this.storage.query(`CREATE TABLE IF NOT EXISTS PaidRecord(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    amountOfPaid INTEGER NOT NULL, 
                    startDate INTEGER NOT NULL,
                    endDate INTEGER NOT NULL
                    )`).then(()=>{
                        this.storage.query('CREATE UNIQUE INDEX IF NOT EXISTS PAIDRECORD_STARTDATE_UNIDX ON PaidRecord(user_id, startDate)');
                    });

    }

    getUserByPhoneNum(phoneNum: String) {
        let sql = "SELECT id, username, phoneNum, createDate FROM User where phoneNum=?";
        return this.storage.query(sql, [phoneNum]).then((data) => {
            let len = data.res.rows.length;
            let user:User = (len==1)?this.row2User(data.res.rows[0]):null;
            return user;
        });
    }

    getUserByName(username: String) {
        let sql = "SELECT id, username, phoneNum, createDate FROM User where username=?";
        return this.storage.query(sql, [username]).then((data) => {
            let len = data.res.rows.length;
            let user:User = (len==1)?this.row2User(data.res.rows[0]):null;
            return user;
        });
    }

    saveUser(user: User) {
        let sql: string;
        if (user.id == null) {
            sql = "INSERT INTO User(username, phoneNum, createDate) VALUES(?, ?, ?)";
            let createDateStr = this.formatDateTime(user.createDate);
            return this.storage.query(sql, [user.username, user.phoneNum, createDateStr]).then((data) => {
                user.id  = data.res.insertId;
                return user;
            });
        } else {
            sql = "UPDATE User SET username=?, phoneNum=? WHERE id=?";
            return this.storage.query(sql, [user.username, user.phoneNum, user.id]).then((data) => {
                return user;
            });
        }
    }

    listAllUser(checkExpired:Boolean=true){
        let sql:string = "SELECT id, username, phoneNum, createDate FROM User ORDER BY createDate DESC";
        return this.storage.query(sql).then((data) => {
            let users:Array<User> = [];
            for(let item of data.res.rows){
                let user = this.row2User(item);
                if(checkExpired){
                    let now = this.formatDate(new Date());
                    this.storage.query("SELECT id FROM PaidRecord WHERE user_id=? AND endDate>?", [user.id, now]).then((data) => {
                        user.isExpired = (data.res.rows.length == 0);
                    })
                }
                users.push(user);
            }
            return users;
        });
    }


    savePaidRecord(record: PaidRecord) {
        if (record.id == null) {
            let sql = `INSERT INTO PaidRecord(user_id, amountOfPaid, 
                    startDate, endDate) VALUES(?, ?, ?, ?)`;
            let startDate:number = this.formatDate(record.startDate), 
                endDate:number = this.formatDate(record.endDate);
            return this.storage.query(sql, [record.user.id, record.amountOfPaid, startDate,
                     endDate]).then((data)=>{
                        record.id = data.res.insertId;
                        return record;
            });
        }else{
            let sql = "UPDATE PaidRecord SET user_id=?, amountOfPaid=?, startDate=?, endDate=? WHERE id=?";
            let startDate:number = this.formatDate(record.startDate), 
                endDate:number = this.formatDate(record.endDate);
            return this.storage.query(sql, [record.user.id, record.amountOfPaid, startDate, endDate, record.id]);

        }

    }

    listUnexpiredPaidRecord(){
        let sql = `SELECT p.id as id, amountOfPaid, startDate, endDate, user_id, username, phoneNum, createDate  
            FROM PaidRecord p JOIN User u ON p.user_id=u.id WHERE p.endDate>? ORDER BY startDate DESC`;
        return this.storage.query(sql, [this.formatDate(new Date())]).then((data) => {
            let paidRecords:Array<PaidRecord> = [];
            for(let item of data.res.rows){
                let user = this.row2User(item);
                user.isExpired = false;
                let paidRecord = this.row2PaidRecord(item, user);
                paidRecords.push(paidRecord);
            };
            return paidRecords;
        });
    }

    getPaidRecordsOfUser(user:User){
        let sql = `SELECT id, amountOfPaid, startDate, endDate FROM PaidRecord WHERE user_id=? ORDER BY endDate DESC`;
        return this.storage.query(sql, [user.id]).then((data) => {
            let paidRecords:Array<PaidRecord> = [];
            for(let item of data.res.rows){
                let paidRecord = this.row2PaidRecord(item, user);
                paidRecords.push(paidRecord);
            };
            user.paidRecords = paidRecords;
            return paidRecords;
        });
    }

    deleteUser(userId: number) {
        return this.storage.query('DELETE FROM User WHERE id=?', [userId]).then((data)=>{
            this.storage.query('DELETE FROM PaidRecord WHERE user_id=?', [userId]);
        });
    }

    deletePaidRecord(paidRecordId: number) {
        return this.storage.query("DELETE FROM PaidRecord WHERE id=?", [paidRecordId]);
    }

    /**
     * handle each user in user list
     * handler(user)
     */
    handleEachUser(handler){
        return this.storage.query("SELECT * FROM User").then((data)=>{
            for(let row of data.res.rows){
                let user = this.row2User(row);
                this.storage.query('SELECT * FROM PaidRecord WHERE user_id=? ORDER BY endDate DESC', [user.id]).then((pdata)=>{
                    let paidRecords: PaidRecord[] = [];
                    for(let prow of pdata.res.rows){
                        paidRecords.push(this.row2PaidRecord(prow, user));
                    }
                    user.paidRecords = paidRecords;
                    handler(user);
                });
            }
        });
    }

    private formatDate(d:Date){
        return  Number(moment(d).format('YYYYMMDD'));
    }

    private formatDateTime(dt:Date){
        return moment(dt).format("YYYYMMDDHHmmss");
    }

    private parseDate(d:number){
        return moment(d.toString(), 'YYYYMMDD').toDate();
    }

    private parseDateTime(dt:string){
        return moment(dt, 'YYYYMMDDHHmmss').toDate();
    }

    private row2User(row){
        let user = new User(row.username, row.phoneNum,row.user_id||row.id);
        user.createDate = this.parseDateTime(row.createDate);
        return user;
    }

    private row2PaidRecord(row, user:User){
        let startDate = this.parseDate(row.startDate);
        let endDate = this.parseDate(row.endDate);
        let paidRecord = new PaidRecord(user, row.amountOfPaid, startDate, endDate, row.id);
        return paidRecord;
    }
}
