
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
  ActivityIndicator,Image,
  FlatList} from 'react-native';
  import {Card, CardItem, Thumbnail, Body, Left, Header, Right, Title,Input, Item, Button, Icon, Picker, Toast, Container, Root} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../component/Loader';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

class AddCategories extends Component {
  _listeners = [];
  constructor(props) {
    super(props);
    this.ref = firestore();
    this.unsubscribe = null;
    this.state = {
      error: "",
      loading: false,
      dataSource: [],
      uid:'',
      category: '',
      prodName:'',
      brand:'',
      description:'',
      regularPrice:'',
      salePrice:'',
      unit:'',
      stock:'',
      admin_control:'',
      city:'',
      cluster:'',
      createdAt:'',
      labor_charge:'',
      section:'',
      status:'',
      storeId:'',
      store_name:'',
      image: null,
      del_charge : '',
          driverCharge: '',
          extra_charge: '',
          labor_charge: '',
          pickup_charge: '',
          succeding: '',
          amount_base: '',
          base_dist: '',
    };
     }
         

  _bootstrapAsync = async() =>{
   
    const getData= this.ref.collection('charges').doc('delivery_charge');
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
          amount_base: doc.data().amount_base,
          base_dist: doc.data().base_dist,
         loading: false,
       })}
    };

  


   async componentDidMount() {
     this._bootstrapAsync();
  }
  
  updateTextInput = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
  }
 
  render() {
    return (
        <Container style={{backgroundColor: '#fdfdfd'}}>
        <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'salmon'}}>
               <Left> 
                 <Button transparent onPress={()=> this.props.navigation.goBack()}>
                 <MaterialIcons name="arrow-back" size={25} color="white" />
                </Button> 
               </Left>
               <Body style={{justifyContent: "center", alignContent: "center"}}>
                   <Title style={{color: 'white'}}>Delivery Charge</Title>
               </Body>
             
               </Header>
             <Loader loading={this.state.loading}/>
         <ScrollView style={{paddingHorizontal: 10}}>
         <View>

         <Text style={{marginTop: 15, fontSize: 10}}>Base Distance (Km)</Text>
         <Item regular style={{marginTop: 7}}>
             <Input   value={this.state.succeding.toString()} keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.updateTextInput(text, 'succeding')}} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Amount of Base Distance</Text>
         <Item regular style={{marginTop: 7}}>
             <Input keyboardType={'number-pad'} value={this.state.amount_base.toString()} onChangeText={(text) => {isNaN(text)? null:this.updateTextInput(text, 'amount_base')}} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Succeeding Km Fee</Text>
         <Item regular style={{marginTop: 7}}>
             <Input value={this.state.base_dist.toString()} keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.updateTextInput(text, 'base_dist')}} placeholderTextColor="#687373" />
         </Item>
                        
     
         <Text style={{marginTop: 15, fontSize: 10}}>Delivery Charge</Text>
         <Item regular style={{marginTop: 7}}>
             <Input  value={this.state.driverCharge.toString()} keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.updateTextInput(text, 'driverCharge')}} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Extra Charge</Text>
         <Item regular style={{marginTop: 7}}>
             <Input value={this.state.extra_charge.toString()}  keyboardType={'number-pad'} onChangeText={(text) => { isNaN(text)? null:this.updateTextInput(text, 'extra_charge')}} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Labor Charge</Text>
         <Item regular style={{marginTop: 7}}>
             <Input value={this.state.labor_charge.toString()} onChangeText={(text) => this.updateTextInput(text, 'labor_charge')} placeholderTextColor="#687373" />
         </Item>
         <Text style={{marginTop: 15, fontSize: 10}}>Pick-up Charge</Text>
         <Item regular style={{marginTop: 7}}>
             <Input value={this.state.pickup_charge.toString()}  keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null: this.updateTextInput(text, 'pickup_charge')}} placeholderTextColor="#687373" />
         </Item>
       </View>

       <View style={{marginTop: 10, marginBottom: 10, paddingBottom: 7}}>
              <Button onPress={() => this.addProduct()} style={{backgroundColor: "tomato"}} block iconLeft>
                <Text style={{color: '#fdfdfd'}}>Update Charge</Text>
              </Button>
            </View>
         </ScrollView>
        
       </Container>
    );
  }
  async addProduct() {

    console.log('addProduct')
    const uidStore= await AsyncStorage.getItem('storetoken');
    const newDocumentID =  firestore().collection('products').doc().id;
    console.log("updateRef: ", newDocumentID)
this.setState({ loading: true});
 
const dataValue = {
 
   del_charge : parseFloat(this.state.del_charge),
          driverCharge: parseFloat(this.state.driverCharge),
          extra_charge: parseFloat(this.state.extra_charge),
          labor_charge: parseFloat(this.state.labor_charge),
          pickup_charge: parseFloat(this.state.pickup_charge),
          succeding: parseFloat(this.state.succeding),
          amount_base: parseFloat(this.state.amount_base),
          base_dist: parseFloat(this.state.base_dist),
          status: 'process'
    
 }
 console.log("dataValue: ", dataValue)
 firestore().collection('charges').doc('delivery_charge').set(dataValue).then((docRef) => {   
      this.setState({
          loading: false,
        });
  this._bootstrapAsync();
           
  })


}

}
export default AddCategories;