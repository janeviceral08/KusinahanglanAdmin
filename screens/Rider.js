import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity, TextInput,ScrollView,View,Image, Alert} from 'react-native';
import { Container, Header, Icon, Accordion, Text, Card, CardItem, Thumbnail, Body, Left, Right, Button, List, ListItem,Item, Input } from "native-base";

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Octicons from 'react-native-vector-icons/Octicons'

import Modal from 'react-native-modal';
import CustomHeader from "../component/CustomHeader";
import Loader from "../component/Loader";
import {imgDefault} from './images';
import * as ImagePicker from "react-native-image-picker"

export default class Rider extends Component {
  constructor(props) {
    super(props);
    this.ref = firestore().collection('riders');
    this.unsubscribe = null;
    this.state = {
      text: '',
      data:[],
      visibleModal: false,
      Status: '',
      loading: false,
      RiderDeatails: {},
      DetailsModal: false,
      ColorMotor:'',
      Province:'',
      Email:'',
      Exp:'',
      FBAccount:'',
      License:'',
      MBrand:'',
      Mobile:'',
      MotorCR:'',
      MotorOR:'',
      Name:'',
      PlateNo:'',
      image:null,
      newImage:null,
      userId: '',
    };
    this.arrayholder = [];
  }
    
  onCollectionUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
    this.arrayholder = stores;
    this.setState({
      data : stores,
      loading: false
   });
  
  }
  componentDidMount(){
    this.setState({loading: true})
     this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
 
  }

  updateStatus(id){
    let prodref = firestore().collection('users').doc(id);
    prodref.update({
      status:  "Verified",

    });
    this.setState({visibleModal: false})
  }

  GetFlatListItem(name) {
    Alert.alert(name);
  }
 
  searchData(text) {
    const newData = this.arrayholder.filter(item => {    

      const itemData = `${item.datas.Name.toUpperCase()}   
       ${item.key.toUpperCase()}`;
      
       const textData = text.toUpperCase();
        
       return itemData.indexOf(textData) > -1;
    });
 
    this.setState({
      data: newData,
      text: text
      })
    }

    toggleMOdal(item, key){
      this.setState({
        Name: item.Name,
        Mobile: item.Mobile,
        Email: item.Email,
        Gender: item.Gender,
        Address: `${item.Address.Address}, ${item.Address.Barangay}, ${item.Address.City}, ${item.Address.Province}, ${item.Address.Country}`,
        Status: item.status,
        visibleModal: true,
        id: key
      })
    }

  _renderHeader(item, expanded) {
    return (
      <List>
      <ListItem avatar onPress={()=> this.props.navigation.navigate('Details',{'id': item.key,'name': item.datas.Name,'email': item.datas.Email,'wallet': item.datas.wallet})}>
        <Left>
          <Thumbnail source={require('../assets/user.png')} />
        </Left>
        <Body>
          <Text>{item.datas.Name}</Text>
           <Text note style={{fontSize: 12}}>Wallet: {item.datas.wallet}</Text>
        </Body>

  <TouchableOpacity  
                    onPress={()=> this.setState({DetailsModal: true, ColorMotor:item.datas.ColorMotor,
Province:item.datas.Address,
Email:item.datas.Email,
Exp:item.datas.Exp,
FBAccount:item.datas.FBAccount,
License:item.datas.License,
MBrand:item.datas.MBrand,
Mobile:item.datas.Mobile,
MotorCR:item.datas.MotorCR,
MotorOR:item.datas.MotorOR,
Name:item.datas.Name,
PlateNo:item.datas.PlateNo,
image:item.datas.image, 
userId:item.datas.userId, 
})}
                    style={{width: 30, height: 30, backgroundColor: 'lightgray',borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 20}}>
                    {!item.datas.status ? 
                    <Icon  name="ios-eye"  style={{ color: "tomato", textAlign: 'center', fontWeight: 'bold' }}/> :
                    <Icon  name="ios-eye"  style={{ color: "rgba(56, 172, 236, 1)", textAlign: 'center', fontWeight:'bold' }}/>
                    }
                    
                </TouchableOpacity>

      </ListItem>
      
    </List>

    );
  }
  openGallery = () => {
    ImagePicker.launchImageLibrary({
        maxWidth: 500,
        maxHeight: 500,
        mediaType: 'photo',
        includeBase64: true,
    }, image => {
     
          console.log('base64: ', image);
        if(image.didCancel== true){
  console.log('base64: ', image);
  return;
        }
    this.setState({newImage:image.assets[0].base64})
                 })
   }

   updateTextInput = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
  }
  render() {
    const {   ColorMotor,
      Province,
      Email,
      Exp,
      FBAccount,
      License,
      MBrand,
      Mobile,
      MotorCR,
      MotorOR,
      Name,
      PlateNo,
      image,
      Status,
      userId,
      newImage,
      id 
    } = this.state;
    return (
      <Container>
        <Loader loading={this.state.loading} />
        <CustomHeader isHome={true} title="Riders" navigation={this.props.navigation}/>
        <TextInput 
         style={styles.textInput}
         onChangeText={(text) => this.searchData(text)}
         value={this.state.text}
         underlineColorAndroid='transparent'
         placeholder="Search Here" />
        <View>
        <FlatList
               data={this.state.data}
               renderItem={({ item }) => (
                 
                    this._renderHeader(item)
                
                  
               )}
               keyExtractor={item => item.key}
               style={{marginBottom: 100}}
           />
            <Modal
      isVisible={this.state.DetailsModal}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({DetailsModal: false})} transparent={true}>
     <Card style={style.content}>
        <List>
        <ScrollView>
            <TouchableOpacity onPress={this.openGallery} style={{justifyContent:"center",alignContent:"center"}}>
              <Image style={{  width: 160, height: 160, resizeMode: 'contain'}} source={this.state.image === null ? imgDefault:this.state.newImage === null && this.state.image !== null ? {uri: this.state.image }:{uri: `data:image;base64,${this.state.newImage}`}} />
            </TouchableOpacity>
                    <Text style={{marginTop: 15, fontSize: 10}}>Name</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={Name}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'Name')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Email</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={Email}  keyboardType={'default'} placeholderTextColor="#687373" />
                    </Item>
                       <Text style={{marginTop: 15, fontSize: 10}}>Mobile Number</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={Mobile}  keyboardType={'number-pad'} onChangeText={(text) => { isNaN(text)? null:this.updateTextInput(text, 'Mobile')}} placeholderTextColor="#687373" />
                    </Item>
                       <Text style={{marginTop: 15, fontSize: 10}}>Facebook Account</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={FBAccount}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'FBAccount')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Complete Address</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={Province} keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'Province')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>License Number</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={License} keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'License')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>License Expiration Date</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={Exp}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'Exp')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Plate Number</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={PlateNo} onChangeText={(text) => this.updateTextInput(text, 'PlateNo')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Motorcycle Color</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={ColorMotor} keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'ColorMotor')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Motorcycle Brand</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={MBrand}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'MBrand')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Official Receipt</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={MotorOR}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'MotorOR')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Certificate of Registration</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={MotorCR}  keyboardType={'default'} onChangeText={(text) =>this.updateTextInput(text, 'MotorCR')} placeholderTextColor="#687373" />
                    </Item>
                   
                        
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => {          Alert.alert(
        'Proceed to Update',
        'Are you sure to proceed?',
        [{text: 'Cancel', onPress: () => null},{text: 'OK', onPress: () => this.UpdateInfo()}]
    )}}
      >
       <Text style={{color:'white'}}>Update Info</Text>
      </Button>
                </ScrollView>
           </List>   

    </Card>
    </Modal>
        </View>
      </Container>
    );
  }
  UpdateInfo(){
const {ColorMotor,
      Province,
      Email,
      Exp,
      FBAccount,
      License,
      MBrand,
      Mobile,
      MotorCR,
      MotorOR,
      Name,
      PlateNo,
      image,
      Status,
      userId,
      newImage,} = this.state
this.setState({loading: true})
      if(newImage === null){
firestore().collection('riders').doc(userId).update({
  ColorMotor,
     Address: Province ,
      Email,
      Exp,
      FBAccount,
      License,
      MBrand,
        Mobile: Mobile.toString(),
      MotorCR,
      MotorOR,
      Name,
      PlateNo}).then((docRef) => {  
                  Alert.alert(
        'Updated Successfully',
        'Rider Information is Updated',
        [{text: 'OK', onPress: () =>  this.setState({DetailsModal: false, loading: false})}]
    )}).catch((err)=>      {Alert.alert(
        'Updated Failed',
        err,
        [{text: 'OK', onPress: () =>  this.setState({DetailsModal: false, loading: false})}]
        )})
    }
  else{
  let base64Img = `data:image/jpg;base64,${this.state.newImage}`;
    let data = {
      "file": base64Img,
      "upload_preset": "bgzuxcoc",
    }
   let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
fetch(CLOUDINARY_URL, {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
  }).then(async r => {
    let data = await r.json()
                console.log('url: ', 'https'+data.url.slice(4))

                firestore().collection('riders').doc(userId).update({
  ColorMotor,
      Address: Province ,
      Email,
      Exp,
      FBAccount,
      License,
      MBrand,
      Mobile: Mobile.toString(),
      MotorCR,
      MotorOR,
      Name,
      PlateNo,
      image:'https'+data.url.slice(4)}).then((docRef) => {  
                    Alert.alert(
        'Updated Successfully',
        'Rider Information is Updated',
        [{text: 'OK', onPress: () =>  this.setState({DetailsModal: false, loading: false})}]
    )
    }).catch((err)=>Alert.alert(
        'Updated Failed',
        err,
        [{text: 'OK', onPress: () =>  this.setState({DetailsModal: false, loading: false})}]
        ))
  }).catch((err)=>Alert.alert(
        'Upload Image Failed',
        err,
        [{text: 'OK', onPress: () =>  this.setState({DetailsModal: false, loading: false})}]
        ))
  }
  }
}

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
    height: '80%',
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

const styles = StyleSheet.create({

  row: {
    fontSize: 18,
    padding: 12
  },
 
  textInput: {
 marginTop: 5,
    textAlign: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#009688',
    borderRadius: 8,
    backgroundColor: "#FFFF"
 
  }
});