//This is an example code for Bottom Navigation//
import React,{Component} from 'react';

//import all the basic component we have used
import {Card, CardItem, Left, Right, Body, Container,Thumbnail, Tabs, Tab,ScrollableTab} from 'native-base';
import Open from './stores/Open';
import Close from './stores/Close';
import Admin from './stores/AdminClose';
import CustomHeader from '../component/CustomHeader';


export default class Store extends Component {
  render() {
    return (
      <Container >
        <CustomHeader title="Stores" isHome={true} navigation={this.props.navigation}/>
         <Tabs  renderTabBar={()=> <ScrollableTab style={{ backgroundColor: "white" }} />}>
          <Tab heading="Open"   tabStyle={{backgroundColor: 'white', borderRadius: 20}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Open navigation={this.props.navigation}/>
          </Tab>
          <Tab heading="Close" tabStyle={{backgroundColor: '#FFFFFF', borderRadius: 20}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Close navigation={this.props.navigation}/> 
          </Tab>
          <Tab heading="Admin Close" tabStyle={{backgroundColor: '#FFFFFF', borderRadius: 20}} textStyle={{color: 'tomato'}} activeTabStyle={{ height: 35,backgroundColor: 'salmon',borderRadius: 20,marginTop: 10,}} activeTextStyle={{color: '#fff', fontWeight: 'normal'}}>
            <Admin navigation={this.props.navigation}/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}