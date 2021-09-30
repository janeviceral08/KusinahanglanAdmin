import React,{ Component} from 'react';
import {    Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  DeviceEventEmitter,
  NativeEventEmitter,
  Switch,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  Alert,
ActivityIndicator } from 'react-native';
import {Container, CardItem, Body, Card, Left, Right, List, ListItem, Button} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Octicons from 'react-native-vector-icons/Octicons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FlatList } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import OrderItems from '../../component/OrderItems';
import Modal from 'react-native-modal';
import {BluetoothEscposPrinter, BluetoothManager, BluetoothTscPrinter} from "react-native-bluetooth-escpos-printer";
import RNImmediatePhoneCall from 'react-native-immediate-phone-call';
import axios from 'axios';
import moment from 'moment';
import Loader from '../../component/Loader';
var {height, width} = Dimensions.get('window');
var dateFormat = require('dateformat');

class OrderDetails extends Component{
  _listeners = [];
constructor(props){
    super(props);
    this.ref = firestore().collection('riders').where('status', '==', true);
     this.refCharges = firestore();
    const orders = this.props.route.params.orders;
    this.state={
        orders: orders,
        visibleModal: false,
        visibleModal2: false,
        data:[],
        devices: null,
        pairedDs:[],
        foundDs: [],
        bleOpend: false,
        open: false,
        loading: false,
        boundAddress: '',
        debugMsg: '',
        visibleModal: false,
        store_key:'',
        name:'',
        store_name:'',
        address:'',
        city:'',
        loading: false,
        del_charge : '',
          driverCharge: '',
          extra_charge: '',
          labor_charge: '',
          pickup_charge: '',
          succeding: '',
          amount_base: '',
          rider_commision: '',
          SuperAdminStoreCommision: 0,
          SuperAdminRiderCommision: 0,
    }
  
}

onCollectionUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.setState({
      data : stores,
  
   });
  
  }

  storeTotal(){
    const {orders} = this.state;
    let total = 0;
    let addonTotal = 0;
    orders.Products.forEach(item => {
            if(item.sale_price){
                total += item.sale_price * item.qty
            }else{
                total += item.price * item.qty
            } 
            
            if(item.choice){
                item.choice.forEach(addon => {
                    addonTotal += addon.price * item.qty
                });
            }
    });
    console.log('store total: ', total+addonTotal)
    return total+addonTotal;
}
 
  onChangeRider(item){
    Alert.alert(
      'Confirmation',
      'Are you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({visibleModal2: false}),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.changeRider(item) }
      ],
      { cancelable: false }
    );
}

onsetDelivered(){
    Alert.alert(
        'Confirmation',
        'This will mark the order as Delivered, are you sure you want to continue?',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('cancel pressed'),
            style: 'cancel'
          },
          { text: 'OK', onPress: () => this.setDelivered() }
        ],
        { cancelable: false }
      );
}

setDelivered(){
   
    const commision =  (this.state.orders.delivery_charge+this.state.orders.extraKmCharge)*this.state.rider_commision;
    const update_Commision = firestore().collection('riders').doc(this.state.orders.DeliveredBy.id);
      update_Commision.update({ 
        wallet: firestore.FieldValue.increment(-commision)
    })
     firestore().collection('charges').doc('delivery_charge').update({AdminWallet: firestore.FieldValue.increment(-commision*this.state.SuperAdminRiderCommision)})
    firestore().collection('SuperAdminCommisionHistory').add({SuperAdminwallet_less: commision*this.state.SuperAdminRiderCommision,riderCommision: commision, account: 'Rider', Id: this.state.orders.DeliveredBy.id, Name: this.state.orders.DeliveredBy.Name, delivery_charge: this.state.orders.delivery_charge+this.state.orders.extraKmCharge, OrderNo:this.state.orders.OrderNo, DateCreated: moment().unix() })
    this.storeID().map(items => {
let storeIds = items.storeId;

    let totalLess = 0;
        let addonTotalLess = 0;
    let total = 0;
        let addonTotal = 0;
        this.state.orders.Products.forEach(item => {
            console.log('storeIds: ', storeIds);
            console.log('item storeID: ', item)
            if(storeIds == item.storeId){
                if(item.sale_price){
                    totalLess += item.sale_price * item.qty,
                     total += (item.sale_price * item.qty)*item.labor_charge
                }else{
                    totalLess += item.price * item.qty,
                     total += (item.price * item.qty)*item.labor_charge
                }
                
            }
            if(item.choice){
            item.choice.forEach(addon => { 
                addonTotal += (addon.price  * item.qty)*item.labor_charge
            });
          }
        });
        let store_wallet = total+addonTotal;
let store_walletLess = totalLess+addonTotalLess;
    console.log('stores com:', totalLess+addonTotalLess);
        const update_Commision = firestore().collection('stores').doc(storeIds);
      update_Commision.update({ 
        wallet: firestore.FieldValue.increment(-store_wallet)
    })
    firestore().collection('charges').doc('delivery_charge').update({AdminWallet: firestore.FieldValue.increment(-(store_wallet*this.state.SuperAdminStoreCommision))})
    firestore().collection('SuperAdminCommisionHistory').add({SuperAdminwallet_less: parseFloat(store_wallet*this.state.SuperAdminStoreCommision), account: 'store', Id: items.storeId, Name: items.store_name, totalOrder: store_walletLess, OrderNo:this.state.orders.OrderNo, DateCreated: moment().unix(), adminCommision: store_wallet })
})
    const ref = firestore().collection('orders').doc(this.state.orders.OrderId);
    ref.update({ 
        OrderStatus: 'Delivered',
        riderLessWallet:this.state.rider_commision ,
        AppShare:parseFloat(this.state.SuperAdminStoreCommision),
    })


    this.props.navigation.goBack();
}

