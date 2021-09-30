import React,{ Component} from 'react';
import { View, Text,  StyleSheet,TouchableOpacity ,Alert,ScrollView} from 'react-native';
import {Container, List, ListItem, Left, Body, Right, Thumbnail,Button, Icon, Card, CardItem, Root, Toast, Item} from 'native-base';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { StackActions, NavigationActions } from 'react-navigation';

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'OrderDetails' })],
});


class OrderItems extends Component{
    constructor(props){
        super(props);
        this.state={
            visibleModal: false,     
            id: '',
            qty: 0,
            quantity: 0,
            price: 0,
            name:'',
        } 
    }
    storeTotal(){
        let total = 0;
        let addonTotal = 0;
        this.props.item.forEach(item => {
            if(item.storeId == this.props.id){
                if(item.sale_price){
                    total += item.sale_price * item.qty
                }else{
                    total += item.price * item.qty
                }
                
            }
            if(item.choice){
            item.choice.forEach(addon => { 
                addonTotal += addon.price  * item.qty
            });
          }
        });
        return total+addonTotal;
    }
  
    updateTextInput = (text, field) => {
        const state = this.state
        state[field] = text;
        this.setState(state);
      }
      

    openModal (data){
        this.setState({
            id: data.id,
            o_qty: data.qty,
            qty: data.qty.toString(),
            quantity: data.quantity,
            visibleModal: true,
            price: data.price,
            sale_price: data.sale_price,
            name: data.name
        })
       }
  

    async  onUpdateQuantity(){
        const { item , subtotal } = this.props;
                    if(this.state.o_qty >= this.state.qty){
                        const updatedCart = item;
                    let itemIndex = updatedCart.findIndex(item => this.state.id === item.id); /* Get the index of the item we want to delete */   
                    let cartRef = firestore().collection('orders');    
                    updatedCart[itemIndex]['qty'] = parseInt(this.state.qty);
                    let less = 0;
                        if(this.state.sale_price){
                            less= (this.state.o_qty - parseInt(this.state.qty)) * this.state.sale_price
                        }else if (!this.state.sale_price){
                            less= (this.state.o_qty - parseInt(this.state.qty)) * this.state.price
                        }

                        cartRef.doc(this.props.oid).update({
                            Products:  updatedCart,
                            subtotal: subtotal - less
                        }).then(()=>(
                            this.setState({visibleModal: false}),
                            this.props.navigation.goBack(),
                            Toast.show({
                                    text: "Order successfully updated",
                                    position: "center",
                                    type: "success",
                                    textStyle: { textAlign: "center" },
                                })
                                )
                        )    
                    }else if(this.state.o_qty< this.state.qty){
                        this.setState({visibleModal: false})
                        Toast.show({
                                text: "Invalid action, cannot add more quantity.",
                                position: "center",
                                type: "warning",
                                textStyle: { textAlign: "center" },
                            })
                    }
                     
      }

     onRemoveProduct() {
              const { item , subtotal } = this.props;
       
              let is_existing = Object.keys(item).length && Object.values(item).find(item => this.state.id === item.id); /* Check if item exists in cart from state */
              if(is_existing){
                  let cartRef = firestore().collection('orders');
                  
                  /* Get current cart contents */
                  cartRef.doc(this.props.oid).get().then(snapshot => {
                      let updatedCart = Object.values(snapshot.data().Products); /* Clone it first */
                      let itemIndex = updatedCart.findIndex(item => this.state.id === item.id); /* Get the index of the item we want to delete */
                      let less=0;
                      /* Remove item from the cloned cart state */
                      updatedCart.splice(itemIndex, 1);             
                      /* Set updated cart in firebase, no need to use setState because we already have a realtime cart listener in the componentDidMount() */
                      cartRef.doc(this.props.oid).update({
                        Products:  updatedCart,
    
  
                    }).then(()=>(
                        this.setState({visibleModal: false}),
                        this.props.navigation.goBack(),
                        Toast.show({
                            text: "Product successfully deleted",
                            position: "center",
                            type: "success",
                            textStyle: { textAlign: "center" },
                        })
                        )
                    ) 
                    
                  });
              } 
     }
   

