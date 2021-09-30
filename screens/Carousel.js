
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
import {imgDefault} from './images';
import * as ImagePicker from "react-native-image-picker"
import { FlatGrid } from 'react-native-super-grid';

class Carousel extends Component {
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
      images: [],
    };
     }
         

  _bootstrapAsync = async() =>{
   this.setState({loading: true})
    const getData= this.ref.collection('carousel').doc('home');
    const doc = await getData.get();
    if (!doc.exists) {
  console.log('No such document!');
} else {
  console.log('Document data:', doc.data());
  this.setState({
          images : doc.data().images,
         loading: false,
       })}
    };

  


   async componentDidMount() {
    //const uid= await AsyncStorage.getItem('storetoken');
    //this.setState({loading: true})
    //console.log(uid)
     this._bootstrapAsync();
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
          console.log('base64: ', image);
        if(image.didCancel== true){
  console.log('base64: ', image);
  return;
        }
        this.setState({loading: true})
                let base64Img = `data:image/jpg;base64,${image.assets[0].base64}`;
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
                    firestore().collection('carousel').doc('home').update({images: firestore.FieldValue.arrayUnion('https'+data.url.slice(4))}).then((docRef) => {   

  this._bootstrapAsync();
  })
                        
                    }).catch(err => console.log('upload err:',err))
                 })
  }

  deleteImage(item){

          Alert.alert(
        'Delete Carousel?',
        'Are you sure to proceed?',
        [
            {text: 'Cancel', onPress: () => null},
          {text: 'OK', onPress: () =>  { firestore().collection('carousel').doc('home').update({images: firestore.FieldValue.arrayRemove(item)}).then((docRef) => {   

  this._bootstrapAsync();
  })}
          },
        ],
        {cancelable: false},
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
                   <Title style={{color: 'white'}}>Carousel</Title>
               </Body>
             
               </Header>
             <Loader loading={this.state.loading}/>
       
         <FlatGrid
      itemDimension={120}
      data={this.state.images}
      // staticDimension={300}
      // fixed
      spacing={10}
      renderItem={({ item }) => (
          <TouchableOpacity onPress={()=> {item === 'AddImage' ? this.openGallery():this.deleteImage(item)}}>
              <Image style={{  width: 160, height: 160, resizeMode: 'contain',margin: 10}} source={item === 'AddImage' ? imgDefault:{uri: item}} />
            </TouchableOpacity>
      )}
    />
         
        
       </Container>
    );
  }


}
export default Carousel;