changeRider(item){
    const ref = firestore().collection('orders').doc(this.state.orders.OrderId);
    ref.update({ 
        DeliveredBy : {           
            Name: item.Name,
            token: item.token,
            id: item.userId
        },
    })
    this.setState({visibleModal2: false})
}

  
onConfirmation(item){
    Alert.alert(
      'Confirmation',
      'Are you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({visibleModal: false}),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.acceptOrder(item) }
      ],
      { cancelable: false }
    );
}

onCall(item){
  Alert.alert(
    'Proceed to Call?',
    'Are you sure you want to proceed?',
    [
      {
        text: 'Cancel',
        onPress: () => this.setState({visibleModal: false}),
        style: 'cancel'
      },
      { text: 'OK', onPress: () => RNImmediatePhoneCall.immediatePhoneCall(item)}
    ],
    { cancelable: false }
  );
}

acceptOrder(item){
    this.setState({loading: true,})
    const ref = firestore().collection('orders').doc(this.state.orders.OrderId);
    const notif_ref = firestore().collection('notification').doc(this.state.orders.OrderId);
    ref.update({ 
        OrderStatus : "Processing",
        rider_id:item.userId,
        DeliveredBy : {           
            Name: item.Name,
            token: item.token,
            id: item.userId
        },
    })
    /* const notif_info={title:'New Order to Deliver',
     body:'You have Order No. '+ this.state.orders.OrderNo,
     key:'AIzaSyCuo41kP9We1Gnvs3S2iiPRA_8KER9aftE',
                        tokens: item.token,
                      }
     axios.post('https://deliverynotifapp.herokuapp.com/notifications/sendToRider', notif_info)
                      .then(res =>{
                          console.log('datas', res.data)
                          if(res.data == 'sucess'){



                                                    const notif_infosendToStore={title:'New Order to Process',
                            body:'You have Order No. '+ this.state.orders.OrderNo,
                            key:'AIzaSyCuo41kP9We1Gnvs3S2iiPRA_8KER9aftE',
                                                tokens: this.state.orders.notification_token,
                                            }
                            axios.post('https://deliverynotifapp.herokuapp.com/notifications/sendToStore', notif_infosendToStore)
                                            .then(res =>{
                                                console.log('datas', res.data)
                                                if(res.data == 'sucess'){
                                                    console.log('DONE!')*/
                                                    this.setState({loading: false,})
                                                this.props.navigation.goBack();
                                               /* }
                                                else{
                                                    console.log('Please Try Again');
                                                }
                                                
                                            });
                          }
                          else{
                              console.log('Please Try Again');
                          }
                          
                      });*/
    
}

cancelConfirmation(){
    Alert.alert(
        'Confirmation',
        'Are you sure you want to cancel the order?',
        [
          {
            text: 'Cancel',
            onPress: console.log('cancelled'),
            style: 'cancel'
          },
          { text: 'OK', onPress: () => this.cancelOrder() }
        ],
        { cancelable: false }
      );
}

