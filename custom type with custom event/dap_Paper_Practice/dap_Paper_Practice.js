// import { LightningElement, track, wire } from 'lwc';
// import fetchAccounts from '@salesforce/apex/AccountDataController.fetchAccounts';
// import CASE_OBJECT from '@salesforce/schema/Case';
// import STATUS_FIELD from '@salesforce/schema/Case.Status';
// import { updateRecord } from 'lightning/uiRecordApi';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import { refreshApex } from '@salesforce/apex';
// import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';

// const columns = [
//     { label: 'Name', fieldName: 'Name', editable: true },
//     { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
//     {
//         label: 'Type', fieldName: 'Type', type: 'picklistColumn', editable: true, typeAttributes: {
//             placeholder: 'Choose Type', options: { fieldName: 'pickListOptions' }, 
//             value: { fieldName: 'Type' }, // default value for picklist,
//             context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
//         }
//     }
// ]

// export default class Dap_Paper_Practice extends LightningElement {
//     columns = columns;
//     showSpinner = false;
//     @track data = [];
//     @track accountData;
//     @track draftValues = [];
//     lastSavedData = [];
//     @track pickListOptions;

//     @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
//     objectInfo;

//     //fetch picklist options
//     @wire(getPicklistValues, {
//         recordTypeId: "$objectInfo.data.defaultRecordTypeId",
//         fieldApiName: STATUS_FIELD
//     })
//      wirePickList({ error, data }) {
//         if (data) {
//             this.pickListOptions = data.values;
//         } else if (error) {
//             console.log(error);
//         }
//     }

//     //here I pass picklist option so that this wire method call after above method
//     @wire(fetchAccounts, { pickList: '$pickListOptions' })
//     accountData(result) {
//         this.accountData = result;
//         if (result.data) {
//             this.data = JSON.parse(JSON.stringify(result.data));

//             this.data.forEach(ele => {
//                 ele.pickListOptions = this.pickListOptions;
//             })

//             this.lastSavedData = JSON.parse(JSON.stringify(this.data));

//         } else if (result.error) {
//             this.data = undefined;
//         }
//     };

//     updateDataValues(updateItem) {
//         let copyData = JSON.parse(JSON.stringify(this.data));

//         copyData.forEach(item => {
//             if (item.Id === updateItem.Id) {
//                 for (let field in updateItem) {
//                     item[field] = updateItem[field];
//                 }
//             }
//         });

//         //write changes back to original data
//         this.data = [...copyData];
//     }

//     updateDraftValues(updateItem) {
//         let draftValueChanged = false;
//         let copyDraftValues = [...this.draftValues];
//         //store changed value to do operations
//         //on save. This will enable inline editing &
//         //show standard cancel & save button
//         copyDraftValues.forEach(item => {
//             if (item.Id === updateItem.Id) {
//                 for (let field in updateItem) {
//                     item[field] = updateItem[field];
//                 }
//                 draftValueChanged = true;
//             }
//         });

//         if (draftValueChanged) {
//             this.draftValues = [...copyDraftValues];
//         } else {
//             this.draftValues = [...copyDraftValues, updateItem];
//         }
//     }

//     //handler to handle cell changes & update values in draft values
//     handleCellChange(event) {
//         //this.updateDraftValues(event.detail.draftValues[0]);
//         let draftValues = event.detail.draftValues;
//         draftValues.forEach(ele=>{
//             this.updateDraftValues(ele);
//         })
//     }

//     handleSave(event) {
//         this.showSpinner = true;
//         this.saveDraftValues = this.draftValues;

//         const recordInputs = this.saveDraftValues.slice().map(draft => {
//             const fields = Object.assign({}, draft);
//             return { fields };
//         });

