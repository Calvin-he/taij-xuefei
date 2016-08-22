import { Directive, ElementRef, Input } from '@angular/core';
import * as moment from 'moment';

@Directive({
  selector: '[dateShow]'
})
export class DateShowDirective {
    constructor(private el: ElementRef) {
    }
    @Input() set dateShow(date:Date){
        let mdate = moment(date).startOf('day'),
            now = moment().startOf('day');
        let diffDays = (mdate.unix() - now.unix())/(24*3600);
        let dateStr:string;
        if(diffDays == 0) {
            dateStr = '今天';
        }else if(diffDays == -1){
            dateStr = "昨天";
        }else if(diffDays == 1){
            dateStr ="明天";
        }else if(diffDays == -2){
            dateStr = "前天";
        }else if(diffDays == 2){
            dateStr = "后天";
        }else if(diffDays<0 && diffDays >= -5){
            dateStr = -diffDays + "天前";
        }else{
            dateStr = mdate.format("YYYY年MM月DD日");
        }
        this.el.nativeElement.innerText = dateStr;
    } 


}