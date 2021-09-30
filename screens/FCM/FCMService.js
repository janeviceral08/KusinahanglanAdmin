
/*import type { Notification, NotificationOpen } from 'react-native-firebase'
import AsyncStorage from '@react-native-community/async-storage';

class FCMService {

    register = (onRegister, onNotification, onOpenNotification) => {
        this.checkPermission(onRegister)
        this.createNotificationListeners(onRegister ,onNotification, onOpenNotification)
    }

    checkPermission = (onRegister) =>{
        firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled){
                //User has permission
                this.getToken(onRegister)
               
            }else{
                //User doesnt have permission
                this.requestPermission(onRegister)
            }
        }).catch(error => {
            console.log("Permission rejected", error)
        })
    }

    getToken = (onRegister) => {
        firebase.messaging().getToken().then(fcmtoken =>{
            if(fcmtoken){
                onRegister(fcmtoken)
                AsyncStorage.setItem('token', fcmtoken);
            }else{
                console.log("User does not have a device token")
            }
        }).catch(error =>{
            console.log("getToken rejected", error)
        })
    }

    requestPermission = (onRegister) => {
        firebase.messaging().requestPermission()
        .then(() => {
            this.getToken(onRegister)
        }).catch(error => {
            console.log("Request Permission rejected", error)
        })
    }

    deleteToken = () =>{
        firebase.messaging().deleteToken()
        .catch(error =>{
            console.log("Delete token error", error)
        })
    }

    createNotificationListeners = (onRegister ,onNotification, onOpenNotification)=>{
        //Trigerred when a particular notification has been received in foreground
        this.notificationListener = firebase.notifications()
        .onNotification((notification: Notification)=>{
            onNotification(notification)
        })

        //If app is in background, you can listen for when a notification
        //is clicked / tapped / opened as follows
        this.notificationOpenedListener = firebase.notifications()
        .onNotificationOpened((notificationOpen: NotificationOpen) => {
            onOpenNotification(notificationOpen)
        })

        //If app is closed, you can check if it was opened by a notification
        //being clicked / tapped / opened as follows

        firebase.notifications().getInitialNotification()
        .then(notificationOpen => {
            if (notificationOpen){
                const notification: Notification = notificationOpen.notification
                onOpenNotification(notification)
            }
        })
    
        //Triggered for data only payload in foreground

        this.messageListener = firebase.messaging().onMessage((message) => {
            onNotification(message)
        })

        //Triggered when have a new token 
        this.onTokenFreshListener = firebase.messaging().onTokenRefresh((fcmtoken) => {
            console.log("New token refesh", fcmtoken)
            onRegister(fcmtoken)
        })

    }

        unRegister = () => {
            this.notificationListener()
            this.notificationOpenedListener()
            this.messageListener()
            this.onTokenFreshListener()
        }

        buildChannel = (obj) =>{
            return new firebase.notifications.Android.Channel(
                'default', 'default',
                firebase.notifications.Android.Importance.High)
                .setDescription('test')
        }

        buildNotification = (obj) => {
            //For Android
            firebase.notifications().android.createChannel(obj.channel)

            //For Android and IOS

            return new firebase.notifications.Notification({
            sound: 'default',
            show_in_foreground: true,
          })
            .setNotificationId(obj.dataId)
            .setTitle(obj.title)
            .setBody(obj.content)
            .setData(obj.data)
            
            //For Android

            .android.setChannelId(obj.channel.channelId)
            .android.setLargeIcon(obj.largeIcon)
            .android.setSmallIcon(obj.smallIcon)
            .android.setColor(obj.colorBgIcon)
            .android.setPriority(firebase.notifications.Android.Priority.Max)
            .android.setVibrate(obj.vibrate)
            //.android.setAutoCancel(true)

        }
            scheduleNotification = (notification, days, minutes) =>{
                const date = new Date()
                if(days){
                    date.setDate(date.getDate() + days)
                }
                if(minutes){
                    date.setMinutes(date.getMinutes() + minutes)
                }

                firebase.notifications()
                .scheduleNotification(notification, {firebase: date.getTime()})
            }
            
            displayNotification = (notification) => {
                firebase.notifications().displayNotification(notification)
                .catch(error => console.log("Display Notification error: ", error))
            }

            removeDeliveredNotification = (notification) =>{
                firebase.notifications().removeDeliveredNotification(notification.notificationId)
            }      
    
}

export const fcmService = new FCMService()*/