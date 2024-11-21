import { LightningElement , api } from 'lwc';

export default class TetJan2022Buttons extends LightningElement {

    @api tetJan2022CustomDataTableData;

    handleButtonClick(event){
        console.log(event.target.value);
        const recId = event.target.value;
        console.log('recId--',recId);

        const transactionIdClickEvent = new CustomEvent('transactionidclicked', {
            detail: {recordId : recId},bubbles : true,composed : true
        });
        this.dispatchEvent(transactionIdClickEvent);
    }
}