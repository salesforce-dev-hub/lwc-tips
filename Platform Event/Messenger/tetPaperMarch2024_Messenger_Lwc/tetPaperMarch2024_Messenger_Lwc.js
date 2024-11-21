import { LightningElement, track } from 'lwc';
import Id from '@salesforce/user/Id';
import getCurrentUser from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getCurrentUser';
import getAllUser from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getAllUser';
import getChat from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getChat';
import sendMessage from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.sendMessage';
import { subscribe } from 'lightning/empApi';

export default class TetPaperMarch2024_Messenger_Lwc extends LightningElement {
    usrId = Id;
    currentLogInUser;
    @track allUsers;
    @track chatOfUser = [];
    selectedUser;
    message = '';
    channelName = '/event/Message__e';

    async connectedCallback() {
        console.log(this.usrId);

       
        await getCurrentUser({ usrId: this.usrId }).then(res=>{
            console.log('User==>', res);
            this.currentLogInUser = res.Name;
        })
        .catch(error => {
            console.log('Error:', error);
        });
            
        

        console.log('Current User:', this.currentLogInUser);

        
        await getAllUser({ usrId: this.usrId }).then(res=>{
            console.log('All Users-->', res);
            this.allUsers = res;
        })
        .catch(error => {
            console.log('Error:', error);
        });

            
        

        console.log('allUsers-->', JSON.stringify(this.allUsers, null, 2));

        subscribe(this.channelName, -1, this.manageEvent).then(response => {
            console.log('Subscribed to platform event: ', response);
        }).catch(error => {
            console.log('Error subscribing to platform event:', error);
        });
    }

    async handleSelect(event) {
        this.selectedUser = event.detail.name;
        console.log('Selected User-->', this.selectedUser);

        await getChat({ usrId: this.usrId, withUser: this.selectedUser }).then(res=>{
            console.log('Chat-->', res);
            this.chatOfUser = res.map(chat => {
                if (chat.OwnerId === this.usrId) {
                    return {...chat,
                            from: true, 
                            to: false 
                        };
                } else {
                    return { ...chat,
                            from: false,
                            to: true
                        };
                }
            })

        })
        .catch(error => {
            console.log('Error:', error);
        });
            
        
    }

    handleMessageType(event) {
        this.message = event.detail.value;
        console.log('Message-->', this.message);
    }

    async handleSend() {
        if (this.message !== '') {
            
            await sendMessage({ to: this.selectedUser, message: this.message }).then(()=>{
                console.log('Message sent');
            })
            .catch(error => {
                console.log('Error:', error);
            });
            
            
            await this.handleSelect({ detail: { name: this.selectedUser } });
        }
    }

    manageEvent = async event => {
        const refreshRecordEvent = event.data.payload;
        console.log('Platform event received-->', JSON.stringify(refreshRecordEvent));

        let userName = refreshRecordEvent.to__c;

        if (this.usrId === userName) {
            await this.handleSelect({ detail: { name: this.selectedUser } });
        }
    }
}


// import { LightningElement, track } from 'lwc';
// import Id from '@salesforce/user/Id';
// import getCurrentUser from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getCurrentUser';
// import getAllUser from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getAllUser';
// import getChat from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.getChat';
// import sendMessage from '@salesforce/apex/TetPaperMarch2024_Messenger_Lwc.sendMessage';
// import { subscribe } from 'lightning/empApi';

// export default class TetPaperMarch2024_Messenger_Lwc extends LightningElement {
//     usrId = Id;
//     currentLogInUser;
//     @track allUsers;
//     @track chatOfUser;
//     selectedUser;
//     message = '';
//     channelName = '/event/Message__e';

//     async connectedCallback(){
//         console.log('User ID: ', this.usrId);
    
//         await getCurrentUser({ usrId: this.usrId }).then(res => {
//             console.log('User:', res);
//             this.currentLogInUser = res.Name;
//         }).catch(error => {
//             console.log('Error:', error);
//         });
    
//         await getAllUser({ usrId: this.usrId }).then(res => {
//             console.log('All Users:', res);
//             this.allUsers = res;
//         }).catch(error => {
//             console.log('Error:', error);
//         });
    
//         console.log('Subscribing to platform event...');
//         subscribe(this.channelName, -1, this.manageEvent).then(response => {
//             console.log('Subscribed to platform event:', response);
//         }).catch(error => {
//             console.log('Subscription error:', error);
//         });
//     }
    

//     async handleSelect(event) {
//         this.selectedUser = event.detail.name;
//         console.log('selected--', this.selectedUser);

//         await getChat({ usrId: this.usrId, withUser: this.selectedUser }).then(res => {
//             console.log('Chat--', res);
//             this.chatOfUser = res.map(chat => {
//                 if (chat.OwnerId === this.usrId) {
//                     return { ...chat, from: true, to: false };
//                 } else {
//                     return { ...chat, from: false, to: true };
//                 }
//             });
//         }).catch(error => {
//             console.log('Error--', error);
//         });

//         console.log('Chat--', JSON.stringify(this.chatOfUser, null, 2));
//     }

//     async handleMessageType(event) {
//         this.message = event.detail.value;
//         console.log('Message--', this.message);
//     }

//     async handleSend() {
//         console.log('send button');

//         if (this.message !== '') {
//             await sendMessage({ to: this.selectedUser, message: this.message }).then(() => {
//                 console.log('message created');
//             }).catch(error => {
//                 console.log('Error--', error);
//             });
//         }

//         // Refresh chat after sending the message
//         await getChat({ usrId: this.usrId, withUser: this.selectedUser }).then(res => {
//             this.chatOfUser = res.map(chat => {
//                 if (chat.OwnerId === this.usrId) {
//                     return { ...chat, from: true, to: false };
//                 } else {
//                     return { ...chat, from: false, to: true };
//                 }
//             });
//         }).catch(error => {
//             console.log('Error--', error);
//         });

//         console.log('Chat--', JSON.stringify(this.chatOfUser, null, 2));
//     }

//     manageEvent = async event => {
//         const refreshRecordEvent = event.data.payload;
//         console.log('Event received:', JSON.stringify(refreshRecordEvent));
    
//         let userName = refreshRecordEvent.to__c;
//         console.log('Current User:', this.usrId, ' Event User:', userName);
    
//         if (this.selectedUser === userName) {
//             await getChat({ usrId: this.usrId, withUser: userName }).then(res => {
//                 console.log('Chat Data:', res);
//                 this.chatOfUser = res.map(chat => {
//                     if (chat.OwnerId === this.usrId) {
//                         return { ...chat, from: true, to: false };
//                     } else {
//                         return { ...chat, from: false, to: true };
//                     }
//                 });
//             }).catch(error => {
//                 console.log('Error:', error);
//             });
//         } else {
//             console.log('Event does not match selected user.');
//         }
//     };
    
// }
