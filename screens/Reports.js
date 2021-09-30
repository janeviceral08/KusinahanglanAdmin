
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Loader from '../component/Loader';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';
import {imgDefault} from './images';
import * as ImagePicker from "react-native-image-picker"
import { FlatGrid } from 'react-native-super-grid';

class Reports extends Component {
  render() {
      const report_details= [
                                {title: 'Load to Rider/Store', Props: 'LTP', Icon: 'SimpleLineIcons', name: 'wallet'},
                                {title: 'App Shares', Props: 'AppShare', Icon: 'Entypo', name: 'creative-commons-share'},
                                {title: 'Order Reports', Props: 'OrderReports', Icon: 'AntDesign', name: 'profile'},
                                {title: 'Gross Income', Props: 'GIReports', Icon: 'Feather', name: 'pie-chart'},
                                {title: 'Net Profit', Props: 'NPReports', Icon: 'MaterialCommunityIcons', name: 'cash-multiple'},
                            ]

    return (
        <Container style={{backgroundColor: '#fdfdfd'}}>
        <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'salmon'}}>
               <Left> 
                 <Button transparent onPress={()=> this.props.navigation.goBack()}>
                 <MaterialIcons name="arrow-back" size={25} color="white" />
                </Button> 
               </Left>
               <Body style={{justifyContent: "center", alignContent: "center"}}>
                   <Title style={{color: 'white'}}>Reports</Title>
               </Body>
             
               </Header>
       
         <FlatGrid
      itemDimension={120}
      data={report_details}
      // staticDimension={300}
      // fixed
      spacing={10}
      renderItem={({ item }) => (
          <TouchableOpacity onPress={()=> this.props.navigation.navigate(item.Props)}>
         <Card style={{borderRadius: 10, padding: 10, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#f3ca9e'}}>
         {item.Icon === 'Entypo'?   <Entypo name={item.name} size={50}/>:item.Icon === 'Feather'?   <Feather name={item.name} size={50}/>:item.Icon === 'SimpleLineIcons'?   <SimpleLineIcons name={item.name} size={50}/>:item.Icon === 'Ionicons'?   <Ionicons name={item.name} size={50}/>:item.Icon === 'MaterialCommunityIcons'? <MaterialCommunityIcons name={item.name} size={50}/>:item.Icon === 'AntDesign'? <AntDesign name={item.name} size={50}/>:<FontAwesome5 name={item.name} size={50}/>}
       <Text style={{fontSize: 15, fontWeight: 'bold'}}>{item.title}</Text>
         </Card>
            </TouchableOpacity>
      )}
    />
         
        
       </Container>
    );
  }


}
export default Reports;