//         // Updateing the records using the UiRecordAPi
//         const promises = recordInputs.map(recordInput => updateRecord(recordInput));
//         Promise.all(promises).then(res => {
//             this.showToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
//             this.draftValues = [];
//             return this.refresh();
//         }).catch(error => {
//             console.log(error);
//             this.showToast('Error', 'An Error Occured!!', 'error', 'dismissable');
//         }).finally(() => {
//             this.draftValues = [];
//             this.showSpinner = false;
//         });
//     }

//     handleCancel(event) {
//         //remove draftValues & revert data changes
//         this.data = JSON.parse(JSON.stringify(this.lastSavedData));
//         this.draftValues = [];
//     }

//     showToast(title, message, variant, mode) {
//         const evt = new ShowToastEvent({
//             title: title,
//             message: message,
//             variant: variant,
//             mode: mode
//         });
//         this.dispatchEvent(evt);
//     }

//     // This function is used to refresh the table once data updated
//     async refresh() {
//         await refreshApex(this.accountData);
//     }
// }

import { LightningElement, track, wire } from "lwc";
import getAccounts from "@salesforce/apex/AccountDataController.fetchAccounts";
import CASE_OBJECT from '@salesforce/schema/Case';
import STATUS_FIELD from '@salesforce/schema/Case.Status';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';

const columns = [
    { label: 'CaseNumber', fieldName: 'CaseNumber', cellAttributes: {
        style: { fieldName: 'statusColor' } 
    }},
    { label: 'Subject', fieldName: 'Subject', cellAttributes: {
        style: { fieldName: 'statusColor' } 
    } },
    {
        label: 'Status', fieldName: 'Status', type: 'picklistColumn', editable: true, typeAttributes: {
            placeholder: 'Choose Status',
            options: { fieldName: 'pickListOptions' },
            value: { fieldName: 'Status' }, // default value for picklist,
            context: { fieldName: 'Id' } // binding account Id with context variable to be returned back
        }, cellAttributes: {
            style: { fieldName: 'statusColor' } 
        }
    },
    { label: 'Priority', fieldName: 'Priority',sortable : true , cellAttributes: {
        style: { fieldName: 'statusColor' } 
    }},
    { label: 'CreatedDate', fieldName: 'createddate' , sortable : true , cellAttributes: {
        style: { fieldName: 'statusColor' } 
    }},
    { label: 'LastModifiedDate', fieldName: 'lastmodifieddate' , cellAttributes: {
        style: { fieldName: 'statusColor' } 
    } }
];

export default class Dap_Paper_Practice extends LightningElement {
    columns = columns;
    @track accounts = [];

    @track wireData;
    @track displayAccounts = [];
    @track pageNumbers = [];
    @track currentPage = 1;
    @track totalPages = 0;
    @track pageSize = 10;
    @track totalRecords;
    @track isFirstPage = true;
    @track isLastPage = false;
    @track isPreviousDisabled = true;
    @track isNextDisabled = false;
    @track showSpinner = true;
    @track showPageButtons = true;
    @track draftValues = [];
    lastSavedData = [];
    @track pickListOptions = [];

    searchKey = '';
    priority = '';

    get options() {
        return [
            { label: '', value: 'None' },
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
        ];
    }

