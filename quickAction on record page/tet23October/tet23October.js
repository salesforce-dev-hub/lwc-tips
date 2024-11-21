import getPricebooks from '@salesforce/apex/Tet23October.getPricebooks';
import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

import { getRecord, getFieldValue } from "lightning/uiRecordApi";


import ID_FIELD from "@salesforce/schema/Quote.Id";
import PRICEBOOK_FIELD from "@salesforce/schema/Quote.Price_Book__c";
import DATA_FIELD from "@salesforce/schema/Quote.Data__c";
import { updateRecord } from "lightning/uiRecordApi";

import getProducts from '@salesforce/apex/Tet23October.getProducts';
import getQuote from '@salesforce/apex/Tet23October.getQuote';

const FIELDS = [ID_FIELD, PRICEBOOK_FIELD, DATA_FIELD];

const allProductsColumns = [
    { label: 'Product Code', fieldName: 'ProductCode' },
    { label: 'Product Name', fieldName: 'ProductName' },
    { label: 'Product Family', fieldName: 'ProductFamily' },
    { label: 'Product Description', fieldName: 'ProductDescription' },
    { label: 'Product Price', fieldName: 'UnitPrice' },
]

const selectedProductsColumns = [
    { label: 'Product Code', fieldName: 'ProductCode' },
    { label: 'Product Name', fieldName: 'ProductName' },
    { label: 'Product Family', fieldName: 'ProductFamily' },
    { label: 'Quantity', fieldName: 'Quantity' },
    { label: 'List Unit Price', fieldName: 'UnitPrice' },
    { label: 'Additional Discount', fieldName: 'AdditionalDiscount' },
    { label: 'Net Unit Price', fieldName: 'UnitPrice' },
    { label: 'Net Total', fieldName: 'NetTotal' },
]

export default class Tet23October extends LightningElement {

    @track options;
    @api recordId;
    showMainModal = true;
    showAllProducts = false;

    @track allProducts;
    allProductsColumns = allProductsColumns;
    selectedProductsColumns = selectedProductsColumns;

    @track storeSelectedRows;
    @track selectedRows;

    startDate;
    endDate;
    discount;
    totalSumOfAmount;
    saveDisable = true;

    @wire(getPricebooks, { recordId: "$recordId", })
    wiredRecord(result) {
        if (result.data) {
            let temp = result.data.map(item => {
                return {
                    label: item.Name,
                    value: item.Id
                }
            });

            this.options = temp;
            console.log(this.options);
            console.log(this.recordId);

        } else {
            console.log(result.error);

        }
    }

    @wire(getRecord, {
        recordId: "$recordId",
        fields: FIELDS,
    })
    quote(result) {
        if (result.data) {
            console.log(result.data);
            // if (result.data.fields.Price_Book__c.value != '') {
            //     this.showMainModal = false;
            //     let d = result.data.fields.Data__c.value;
            //     this.startDate = d.split('--')[0];
            //     console.log(this.startDate);

            //     this.endDate = d.split('--')[1];
            //     console.log(this.endDate);
            //     let json = d.split('--')[2]
            //     console.log(json);
            //     this.selectedRows = JSON.parse(json);
            //     console.log(this.selectedRows);

            // } else {
            //     this.showMainModal = true;
            // }

            const priceBookValue = result.data.fields.Price_Book__c?.value;
            if (priceBookValue) {
                this.showMainModal = false;

                let d = result.data.fields.Data__c.value || ''; // Handle case where Data__c is null
                if (d) {
                    this.startDate = d.split('--')[0];
                    this.endDate = d.split('--')[1];
                    let json = d.split('--')[2];
                    this.selectedRows = JSON.parse(json || '[]'); // Handle case where JSON is invalid or empty
                } else {
                    this.startDate = null;
                    this.endDate = null;
                    this.selectedRows = [];
                }

                console.log(this.startDate, this.endDate, this.selectedRows);
            } else {
                this.showMainModal = true;
            }

        } else {
            console.log(result.error);
        }
    };


    async handlePricebookChange(event) {
        let selectedPricebook = event.target.value;
        console.log(selectedPricebook);

        const fields = {};

        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[PRICEBOOK_FIELD.fieldApiName] = selectedPricebook;

        const recordInput = { fields: fields };

        await updateRecord(recordInput).then((record) => {
            console.log(record);
        });

        // // Close the modal window and display a success toast
        // this.dispatchEvent(new CloseActionScreenEvent());
        // this.dispatchEvent(
        //     new ShowToastEvent({
        //         title: 'Success',
        //         message: 'Opportunity Record Updated!',
        //         variant: 'success'
        //     })
        // );

        this.handleQuoteLineEditor();

    }

    async handleQuoteLineEditor() {

        console.log('open modal');
        this.showMainModal = false;

        await getProducts({ quoteId: this.recordId }).then(result => {

            console.log(result);
            this.allProducts = result.map(item => {
                return {
                    ...item,
                    ProductName: item.Product2.Name,
                    ProductFamily: item.Product2.Family,
                    ProductDescription: item.Product2.Description,
                }
            });
            console.log(JSON.stringify(this.allProducts));

        }).catch(error => {
            console.log(error);
        });

        this.showAllProducts = true;

    }

    handleRowSelection(event) {
        let selected = event.detail.selectedRows;

        console.log(selected);
        this.storeSelectedRows = selected.map(item => {
            console.log(item);

            return {
                ...item,
                Quantity: 1,
                AdditionalDiscount: '',
                NetTotal: '',
            }
        });

        console.log('this.storeSelectedRows', this.storeSelectedRows);
    }

    handleAddProductsClick() {
        this.saveDisable = true;
        console.log('add products clicked');
        this.selectedRows = this.storeSelectedRows;
    }

    handleStartDate(event) {
        console.log('start date');
        console.log(event.detail.value);
        this.startDate = event.detail.value;
        this.handleDates();
    }

    handleEndDate(event) {
        console.log('end date');
        console.log(event.detail.value);
        this.endDate = event.detail.value;
        this.handleDates();
    }

    handleDates() {
        if (this.startDate != null && this.endDate != null) {
            this.showAllProducts = false;
        }
        else {
            this.showAllProducts = true;
        }
    }

    handleDiscount(event) {
        console.log('discount');
        console.log(event.detail.value);
        this.discount = event.detail.value;
    }

    handleCalculateClick() {
        console.log('calculate clicked');
        this.totalSumOfAmount = 0;

        this.selectedRows = this.selectedRows.map(element => {
            return {
                ...element,
                AdditionalDiscount: this.discount,
                NetTotal: element.UnitPrice - (element.UnitPrice * (this.discount / 100)),
            }

        });
        console.log('selected rows', JSON.stringify(this.selectedRows, null, 2));

        this.selectedRows.forEach(element => {
            this.totalSumOfAmount += element.NetTotal;
        });

        console.log(this.totalSumOfAmount);
        this.saveDisable = false;
    }


    async handleSaveClick() {
        console.log('save clicked');

        let allSelectedData = JSON.stringify(this.startDate) + '--' + JSON.stringify(this.endDate) + '--' + JSON.stringify(this.selectedRows);
        console.log(allSelectedData);

        const fields = {};

        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[DATA_FIELD.fieldApiName] = allSelectedData;

        const recordInput = { fields: fields };

        await updateRecord(recordInput).then((record) => {
            console.log(record);
        });
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Quote Updated',
                variant: 'success'
            })
        );

        this.dispatchEvent(new CloseActionScreenEvent());
    }


}