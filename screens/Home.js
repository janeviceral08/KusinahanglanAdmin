import React,{ Component} from 'react';
import { View, Text, Button, StyleSheet ,Image} from 'react-native';
import CustomHeader from '../component/CustomHeader';
import {Container} from 'native-base';
//import {fcmService} from './FCM/FCMService'
import { Card, Divider } from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from "moment";
import messaging from '@react-native-firebase/messaging';

class Home extends Component{
  constructor(props) {
    super(props);
    this.ref = firestore();
    this.subscribe= null;
    this.state = {
      dataSource:[],
      data:[],
      wallet:0,
    };
}

componentDidMount(){
  this._bootstrapAsync();
  this.getWallet();
   messaging().getToken().then(token=>{
      console.log('Admintoken: ', token)
    })

}

          getWallet =async () =>{
    this.unsubscribe = this.ref.collection('charges').where('id', '==', 'admin000001' ).onSnapshot(this.onCollectionUpdategetWallet);
    };


  onCollectionUpdategetWallet = (querySnapshot) => {
    querySnapshot.forEach((doc) => {

      this.setState({
          wallet:doc.data().AdminWallet,

     });
    });
  }
  onCollectionUpdate = (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
     orders.push ({
            datas : doc.data(),
            key : doc.id
            });
    })
 
    this.setState({
      dataSource : orders,
      loading: false,
   })

  }

  onCollectionUpdateUsers = (querySnapshot) => {
    const orders = [];
    querySnapshot.forEach((doc) => {
     orders.push ({
            datas : doc.data(),
            key : doc.id
            });
    })
 
    this.setState({
      data : orders,
      loading: false,
   })

  }


_bootstrapAsync = () =>{
  const today = this.state.currentDate;
  const date_ordered = moment(today).format('MMMM Do YYYY, h:mm:ss a');
  const week_no = moment(today , "MMDDYYYY").isoWeek();
  const time =  moment(today).format('h:mm:ss a');
  const date = moment(today).format('MMMM D, YYYY');
  let Name = 'id';
  let Date = 'Date';
  let path = 'DeliveredBy.'+'id';
  let paths = 'OrderDetails.'+'Date';
    this.unsubscribe = this.ref.collection('orders')
    .where('OrderDetails.Date','==', date).onSnapshot(this.onCollectionUpdate) ;
    this.subscribe = firestore().collection('users')
    .where('Address.City','==', "Butuan City").onSnapshot(this.onCollectionUpdateUsers) ;
  };


orderCount(status){
  let count = 0;
  this.state.dataSource.map((item, i)=>{
        if(item.datas.OrderStatus == status){
          count += 1;
        }
  })

  return count;
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

  render(){
    return (
      <Container>
        <CustomHeader title="Dashboard" isHome={true} navigation={this.props.navigation}/>
         <Card containerStyle={styles.card}>
				<Text style={styles.notes}>Admin Wallet Balance</Text>
				
				<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
					<Image style={{width:70, height:70}} source={require('../assets/Wallet.png')} />
          <Text style={styles.time}>₱{parseFloat(this.state.wallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text>
				</View>

			</Card>
        <Card containerStyle={styles.card}>
				<Text style={styles.notes}>Today's Order</Text>
				
				<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
					<Image style={{width:70, height:70}} source={require('../assets/AdminOrder1.png')} />
					<Text style={styles.time}>{this.state.dataSource.length}</Text>
				</View>

				<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:10}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>Pending</Text>
            <Text style={styles.notes}>{this.orderCount('Pending')}</Text>
				</View>
        <Divider style={{ backgroundColor: '#dfe6e9', marginVertical:10}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>Processing</Text>
            <Text style={styles.notes}>{this.orderCount('Processing')}</Text>
				</View>
        <Divider style={{ backgroundColor: '#dfe6e9', marginVertical:10}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>Delivered</Text>
            <Text style={styles.notes}>{this.orderCount('Delivered')}</Text>
				</View>
			</Card>
      <Card containerStyle={styles.card}>
				<Text style={styles.notes}>Number of Registered Users</Text>
				
				<View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
					<Image style={{width:70, height:70}} source={require('../assets/users.png')} />
          <Text style={styles.time}>{this.state.data.length}</Text>
				</View>

				<Divider style={{ backgroundColor: '#dfe6e9', marginVertical:10}} />
				
				<View style={{flexDirection:'row', justifyContent:'space-between'}}>
					<Text style={styles.notes}>City</Text>
					<Text style={styles.notes}>Butuan City</Text>
				</View>
			</Card>
      </Container>
    );
}
}

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
	card:{
		backgroundColor:'rgba(56, 172, 236, 1)',
		borderWidth:0,
		borderRadius:20
	},
	time:{
		fontSize:30,
		color:'#fff'
	},
	notes: {
		fontSize: 18,
		color:'#fff',
		textTransform:'capitalize'
	}
});