cancelOrder(){
    const ref = firestore().collection('orders').doc(this.state.orders.OrderId);
    ref.update({ OrderStatus : "Cancelled" })
    this.props.navigation.goBack();
}
getDelivery = async() =>{
   
    const getData= this.refCharges.collection('charges').doc('delivery_charge');
    const doc = await getData.get();
    if (!doc.exists) {
  console.log('No such document!');
} else {
  console.log('Document data:', doc.data());
  this.setState({
          del_charge : doc.data().del_charge,
          driverCharge: doc.data().driverCharge,
          extra_charge: doc.data().extra_charge,
          labor_charge: doc.data().labor_charge,
          pickup_charge: doc.data().pickup_charge,
          succeding: doc.data().succeding,
          amount_base: doc.data().del_charge,
          rider_commision: doc.data().rider_commision,
            SuperAdminStoreCommision: doc.data().SuperAdminStoreCommision,
          SuperAdminRiderCommision: doc.data().SuperAdminRiderCommision,
       })}
    };


componentDidMount(){
    this.storeID();
    this.getDelivery();
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

    BluetoothManager.isBluetoothEnabled().then((enabled)=> {
      this.setState({
          bleOpend: Boolean(enabled),
          loading: false
      })
  }, (err)=> {
      err
  });

  if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
          (rsp)=> {
              this._deviceAlreadPaired(rsp)
          }));
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp)=> {
          this._deviceFoundEvent(rsp)
      }));
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, ()=> {
          this.setState({
              name: '',
              boundAddress: ''
          });
      }));
  } else if (Platform.OS === 'android') {
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp)=> {
              this._deviceAlreadPaired(rsp)
          }));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_FOUND, (rsp)=> {
              this._deviceFoundEvent(rsp)
          }));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_CONNECTION_LOST, ()=> {
              this.setState({
                  name: '',
                  boundAddress: ''
              });
          }
      ));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, ()=> {
              ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
          }
      ))
  }
}


componentWillUnmount(){
    this.storeID();
    this.getDelivery();
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

    BluetoothManager.isBluetoothEnabled().then((enabled)=> {
      this.setState({
          bleOpend: Boolean(enabled),
          loading: false
      })
  }, (err)=> {
      err
  });

  if (Platform.OS === 'ios') {
      let bluetoothManagerEmitter = new NativeEventEmitter(BluetoothManager);
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED,
          (rsp)=> {
              this._deviceAlreadPaired(rsp)
          }));
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_DEVICE_FOUND, (rsp)=> {
          this._deviceFoundEvent(rsp)
      }));
      this._listeners.push(bluetoothManagerEmitter.addListener(BluetoothManager.EVENT_CONNECTION_LOST, ()=> {
          this.setState({
              name: '',
              boundAddress: ''
          });
      }));
  } else if (Platform.OS === 'android') {
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_ALREADY_PAIRED, (rsp)=> {
              this._deviceAlreadPaired(rsp)
          }));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_DEVICE_FOUND, (rsp)=> {
              this._deviceFoundEvent(rsp)
          }));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_CONNECTION_LOST, ()=> {
              this.setState({
                  name: '',
                  boundAddress: ''
              });
          }
      ));
      this._listeners.push(DeviceEventEmitter.addListener(
          BluetoothManager.EVENT_BLUETOOTH_NOT_SUPPORT, ()=> {
              ToastAndroid.show("Device Not Support Bluetooth !", ToastAndroid.LONG);
          }
      ))
  }
}

storeID (){
    const {orders} = this.state;
    var uniq = {}
    if(orders.Products.length == 1){
      var arrFiltered = orders.Products;
    }else{
      var arrFiltered = orders.Products.filter(obj => !uniq[obj.storeId] && (uniq[obj.storeId] = true));
    }

    return arrFiltered;
}


_deviceAlreadPaired(rsp) {
  var ds = null;
  if (typeof(rsp.devices) == 'object') {
      ds = rsp.devices;
  } else {
      try {
          ds = JSON.parse(rsp.devices);
      } catch (e) {
      }
  }
  if(ds && ds.length) {
      let pared = this.state.pairedDs;
      pared = pared.concat(ds||[]);
      this.setState({
          pairedDs:pared
      });
  }
}

_deviceFoundEvent(rsp) {//alert(JSON.stringify(rsp))
  var r = null;
  try {
      if (typeof(rsp.device) == "object") {
          r = rsp.device;
      } else {
          r = JSON.parse(rsp.device);
      }
  } catch (e) {//alert(e.message);
      //ignore
  }
  //alert('f')
  if (r) {
      let found = this.state.foundDs || [];
      if(found.findIndex) {
          let duplicated = found.findIndex(function (x) {
              return x.address == r.address
          });
          //CHECK DEPLICATED HERE...
          if (duplicated == -1) {
              found.push(r);
              this.setState({
                  foundDs: found
              });
          }
      }
  }
}

