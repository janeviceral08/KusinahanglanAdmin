import React,{ Component} from 'react';
import { Platform,
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
ActivityIndicator,
PermissionsAndroid,
FlatList} from 'react-native';
import moment from "moment";
import {Container, Card, Thumbnail, Body, Right, Left, CardItem,Button, Icon, Header,Title, List, Item, Input} from 'native-base';

import Modal from 'react-native-modal';
import {BluetoothEscposPrinter, BluetoothManager, BluetoothTscPrinter} from "react-native-bluetooth-escpos-printer";
var {height, width} = Dimensions.get('window');
var dateFormat = require('dateformat');
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import XLSX from 'xlsx';
import { writeFile, DownloadDirectoryPath } from 'react-native-fs';



class riderDetails extends Component{
  _listeners = [];
  constructor(props) {
    super(props);
    const id = this.props.route.params.id;
    const name = this.props.route.params.name;
      const email = this.props.route.params.email;
    this.ref = firestore();
    this.unsubscribe = null;
    this.unsubscribes = null;
    this.state = {
      user: null,
      email: email,
      password: "",
      formValid: true,
      error: "",
      loading: false,
      dataSource: [],
      uid:'',
      store_path: '',
      currentDate: new Date(),
      id: id,
      printModal: false,
      devices: null,
      pairedDs:[],
      foundDs: [],
      bleOpend: false,
      open: false,
      loading: false,
      boundAddress: '',
      debugMsg: '',
      visibleModal: false,
      UpdateWallet: false,
      store_key:'',
      name:'',
      store_name:'',
      address:'',
      city:'',
      Addwallet: 0,
      names: name,
      AdminWallet:0,
      isDatePickerVisible: false,
      isDatePickerVisibleEnd: false,
      dateRangeModal: false,
      startDate: "",
      endDate: "",
      RiderWallet: this.props.route.params.wallet,
    };
     }

    showDatePickerEnd = () => {
this.setState({isDatePickerVisibleEnd: true})
  };

   hideDatePickerEnd = () => {
    this.setState({isDatePickerVisibleEnd: false})
  };

   handleConfirmEnd = (date) => {
    console.warn("A date has been picked: ", date);
      this.setState({endDate: date})
    this.hideDatePickerEnd();
  };
      
       showDatePicker = () => {
this.setState({isDatePickerVisible: true})
  };

   hideDatePicker = () => {
    this.setState({isDatePickerVisible: false})
  };

   handleConfirm = (date) => {
    console.warn("A date has been picked: ", date);
      this.setState({startDate: date})
    this.hideDatePicker();
  };
         
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

  TotalAmount(){
    let total = 0
  this.state.dataSource.forEach((item) => {
    total += this.storeTotal(item.datas.Products) + item.datas.delivery_charge + item.datas.extraKmCharge - item.datas.discount
  
})
return total;
  }

  onRiderClear(){
    Alert.alert(
      'Confirmation',
      'Are you sure you want to proceed?',
      [
        {
          text: 'Cancel',
          onPress: () => this.setState({visibleModal2: false}),
          style: 'cancel'
        },
        { text: 'OK', onPress: () => this.saveRiderReport() }
      ],
      { cancelable: false }
    );
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
      this.unsubscribe = this.ref.collection('orders').where('DeliveredBy.id', '==', this.state.id).where('OrderStatus','==', 'Delivered')
      .where('OrderDetails.Date','==', date).onSnapshot(this.onCollectionUpdate) ;
    };

    storeTotal(items){
      const {orders} = this.state;
      let total = 0;
      items.forEach(item => {
              if(item.sale_price){
                  total += item.sale_price * item.qty
              }else{
                  total += item.price * item.qty
              }      
      });
      return total;
  }

