import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { BetEvent } from 'src/app/model/bet-event.model';
import { BetSlip } from 'src/app/model/bet-slip.model';
import { SharedVarService } from 'src/app/services/shared-var.service';

@Component({
  selector: 'app-odds-bet-slip',
  templateUrl: './odds-bet-slip.component.html',
  styleUrls: ['./odds-bet-slip.component.css']
})
export class OddsBetSlipComponent implements OnInit {
  showSinglesSelection: boolean = true;
  showMultiplesSelection: boolean = true;

  @Input() betSelections: BetSlip[];

  constructor(public sharedVar: SharedVarService) { }

  ngOnInit(): void {
  }
  
  ngOnChanges() {
      // Handle changes to selectedEvents and update the displayed selection
  }

  toggleSelection(selectionType: string): void {
    if (selectionType === 'singles') {
      this.showSinglesSelection = !this.showSinglesSelection;
    } else if (selectionType === 'multiples') {
      this.showMultiplesSelection = !this.showMultiplesSelection;
    }
  }

  onDeleteBetSelection(betSelection: BetSlip){
    this.betSelections = this.betSelections.filter(e => !(e.eventId === betSelection.eventId && e.betSelection === betSelection.betSelection));
  }

  onBetAmountChange(betSlipItem: BetSlip, betAmount: string) {
    const regex = /^(?!0\d)[1-9]\d{0,3}$/;
    betSlipItem.potentialPayout = regex.test(betAmount) ? parseFloat((parseFloat(betAmount) * betSlipItem.odds).toFixed(2)) : 0;
  }

}