import { LightningElement,api ,track } from 'lwc';
import getContactFieldSetFields from "@salesforce/apex/TetAugust2024_IndiCare.getContactFieldSetFields";
import getOpportunityFieldSetFields from "@salesforce/apex/TetAugust2024_IndiCare.getOpportunityFieldSetFields";
import getRecords from "@salesforce/apex/TetAugust2024_IndiCare.getRecords";
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class TetAugust2024_IndiCare extends LightningElement {
    @api recordId;
    @track RecordFromApex =[];
    @track contactFields;
    @track opportunityFields;
    @track activeLeadSourceTab;
    @track activeStageNameTab;
    showContactTabset = true;
    showOpportunityTabset =  false;
    @track showEditForm = false;
    @track recordIdToEdit;
    @track fields = [];
    @track objectApiName ;
    @track showDetailsForm = false;

    @track subscription = {};
    channelName = '/event/Tet_August_2024_Record_Update__e';


    fieldMappings = {
        'Contact': [
            'Name',
            'Account.Name'
        ],
        'Opportunity': [
            'Name',          
            'StageName',    
            'CloseDate',  
            'Amount',
            'Account.Name'
        ]
    };


    async connectedCallback() {
        try {
            this.contactFields = await getContactFieldSetFields();
            this.opportunityFields = await getOpportunityFieldSetFields();
            console.log(JSON.stringify(this.contactFields,null,2));
            console.log(JSON.stringify(this.opportunityFields,null,2));

        } catch (error) {
            console.error('Error in connectedCallback', error);
        }
        subscribe(this.channelName, -1, this.manageEvent).then(response => {
            this.subscription = response;
            console.log('Subscribed to platform event: ', response);
        });
    }

    manageEvent = event=> {
        console.log('manageEvent',event);
        const refreshRecordEvent = event.data.payload;
        console.log('refreshRecordEvent',JSON.stringify(refreshRecordEvent));
        
        if (refreshRecordEvent.recordId__c == this.recordId) {
            console.log('refreshRecordEvent.recordId__c',JSON.stringify(refreshRecordEvent.recordId__c));
            
           console.log('-----------',this.activeLeadSourceTab,'----',this.activeStageNameTab,'--------',this.objectApiName);
           
            if (this.activeLeadSourceTab != '') {
                this.handleActiveTabOfContact({ target: { value: this.activeLeadSourceTab } });
            } else if (this.activeStageNameTab != '') {
                this.handleActiveTabOfOpportunity({ target: { value:this.activeStageNameTab } });
            }   
            
        }
    }

    get recordList() {
        if (this.showContactTabset) {
            return this.RecordFromApex.map(rec => ({
                id: rec.Id,
                keyValuePairs: [
                    { key: 'Name', value: rec.Name },
                    { key: 'Account Name', value: rec.Account.Name }
                ]
            }));
        } else {
            return this.RecordFromApex.map(rec => ({
                id: rec.Id,
                keyValuePairs: [
                    { key: 'Amount', value: rec.Amount },
                    { key: 'StageName', value: rec.StageName },
                    { key: 'Account Name', value: rec.Account?.Name }
                ]
            }));
        }
    }


    
    
    async handleActiveTab(event){
        this.showDetailsForm = false;
        this.showEditForm = false;
        var activeTab = event.target.value;
        console.log('Active Tab : ' + activeTab);

        if (activeTab == 'Contact') {
            this.showContactTabset = true;
            this.showOpportunityTabset =  false;
            this.objectApiName = 'Contact';
            
        } else {
            this.showContactTabset = false;
            this.showOpportunityTabset =  true;
            this.objectApiName = 'Opportunity';
            
        }  
    }

    async handleActiveTabOfContact(event){
        this.showDetailsForm = false;
        this.showEditForm = false;
        this.activeStageNameTab = '';
        this.activeLeadSourceTab = event.target.value;

        await getRecords({'recId':this.recordId ,'ldSource': this.activeLeadSourceTab , 'stage':'' , 'tab' : 'Contact'}).then(result=>{
            this.RecordFromApex = result;
        })
        .catch(error => {
            console.log('Error : ' + error);
        });
        console.log('RecordFromApex 3 ',JSON.stringify(this.RecordFromApex));
    }

    async handleActiveTabOfOpportunity(event){
        this.showDetailsForm = false;
        this.showEditForm = false;
        this.activeLeadSourceTab = '';
        this.activeStageNameTab = event.target.value;
        await getRecords({'recId':this.recordId ,'ldSource': '' , 'stage': this.activeStageNameTab , 'tab' : 'Opportunity'}).then(result=>{
            this.RecordFromApex = result;
        })
        .catch(error => {
            console.log('Error : ' + error);
        });
        console.log('RecordFromApex',JSON.stringify(this.RecordFromApex));
    }

    handleEdit(event) {
        this.recordIdToEdit = '';
        this.recordIdToEdit = event.target.dataset.id;
        console.log('recordIdToEdit',this.recordIdToEdit);
        this.showEditForm = true;
        this.fields = this.showContactTabset == true ? 
                      this.fieldMappings['Contact'] : 
                      this.fieldMappings['Opportunity'];
        console.log('this.fields',this.fields);
        
    }

    async handleSuccess(event) {
        console.log('Record updated successfully');
        this.showEditForm = false;
        this.recordIdToEdit = '';
        this.fields = [];
        this.refreshData();
        
    }

    handleCancel() {
        this.showEditForm = false;
        this.showDetailsForm=false;
    }

    refreshData() {
        
        if (this.activeLeadSourceTab) {
            this.handleActiveTabOfContact({ target: { value: this.activeLeadSourceTab } });
        } else if (this.activeStageNameTab) {
            this.handleActiveTabOfOpportunity({ target: { value: this.activeStageNameTab } });
        }
    }

    handleShowDetails(event) {
        this.showDetailsForm = false;
        this.recordIdToEdit = '';
        this.recordIdToEdit = event.target.dataset.id;
        this.showDetailsForm = true;
        this.fields = this.showContactTabset ? this.fieldMappings['Contact'] : this.fieldMappings['Opportunity'];
    }

   

    /*subscribeToPlatformEvent() {
        const messageCallback = (response) => {
            const objectName = response.data.payload.ObjectName__c;
            const recordId = response.data.payload.RecordId__c;

            if ((objectName === 'Contact' || objectName === 'Opportunity') && recordId === this.recordId) {
                window.location.reload();
            }
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            this.subscription = response;
            console.log('Subscribed to platform event: ', response);
        });

        onError(error => {
            console.error('Error in platform event subscription', error);
        });
    }*/

    disconnectedCallback() {
        unsubscribe(this.subscription, response => {
            console.log('Unsubscribed from platform event: ', response);
        });
    }

}