_renderRow(rows){
  let items = [];
  for(let i in rows){
      let row = rows[i];

      if(row.address) {
          items.push(
              <TouchableOpacity key={new Date().getTime()+i} style={styles.wtf} onPress={()=>{
              this.setState({
                  loading:true
              });
              BluetoothManager.connect(row.address)
                  .then((s)=>{
                      this.setState({
                          loading:false,
                          boundAddress:row.address,
                          name:row.name || "UNKNOWN"
                      })
                  },(e)=>{
                      this.setState({
                          loading:false
                      })
                      alert(e);
                  })

          }}><Text style={styles.name}>{row.name || "UNKNOWN"}</Text><Text
                  style={styles.address}>{row.address}</Text></TouchableOpacity>
          );
      }
  }
  return items;
}


  
  render(){
    const {orders} = this.state;

console.log('rider minus: ', orders.delivery_charge+orders.extraKmCharge*this.state.rider_commision)
this.storeID().map(items => {
let storeIds = items.storeId;

    let total = 0;
        let addonTotal = 0;
        this.state.orders.Products.forEach(item => {
            console.log('storeIds: ', storeIds);
            console.log('item storeID: ', item)
            if(storeIds == item.storeId){
                if(item.sale_price){
                    total += (item.sale_price * item.qty)*this.state.SuperAdminStoreCommision
                }else{
                    total += (item.price * item.qty)*this.state.SuperAdminStoreCommision
                }
                
            }
            if(item.choice){
            item.choice.forEach(addon => { 
                addonTotal += (addon.price  * item.qty)*this.state.SuperAdminStoreCommision
            });
          }
        });

    console.log('stores com:', total+addonTotal);
})
    return (
      <Container>
          <Loader loading={this.state.loading} />
        <ScrollView>
        <Card transparent>
            <CardItem style={{backgroundColor:'#E8E8E8', paddingBottom: 0}}>
                <Left/>
                <Body style={{flex: 2}}><Text style={{fontWeight: 'bold', fontSize: 18}}>Order Details</Text></Body>
                <Right>
                  <TouchableOpacity onPress={()=> this.setState({printModal: true})}>
                    <Text style={{fontSize: 14, fontWeight:'bold'}}>
                      Print
                    </Text>
                  </TouchableOpacity>
                </Right>
            </CardItem>
            <CardItem style={{backgroundColor:'#E8E8E8', paddingBottom: 0}}>
                <Body style={{backgroundColor: 'white', borderRadius:10}}>
                <View style={{width:'100%', flexDirection:'row', backgroundColor: 'lightblue', padding: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10}}>
                                <Text  style={{paddingHorizontal: 10,fontWeight:'bold',}}>Order Details</Text>
                            </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}>
                        <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Order Number:</Text><Text> #00{orders.OrderNo}</Text>
                    </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}>
                        <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Customer :</Text><Text style={{fontSize: 18}}> {orders.AccountInfo.name}</Text>
                    </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> User Status:</Text><Text style={{fontSize: 16}}> {orders.AccountInfo.status}</Text>
                    </View> 
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Payment Method:</Text><Text> {orders.PaymentMethod}</Text>
                    </View> 
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Time:</Text><Text> {orders.OrderDetails.Time}</Text>
                    </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Date:</Text><Text> {orders.OrderDetails.Date}</Text>
                    </View>     
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Recepient:</Text><Text> {orders.Billing.name}</Text>
                    </View>  
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <TouchableOpacity style={{flexDirection: 'row',paddingVertical: 5}} onPress={()=>this.onCall(orders.Billing.phone)}>
                            <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Contact #:</Text><Text> {orders.Billing.phone}</Text>
                        </TouchableOpacity>
                    </View>  
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text numberOfLines={5} note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Delivery Address:</Text>
                    </View>  
                    <View style={{flexDirection: 'row',paddingLeft:30, paddingBottom:10}}> 
                        <Text>{orders.Billing.address}, {orders.Billing.barangay},{orders.Billing.province}</Text>
                    </View> 
                 
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}> Assigned Rider :</Text><Text style={{fontSize: 18}}> {orders.DeliveredBy.Name}</Text>
                    </View>  
                    {orders.RiderCancel < 0 || orders.RiderCancel== undefined?null:  <View>
                    <View style={{flexDirection: 'row',paddingVertical: 5,paddingHorizontal:10}}> 
                        <Text numberOfLines={5} note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}>Cancelled By Riders:</Text>
                    </View>  
                  {orders.RiderCancel.map((info, index) =>  {return(<View style={{flexDirection: 'row',paddingLeft:30, paddingBottom:10}} key={index}> 
                        <Text>{info.RiderName}- {info.CancelledReason}</Text>
                    </View>)} )}
                    </View> }
                </Body>                                             
            </CardItem>
            <CardItem style={{backgroundColor:'#E8E8E8', paddingBottom: 0}}>
                <Left/>
                <Body style={{flex: 3}}><Text style={{fontWeight: 'bold', fontSize: 15}}>Ordered Products by Store</Text></Body>
                <Right/>
            </CardItem>
            <CardItem style={{backgroundColor:'#E8E8E8',flexDirection: 'column' , paddingBottom: 0}}>
                {
                this.storeID().map(item => {
                    return (
                        <Body style={{flex: 1, marginTop: 5}}>
                        {console.log('item: ',item)}
                            <View style={{width:'100%', flexDirection:'row', backgroundColor: 'lightblue', padding: 10, borderTopRightRadius: 10, borderTopLeftRadius: 10}}>
                                <AntDesign name="pushpin" size={18} color="red"/>
                                <Text  style={{paddingHorizontal: 10,fontWeight:'bold',}}>{item.store_name} </Text>
                            </View>
                            <View style={{flexDirection:'row', backgroundColor: 'white', borderBottomLeftRadius:10,borderBottomRightRadius: 10}}>
                                <OrderItems navigation={this.props.navigation} labor_charge={item.labor_charge}id={item.storeId} subtotal={orders.subtotal.toFixed(2)} oid={orders.OrderId} item={orders.Products} />
                            </View>
                        </Body>
                    )
                })
                }   
            </CardItem>
            <CardItem style={{ backgroundColor:'#E8E8E8', paddingBottom: 0}}>
                <Left/>
                <Body style={{flex: 3}}><Text style={{fontWeight: 'bold', fontSize: 15}}>Order Summary/Total</Text></Body>
                <Right/>
            </CardItem>
            <CardItem style={{ backgroundColor:'#E8E8E8'}}>
                <View style={{flex:1,paddingLeft: 10, backgroundColor:'white', paddingHorizontal: 10, borderRadius: 10}}>
                    <View style={{flexDirection: 'row',paddingVertical: 5, justifyContent:'space-between'}}>
                        <Text style={{fontSize: 14, fontWeight:'bold'}}>Sub Total</Text>
                        <Text>₱{Math.round(this.storeTotal()*10)/10}</Text>
                    </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5, justifyContent:'space-between'}}>
                        <Text style={{fontSize: 14, fontWeight:'bold'}}>Delivery Charge</Text><Text> ₱{Math.round(orders.delivery_charge*10)/10}</Text>
                    </View>
                    <View style={{flexDirection: 'row',paddingVertical: 5, justifyContent:'space-between'}}> 
                        <Text note style={{ fontSize: 12, fontWeight: 'bold'}}>Extra Kilometer Charge</Text><Text> ₱{orders.extraKmCharge}</Text>
                    </View>
                        
                    <View style={{flexDirection: 'row',paddingVertical: 5, justifyContent:'space-between'}}> 
                        <Text note style={{color:'salmon', fontSize: 14, fontWeight: 'bold'}}>Discount</Text><Text> -₱{orders.discount}</Text>
                    </View>  
                    <View style={{borderBottomWidth: 1, borderBottomColor: 'gray'}}/>
                    <View style={{flexDirection: 'row',paddingVertical: 5, justifyContent:'space-between'}}> 
                        <Text note style={{fontSize: 15, fontWeight: 'bold'}}>Total</Text><Text style={{fontSize: 15, fontWeight: 'bold'}}> ₱{Math.round((this.storeTotal() + orders.extraKmCharge + orders.delivery_charge - orders.discount)*10)/10}</Text>
                    </View> 
                </View>                                             
            </CardItem>
            {orders.OrderStatus == "Pending" ?
            <CardItem style={{flexDirection: "row", flex: 3, justifyContent: "space-between", alignContent: "center",backgroundColor:'#E8E8E8' }}>
                <Button style={{backgroundColor: 'salmon', flex:1, marginHorizontal: 2}} block onPress={()=> this.cancelConfirmation()}>
                    <Text style={{color:'white', fontSize: 15, fontWeight: 'bold'}}>Cancel</Text>
                </Button>
                <Button style={{backgroundColor: 'rgba(56, 172, 236, 1)', flex:1,marginHorizontal: 2}}  block onPress={()=> this.setState({visibleModal: true})}>
                    <Text style={{color:'white', fontSize: 15, fontWeight: 'bold'}}>Accept</Text>
                </Button>
            </CardItem>:orders.OrderStatus == "Processing" ? 
             <CardItem style={{ flex: 3, justifyContent: "space-between", alignContent: "center",backgroundColor:'#E8E8E8' }}>
             <Button style={{backgroundColor: 'salmon', flex:1, marginHorizontal: 2}} block onPress={()=> this.setState({visibleModal2: true})}>
                 <Text style={{color:'white', fontSize: 15, fontWeight: 'bold'}}>Change Rider</Text>
             </Button>
             <Button  style={{ flex:1, marginHorizontal: 2, backgroundColor: 'rgba(56, 172, 236, 1)'}} block onPress={()=> this.onsetDelivered()}>
                 <Text style={{color:'white', fontSize: 15, fontWeight: 'bold'}}>Delivered</Text>
             </Button>
         </CardItem>
            :null }
        </Card>
        </ScrollView>
        <Modal
      isVisible={this.state.visibleModal}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
     <Card style={style.content}>
        <CardItem><Left/><Body style={{flex:2, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Assign Rider</Text></Body><Right/></CardItem>
        <List>
     <FlatList
               data={this.state.data}
               renderItem={({ item }) => (
              item.datas.wallet > 0?
                <ListItem onPress={()=> this.onConfirmation(item.datas)}>
                  <Body>
                    <Text>{item.datas.Name}</Text>
                  </Body>
                </ListItem>
                    :null
               )}
               keyExtractor={item => item.key}
               
           />
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.setState({visibleModal: false})}
      >
       <Text style={{color:'white'}}>Cancel</Text>
      </Button>
    </Card>
    </Modal>
    <Modal
      isVisible={this.state.visibleModal2}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({visibleModal2: false})} transparent={true}>
     <Card style={style.content}>
        <CardItem><Left/><Body style={{flex:2, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Change Rider</Text></Body><Right/></CardItem>
        <List>
     <FlatList
               data={this.state.data}
               renderItem={({ item }) => (
              
                <ListItem onPress={()=> this.onChangeRider(item.datas)}>
                  <Body>
                    <Text>{item.datas.Name}</Text>
                    <Text note numberOfLines={1}>{item.key}</Text>
                  </Body>
                </ListItem>
                    
               )}
               keyExtractor={item => item.key}
               
           />
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.setState({visibleModal2: false})}
      >
       <Text style={{color:'white'}}>Cancel</Text>
      </Button>
    </Card>
    </Modal>
    <Modal
              isVisible={this.state.printModal}
               animationInTiming={1000}
            animationIn='slideInUp'
            animationOut='slideOutDown'
            animationOutTiming={1000}
            useNativeDriver={true}
              onBackdropPress={() => this.setState({printModal: false})} transparent={true}>
                 <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Open Bluetooth Before Scanning </Text>
                <View>
                <View style={{flexDirection: 'row', alignContent: "center", justifyContent: "center"}}>
                <Text style={{color: 'tomato'}}>Turn On Bluetooth</Text>
                <Switch value={this.state.open} onValueChange={(v)=>{
                this.setState({
                    loading:true
                })
                if(!v){
                    BluetoothManager.disableBluetooth().then(()=>{
                        this.setState({
                          open:false,
                            loading:false,
                            foundDs:[],
                            pairedDs:[]
                        });
                    },(err)=>{alert(err)});

                }else{
                    BluetoothManager.enableBluetooth().then((r)=>{
                        var paired = [];
                        if(r && r.length>0){
                            for(var i=0;i<r.length;i++){
                                try{
                                    paired.push(JSON.parse(r[i]));
                                }catch(e){
                                    //ignore
                                }
                            }
                        }
                        this.setState({
                          open:true,
                            loading:false,
                            pairedDs:paired
                        })
                    },(err)=>{
                        this.setState({
                            loading:false
                        })
                        alert(err)
                    });
                }
            }}/>
            </View>
            <View style={{paddingHorizontal : 30, paddingVertical: 10}}>
                    <Button style={{backgroundColor:'rgba(56, 172, 236, 1)'}} block disabled={this.state.loading || this.state.open} onPress={()=>
                        this._scan()
                    }><Text style={{color: 'white', fontSize: 15}}>Scan</Text></Button>
            </View>
                </View>
                <Text  style={styles.title}>Connected:<Text style={{color:"tomato"}}>{!this.state.name ? 'No Devices' : this.state.name}</Text></Text>
                <Text  style={styles.title}>Found(tap to connect):</Text>
                {this.state.loading ? (<ActivityIndicator animating={true}/>) : null}
                <View>
                {this.state.foundDs &&
                    this._renderRow(this.state.foundDs)
                }
                </View>
                <Text  style={styles.title}>Paired:</Text>
                {this.state.loading ? (<ActivityIndicator animating={true}/>) : null}
                <View style={{flex:1,flexDirection:"column"}}>
                {
                    this._renderRow(this.state.pairedDs)
                }
                </View>

                <View style={{flexDirection:"column",justifyContent:"space-around",paddingVertical:10 , paddingHorizontal: 30}}>         
                <Button block  style={{backgroundColor:'rgba(56, 172, 236, 1)', color:'white'}} disabled={this.state.loading|| !(this.state.open && this.state.boundAddress.length > 0) }
                        title="Print Receipt" onPress={async () => {
                    try {
                        await BluetoothEscposPrinter.printerInit();
                        await BluetoothEscposPrinter.printerLeftSpace(0);

                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
                        await BluetoothEscposPrinter.setBlob(0);
                        await  BluetoothEscposPrinter.printText(`Order No. ${orders.OrderNo}\r\n`, {
                            encoding: 'GBK',
                            codepage: 0,
                            widthtimes: 1,
                            heigthtimes: 0,
                            fonttype: 2
                        });
                        
                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                        await  BluetoothEscposPrinter.printText("Date / Time " + (dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")) + "\r\n", {});
                        await  BluetoothEscposPrinter.printText(`Customer  ${orders.Billing.name}\r\n`, {});
                        await  BluetoothEscposPrinter.printText(`Address  ${orders.Billing.address},${orders.Billing.barangay},${orders.Billing.province}\r\n`, {});
                        await  BluetoothEscposPrinter.printText(`TRID  ${orders.OrderId}\r\n`, {});
                        await  BluetoothEscposPrinter.printText(`Rider:  ${orders.DeliveredBy.Name}\r\n`, {});
               
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        let columnWidths = [23, 4, 7, 8];
                        let columnWidths2 =[23, 4,7, 8 ];
                        let addonColumnWidths =  [3, 31, 0, 8]
                        await BluetoothEscposPrinter.printColumn(columnWidths,
                            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                            ["Item", 'Qty', 'Price', 'Total'], {encoding: 'GBK',
                            codepage: 0,
                            widthtimes: 0,
                            heigthtimes: 0,
                            fonttype: 1});
                       await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                         await orders.Products.map((item, i) => {
                               let num = item.qty;
                               let num2 = item.price;
                               let num3 = Math.round((num * num2)*10)/10;
                               let num4 = item.sale_price;
                               let num5= Math.round((num * num4)*10)/10;
                               let sale_price = num4.toString();
                               let price = num2.toString();
                               let qty= num.toString();  
                               let total = num3.toString();
                               let total_sp = num5.toString();
                               

                                if(item.sale_price){    
                                  BluetoothEscposPrinter.printColumn(columnWidths,
                                                        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                        [`${item.name} ${item.brand} (${item.unit})`, `${qty}`, sale_price, total_sp],{encoding: 'GBK',
                                                        codepage: 0,
                                                        widthtimes: 0,
                                                        heigthtimes: 0,
                                                        fonttype: 1})
                                                        
                                          BluetoothEscposPrinter.printText(`Note: ${item.note}\r\n`, {encoding: 'GBK',
                                                                                                        codepage: 0,
                                                                                                        widthtimes: 0,
                                                                                                        heigthtimes: 0,
                                                                                                        fonttype: 1});
                           if(item.choice){
                                  item.choice.map((addon, i) => {
                                        let num6 = addon.price;
                                        let addonPrice = num6.toString();
                                            BluetoothEscposPrinter.printColumn(addonColumnWidths,
                                                            [BluetoothEscposPrinter.ALIGN.RIGHT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                            ["+", `${addon.label}`, " ", addonPrice],{encoding: 'GBK',
                                                            codepage: 0,
                                                            widthtimes: 0,
                                                            heigthtimes: 0,
                                                            fonttype: 1})
                                            });
                                    }
                                                                                            
                                }else{
                                   BluetoothEscposPrinter.printColumn(columnWidths,
                                                        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                        [`${item.name} ${item.brand} (${item.unit})`, `  ${qty}`, price, total], {encoding: 'GBK',
                                                        codepage: 0,
                                                        widthtimes: 0,
                                                        heigthtimes: 0,
                                                        fonttype: 1})
                                          BluetoothEscposPrinter.printText(`Note: ${item.note}\r\n`, {
                                                                                                        encoding: 'GBK',
                                                                                                        codepage: 0,
                                                                                                        widthtimes: 0,
                                                                                                        heigthtimes: 0,
                                                                                                        fonttype: 1});
                                if(item.choice){
                                  item.choice.map((addon, i) => {
                                        let num6 = addon.price;
                                        let addonPrice = num6.toString();
                                            BluetoothEscposPrinter.printColumn(addonColumnWidths,
                                                            [BluetoothEscposPrinter.ALIGN.RIGHT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                            ['+', `${addon.label}`, " ", addonPrice],{encoding: 'GBK',
                                                            codepage: 0,
                                                            widthtimes: 0,
                                                            heigthtimes: 0,
                                                            fonttype: 1})
                                            });
                                    }                                                                    
                                }
                          });
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                                                    [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                    ["Subtotal", "", "", `${Math.round(this.storeTotal()*10)/10}`], {encoding: 'GBK',
                                                    codepage: 0,
                                                    widthtimes: 0,
                                                    heigthtimes: 0,
                                                    fonttype: 1})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                          ["Delivery Charge", "", "", `${Math.round(orders.delivery_charge*10)/10}`], {encoding: 'GBK',
                          codepage: 0,
                          widthtimes: 0,
                          heigthtimes: 0,
                          fonttype: 1})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                          ["Extra Kilometer Charge", "", "",`${orders.extraKmCharge}`], {encoding: 'GBK',
                          codepage: 0,
                          widthtimes: 0,
                          heigthtimes: 0,
                          fonttype: 1})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                                                    [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                    ["Discount", "", "-", `${orders.discount}`], {encoding: 'GBK',
                                                    codepage: 0,
                                                    widthtimes: 0,
                                                    heigthtimes: 0,
                                                    fonttype: 1})
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                                                    [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                    ["Total", "", "", `${Math.round((this.storeTotal() + orders.extraKmCharge + orders.delivery_charge - orders.discount)*10)/10}`], {encoding: 'GBK',
                                                    codepage: 0,
                                                    widthtimes: 0,
                                                    heigthtimes: 0,
                                                    fonttype: 1})
                   
                     
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
        
                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
                        await  BluetoothEscposPrinter.printText("Thank you for ordering with us!\r\n\r\n\r\n",  {
                            encoding: 'GBK',
                            codepage: 0,
                            widthtimes: 0,
                            heigthtimes: 0,
                            fonttype: 1
                        });
                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                    } catch (e) {
                        alert(e.message || "ERROR");
                    }

                }}><Text style={{ color:'white', fontSize: 15}}>Print</Text></Button>
                 
                </View>
                <View style={{ paddingHorizontal: 30}}>
                <Button block style={{backgroundColor: 'rgba(56, 172, 236, 1)', color:'white'}}
                         onPress={()=> this.setState({printModal: false})}><Text style={{ color:'white', fontSize: 15}}>Close</Text></Button>
                </View>
                </ScrollView>
            </Modal>
      </Container>
    );
}

_selfTest() {
  this.setState({
      loading: true
  }, ()=> {
      BluetoothEscposPrinter.selfTest(()=> {
      });

      this.setState({
          loading: false
      })
  })
}

_scan() {
  this.setState({
      loading: true
  })
  BluetoothManager.scanDevices()
      .then((s)=> {
          var ss = s;
          var found = ss.found;
          try {
              found = JSON.parse(found);//@FIX_it: the parse action too weired..
          } catch (e) {
              //ignore
          }
          var fds =  this.state.foundDs;
          if(found && found.length){
              fds = found;
          }
          this.setState({
              foundDs:fds,
              loading: false
          });
      }, (er)=> {
          this.setState({
              loading: false
          })
          alert('error' + JSON.stringify(er));
      });
}

}

