import React,{Component} from 'react';
import { 
    Text, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    ScrollView,Image
} from 'react-native';
import { Container, View, Left, Right, Button, Icon, Item, Input, DatePicker, Picker } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../component/CustomHeader';
import Loader from '../component/Loader';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {imgDefault} from './images';
import * as ImagePicker from "react-native-image-picker"
import moment from 'moment';

export default class AddRider extends Component {
        constructor(props) {
            super(props);
            this.cityRef = firestore().collection('city');
            this.barangayRef = firestore();
            this.ref = firestore();
            this.subscribe= null;
            this.state = {
              email: '',
              name: '',
              username: '',
              password: '',
              rePassword: '',
              mobile:'',
              hasError: false,
              errorText: '',
              loading: false,
              barangay: [],
              address:'',
              city:'',
              province:'',
              PickerValueHolder: 'Select Barangay',
              barangayList: [],
              cityList:[],
              userTypes: [{userType: 'admin', userName: 'Admin User'}, {userType: 'employee', userName: 'Employee User'}, {userType: 'dev', userName: 'Developer User'}],
              selectedCity: 'Select City/Municipality',
              selectedBarangay: 'Select Barangay',
              AdminWallet:0,
                wallet: 0,
                image: null,
                FBAccount:'',
                MotorCR:'',
                MotorOR:'',
                MBrand:'',
                ColorMotor:'',
                PlateNo:'',
                Exp:'',
                License:'',
            };
        }

      
  onCityUpdate = (querySnapshot) => {
    const city = [];
   querySnapshot.forEach((doc) => {
    city.push ({
           datas : doc.data(),
           key : doc.id
           });        
   });
   this.setState({
     cityList: city,
  });
  
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
    this.setState({image:image.assets[0].base64})
                 })
   }
  onBarangayUpdate = (querySnapshot) => {
    const barangay = [];
   querySnapshot.forEach((doc) => {
    barangay.push ({
           datas : doc.data(),
           key : doc.id
           });        
   });
   this.setState({
     barangayList: barangay,
  });
  
  }

  fetchBarangay =(city)=>{
    this.setState({ selectedCity: city })
    this.subscribe = this.barangayRef.collection('barangay').where('city', '==', city).onSnapshot(this.onBarangayUpdate)
  }
      
        componentDidMount(){
          this._bootstrapAsync();
          this.tosubscribe = this.cityRef.onSnapshot(this.onCityUpdate);
        }
