import React, { Component } from 'react';
import {FlatList, TouchableOpacity, Dimensions, View, Alert, StatusBar,SafeAreaView} from 'react-native';
import { Col,Form,Textarea, Card, CardItem, Body, Button, Left, ListItem, List, Thumbnail, Right, Text,Grid, Icon,  Container, Header,Item, Input } from 'native-base';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import styles from './styles'
import FastImage from 'react-native-fast-image';
const SCREEN_WIDTH = Dimensions.get('window').width;
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';


export default class Products extends Component {
    constructor(props) {
        super(props);
        this.ref = firestore().collection('products').where('category', "array-contains", this.props.title);
        this.ref = this.ref.where('storeId', '==', this.props.storeId);

        this.state = {
          loading: false,      
          data: [],      
          error: null,    
          items:[],
          searchText:'',
          store_name: '',
          isVisible: false,
        };
    
        this.arrayholder = [];
    }
  
 

   toggleProduct (id, status){
     let prodref = firestore().collection('products').doc(id);
      prodref.update({
        status:  !status
      });
   }
      

    onCollectionUpdate = (querySnapshot) => {
      const products = [];
      querySnapshot.forEach((doc) => {
       products.push ({
              datas : doc.data(),
              key : doc.id
              });
      });
      this.arrayholder = products;
      this.setState({
          data: products
      })
    }
  
    componentDidMount() {
      this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
    }
  
    searchFilterFunction = text => {    
      const newData = this.arrayholder.filter(item => {      
        const itemData = `${item.datas.name.toUpperCase()}   
         ${item.datas.section.toUpperCase()}`;
        
         const textData = text.toUpperCase();
          
         return itemData.indexOf(textData) > -1;
      });
     
        this.setState({ data: newData }); 
      
     
    };

    rowRenderer = (data) => {
        const { name, price, quantity, featured_image, unit, status, id, store_id, sale_price,sale_description,brand } = data;
        return (
            <List>
            <ListItem>
              <Body>
                <Text>{name} ({unit} )</Text>
                <Text note>{brand}</Text>
              </Body>
            </ListItem>
          </List>
        )
      }
    

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
       
        <Header searchBar rounded androidStatusBarColor={'#696969'} style={{backgroundColor: 'salmon'}}>
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search..."
                onChangeText={(text) => this.searchFilterFunction(text)}
                
                style={{marginTop: 9}} />
          </Item>
          <Button transparent>
            <Text>Search</Text>
          </Button>
        </Header>
        {this.searchFilterFunction &&
        <FlatList
          data={this.state.data}
          ItemSeparatorComponent={this.ListViewItemSeparator}
          renderItem={({ item }) => this.rowRenderer(item.datas)}
          keyExtractor={(item, index) => index.toString()}
          /> }
         
      </SafeAreaView>
    );
  }
}