import React,{ Component} from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, Dimensions,TouchableOpacity } from 'react-native';
import {Container, CardItem, Thumbnail, Body, Button} from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Loader from '../../component/Loader';
import { Card, Divider } from 'react-native-elements';
const SCREEN_WIDTH = Dimensions.get('window').width;
import moment from "moment";

class Cancelled extends Component{
    constructor() {
        super();
        this.ref = firestore();
        this.unsubscribe = null;
        this.state = {
          user: null,
          email: "",
          password: "",
          formValid: true,
          error: "",
          loading: false,
          dataSource: [],
          uid:'',
          store_path: ''
        };
         }
        
         onCollectionUpdate = (querySnapshot) => {
          const orders = [];
          querySnapshot.forEach((doc) => {
           orders.push ({
                  datas : doc.data(),
                  key : doc.id
                  });
          })

          this.setState({
            dataSource : orders.sort((a,b)=> a.datas.OrderNo - b.datas.OrderNo),
            loading: false,
         })
      
        }
     
        _bootstrapAsync = () =>{
                     const month_now = moment().format('MMMM');
               const year_now = moment().format('YYYY');
          this.unsubscribe = this.ref.collection('orders').where('OrderStatus', '==', "Cancelled").where('OrderDetails.Month', '==', month_now).where('OrderDetails.Year', '==', year_now).onSnapshot(this.onCollectionUpdate) ;
          };
     
    
        componentDidMount() {
          this.setState({loading: true})
          this._bootstrapAsync();
        }
  render(){
    return (
      <Container>
        <Loader loading={this.state.loading} />
          <SafeAreaView> 
                <FlatList
                    data={this.state.dataSource}
                    renderItem={({ item }) => (
                      <Card  containerStyle={styles.card} >
                            <TouchableOpacity  onPress={() => this.props.navigation.navigate('OrderDetails',{ 'orders' : item.datas, 'path' : this.state.store_path })} > 
                              <Text style={styles.notes}>Order No. : 00{item.datas.OrderNo}</Text>      
                              <Divider /> 
                                      <View style={{flexDirection: 'row', justifyContent: "flex-start", alignContent: "flex-start"}}>
                                          <Text style={{color:'yellow',fontSize: 13, fontWeight:'900'}}> Customer :</Text><Text style={{color:'white',fontSize: 13, fontWeight:'900'}}> {item.datas.AccountInfo.name}</Text>
                                      </View>
                                   
                                      <View style={{flexDirection: "row", flex:3}}>
                                      <Text style={{color:'yellow',fontSize: 13, fontWeight:'900'}}> Date/Time :</Text><Text style={{color:'white',fontSize: 13, fontWeight:'900'}}> {item.datas.OrderDetails.Date} / {item.datas.OrderDetails.Time}</Text>
                                      </View>  
                              </TouchableOpacity>                             
                              </Card>
                    )}
                    enableEmptySections={true}
                    style={{ marginTop: 10 }}
                
                /> 
          </SafeAreaView>
      </Container>
    );
}
}

export default Cancelled;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
	card:{
		backgroundColor:'rgba(56, 172, 236, 1)',
		borderWidth:0,
		borderRadius: 5
	},
	time:{
		fontSize:38,
		color:'#fff'
	},
	notes: {
		fontSize: 18,
		color:'yellow',
		textTransform:'capitalize'
	}
});