  componentDidMount() {
    this.setState({loading: true})
     this.getAdminWallet();
    this._bootstrapAsync();

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
GetData = () =>{
     this.haveNewValue();
}
haveNewValue = () =>{
  this.setState({ loading: true,dateRangeModal: false})
    const startDate = this.state.startDate;
    const endDate = this.state.endDate;
    const date_ordered = moment(startDate).unix();
        const date_orderedendDate = moment(endDate).unix();
      this.unsubscribes = this.ref.collection('orders').where('DeliveredBy.id', '==', this.state.id).where('OrderStatus','==', 'Delivered').where('Timestamp','>=', date_ordered)
      .where('Timestamp','<=', date_orderedendDate).onSnapshot(
                querySnapshot => {
                    const orders = []
                    querySnapshot.forEach(doc => {
                        console.log('doc.data(): ',doc.data())
                        orders.push ({
            datas : doc.data(),
            key : doc.id
            })
                    });
                    this.setState({
      dataSource : orders,
      loading: false,
      
   })
                },
                error => {
                    console.log(error)
                }
            )
    };

    
    storeTotal(items){
      const {orders} = this.state;
      let total = 0;
      items.forEach(item => {
              if(item.sale_price){
                  total += item.sale_price * item.qty
              }else{
                  total += item.price * item.qty
              }      
      });
      return total;
  }
getAdminWallet =async () =>{
    this.unsubscribe = this.ref.collection('charges').where('id', '==', 'admin000001' ).onSnapshot(this.onCollectionUpdategetAdminWallet);
    };


  onCollectionUpdategetAdminWallet = (querySnapshot) => {
    querySnapshot.forEach((doc) => {

      this.setState({
          AdminWallet:doc.data().AdminWallet,

     });
    });
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
  updateTextInput = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
  }
EditWallet(){
  if(this.state.Addwallet > this.state.AdminWallet){
    Alert.alert(
        'Insufficient Balance',
        'You only have '+ this.state.AdminWallet + ' on your account',
        [
          { text: 'OK', onPress: () => null }
        ],
        { cancelable: false }
      );
      return
  }
firestore().collection('charges').doc('delivery_charge').update({AdminWallet: firestore.FieldValue.increment(-parseFloat(this.state.Addwallet))})
firestore().collection('riders').doc(this.state.id).update({wallet: firestore.FieldValue.increment(parseFloat(this.state.Addwallet))})
firestore().collection('LoadHistory').add({PrevWallet:parseFloat(this.state.RiderWallet), Amount: parseFloat(this.state.Addwallet), RiderId: this.state.id, account: 'Rider', DateLoaded: moment().unix(), riderName:this.state.names, riderEmail: this.state.email })
  Alert.alert(
        'Transaction Successfull',
        'You have successfully updated the wallet',
        [
          { text: 'OK', onPress: () => this.props.navigation.goBack()}
        ],
        { cancelable: false }
      );
}
  render(){
    
var hash = Object.create(null),
    result = [];

                
this.state.dataSource.forEach(function (o) {
    if (!hash[o.key]) {
        hash[o.key] = { order_no: o.datas.OrderNo, date: moment(o.datas.OrderDetails.Date).format('MM/D/YYYY'), Status: o.datas.OrderStatus, delivery_charge:o.datas.delivery_charge, extra_charge:o.datas.extraKmCharge, total: o.datas.subtotal + o.datas.delivery_charge + o.datas.extraKmCharge- o.datas.discount };
        result.push(hash[o.key]);
    }

});
console.log('sum: ',result);

  const DDP = DownloadDirectoryPath + '/';

  const input = res => res;
  const output =str => str;

    const requestRunTimePermission=()=>{
   
    async function externalStoragePermission(){
      try{
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs access to storage data',
          }
        );
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
      
    const date_now = moment().format('MMM-D-YYYY h-mm-a')
    const name = 'Gross Income ('+ date_now +' )'+'.xlsx'
    const ws= XLSX.utils.json_to_sheet(result);
    console.log('ws: ', ws)
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, date_now+" report");
    const wbout =XLSX.write(wb, {type: 'binary', bookType: "xlsx"});
    const file = DDP + name;
  
  
    writeFile(file, output(wbout), 'ascii').then((res)=> {
      Alert.alert("Exportfile Success", "Exported to "+ file);
    }).catch((err) => {Alert.alert('exporting file error ', 'Export is not Available');});
  
  
        }else{
          Alert.alert('Permission Denied');
        }
      } catch(err){
        Alert.alert('Write Permission err: ', err);
        console.warn(err);
      }
    }
  
    if (Platform.OS === 'android'){
      externalStoragePermission();
    }else{console.log('not android')
  
    }
  }






    return (
      <Container>
  
        <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'rgba(56, 172, 236, 1)'}}>
          <Left style={{flex:1}}>      
                 <Button transparent onPress={()=> this.props.navigation.goBack()}>
                    <Icon style={{color:'white'}} name='arrow-back' />
                 </Button> 
          </Left>
          <Body style={{flex: 3}}>
            <Title style={{color:'white'}}>Rider Deliveries</Title>
          </Body>
          <Right style={{flex:1}}>
            
           <Button transparent  onPress={()=> this.setState({dateRangeModal: true})}>
                    <Icon style={{color:'white'}} name='md-calendar-sharp' />
                 </Button> 
           <Button transparent  onPress={()=> this.setState({UpdateWallet: true})}>
                    <Icon style={{color:'white'}} name='wallet' />
                 </Button> 
             <Button transparent onPress={requestRunTimePermission}>
            <MaterialCommunityIcons name="microsoft-excel" size={28} color={'white'} />
            </Button>
          </Right>
        </Header>

        <Modal
      isVisible={this.state.dateRangeModal}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({dateRangeModal: false})} transparent={true}>
     <Card style={style.content}>
       
        <List>
        
            
                    <Text style={{marginTop: 15, fontSize: 10}}>Start Date/Time</Text>
                    <Item regular style={{marginTop: 7, padding: 10}}>
                       <TouchableOpacity onPress={this.showDatePicker} style={{width: '100%'}}>
