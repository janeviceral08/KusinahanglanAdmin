import React, { Component } from "react";
import {StyleSheet, FlatList, TouchableOpacity, TextInput, View} from 'react-native';
import { Container, Header, Icon, Accordion, Text, Card, CardItem, Thumbnail, Body, Left, Right, Button, List, ListItem } from "native-base";

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Octicons from 'react-native-vector-icons/Octicons'

import Modal from 'react-native-modal';
import CustomHeader from "../component/CustomHeader";

export default class User extends Component {
  constructor(props) {
    super(props);
    this.ref = firestore().collection('users');
    this.unsubscribe = null;
    this.state = {
      text: '',
      data:[],
      visibleModal: false,
      Name: '',
      Mobile: '',
      Email: '',
      Gender: '',
      Address: '',
      Status: '',
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
  
   });
  
  }
  componentDidMount(){
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
      <ListItem avatar onPress={()=> this.toggleMOdal(item.datas, item.key)}>
        <Left>
          <Thumbnail source={require('../assets/use.png')} />
        </Left>
        <Body>
          <Text>{item.datas.Name}</Text>
          <Text note style={{fontSize: 12}}>{item.datas.Mobile}</Text>
          <Text note style={{fontSize: 12}}>{item.datas.Email}</Text>
          <Text note style={{fontSize: 12}}>{item.key}</Text>
        </Body>

        <Right style={{justifyContent: "center", alignContent: "center"}}>
          {item.datas.status == "Verified" &&
             <Octicons name="check" size={20} color={"green"} />
          }    
        </Right>
      </ListItem>
    </List>

    );
  }

  render() {
    const {   Name,
      Mobile,
      Email,
      Gender,
      Address,
      Status,
      id 
    } = this.state;
    return (
      <Container>
        <CustomHeader isHome={true} title="Users" navigation={this.props.navigation}/>
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
               
           />
        </View>
        <Modal
      isVisible={this.state.visibleModal}
      animationInTiming={1000}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={1000}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
     <Card style={style.content}>
     <CardItem>
          <Body>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Name :</Text><Text> {Name}</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
               
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Contact # :</Text><Text> {Mobile}</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
                 
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Email:</Text><Text> {Email}</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
                  
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Gender :</Text><Text> {Gender}</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
               
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Address :</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5,paddingLeft: 15}}>
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}></Text><Text> {Address}</Text>
              </View>
              <View style={{flexDirection: 'row',paddingVertical: 5}}>
                
                  <Text style={{color:'salmon',fontSize: 14, fontWeight:'bold'}}> Status:</Text><Text> {Status}</Text>
              </View>
          </Body>                                             
      </CardItem>
     <Button block style={{ height: 30, backgroundColor: "rgba(56, 172, 236, 1)"}}
        onPress={() =>this.updateStatus(id)}
      >
       <Text style={{color: 'white'}}>Verify User</Text>
      </Button>
      
      <Button block style={{ height: 30, backgroundColor:  "rgba(56, 172, 236, 1)", marginTop: 10}}
        onPress={() => this.setState({visibleModal: false})}
      >
       <Text style={{color:'white'}}>Done</Text>
      </Button>
    </Card>
    </Modal>
      </Container>
    );
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