     onUpdateConfirm(){
        Alert.alert(
          'Confirmation',
          'Are you sure you want to update this order?',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel'
            },
            { text: 'OK', onPress: () => this.onUpdateQuantity() }
          ],
          { cancelable: false }
        );
    }

    onRemoveConfirm(){
        Alert.alert(
          'Delete item?',
          'Are you sure you want to delete this product from order?',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel'
            },
            { text: 'OK', onPress: () => this.onRemoveProduct() }
          ],
          { cancelable: false }
        );
    }

  render(){
    return (
    <Root>
      <ScrollView>
      {this.props.item.map((item, d) => 
            <View   key={d}>
               <List>
                {item.storeId == this.props.id &&
                 <ListItem button onPress={()=> this.openModal(item)}>
                 <Body style={{flex:3}}>
                 <View style={{flexDirection: "row"}}>
                   <Text style={{fontSize: 12}}>{item.qty} {item.brand} {item.name} ({item.unit})</Text>
                   
                 </View>  
                 <Text note style={{color:'salmon', fontSize: 12}}>Note: {item.note}</Text> 
                 </Body>
                 <Right style={{flex:3}}>
                     {item.sale_price ? <Text>₱{(item.qty * item.sale_price)}</Text>: <Text>₱{(item.qty * item.price)}</Text>} 
                 </Right>               
             </ListItem>
                }
            </List>
            {item.choice  ? 
              [item.choice.map((drink, i) =>
                <View key={i}>
                   <List style={{marginLeft: 20}}>
                   <ListItem>
                      <Left  style={{justifyContent: "flex-start"}}>
                          <Text style={{fontWeight:'bold', fontSize: 20}}>{'\u2022' + " "}</Text>
                      </Left>
                      <Body style={{justifyContent: "flex-start", flex: 5}}>
                          <Text style={{ fontSize: 12}}>{item.qty}x </Text>
                          <Text style={{ fontSize: 12}}>{drink.label}</Text>
                      </Body>
                      <Right style={{justifyContent: "flex-end", flex:1}}>
                          <Text style={{ fontSize: 13 }}>₱{drink.price*item.qty}</Text>
                      </Right>                                                   
                   </ListItem>
               </List>
               </View>
              )] : null}
            </View>  
            )} 

            <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: 15}}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'salmon'}}>Total</Text>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'salmon'}}>₱{Math.round(this.storeTotal()*10)/10}</Text>
            </View>
           
            <Modal
                isVisible={this.state.visibleModal}
                animationInTiming={700}
                animationIn='slideInUp'
                animationOut='slideOutDown'
                animationOutTiming={700}
                useNativeDriver={true}
                onBackdropPress={() => this.setState({visibleModal: false})} transparent={true}>
                <Card style={style.content}>
                    <CardItem><Left/><Body style={{flex:3, justifyContent:"center",alignContent:"center"}}><Text style={{fontSize:17, fontWeight:'bold'}}>Override Changes</Text></Body><Right/></CardItem>
                    <View style={{margin: 10}}>
                      <View>
                        <Text style={{ fontSize: 15, padding: 5}}>{this.state.name}</Text>
                      </View>
                    
                    <Text style={{ fontSize: 10}}>Quantity</Text>
                    <Item regular style={{marginTop: 7}}>
                        <TextInput style={{flex:1}} value={this.state.qty} keyboardType='numeric' onChangeText={(text) => this.updateTextInput(text, 'qty')} placeholderTextColor="#687373" />
                    </Item>
                    </View>
                    <Button block style={{ height: 30, backgroundColor:  "rgba(56, 172, 236, 1)", marginTop: 10}}
                            onPress={() => this.onUpdateConfirm()}
                        >
                        <Text style={{color:'white'}}>Save Changes</Text>
                        </Button>
                        <Button block style={{ height: 30, backgroundColor:  "salmon", marginTop: 10}}
                            onPress={() => this.onRemoveConfirm()}
                        >
                        <Text style={{color:'white'}}>Remove Item</Text>
                        </Button>
                        <Button block style={{ height: 30, backgroundColor:  'salmon', marginTop: 10}}
                            onPress={() => this.setState({visibleModal: false})}
                        >
                        <Text style={{color:'white'}}>Cancel</Text>
                        </Button>
                </Card>
            </Modal>
      </ScrollView>
    </Root>
    );
}
}

export default OrderItems;


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