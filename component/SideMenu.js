import React, { Component } from 'react';
import { Container, Header, Button, ListItem, Text, Icon, Left, Body, Right, Switch,List,Grid,Row } from 'native-base';
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { ScrollView, View, TouchableOpacity ,SafeAreaView, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
export default class SideMenu extends Component {
  constructor(props) {
    super(props);
 this.ref = firestore();
 this.storeRef = firestore().collection('stores');
 this.unsubscribe = null;
    this.state = {
      loggedIn: '',
      wallet: 0,
    };
    
  }

    signOut=async () =>{


Alert.alert(
            'Log out',
            'Are you sure?',
            [
            {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
              {text: 'OK', onPress: async() => {
                 const token= await AsyncStorage.getItem('Admintoken');
      firestore().collection('admin_token').doc('token').update({
          tokens: firestore.FieldValue.arrayRemove(token)
        }).then(user=>
                      auth().signOut().then(user => {     
                        AsyncStorage.removeItem('uid');   
                      this.props.navigation.navigate('Login')    
                  })
          ).catch((err)=>    Alert.alert(
            'Log out Failed',
            'Sorry, Try again',
            [
            
              {text: 'OK', onPress: () => console.log('Cancel Pressed')},
            ],
            {cancelable: false},
          ))
   .catch(error => this.setState({ errorMessage: error.message }))
              }},
            ],
            {cancelable: false},
          )
       
}

  async componentDidMount(){
    const userId= await AsyncStorage.getItem('uid');
    
    this.setState({
      loggedIn : userId
    })
    this._bootstrapAsync();
    this.unsubscribe = this.storeRef.onSnapshot(this.getStore);
}

getStore = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
     if(doc.data().wallet < 1){
       firestore().collection('stores').doc(doc.data().id).update({admin_control: false,status:false})
     }
    });

  
  }
_bootstrapAsync =async () =>{
    this.unsubscribe = this.ref.collection('charges').where('id', '==', 'admin000001' ).onSnapshot(this.onCollectionUpdate);
    };


  onCollectionUpdate = (querySnapshot) => {
    querySnapshot.forEach((doc) => {

      this.setState({
          wallet:doc.data().AdminWallet,

     });
    });
  }
  render() {
    const {loggedIn} = this.state;
    return (
      <SafeAreaView style={{flex: 1}}>
        <Header style={{backgroundColor:'salmon'}}>
            <Left/>
            <Body style={{flex: 3}}>
                <Text style={{fontWeight:'bold', color: 'white'}}>
                    MY DELIVERY APP
                </Text>
                <Text style={{ color: 'white', width: 300}}>
                  Wallet Balance: ₱{parseFloat(this.state.wallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                </Text>
            </Body>
            <Right/>
        </Header>

          <ScrollView contentContainerStyle={{flex:1}}>
          <ListItem icon onPress={()=> this.props.navigation.navigate('AddRider')}>
            <Left>
              <Button style={{ backgroundColor: "skyblue" }}>
              <Fontisto name="motorcycle" size={18} color="white"/>
              </Button>
            </Left>
            <Body>
              <Text>Add Rider</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          <ListItem icon onPress={()=> this.props.navigation.navigate('AddStore')}>
            <Left>
              <Button style={{ backgroundColor: "white" }}>
              <Fontisto name="shopping-store" size={18} color="red"/>
              </Button>
            </Left>
            <Body>
              <Text>Add Store</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
         <ListItem icon onPress={()=> this.props.navigation.navigate('DeliveryCharge')}>
            <Left>
              <Button style={{ backgroundColor: "white" }}>
              <FontAwesome5 name="money-check-alt" size={18} color="red"/>
              </Button>
            </Left>
            <Body>
              <Text>Charges Settings</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
             <ListItem icon onPress={()=> this.props.navigation.navigate('Categories')}>
            <Left>
              <Button style={{ backgroundColor: "white" }}>
              <MaterialCommunityIcons name="view-list" size={18} color="red"/>
              </Button>
            </Left>
            <Body>
              <Text>Category</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
             <ListItem icon onPress={()=> this.props.navigation.navigate('Carousel')}>
            <Left>
              <Button style={{ backgroundColor: "white" }}>
              <MaterialCommunityIcons name="view-carousel-outline" size={18} color="red"/>
              </Button>
            </Left>
            <Body>
              <Text>Carousel</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          <ListItem icon onPress={()=> this.props.navigation.navigate('Reports')}>
            <Left>
              <Button style={{ backgroundColor: "white" }}>
              <MaterialCommunityIcons name="chart-bar" size={18} color="red"/>
              </Button>
            </Left>
            <Body>
              <Text>Reports</Text>
            </Body>
            <Right>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          </ScrollView>
          <List style={{justifyContent:'flex-end'}}>
         {
           loggedIn ?
            <ListItem onPress={()=> this.signOut()}>
              <Text>Log Out</Text>
            </ListItem> :
             <ListItem onPress={()=> this.props.navigation.navigate("Login")}>
              <Text>Sign In</Text>
            </ListItem>
         }
           <ListItem>
            <View>
            <Grid>
              <Row style={{alignItems: 'center'}}><TouchableOpacity style={{flexDirection: 'row'}} onPress={() => Linking.openURL('https://icons8.com').catch(err => console.error('An error occurred', err))} ><Text> Icons by Icons8</Text></TouchableOpacity></Row>
            </Grid>
          </View>
           </ListItem>
          </List>
      </SafeAreaView>
    );
  }
}