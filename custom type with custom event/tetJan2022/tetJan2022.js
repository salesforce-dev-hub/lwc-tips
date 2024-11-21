import { LightningElement, wire, track } from 'lwc';
import getOpportunies from '@salesforce/apex/TetJan2022Lwc.getOpportunies';
import updatePayments from '@salesforce/apex/TetJan2022Lwc.updatePayments';
import { refreshApex } from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const actions = [
    { label: 'Payment', name: 'Payment' },
    { label: 'Void', name: 'Void' },
    { label: 'Refund', name: 'Refund' },
];

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Account Name', fieldName: 'AccountName' },
    {
        type: "customTransactionId", label: 'Payments', typeAttributes: {
            PaymentList: { fieldName: 'Payments__r' }
        }
    },
    { label: 'StageName', fieldName: 'StageName' },
    { label: 'Close Date', fieldName: 'CloseDate' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },

];

export default class TetJan2022 extends NavigationMixin(LightningElement) {
    columns = columns;
    @track wireData;
    @track opportunityData;
    selectedRow;
    createPayment = false;

    @wire(getOpportunies)
    wiredAccount(result) {
        this.wireData = result;

        if (result.data) {
            console.log(JSON.stringify(result.data, null, 2));
            let temp = result.data.map(item => {

                let payedAmount = 0;
                if (item.Payments__r != null) {
                    item.Payments__r.forEach(element => {
                        payedAmount += element.Payable_Amount__c;
                    });
                }


                console.log('payedAmount--', payedAmount);

                if (item.Amount - payedAmount <= 0) {
                    return {
                        ...item,
                        AccountName: item.Account.Name,
                        RemainingAmount: 0,
                    }
                } else {
                    return {
                        ...item,
                        AccountName: item.Account.Name,
                        RemainingAmount: item.Amount - payedAmount,
                    }
                }

            });

            this.opportunityData = temp;
            console.log('opportunityData--', JSON.stringify(this.opportunityData, null, 2));



        } else if (result.error) {
            console.error('Error fetching account', result.error);
        }
    }

    handlePaymentIdClicked(event) {
        console.log('PaymentIdClicked');
        const selectedPaymentId = event.detail.recordId;

        console.log('selectedPaymentId--', selectedPaymentId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: selectedPaymentId,
                actionName: 'view'
            }
        });
    }

    async handleRowAction(event) {
        const actionName = event.detail.action.name;
        this.selectedRow = event.detail.row;
        if (actionName == 'Payment') {
            this.createPayment = true;
        }
        else {
            await updatePayments({ oppId: this.selectedRow.Id, status: actionName }).then(() => {
                console.error('Success');
                const evt = new ShowToastEvent({
                    message: 'Payments Status Updated',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(evt);
            })
                .catch((error) => {
                    console.error('Error fetching account', error);
                    const evt = new ShowToastEvent({
                        message: 'Unexpected error',
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                });



        }
    }

    async handleSuccess() {

        console.log('handleSuccess');
        const evt = new ShowToastEvent({
            message: 'Payment Created',
            variant: 'success',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
        await refreshApex(this.wireData);
        this.createPayment = false;
    }

}