import {Injectable} from '@angular/core';
import { Storage, SqlStorage } from 'ionic-angular';
import * as moment from 'moment';
import {User, PaidRecord} from './model'


@Injectable()
export class UserService {
    private storage: Storage;

    constructor() {
        this.storage = new Storage(SqlStorage, { name: 'xuefei_v1' });
        this.storage.query("DROP TABLE IF EXISTS User");
        this.storage.query(`CREATE TABLE IF NOT EXISTS User(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL, 
                    phoneNum TEXT UNIQUE NOT NULL,
                    createDate TEXT NOT NULL,
                    image Blob,
                    comment text
                    )`);

        this.storage.query(`INSERT INTO User(username, phoneNum,createDate) VALUES('Alice', '18888888888', '20160731212130')`);

        this.storage.query("DROP TABLE IF EXISTS PaidRecord");
        this.storage.query(`CREATE TABLE IF NOT EXISTS PaidRecord(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    amountOfPaid INTEGER NOT NULL, 
                    startDate INTEGER NOT NULL,
                    endDate INTEGER NOT NULL
                    )`);
    }

    getUser(id: number) {

    }

    getUserByPhoneNum(phoneNum: String) {
        let sql = "SELECT id, username, phoneNum, createDate FROM User where phoneNum=?";
        return this.storage.query(sql, [phoneNum]).then((data) => {
            let len = data.res.rows.length;
            let user: User;
            if (len == 1) {
                let res = data.res.rows[0];
                user = new User(res.username, res.phoneNum, res.id);
                user.createDate = this.parseDateTime(res.createDate);
            } else if (len == 0) {
                user = null;
            } else {
                user == null;
            }
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

    listAllUser(){
        let sql:string = "SELECT id, username, phoneNum, createDate FROM User ORDER BY createDate DESC";
        return this.storage.query(sql).then((data) => {
            let users:Array<User> = [];
            for(let item of data.res.rows){
                let user = new User(item.username, item.phoneNum, item.id);
                user.createDate = this.parseDateTime(item.createDate);
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
        }

    }

    listUnexpiredPaidRecord(){
        let sql = `SELECT p.id as pid, amountOfPaid, startDate, endDate, user_id, username, phoneNum, createDate  
            FROM PaidRecord p JOIN User u ON p.user_id=u.id WHERE p.endDate>? ORDER BY startDate DESC`;
        return this.storage.query(sql, [this.formatDate(new Date())]).then((data) => {
            let paidRecords:Array<PaidRecord> = [];
            for(let item of data.res.rows){
                let user = new User(item.username, item.phoneNum, item.user_id);
                user.createDate = this.parseDateTime(item.createDate);
                let startDate = this.parseDate(item.startDate);
                let endDate = this.parseDate(item.endDate);
                let paidRecord = new PaidRecord(user, item.amountOfPaid, startDate, endDate, item.pid);
                paidRecords.push(paidRecord);
            };
            return paidRecords;
        });
    }

    getPaidRecordsOfUser(user){
        let sql = `SELECT id, amountOfPaid, startDate, endDate FROM PaidRecord WHERE user_id=? ORDER BY startDate DESC`;
        console.debug("get paid record list from user: " + user.id);
        return this.storage.query(sql, [user.id]).then((data) => {
            let paidRecords:Array<PaidRecord> = [];
            for(let item of data.res.rows){
                let startDate = this.parseDate(item.startDate);
                let endDate = this.parseDate(item.endDate);
                let paidRecord = new PaidRecord(user, item.amountOfPaid, startDate, endDate, item.id);
                paidRecords.push(paidRecord);
            };
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
}