_bootstrapAsync =async () =>{
    this.unsubscribe = this.ref.collection('charges').where('id', '==', 'admin000001' ).onSnapshot(this.onCollectionUpdate);
    };


  onCollectionUpdate = (querySnapshot) => {
    querySnapshot.forEach((doc) => {

      this.setState({
          AdminWallet:doc.data().AdminWallet,

     });
    });
  }
        signup() {
          this.setState({ loading: true});
            if(this.state.wallet  > this.state.AdminWallet ){
            this.setState({hasError: true, errorText: 'Insufficient Wallet Balance. You only have '+parseFloat(this.state.AdminWallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +' in your account',loading: false});
            return;
          } 
          if(this.state.wallet===""||this.state.email===""||this.state.name===""||this.state.email===""||this.state.password===""||this.state.rePassword===""||this.state.province=="") {
            this.setState({hasError: true, errorText: 'Please fill all fields !',loading: false});
            return;
          }
          if(!this.verifyEmail(this.state.email)) {
            this.setState({hasError: true, errorText: 'Please enter a valid email address !',loading: false});
            return;
          }
          
          if(this.state.mobile.length < 11|| this.state.mobile.length > 11) {
            this.setState({hasError: true, errorText: 'Mobile number must contains at least 11 characters !',loading: false});
            return;
          }
          if(this.state.password.length < 6) {
            this.setState({hasError: true, errorText: 'Passwords must contains at least 6 characters !',loading: false});
            return;
          }
          if(this.state.password !== this.state.rePassword) {
            this.setState({hasError: true, errorText: 'Passwords does not match !',loading: false});
            return;
          }
          this.setState({hasError: false});
            auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
              this.saveUserdata();
          })
      
        }
      
        saveUserdata() {
          this.setState({loading: true})
         const newDocumentID = firestore().collection('riders').doc().id;
          const userId = auth().currentUser.uid;
  let base64Img = `data:image/jpg;base64,${this.state.image}`;
    let data = {
      "file": base64Img,
      "upload_preset": "bgzuxcoc",
    }
   let CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/kusinahanglan/upload';
if(this.state.image == null){
   this.ref.collection('riders').doc(userId).set({
            Name: this.state.name,
            Username: this.state.username,
            Mobile: this.state.mobile,
            Email: this.state.email,
            Password: this.state.password,
            Lat:'',
            Long:'',
            userId: userId,
            token:'',
            image: '',
            wallet: parseFloat(this.state.wallet),
            status:false,
            FBAccount: this.state.FBAccount,
            MotorCR: this.state.MotorCR,
            MotorOR: this.state.MotorOR,
            MBrand: this.state.MBrand,
            ColorMotor: this.state.ColorMotor,
            PlateNo: this.state.PlateNo,
            Exp: this.state.Exp,
            License: this.state.License,
            Address: this.state.province,
          }).then((docRef) => {
                     firestore().collection('charges').doc('delivery_charge').update({
        AdminWallet: firestore.FieldValue.increment(-parseFloat(this.state.wallet)),
        
    }).then((docRef) => {   
        this.setState({
            loading: false,
          });
   firestore().collection('LoadHistory').add({PrevWallet:0, Amount: parseFloat(this.state.wallet), RiderId: userId, account: 'Rider', DateLoaded: moment().unix(), riderName:this.state.name, riderEmail: this.state.email })
                this.props.navigation.goBack()
    }).catch((error)=> console.log('error in if: ', error))
          })

}
else{
fetch(CLOUDINARY_URL, {
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    },
    method: 'POST',
  }).then(async r => {
    let data = await r.json()
                console.log('url: ', 'https'+data.url.slice(4))
          this.ref.collection('riders').doc(userId).set({
            image: 'https'+data.url.slice(4),
            Name: this.state.name,
            Username: this.state.username,
            Mobile: this.state.mobile,
            Email: this.state.email,
            Password: this.state.password,
            Lat:'',
            Long:'',
            userId: userId,
            token:'',
            wallet: parseFloat(this.state.wallet),
            status:false,
            FBAccount: this.state.FBAccount,
            MotorCR: this.state.MotorCR,
            MotorOR: this.state.MotorOR,
            MBrand: this.state.MBrand,
            ColorMotor: this.state.ColorMotor,
            PlateNo: this.state.PlateNo,
            Exp: this.state.Exp,
            License: this.state.License,
           Address: this.state.province,
          }).then((docRef) => {
                     firestore().collection('charges').doc('delivery_charge').update({
        AdminWallet: firestore.FieldValue.increment(-parseFloat(this.state.wallet)),
        
    }).then((docRef) => {   
        this.setState({
            loading: false,
          });
  firestore().collection('LoadHistory').add({PrevWallet:0, Amount: parseFloat(this.state.wallet), RiderId: userId, account: 'Rider', DateLoaded: moment().unix(), riderName:this.state.name, riderEmail: this.state.email })
                this.props.navigation.goBack()
    })
          }).catch((error)=> console.log('error in else: ', error))
           }).catch((error)=> console.log('error in upload: ', error))
  }
        }
      
        verifyEmail(email) {
          var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return reg.test(email);
        }
      
      
    render() {
      return (
        <Container style={{flex: 1,backgroundColor: '#fdfdfd'}}>
          <Loader loading={this.state.loading} />
                 <CustomHeader title="Add Rider" navigation={this.props.navigation}/>
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="always">
       
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 50, paddingRight: 50, marginTop: 20}}>
             <Item>
               <TouchableOpacity onPress={this.openGallery} style={{justifyContent:"center",alignContent:"center"}}>
              <Image style={{  width: 160, height: 160, resizeMode: 'contain',margin: 10}} source={this.state.image === null ? imgDefault:{uri: `data:image;base64,${this.state.image}`}} />
            </TouchableOpacity>
            <Item style={{width: '50%'}}>
                <Icon active name='wallet' style={{color: '#687373'}} />
                <TextInput style={{flex: 1}} placeholder='Wallet' keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.setState({wallet: text})}} placeholderTextColor="#687373" />
            </Item>
            </Item>
            <Item>
                <MaterialIcons name='sports-motorsports' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Name' onChangeText={(text) => this.setState({name: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <MaterialCommunityIcons name='email' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Email' onChangeText={(text) => this.setState({email: text})} keyboardType="email-address" placeholderTextColor="#687373" />
            </Item>
            
            <Item>
                <FontAwesome name='mobile-phone' style={{color: '#687373'}}  size={25}/>
                <Input placeholder='Mobile Number' onChangeText={(text) => this.setState({mobile: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                <Ionicons name='ios-logo-facebook' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Facebook Account' onChangeText={(text) => this.setState({FBAccount: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Entypo name='location' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Home Address' style={{ height: 100 }}  multiline={true} onChangeText={(text) => this.setState({province: text})} placeholderTextColor="#687373" />
            </Item>
              
            <Item>
                <Icon active name='ios-lock-closed' style={{color: '#687373'}} />
                <Input placeholder='Password' onChangeText={(text) => this.setState({password: text})} secureTextEntry={true} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='ios-lock-closed' style={{color: '#687373'}} />
                <Input placeholder='Repeat your password' onChangeText={(text) => this.setState({rePassword: text})} secureTextEntry={true} placeholderTextColor="#687373" />
            </Item>

 <Item>
                <FontAwesome name='drivers-license' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='License Number' onChangeText={(text) => this.setState({License: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                <Fontisto name='date' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='License Expiration Date' onChangeText={(text) => this.setState({Exp: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                <FontAwesome active name='motorcycle' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Plate Number' onChangeText={(text) => this.setState({PlateNo: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                <FontAwesome active name='motorcycle' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Color of Motorcycle' onChangeText={(text) => this.setState({ColorMotor: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                <FontAwesome active name='motorcycle' style={{color: '#687373'}} size={20} />
                <Input placeholder='Brand of Motorcycle' onChangeText={(text) => this.setState({MBrand: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                  <FontAwesome active name='file-text' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Official Receipt' onChangeText={(text) => this.setState({MotorOR: text})} placeholderTextColor="#687373" />
            </Item>
             <Item>
                  <FontAwesome active name='file-text' style={{color: '#687373'}}  size={20}/>
                <Input placeholder='Certificate of Registration' onChangeText={(text) => this.setState({MotorCR: text})} placeholderTextColor="#687373" />
            </Item>
           

            {this.state.hasError?<Text style={{color: "#c0392b", textAlign: 'center', marginTop: 10}}>{this.state.errorText}</Text>:null}
            <View style={{alignItems: 'center'}}>
              <Button onPress={() => this.signup()} style={{backgroundColor: 'tomato', marginVertical: 20,width: '100%',
                                                                                      height: 50,
                                                                                      justifyContent: 'center',
                                                                                      alignItems: 'center',
                                                                                      borderRadius: 10, borderWidth: 1, borderColor: 'tomato'}}>
                <LinearGradient
                    colors={['salmon', 'tomato']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Save</Text>
                </LinearGradient>
              </Button>
            </View>
          </View>
        </ScrollView>
      </Container>
    );
            }
};


const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: '#009387'
    },
    header: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        flex: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30
    },
    text_header: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    button: {
        alignItems: 'center',
        marginTop: 50
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    textPrivate: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20
    },
    color_textPrivate: {
        color: 'grey'
    }
  });