export default OrderDetails;

const styles = StyleSheet.create({
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#bdc3c7',
    marginBottom: 10,
    marginTop: 10
  },
  invoice: {
      padding: 20,
      backgroundColor:"#FFFFFF",
      borderWidth: 0.2,
      borderBottomColor: '#ffffff',
      borderTopColor: '#ffffff',

    },
    centerElement: {justifyContent: 'center', alignItems: 'center'},
    content: {
      backgroundColor: 'white',
      padding: 22,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
     container: {
        backgroundColor: '#F5FCFF',
        paddingVertical: 20
    },

    title:{
        width:width,
        backgroundColor:"#eee",
        color:"#232323",
        paddingLeft:8,
        textAlign:"left"
    },
    wtf:{
        flex:1,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingHorizontal: 10
    },
    name:{
        flex:1,
        textAlign:"left"
    },
    address:{
        flex:1,
        textAlign:"right"
    }
});



const style = StyleSheet.create({
    wrapper: {
      // marginBottom: -80,
      backgroundColor: "white",
      height: 80,
      width: "100%",
      padding: 10
    },
    notificationContent: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start"
    },
   sssage: {
      marginBottom: 2,
      fontSize: 14
    },
    closeButton: {
      position: "absolute",
      right: 10,
      top: 10
    },
    content: {
      backgroundColor: 'white',
      padding: 22,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 5,
    },
  });