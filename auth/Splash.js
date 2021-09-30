import React from 'react';
import { View, Text, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fcmService} from '../screens/FCM/FCMService'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
class SplashScreen extends React.Component {
  performTimeConsumingTask = async() => {
    return new Promise((resolve) =>
      setTimeout(
        () => { resolve('result') },
        1500
      )
    )
  }

  async componentDidMount() {
    // Preload data from an external API
    // Preload data using AsyncStorage
    const data = await this.performTimeConsumingTask();
    const isLoggedIn= await AsyncStorage.getItem('uid');
    console.log('isLoggedIn: ', isLoggedIn)
    if (data !== null) {
        if (isLoggedIn == null){
              this.props.navigation.navigate('Login');
        }else{
            this.props.navigation.navigate('Home');
        }
    
    }

    fcmService.register(this.onRegister, this.onNotification, this.onOpenNotification)

    this.notif();
  }

  async notif(){
    const token= await AsyncStorage.getItem('token');

    var washingtonRef = firestore().collection("admin_token").doc("token");
    // Atomically add a new region to the "regions" array field.
    washingtonRef.update({
        tokens: firestore.FieldValue.arrayUnion(token)
    });
  }

onRegister(token){
console.log("[NotificationFCM] onRegister: ", token)

}

onNotification(notify){
console.log("[NotificationFCM] onNotification: ", notify)

const channelObj = {
  channelId: "SampleChannelID",
  channelName: "SampleChannelName",
  channelDes: "sampleChannelDes"
}

const channel = fcmService.buildChannel(channelObj)

const buildNotify = {
  dataId: notify._notificationId,
  title: notify._title,
  content: notify._body,
  sound: 'default',
  channel: channel,
  data: {},
  colorBgIcon: '#1A243B',
  largeIcon: 'ic_launcher',
  smallIcon: 'ic_launcher',
  vibrate: true
}

const notification = fcmService.buildNotification(buildNotify)
fcmService.displayNotification(notification)
}

onOpenNotification(notify){
console.log("[NotificationFCM] onOpenNotification", notify)
}

  render() {
    return (
      <View style={styles.viewStyles}>

          <Image
            source={require('../assets/k.png')}
            style={{ width: 300, height: 300 }}
          />
      </View>
    );
  }
}

const styles = {
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red'
   
  },
  textStyles: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold'
  },
  backgroundImage: {
    resizeMode: 'cover', // or 'stretch'
  },
}

export default SplashScreen;