    @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: "$objectInfo.data.defaultRecordTypeId",
        fieldApiName: STATUS_FIELD
    })
    wirePickList({ error, data }) {
        if (data) {
            console.log('data.values--',data.values);
            
            this.pickListOptions = data.values;
            console.log('Picklist options fetched:', JSON.stringify(this.pickListOptions, null, 2));
        } else if (error) {
            console.error('Error fetching picklist values:', error);
        }
    }

    @wire(getAccounts, { pickList: '$pickListOptions' , searchKey : '$searchKey' , priority : '$priority'})
    wiredAccounts(result) {
        this.wireData = result;
        console.log('Result from Apex:', JSON.stringify(result, null, 2));

        if (result.data) {
            this.totalRecords = result.data.length;
            console.log('Total records:', this.totalRecords);


            let tempData = result.data.map(ele => {
                let createddate = new Date(ele.CreatedDate);
                createddate = createddate.toISOString()
                console.log('createdDate=',createddate);
                

                let lastmodifieddate = new Date(ele.LastModifiedDate);
                lastmodifieddate = lastmodifieddate.toISOString()
                console.log('lastmodifieddate=',lastmodifieddate);
                
                let currentTimeMinus2Days = new Date();
                currentTimeMinus2Days.setDate( currentTimeMinus2Days.getDate() - 2 );
                console.log('currentTimeMinus2Days',currentTimeMinus2Days.toISOString());

                console.log(lastmodifieddate < currentTimeMinus2Days.toISOString());
                
                
                if(lastmodifieddate < currentTimeMinus2Days.toISOString()){
                    return {
                        ...ele,
                        pickListOptions : this.pickListOptions,
                        lastmodifieddate : lastmodifieddate.substring(0, 10),
                        createddate : createddate.substring(0, 10),
                        statusColor : 'color: red',
                        
                    }
                }else{
                    return {
                        ...ele,
                        pickListOptions : this.pickListOptions,
                        lastmodifieddate : lastmodifieddate.substring(0, 10),
                        createddate : createddate.substring(0, 10),
                        statusColor : 'color: black',
                    }
                }
                
                    
            })
            
            this.accounts = JSON.parse(JSON.stringify(tempData));
            console.log('this.accounts--', JSON.stringify(this.accounts,null,2));

            

            this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            console.log('Total pages:', this.totalPages);

            this.setPages(this.accounts);
            this.navigateToFirstPage();
            this.showSpinner = false;
        }else if (result.error) {
            console.error('Error fetching accounts:', result.error);
            this.showSpinner = false;
        }
    }

    /**
     * setPages method is used to set the page numbers for the pagination component.
     * It creates an array of page numbers based on the length of the data and the page size.
     * The created array is assigned to this.pageNumbers so that it can be used in the pagination component.
     * @param {Object} data - data used to calculate the number of pages
     */
    setPages(data) {
        // Create an array of page numbers based on the length of the data and the page size.
        // this.pageNumbers is assigned the array so that it can be used in the pagination component.
        this.pageNumbers = Array.from(
            // Using the Array.from method with the length of Math.ceil(data.length / this.pageSize)
            { length: Math.ceil(data.length / this.pageSize) },
            // _ is a placeholder for the value of the array and i is the index of the array, and it starts with 1.
            (_, i) => i + 1
        );
    }
    /**
       * getPagesList method is used to return the list of page numbers to be displayed in the pagination component.
       * It calculates the middle of the page size and checks if the total number of pages is greater than the middle of the page size.
       * If so, it returns a slice of page numbers from the current page - middle to the current page + middle - 1.
       * If the total number of pages is less than or equal to the middle of the page size, 
       it returns a slice of page numbers from the start to the page size
      */
    getPagesList() {
        //Calculates the middle of the page size
        let mid = Math.floor(this.pageSize / 2) + 1;
        //Checks if the total number of pages is greater than the middle of the page size
        if (this.pageNumbers > mid) {
            //Returns a slice of page numbers from the current page - middle to the current page + middle - 1
            return this.pageNumbers.slice(
                this.currentPage - mid,
                this.currentPage + mid - 1
            );
        }
        //If the total number of pages is less than or equal to the middle of the page size,
        //returns a slice of page numbers from the start to the page size
        return this.pageNumbers.slice(0, this.pageSize);
    }
    /**
       * navigateToFirstPage method is used to navigate to the first page of the pagination component.
       * It assigns the current page to the first page, sets the flags for the first page, last page, 
       previous button, and next button, and assigns the accounts to be displayed on the first page.
      */
    navigateToFirstPage() {
        // Assign the current page to the first page
        this.currentPage = 1;
        // Assign the flag for first page to true
        this.isFirstPage = true;
        // Setting the flag for last page to false
        this.isLastPage = false;
        // Assign the flag for previous button to be disabled
        this.isPreviousDisabled = true;
        // Assign the flag for next button to be enabled
        this.isNextDisabled = false;
        // Assign the accounts to be displayed on the first page
        this.displayAccounts = this.accounts.slice(0, this.pageSize);
    }
    /**
       * navigateToLastPage method is used to navigate to the last page of the pagination.
       * It assigns the current page variable to the total number of pages, updates the isFirstPage and isLastPage variables, 
       and sets the isPreviousDisabled and isNextDisabled variables.
      * It also assigns the displayAccounts variable to the slice of the accounts array that corresponds to the current page
      */
    navigateToLastPage() {
        // Assign the current page variable to the total number of pages
        this.currentPage = this.totalPages;
        // Assign the isFirstPage variable to false, indicating that the current page is not the first page
        this.isFirstPage = false;
        // Assign the isLastPage variable to true, indicating that the current page is the last page
        this.isLastPage = true;
        // This line sets the isPreviousDisabled variable to false, indicating that the "previous" button should be enabled
        this.isPreviousDisabled = false;
        // Assign the isNextDisabled variable to true, indicating that the "next" button should be disabled
        this.isNextDisabled = true;
        // Assign the displayAccounts variable to the slice of the accounts array that corresponds to the current page, using the currentPage, pageSize and the accounts array
        this.displayAccounts = this.accounts.slice(
            (this.currentPage - 1) * this.pageSize,
            this.currentPage * this.pageSize
        );
    }
    /**
       * navigateToPage method is used to navigate to a specific page.   
       * It sets the currentPage variable to the page number that was clicked and checks if the current page 
       is the first page, last page, and if the previous and next buttons should be disabled.
      * It also calls the displayAccounts property and slice the accounts array to display the accounts for the current page.
      * @param {Object} event - event object passed when a page number is clicked.
      */
    navigateToPage(event) {
        //Sets the currentPage variable to the page number that was clicked
        this.currentPage = parseInt(event.target.textContent, 10);
        //Checks if the current page is the first page
        this.isFirstPage = this.currentPage === 1;
        //Checks if the current page is the last page
        this.isLastPage = this.currentPage === this.totalPages;
        //Checks if the previous button should be disabled
        this.isPreviousDisabled = this.currentPage === 1;
        //Checks if the next button should be disabled
        this.isNextDisabled = this.currentPage === this.totalPages;
        //Displays the accounts for the current page
        this.displayAccounts = this.accounts.slice(
            //Calculates the start index for the current page
            (this.currentPage - 1) * this.pageSize,
            //Calculates the end index for the current page
            this.currentPage * this.pageSize
        );
    }
    /**
       * navigateToPreviousPage method is used to navigate to the previous page in the pagination.
       * It updates the currentPage, isFirstPage, isLastPage, isPreviousDisabled and isNextDisabled properties
       and also updates the accounts to be displayed on the current page
      */
    navigateToPreviousPage() {
        // Assign the current page variable to the current page minus 1
        this.currentPage = this.currentPage - 1;
        // Assign the isLastPage variable to false, indicating that the current page is not the last page
        this.isLastPage = false;
        // If the current page is equal to 1
        if (this.currentPage === 1) {
            // Assign the isFirstPage variable to true, indicating that the current page is the first page
            this.isFirstPage = true;
            // Assign the isPreviousDisabled variable to true, indicating that the "previous" button should be disabled
            this.isPreviousDisabled = true;
        }
        // Assign the isNextDisabled variable to false, indicating that the "next" button should be enabled
        this.isNextDisabled = false;
        // Assign the accounts to be displayed on the previous page
        this.displayAccounts = this.accounts.slice(
            (this.currentPage - 1) * this.pageSize,
            this.currentPage * this.pageSize
        );
    }
    /**
     * navigateToNextPage method is used to navigate to the next page of accounts.
     * It checks if the current page is less than the total number of pages.
     * If true, it increments the current page by 1, updates the isFirstPage, isLastPage, isPreviousDisabled and isNextDisabled properties.
     * It also updates the displayAccounts array to show the accounts for the current page
     */
    navigateToNextPage() {
        //Checks if the current page is less than the total number of pages
        if (this.currentPage < this.totalPages) {
            //Increments the current page by 1
            this.currentPage++;
            //Checks if the current page is equal to the total number of pages
            if (this.currentPage === this.totalPages) {
                //Sets isFirstPage and isPreviousDisabled to false, isLastPage and isNextDisabled to true
                this.isFirstPage = false;
                this.isLastPage = true;
                this.isPreviousDisabled = false;
                this.isNextDisabled = true;
            } else {
                //Sets isFirstPage, isLastPage, isPreviousDisabled, and isNextDisabled to false
                this.isFirstPage = false;
                this.isLastPage = false;
                this.isPreviousDisabled = false;
                this.isNextDisabled = false;
            }
            //Updates the displayAccounts array to show the accounts for the current page
            this.displayAccounts = this.accounts.slice(
                (this.currentPage - 1) * this.pageSize,
                this.currentPage * this.pageSize
            );
        }
    }
    

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.displayAccounts));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.displayAccounts = parseData;
    } 



    updateDataValues(updateItem) {
        let copyData = JSON.parse(JSON.stringify(this.displayAccounts));
 
        copyData.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
            }
        });
 
        //write changes back to original data
        this.displayAccounts = [...copyData];
    }
 
    updateDraftValues(updateItem) {
        let draftValueChanged = false;
        let copyDraftValues = [...this.draftValues];
        //store changed value to do operations
        //on save. This will enable inline editing &
        //show standard cancel & save button
        copyDraftValues.forEach(item => {
            if (item.Id === updateItem.Id) {
                for (let field in updateItem) {
                    item[field] = updateItem[field];
                }
                draftValueChanged = true;
            }
        });
 
        if (draftValueChanged) {
            this.draftValues = [...copyDraftValues];
        } else {
            this.draftValues = [...copyDraftValues, updateItem];
        }
    }
 
    //handler to handle cell changes & update values in draft values
    handleCellChange(event) {
        //this.updateDraftValues(event.detail.draftValues[0]);
        let draftValues = event.detail.draftValues;
        draftValues.forEach(ele=>{
            this.updateDraftValues(ele);
        })
    }

    handleSave(event) {
        this.showSpinner = true;
        this.saveDraftValues = this.draftValues;
 
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
 
        // Updateing the records using the UiRecordAPi
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(res => {
            this.showToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.draftValues = [];
            return this.refresh();
        }).catch(error => {
            console.log(error);
            this.showToast('Error', 'An Error Occured!!', 'error', 'dismissable');
        }).finally(() => {
            this.draftValues = [];
            this.showSpinner = false;
        });
    }
 
    handleCancel(event) {
        //remove draftValues & revert data changes
        this.displayAccounts = JSON.parse(JSON.stringify(this.lastSavedData));
        this.draftValues = [];
    }
 
    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }

    handleSearch(event){
        this.searchKey = event.target.value;
        console.log('this.searchKey==>',this.searchKey);
        this.refresh();
    }

    handlePriorityChange(event){
        
        if (event.detail.value == 'None') {
            this.priority = '';
            console.log(this.priority);
        } else {
            this.priority = event.detail.value;
            console.log(this.priority);
        }
        this.refresh();
        

    }

    handleRefresh(){
        this.priority = '';
        this.searchKey = '';
        console.log('refresh');
        
    }
 
    // This function is used to refresh the table once data updated
    async refresh() {
        console.log('refresh function');
        
        await refreshApex(this.wireData);
    }
}