import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ResultEvent } from 'src/app/model/result-event.model';
import { ApiService } from 'src/app/services/api/api.service';
import { SharedVarService } from 'src/app/services/shared-var.service';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-results-landing',
  templateUrl: './results-landing.component.html',
  styleUrls: ['./results-landing.component.css']
})
export class ResultsLandingComponent implements OnInit {

  public subscriptions: Subscription = new Subscription();

  compType: string = this.sharedVar.API_SOURCE_COMP_TYPE_EPL;
  competitionTypeHdr: string;
  public events : ResultEvent[];

  public selectedDates: string = 'last24Hrs';
  public dateFrom: Date;
  public dateTo: Date;
  public minDate: Date = new Date();
  public maxDate: Date = new Date();
  dateErrorMsg:string = "";

  constructor(public sharedVar: SharedVarService,
    public apiService: ApiService) {
    const currentDate = new Date().getDate();
    this.minDate.setDate(currentDate - 7);
    this.maxDate.setDate(currentDate + 14);
    this.competitionTypeHdr = this.sharedVar.COMP_HEADER_EPL;
  }

  ngOnInit(): void {
      this.subscriptions.add(
        this.apiService.retrieveResults(this.compType).subscribe((resp: any) => {
          this.events = resp.resultEvent;

          //convert json response from String to Date format
          this.events.map(event => event.startTime = new Date(event.startTime));
        } ,
          error => {
          console.log(error);
          this.sharedVar.changeException(error);
        }
      )
    );
  }

  ngOnDestroy(){
    this.subscriptions.unsubscribe();
  }

  readCompType(competitionName: string){
    this.compType = competitionName;
    this.competitionTypeHdr = this.sharedVar.retrieveCompHdr(this.compType);
    this.ngOnInit();
  }

  isEventOver(startTime: Date): boolean{
    const currentTime = new Date();
    return currentTime > startTime;
  }

  filterResult(dateFrom: Date, dateTo: Date){
    console.log("dateFrom: ", dateFrom);
    console.log("dateTo: ", dateTo);
    // const checkValidDate = this.validateDateFromLaterThanDateTo(dateFrom, dateTo);
    // console.log("checkValidDate: ", checkValidDate);
  }

  validateDateFromLaterThanDateTo(dateFrom: Date, dateTo: Date) {
    if(dateFrom && dateTo && dateFrom > dateTo){
      this.dateErrorMsg = '"From" date cannot be later than "To" date.';
    } else {
      this.dateErrorMsg = "";
    }
  }

}
