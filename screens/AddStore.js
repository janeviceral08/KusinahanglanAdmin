import React,{Component} from 'react';
import { 
    Text, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    ScrollView
} from 'react-native';
import { Container, View, Left, Right, Button, Icon, Item, Input, DatePicker, Picker } from 'native-base';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from '../component/CustomHeader';
import Loader from '../component/Loader';
import MapView, {  Polyline,  PROVIDER_GOOGLE,  } from 'react-native-maps';


export default class AddStore extends Component {
        constructor(props) {
            super(props);
            this.cityRef = firestore().collection('city');
            this.barangayRef = firestore();
             this.storeRef = firestore().collection('categories');
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
              section:'Select Category',
              wallet: 0,
              store_commision: 0,
              percentage:0,
              cluster:'',
              x: {latitude: 14.599512,
      longitude: 	120.984222,},
      AdminWallet:0,
      dataSource: [],
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
          this.unsubscribe = this.storeRef.onSnapshot(this.onCollectionUpdateGetCategories);
        }

        onCollectionUpdateGetCategories = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
        console.log('list: ', doc.data())
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
 this.setState({
      dataSource : stores.sort((a, b) => a.datas.name - b.datas.name),
   });

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
          console.log('x: ', this.state.x)
          this.setState({ loading: true});
          if(this.state.wallet  > this.state.AdminWallet ){
            this.setState({hasError: true, errorText: 'Insufficient Wallet Balance. You only have '+parseFloat(this.state.AdminWallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,') +' in your account',loading: false});
            return;
          } 
          if(this.state.x.latitude=== 8.951549||this.state.x.longitude=== 125.527725) {
            this.setState({hasError: true, errorText: 'Pin Store Location',loading: false});
            return;
          } 
          if(this.state.email===""||this.state.name===""||this.state.section==="Select Category"||this.state.email===""||this.state.wallet===""||this.state.percentage===""||this.state.address==""||this.state.selectedCity=="Select City/Municipality"||this.state.province=="") {
            this.setState({hasError: true, errorText: 'Please fill all fields !',loading: false});
            return;
          }
          if(!this.verifyEmail(this.state.email)) {
            this.setState({hasError: true, errorText: 'Please enter a valid email address !',loading: false});
            return;
          }        
         this.setState({hasError: false});
          const { email, password } = this.state
             auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
              this.saveUserdata();
          })
      
        }
      
        saveUserdata() {
          this.setState({loading: true})
         const newDocumentID = firestore().collection('stores').doc().id;
          const userId = auth().currentUser.uid;
    
          this.ref.collection('stores').doc(userId).set({
            slatitude:this.state.x.latitude,
            slongitude:this.state.x.longitude,
            name: this.state.name,
            email: this.state.email,
            id: userId,
            status: true,
            address: this.state.address,
            city: this.state.selectedCity,
            province: this.state.province,
            cluster: this.state.email,
            foreground: '',
            arrange: '',
            admin_control: false,
            keywords:[
                this.state.name
            ],
            notification_token:'',
            labor_charge: parseFloat(this.state.percentage)/100,
            section: this.state.section,
            subcategory: [
                {
                    key:"None",
                    title: "All"
                }
            ],
            wallet: parseFloat(this.state.wallet),
            AlwaysOpen:false,
            withAddons: true,
            startDate: null,
            endDate:null,

          }).then((docRef) => {
            firestore().collection('charges').doc('delivery_charge').update({
        AdminWallet: firestore.FieldValue.increment(-parseFloat(this.state.wallet)),
        
    }).then((docRef) => {   
      firestore().collection('LoadHistory').add({PrevWallet:0, Amount: parseFloat(this.state.wallet), RiderId: userId, account: 'Store', DateLoaded: moment().unix(), riderName:this.state.name, riderEmail: this.state.email })
        this.setState({
            loading: false,
          });
  
                this.props.navigation.goBack()
    })
          })
        }
      
        verifyEmail(email) {
          var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return reg.test(email);
        }
        updateTextInput = (text, field) => {
          const state = this.state
          state[field] = text;
          this.setState(state);
        }
          
      
    render() {
      console.log('AdminWallet: ', this.state.AdminWallet)
      return (
        <Container style={{flex: 1,backgroundColor: '#fdfdfd'}}>
          <Loader loading={this.state.loading} />
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="always">
            <CustomHeader title="Add Store" navigation={this.props.navigation}/>
        

          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 50, paddingRight: 50, marginTop: 20,}}>
             <Item>
                 <MapView
                 
             style={{ height: 300, width: 300}}
    initialRegion={{
      latitude: 14.599512,
      longitude: 	120.984222,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }}
     >
      <MapView.Marker
      draggable
      key={'index'}
      coordinate={this.state.x}
       onDragEnd={(e) => this.setState({ x: e.nativeEvent.coordinate })}
      title={'Store Location'}
      description={'Long press to move the marker'}
    />
    </MapView>
 
            </Item>
            <Item>
                <Icon active name='ios-mail' style={{color: '#687373'}} />
                <Input placeholder='Email'
                 onChangeText={(text) => this.setState({email: text})} keyboardType="email-address" placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='md-lock-closed' style={{color: '#687373'}} />
                <Input placeholder='Password' value={this.state.password}
                 onChangeText={(text) => this.setState({password: text})} keyboardType="email-address" placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='ios-man' style={{color: '#687373'}} />
                <Input placeholder='Name' onChangeText={(text) => this.setState({name: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='md-pin' style={{color: '#687373'}} />
                <Input placeholder='Province' onChangeText={(text) => this.setState({province: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
            <Icon active name='md-pin' style={{color: '#687373'}} />
                            <Input placeholder='City/Municipality' onChangeText={(text) => this.fetchBarangay(text)   } placeholderTextColor="#687373" />
              
            </Item>
   
            <Item>
                <Icon active name='md-pin' style={{color: '#687373'}} />
                <Input placeholder='Detailed Address' onChangeText={(text) => this.setState({address: text})} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='grid' style={{color: '#687373'}} />
                   <Picker
                         selectedValue={this.state.section}
                         onValueChange={(itemValue, itemIndex) => 
                               this.updateTextInput(itemValue, 'section')                        
                             }>     
                            <Picker.Item label = {this.state.section}  value={this.state.section}  />
                              {this.state.dataSource.map((user, index) => (
     <Picker.Item label={user.datas.title} value={user.datas.title} key={index}/>
  ))        }
                    </Picker>
            </Item>
            <Item>
                <Icon active name='trending-up' style={{color: '#687373'}} />
                <TextInput style={{flex: 1}} placeholder='Store Commision (%)' keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.setState({percentage: text})}} placeholderTextColor="#687373" />
            </Item>
            <Item>
                <Icon active name='wallet' style={{color: '#687373'}} />
                <TextInput style={{flex: 1}} placeholder='Wallet' keyboardType={'number-pad'} onChangeText={(text) => {isNaN(text)? null:this.setState({wallet: text})}} placeholderTextColor="#687373" />
            </Item>
         
      
            {this.state.hasError?<Text style={{color: "#c0392b", textAlign: 'center', marginTop: 10}}>{this.state.errorText}</Text>:null}
            <View style={{alignItems: 'center'}}>
              <Button onPress={() => this.signup()} style={{backgroundColor: 'red', marginVertical: 20,width: '100%',
                                                                                      height: 50,
                                                                                      justifyContent: 'center',
                                                                                      alignItems: 'center',
                                                                                      borderRadius: 10, borderWidth: 1, borderColor: 'red'}}>
                <LinearGradient
                    colors={['tomato', 'red']}
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
