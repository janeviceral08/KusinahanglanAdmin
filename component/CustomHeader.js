import React, { Component } from 'react';
import {View, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import {Container, Header , Left, Right,Body, Button, Icon, Title, Text, List, ListItem} from 'native-base';


class CustomHeader extends Component {
  render(){
      let {title, isHome, Cartoff} = this.props;
    return(
      <Header androidStatusBarColor="#2c3e50" style={{display:'none'}} style={{backgroundColor: 'rgba(56, 172, 236, 1)'}}>
          <Left style={{flex:1}}>
            {
                isHome ?
                  <Button transparent onPress={()=> this.props.navigation.openDrawer()}>
                    <Icon style={{color:'white'}} name='menu' />
                 </Button> :
                 <Button transparent onPress={()=> this.props.navigation.goBack()}>
                    <Icon style={{color:'white'}} name='arrow-back' />
                 </Button> 
                 
            }
          
          </Left>
          <Body style={{flex: 3}}>
            <Title style={{color:'white'}}>{title}</Title>
          </Body>
          <Right style={{flex:1}}>
          </Right>
        </Header>
    )
  }
}

export default CustomHeader;