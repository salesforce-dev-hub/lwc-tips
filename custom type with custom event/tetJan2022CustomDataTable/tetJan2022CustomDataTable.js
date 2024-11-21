import LightningDatatable from 'lightning/datatable';
import listOfButtons from './listOfButtons.html';
 
export default class TetJan2022CustomDataTable extends LightningDatatable {
    static customTypes = {
        customTransactionId: {
            template: listOfButtons,
            standardCellLayout: true,
            typeAttributes: ['PaymentList']
        }
    };
}