<Text>{this.state.startDate===""?'Start Date/Time':moment(this.state.startDate).format('MMM D, YYYY h:mm a')}</Text>
</TouchableOpacity>

                    </Item>
                        <Text style={{marginTop: 15, fontSize: 10}}>End Date/Time</Text>
                    <Item regular style={{marginTop: 7, padding: 10}}>
                   
<TouchableOpacity onPress={this.showDatePickerEnd} style={{width: '100%'}}>
<Text>{this.state.endDate ===""?'End Date/Time':moment(this.state.endDate).format('MMM D, YYYY h:mm a')}</Text>
</TouchableOpacity>
                    </Item>
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.GetData()}
      >
       <Text style={{color:'white'}}>Get Data</Text>
      </Button>
    </Card>
    </Modal>
<DateTimePickerModal
        isVisible={this.state.isDatePickerVisible}
        mode="datetime"
        onConfirm={this.handleConfirm}
        onCancel={this.hideDatePicker}
      />
      <DateTimePickerModal
        isVisible={this.state.isDatePickerVisibleEnd}
        mode="datetime"
        onConfirm={this.handleConfirmEnd}
        onCancel={this.hideDatePickerEnd}
      />
        <ScrollView style={{ backgroundColor: "white", }}>
                

            
        <View>
        <Card transparent> 
            <CardItem style={{backgroundColor:'lightblue'}}>
              <Left>
                <Text >Order #</Text>
              </Left>
              <Body>
                <Text> Status</Text>
              </Body>
              <Body>
                <Text> Date</Text>
              </Body>
              <Body>
                <Text>Delivery Charge</Text>
              </Body>
              <Body>
                <Text>Extra Charge</Text>
              </Body>
              <Right>
                <Text>Total</Text>
              </Right>
            </CardItem>
        </Card>
        <FlatList
               data={this.state.dataSource}
               renderItem={({ item }) => (            
            <Card transparent>
              <CardItem style={{paddingTop: 0, paddingBottom: 0}}>
                <Left style={{flex:1}}>
                <Text style={{fontSize: 12,  marginBottom: 10}}>
                    #00{item.datas.OrderNo}
                  </Text>
                </Left>
                <Body style={{paddingLeft: 5,flex:1,}}>
                  
                  <Text note style={{fontSize: 12, }}>{item.datas.OrderStatus}</Text>
   
                </Body>
                <Body style={{paddingLeft: 5, flex: 1}}>
                  
                  <Text note style={{fontSize: 12,}}>{moment(item.datas.OrderDetails.Date).format('MM/D/YY')}</Text>
   
                </Body>
<Body>
                  <Text style={{fontSize: 12, marginBottom: 10}}>₱{Math.round(item.datas.delivery_charge)}</Text>
                </Body>
                <Body>
                    <Text style={{fontSize: 12, marginBottom: 10}}>₱{Math.round(item.datas.extraKmCharge)}</Text>
                </Body>
                
                <Right style={{textAlign: 'right'}}>
                  <Text style={{fontSize: 12, marginBottom: 10}}>₱{Math.round((this.storeTotal(item.datas.Products) + item.datas.delivery_charge + item.datas.extraKmCharge- item.datas.discount)*10)/10}</Text>
                </Right>
                </CardItem>
            </Card>
           )}
           keyExtractor={item => item.key}
       />
        
          <View style={{borderTopColor: 'black', borderTopWidth: 2,borderStyle: 'dashed',  borderRadius: 1}}/>
          <CardItem>
            <Left>
              <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 12}}>Total</Text>
            </Left>
            <Right>
              <Text style={{ color:'black', fontWeight: 'bold', fontSize: 12}}>
              ₱{Math.round(this.TotalAmount()*10)/10}
              </Text>
            </Right>
          </CardItem>
     </View>  
     <View style={{borderTopColor: 'black', borderTopWidth: 2,borderStyle: 'dashed',  borderRadius: 1}}/>
     <View>
          <CardItem>
            <Left>

            </Left>
  
            <Right>
             
            </Right>
          </CardItem>
          <CardItem>
            <Left>
              <Text style={{ color: 'gray'}}>No. of Orders:  {this.state.dataSource.length}</Text>
            </Left>
        
          </CardItem>
          
     </View>  
    
        </ScrollView>
        <Modal
      isVisible={this.state.UpdateWallet}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({UpdateWallet: false})} transparent={true}>
     <Card style={style.content}>
        <List>
        
            
                    <Text style={{marginTop: 15, fontSize: 10}}>Wallet Add Amount</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={this.state.Addwallet.toString()}  keyboardType={'number-pad'} onChangeText={(text) => { isNaN(text)? null:this.updateTextInput(text, 'Addwallet')}} placeholderTextColor="#687373" />
                    </Item>
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.EditWallet()}
      >
       <Text style={{color:'white'}}>Add Wallet</Text>
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
                <Text>Turn On Switch</Text>
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
                    <Button block disabled={this.state.loading || !this.state.open} onPress={()=>
                        this._scan()
                    }><Text>Scan</Text></Button>
            </View>
                </View>
                <Text  style={styles.title}>Connected:<Text style={{color:"blue"}}>{!this.state.name ? 'No Devices' : this.state.name}</Text></Text>
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
                <Button block  color="tomato" disabled={this.state.loading|| !(this.state.bleOpend && this.state.boundAddress.length > 0) }
                        title="Print Receipt" onPress={async () => {
                    try {
                        await BluetoothEscposPrinter.printerInit();
                        await BluetoothEscposPrinter.printerLeftSpace(0);

                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
                        await BluetoothEscposPrinter.setBlob(0);
                        await  BluetoothEscposPrinter.printText(`Daily Report (Rider)\r\n`, {
                            encoding: 'GBK',
                            codepage: 0,
                            widthtimes: 1,
                            heigthtimes: 0,
                            fonttype: 2
                        });
                        
                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                        await  BluetoothEscposPrinter.printText("Date / Time " + (dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")) + "\r\n", {});
                        await  BluetoothEscposPrinter.printText(`Rider:  ${this.state.names}\r\n`, {});
               
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        let columnWidths = [7, 12, 15, 7];
                        let columnWidths2 =[34, 0,0, 7 ];
                
                        await BluetoothEscposPrinter.printColumn(columnWidths,
                            [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                            ["Order #", 'Status', 'Date', 'Total'], {encoding: 'GBK',
                            codepage: 0,
                            widthtimes: 0,
                            heigthtimes: 0,
                            fonttype: 1});
                       await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                         await this.state.dataSource.map((item, i) => {
                               let num = this.storeTotal(item.datas.Products);
                               let num2 = item.datas.delivery_charge;
                               let num3 = item.datas.extraKmCharge;
                               let numm = item.datas.discount;
                               let num4 = Math.round((num + num2 + num3 - numm)*10)/10;
                              
                               let total = num4.toString();
                                
                                  BluetoothEscposPrinter.printColumn(columnWidths,
                                                        [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                        [`#00${item.datas.OrderNo}`, `${item.datas.OrderStatus}`,`${item.datas.OrderDetails.Date}` ,total ],{encoding: 'GBK',
                                                        codepage: 0,
                                                        widthtimes: 0,
                                                        heigthtimes: 0,
                                                        fonttype: 1})
                                                        
                          
                          });
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths,
                          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                          ["Total", "", "",`${Math.round(this.TotalAmount()*10)/10}`], {encoding: 'GBK',
                          codepage: 0,
                          widthtimes: 0,
                          heigthtimes: 0,
                          fonttype: 2})
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                                                    [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                                                    ["Summary", "", "",""], {encoding: 'GBK',
                                                    codepage: 0,
                                                    widthtimes: 0,
                                                    heigthtimes: 0,
                                                    fonttype: 2})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                          ["Total No. of Orders Delivered", "", "", `${this.state.dataSource.length}`], {encoding: 'GBK',
                          codepage: 0,
                          widthtimes: 0,
                          heigthtimes: 0,
                          fonttype: 1})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printColumn(columnWidths2,
                          [BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.LEFT, BluetoothEscposPrinter.ALIGN.CENTER, BluetoothEscposPrinter.ALIGN.RIGHT],
                          ["Total Amount Delivered", "", "",`${Math.round(this.TotalAmount()*10)/10}`], {encoding: 'GBK',
                          codepage: 0,
                          widthtimes: 0,
                          heigthtimes: 0,
                          fonttype: 1})
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await  BluetoothEscposPrinter.printText("--------------------------------\r\n", {});
                        await  BluetoothEscposPrinter.printText("\r\n", {});
                        await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
                    } catch (e) {
                        alert(e.message || "ERROR");
                    }

                }}><Text>Print</Text></Button>
                 
                </View>
                <View style={{ paddingHorizontal: 30}}>
                <Button block  color="tomato" 
                         onPress={()=> this.setState({printModal: false})}><Text>Close</Text></Button>
                </View>
                </ScrollView>
            </Modal>
      </Container>
    );
}
}

export default riderDetails;

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