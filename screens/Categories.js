
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
  import {Card, CardItem, Thumbnail, Body, Left, Header, Right, Title,Input, Item, Button, Icon, Picker, Toast, Container, Root, List} from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Loader from '../component/Loader';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import Modal from 'react-native-modal';
import {imgDefault} from './images';
import * as ImagePicker from "react-native-image-picker"


class Categories extends Component {
  _listeners = [];
  constructor(props) {
    super(props);
    this.storeRef = firestore().collection('categories');
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
      category:'',
      seq:0,
          driverCharge: '',
          extra_charge: '',
          labor_charge: '',
          pickup_charge: '',
          succeding: '',
          amount_base: '',
          base_dist: '',
          viewmodal: false,
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

  
  onCollectionUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
        console.log('list: ', doc.data())
     stores.push ({
            datas : doc.data(),
            key : doc.id
            });
    });
 this.setState({
      data : stores.sort((a, b) => Number(a.datas.id) - Number(b.datas.id)),
      loading: false
   });
  
  }

   async componentDidMount() {
     this._bootstrapAsync();
      this.setState({loading: true})
     this.unsubscribe = this.storeRef.onSnapshot(this.onCollectionUpdate);
  }
  
  updateTextInput = (text, field) => {
    const state = this.state
    state[field] = text;
    this.setState(state);
  }
   openGallery = () => {
    ImagePicker.launchImageLibrary({
        maxWidth: 500,
        maxHeight: 500,
        mediaType: 'photo',
        includeBase64: true,
    }, image => {
        if(image.didCancel== true){
  console.log('base64: ', image);
  return;
        }
    this.setState({image:image.assets[0].base64})
        this.setState({image:image.assets[0].base64})
      console.log('base64: ', image.assets[0].base64);
                 })
   }
   deleteCategory (items){
         Alert.alert(
        'No Category',
        'Input Category',
        [
            {text: 'Cancel', onPress: () => null},
          {text: 'OK', onPress: () =>  firestore().collection('categories').doc(items.datas.title).delete().then(()=>{console.log('deleted')}).catch((err)=> {console.log('error delete')})},
        ],
        {cancelable: false},
      );
      
   }
  _renderHeader(item, expanded) {
    return (
        <TouchableOpacity style={{flex:1}} onPress={()=> this.props.navigation.navigate('Details', {'store': item.datas})}>
        <Card transparent style={{
          marginBottom: 5, flex: 1 }}>
           <CardItem style={{flexDirection: 'row',
           marginHorizontal:5, flex: 1,zIndex: 3,
        elevation: 5, marginBottom: 0}}>
           
              <Thumbnail  square source={{uri: item.datas.image}}
                
              />
                <Body style={{marginHorizontal: 10}}>  
                    <Text style={{fontSize: 13, fontWeight:'bold'}}>{item.datas.name}</Text>
                    <Text note style={{fontSize: 10}}><Text style={{fontWeight: 'bold', fontSize: 11}}>Category :</Text> {item.datas.title}</Text>
                    <Text note style={{fontSize: 10}}><Text style={{fontWeight: 'bold', fontSize: 11}}>Seq. # :</Text> {item.datas.id}</Text>
                </Body>

                <TouchableOpacity  
                    onPress={()=> this.deleteCategory(item)}
                    style={{width: 30, height: 25, justifyContent: 'center', alignItems: 'center'}}>
                  
                    <Ionicons  name="ios-trash-bin" size={22}  style={{ color: "tomato", textAlign: 'center', fontWeight: 'bold' }}/>

                    
                </TouchableOpacity>

              </CardItem>
        </Card>
        </TouchableOpacity>
        
    );
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
                   <Title style={{color: 'white'}}>Categories</Title>
               </Body>
                 <Right style={{flex:1}}>
                 <MaterialIcons name="add-circle" size={25} color="white" onPress={()=> this.setState({viewmodal: true})}/>
          </Right>
               </Header>
             <Loader loading={this.state.loading}/>
           <FlatList
               data={this.state.data}
               renderItem={({ item }) => (
                 
                    this._renderHeader(item)
                
                  
               )}
               keyExtractor={item => item.datas.id}
              
           />
        

<Modal
      isVisible={this.state.viewmodal}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({viewmodal: false})} transparent={true}>
     <Card style={style.content}>
        <CardItem><Left/><Body style={{flex:2, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Add Categories</Text></Body><Right/></CardItem>
        <List>
        <TouchableOpacity onPress={this.openGallery} style={{justifyContent:"center",alignContent:"center"}}>
              <Image style={{  width: 160, height: 160, resizeMode: 'contain',margin: 10}} source={this.state.image === null ? imgDefault:{uri: `data:image;base64,${this.state.image}`}} />
            </TouchableOpacity>
            <Text style={{marginTop: 15, fontSize: 10}}>Category</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input  value={this.state.category} keyboardType={'default'} onChangeText={(text) => this.updateTextInput(text, 'category')} placeholderTextColor="#687373" />
                    </Item>
                    <Text style={{marginTop: 15, fontSize: 10}}>Sequence Number</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={this.state.seq.toString()}  keyboardType={'number-pad'} onChangeText={(text) => { isNaN(text)? null:this.updateTextInput(text, 'seq')}} placeholderTextColor="#687373" />
                    </Item>
           </List>   
    
      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.addProduct()}
      >
       <Text style={{color:'white'}}>Add Category</Text>
      </Button>
    </Card>
    </Modal>
       </Container>
    );
  }
  async addProduct() {

if(this.state.image === null){
    Alert.alert(
        'No Image Found',
        'Attach Image',
        [
          {text: 'OK', onPress: () => null},
        ],
        {cancelable: false},
      );
      return;
}
if(this.state.category === null){
    Alert.alert(
        'No Category',
        'Input Category',
        [
          {text: 'OK', onPress: () => null},
        ],
        {cancelable: false},
      );
      return;
}
    console.log('addProduct')
    
this.setState({ loading: true});
     let base64Img = `data:image/jpg;base64,${this.state.image}`;
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
                const dataValue = {
                
                            title : this.state.category,
                        image: 'https'+data.url.slice(4),
                        id: this.state.seq,
                    
                    
                }
                console.log("dataValue: ", dataValue)
                firestore().collection('categories').doc(this.state.category).set(dataValue).then((docRef) => {   
                    this.setState({
                        loading: false,
                        viewmodal: false,
                        });
                this._bootstrapAsync();
                        
                })
  })

}

}
export default Categories;

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