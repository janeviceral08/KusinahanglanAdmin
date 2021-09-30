import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity, Alert,Dimensions,Image, View} from 'react-native';
import { Container, Header, Icon, Accordion, Text, Card, CardItem, Thumbnail, Body, Left, Right, Button } from "native-base";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import SwitchToggle from 'react-native-switch-toggle';
import Loader from "../../component/Loader";
const SCREEN_WIDTH = Dimensions.get('window').width;


export default class Open extends Component {
  constructor(props) {
    super(props);
    this.storeRef = firestore().collection('stores').where('status', '==', true);
    this.storeRef=this.storeRef.where('admin_control', '==', true)

    this.unsubscribe = null;

    this.state = {
      data:[],
      loading: false
    };

  }

  toggleProduct (id, s_status, a_status){
    let prodref = firestore().collection('stores').doc(id);
     prodref.update({
       status:  false,
       admin_control: false
     });
  }
  
  Onsettingopen = (item) =>{

    Alert.alert(
      'Alert',
      'Are you sure you want to OPEN your Store?',
      [
       
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () =>  this.updatopen(item)},
      ],
      { cancelable: false }
    )
  }
  updatopen(item) {
    
    const updateRef = firestore().collection('stores').doc(item);
    updateRef.update({
     
      store_status: 'open',
    })
  
    
  } 

  Onsettingclose= (item) =>{

    Alert.alert(
      'Alert',
      'Are you sure you want to CLOSE your Store?',
      [
       
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () =>  this.updatclose(item)},
      ],
      { cancelable: false }
    )
  }
  updatclose(item) {
   
    const updateRef = firestore().collection('stores').doc(item);
    updateRef.update({
     
      store_status: 'close',
    })
    return fetch('https://batchbuddies.com/delete_product_cart_unavailable_store.php',{
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
              },
        body: JSON.stringify({
          
         store_id: item,
    })
   
    })
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
      loading: false
   });
  
  }
  componentDidMount(){
    this.setState({loading: true})
     this.unsubscribe = this.storeRef.onSnapshot(this.onCollectionUpdate);

  }

  _renderHeader(item, expanded) {
    return (
        <TouchableOpacity style={{flex:1}} onPress={()=> this.props.navigation.navigate('Details', {'store': item.datas})}>
        <Card transparent style={{
          marginBottom: 5, flex: 1 }}>
           <CardItem style={{flexDirection: 'row',
           marginHorizontal:5, flex: 1,zIndex: 3,
        elevation: 5, marginBottom: 0}}>
           
              <Thumbnail  square source={{uri: item.datas.foreground}}
                
              />
                <Body style={{marginHorizontal: 10}}>  
                    <Text style={{fontSize: 13, fontWeight:'bold'}}>{item.datas.name}</Text>
                    <Text note style={{fontSize: 10}}><Text style={{fontWeight: 'bold', fontSize: 11}}>Wallet :</Text> {item.datas.wallet}</Text>
                    <Text note style={{fontSize: 10}}><Text style={{fontWeight: 'bold', fontSize: 11}}>ID# :</Text> {item.datas.id}</Text>
                </Body>

                {item.datas.wallet <1?null:<TouchableOpacity  
                    onPress={()=> this.toggleProduct(item.datas.id, item.datas.status, item.datas.admin_control)}
                    style={{width: 30, height: 30, backgroundColor: 'lightgray',borderRadius: 10, justifyContent: 'center', alignItems: 'center'}}>
                    {item.datas.status && item.datas.admin_control ? 
                    <Icon  name="ios-eye-off"  style={{ color: "tomato", textAlign: 'center', fontWeight: 'bold' }}/> :
                    <Icon  name="ios-eye"  style={{ color: "rgba(56, 172, 236, 1)", textAlign: 'center', fontWeight:'bold' }}/>
                    }
                    
                </TouchableOpacity>}

              </CardItem>
        </Card>
        </TouchableOpacity>
    );
  }

  render() {
    console.log('open: ',this.state.data)
    return (
      <Container>
        <Loader loading={this.state.loading} />
        <View>
        <FlatList
               data={this.state.data}
               renderItem={({ item }) => (
                 
                    this._renderHeader(item)
                
                  
               )}
               
           />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    favorite: {
        zIndex: 3,
        elevation: 3,
        position:'absolute',
        justifyContent: "flex-end",
        marginLeft : 10,
        marginVertical : 10
      },
});