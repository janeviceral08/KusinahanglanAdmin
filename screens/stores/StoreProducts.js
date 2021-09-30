import React, { Component } from "react";
import { Platform, StyleSheet,  View,SafeAreaView,Alert } from "react-native";
import DynamicTabView from "react-native-dynamic-tab-view";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { Container, Header, Item, Input, Icon, Button, Text, Left, Right,Body,Title,Form, Picker, Fab, Card, List, CardItem } from 'native-base';

import Products from '../../component/Products'
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FAB, Portal, Provider } from 'react-native-paper';
import Modal from 'react-native-modal';
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import moment from "moment";


class StoreProducts extends Component{
  constructor(props) {
    super(props);
    const store =  this.props.route.params.store;
    this.ref = firestore();
    this.storeRef = firestore().collection('categories');
    this.state = {
      defaultIndex: 0,
      category : store.category,
      store_name: store.name,
      store_id: store.id,
      visibleModal: false,
      count: 0,
      stores:[],
      cluster:'',
      city:'',
      section: '',
      active: false,
      open: false,
      store: store.id,
      AdminWallet: 0,
      Addwallet: 0,
      UpdateWallet: false,
      storeWallet: store.wallet,
        UpdateStoreInfo: false,
        selectedCity:store.section,
         arrangement:store.arrange,
         section:store.section,
         storeCommision: store.labor_charge*100,
         dataSource: [],
    };
  }

  _bootstrapAsync = async () =>{
    this.unsubscribe = this.ref.collection('stores').where('id', '==', this.state.store).onSnapshot(this.onCollectionUpdate);
  };


  onCollectionUpdate = (querySnapshot) => {
    const stores = [];
    querySnapshot.forEach((doc) => {
        this.setState({
            category : doc.data().subcategory,
            store_name: doc.data().name,
            store_id: doc.data().id, 
            city: doc.data().city, 
            cluster: doc.data().cluster, 
            section: doc.data().section,
            image: doc.data().foreground,
         });
    });
  }

  _renderItem = (item, index) => {
    return (
      <View
        key={item["key"]}
        style={{ backgroundColor: '#ffffff', flex: 1}}
      >
        <Products title={item["title"]} store={this.state.store_name} storeId={this.state.store_id} category={this.state.category}  navigation={this.props.navigation}/>
      </View>
    );
  };

  
  componentDidMount(){
    this.getAdminWallet();
    this.unsubscribe = this.storeRef.onSnapshot(this.onCollectionUpdateGetCategories);
    this._bootstrapAsync();
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
 onStateChange = ({ open }) => this.setState({ open: !this.state.open });


  onChangeTab = index => {};
  

    
render() {
   const { open } = this.state;
    return (

    <SafeAreaView style={{flex: 1}}>
     <Provider>
      <DynamicTabView
        data={this.state.category}
        renderTab={this._renderItem}
        defaultIndex={this.state.defaultIndex}
        containerStyle={styles.container}
        headerBackgroundColor={'white'}
        headerTextStyle={styles.headerText}
        onChangeTab={this.onChangeTab}
        headerUnderlayColor={'tomato'}
      /> 
        <Portal>
        <FAB.Group
          open={this.state.open}
          icon={this.state.open ? 'close-circle-outline' : 'plus'}
          actions={[
            {
              icon: 'wallet-plus',
              label: 'Update Wallet',
              onPress: () => this.setState({UpdateWallet: true}),
            },
            {
              icon: 'store',
              label: 'Update Store Info',
              onPress: () => this.setState({UpdateStoreInfo: true}),
            },
          
          ]}
          onStateChange={this.onStateChange}
          onPress={() => {
            if (this.state.open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
    <Modal
      isVisible={this.state.UpdateWallet}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({UpdateWallet: false})} transparent={true}>
     <Card style={style.content}>
       <CardItem><Body style={{flex:2, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Store Wallet Balance: {parseFloat(this.state.storeWallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text></Body></CardItem>
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
      isVisible={this.state.UpdateStoreInfo}
      animationInTiming={700}
      animationIn='slideInUp'
      animationOut='slideOutDown'
      animationOutTiming={700}
      useNativeDriver={true}
      onBackdropPress={() => this.setState({UpdateStoreInfo: false})} transparent={true}>
     <Card style={style.content}>
       <CardItem><Body style={{flex:2, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Store Wallet Balance: {parseFloat(this.state.storeWallet).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</Text></Body></CardItem>
        <List>
        
            
                    <Text style={{marginTop: 15, fontSize: 10}}>Store Commision (%)</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={this.state.storeCommision.toString()}  keyboardType={'number-pad'} onChangeText={(text) => { isNaN(text)? null:this.updateTextInput(text, 'storeCommision')}} placeholderTextColor="#687373" />
                    </Item>
                     <Text style={{marginTop: 15, fontSize: 10}}>Category</Text>
                    <Item regular style={{marginTop: 7}}>
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
                     <Text style={{marginTop: 15, fontSize: 10}}>Arrangement</Text>
                    <Item regular style={{marginTop: 7}}>
                        <Input value={this.state.arrangement}  keyboardType={'number-pad'} onChangeText={(text) => this.updateTextInput(text, 'arrangement')} placeholderTextColor="#687373" />
                    </Item>
           </List>  

      <Button block style={{ height: 30, backgroundColor:  "#33c37d", marginTop: 10}}
        onPress={() => this.EditStoreInfo()}
      >
       <Text style={{color:'white'}}>Update Information</Text>
      </Button>
    </Card>
    </Modal>
  </SafeAreaView>
    );
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
firestore().collection('stores').doc(this.state.store).update({wallet: firestore.FieldValue.increment(parseFloat(this.state.Addwallet))})
firestore().collection('LoadHistory').add({PrevWallet:parseFloat(this.state.storeWallet), Amount: parseFloat(this.state.Addwallet), RiderId: this.state.store, account: 'Store', DateLoaded: moment().unix(), riderName:this.state.store_name, riderEmail: this.props.route.params.store.email })
  Alert.alert(
        'Transaction Successfull',
        'You have successfully updated the wallet',
        [
          { text: 'OK', onPress: () => this.props.navigation.goBack() }
        ],
        { cancelable: false }
      );
}


 EditStoreInfo(){

    Alert.alert(
        'Change Store Information',
        'You sure to proceed?',
        [{ text: 'Cancel', onPress: () => null },
          { text: 'OK', onPress: () => {
            firestore().collection('stores').doc(this.state.store).update({ labor_charge:parseFloat(this.state.storeCommision)/ 100, section: this.state.section,arrange: this.state.arrangement})
          Alert.alert(
        'Transaction Successfull',
        'You have successfully updated the wallet',
        [
          { text: 'OK', onPress: () => this.props.navigation.goBack() }
        ],
        { cancelable: false }
      );
          } }
        ],
        { cancelable: false }
      );
  

}
}

export default  StoreProducts;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
    paddingTop: 0,
    marginTop:0,
    marginBottom:0,
    height: 50
  },

  headerContainer: {
    marginTop: 5,
   
  },
  headerText: {
    color:'black'
  },
  tabItemContainer: {
    backgroundColor: "#cf6bab"
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
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