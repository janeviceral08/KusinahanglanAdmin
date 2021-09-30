import React, { useEffect } from 'react';

import { Button, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';

import {Dimensions} from 'react-native';

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import 'react-native-gesture-handler';
import Home from './screens/Home';
import Store from './screens/Store';
import User from './screens/User';
import Rider from './screens/Rider';
import Login from './auth/Login';
import SideMenu from './component/SideMenu';
import Pending from './screens/orders/Pending';
import OTW from './screens/orders/OTW';
import Processing from './screens/orders/Processing';
import Delivered from './screens/orders/Delivered';
import Cancelled from './screens/orders/Cancelled';
import OrderDetails from './screens/orders/OrderDetails';
import StoreProducts from './screens/stores/StoreProducts';
import AddRider from './screens/AddRider';
import AddStore from './screens/AddStore';
import riderDetails from './screens/riders/riderDetails';
import TrackRider from './screens/TrackRider';
import SplashScreen from './auth/Splash';
import DeliveryCharge from './screens/DeliveryCharge';
import Carousel from './screens/Carousel';
import Categories from './screens/Categories';
import AddCategories from './screens/AddCategories';
import Reports from './screens/Reports';
import LTP from './screens/LTP';
import AppShare from './screens/AppShare';
import GIReports from './screens/GIReports';
import NPReports from './screens/NPReports';
import OrderReports from './screens/OrderReports';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Top = createMaterialTopTabNavigator();
const Drawer = createDrawerNavigator();


function appDrawer() {
  return (
    <Drawer.Navigator  drawerContent={(props) => <SideMenu {...props} /> } >
   
      <Drawer.Screen name="MainTabs" component={MainTabs}    options={{headerShown:false}} />
      <Stack.Screen 
        name="AddRider" 
        component={AddRider} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="AddStore" 
        component={AddStore} 
        options={{headerShown:false}}
        />  
          <Stack.Screen 
        name="DeliveryCharge" 
        component={DeliveryCharge} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="Carousel" 
        component={Carousel} 
        options={{headerShown:false}}
        /> 
        <Stack.Screen 
        name="Categories" 
        component={Categories} 
        options={{headerShown:false}}
        /> 
        <Stack.Screen 
        name="Reports" 
        component={ReportsStack} 
        options={{headerShown:false}}
        />  
        <Stack.Screen 
        name="TrackRider" 
        component={TrackRider} 
        options={{headerShown:false}}
        />  
     {/* <Stack.Screen 
        name="appDrawer" 
        component={appDrawer} 
        options={{headerShown:false}}
     /> */}
    </Drawer.Navigator>
  );
}
function ReportsStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
        name="Home" 
        component={Reports} 
        options={{headerShown:false}}
        /> 
        <Stack.Screen 
        name="LTP" 
        component={LTP} 
        options={{headerShown:false}}
        /> 
           <Stack.Screen 
        name="AppShare" 
        component={AppShare} 
        options={{headerShown:false}}
        />    
        <Stack.Screen 
        name="GIReports" 
        component={GIReports} 
        options={{headerShown:false}}
        />
          <Stack.Screen 
        name="NPReports" 
        component={NPReports} 
        options={{headerShown:false}}
        />
        <Stack.Screen 
        name="OrderReports" 
        component={OrderReports} 
        options={{headerShown:false}}
        />
        
    </Stack.Navigator>
  );
}
function UserStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
        name="User" 
        component={User} 
        options={{headerShown:false}}
        />  
      
        
    </Stack.Navigator>
  );
}
function RiderStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen 
        name="Rider" 
        component={Rider} 
        options={{headerShown:false}}
        />  
      
      <Stack.Screen 
        name="Details" 
        component={riderDetails} 
        options={{headerShown:false}}
        />  
      
    </Stack.Navigator>
  );
}
function StoreStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Store" 
        component={Store} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="Details" 
        component={StoreProducts} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}

function PendingStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Pending" 
        component={Pending} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetails} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}
function ProcessingStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Processing" 
        component={Processing} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetails} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}
function DeliveredStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Delivered" 
        component={Delivered} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetails} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}
function CancelledStack() {
  return (
    <Stack.Navigator>
           <Stack.Screen 
        name="Cancelled" 
        component={Cancelled} 
        options={{headerShown:false}}/>  
        <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetails} 
        options={{headerShown:false}}/> 
    </Stack.Navigator>
  );
}
function TopTabs() {
  return (
    <Top.Navigator tabBarOptions={{
      activeTintColor: 'white',
      inactiveTintColor: 'white',
      style: {
        fontSize: 12,
      },
      scrollEnabled: true,
    }}
    
    screenOptions={{
      tabBarIndicatorStyle: { backgroundColor: 'white'},
      tabBarLabelStyle: { fontSize: 12 },
      tabBarItemStyle: { width: 120 },
      tabBarStyle: { backgroundColor: 'rgba(56, 172, 236, 1)'},
    }}>
      <Top.Screen name="Pending" component={PendingStack} />
      <Top.Screen name="Processing" component={ProcessingStack} />
      <Top.Screen name="Delivered" component={DeliveredStack} />
      <Top.Screen name="Cancelled" component={CancelledStack} />
    </Top.Navigator>
  );
}
function MainTabs() {
  return (
    <Tab.Navigator tabBarOptions={{
      activeTintColor: '#e87b1c',
      inactiveTintColor: 'black',
      style: {
        backgroundColor: 'salmon',
    
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      },
      
    }}
    initialRouteName="Home"
    >
       
       
        
        <Tab.Screen 
            name="Home" 
            component={HomeStack}
            options={{headerShown:false,
              tabBarLabel: 'Home',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'home'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
            }} 
            />  
            <Tab.Screen 
            name="Orders" 
            component={TopTabs} 
            options={{headerShown:false,
              tabBarLabel: 'Orders',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'profile'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
           
            }}
            
          />  
              <Tab.Screen 
          name="Stores" 
          component={StoreStack}
          options={{headerShown:false,
            tabBarLabel: 'Stores',
            tabBarIcon: ({focused, color, size, tintColor}) => (
              <AntDesign name={'isv'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
            ),
            
          }}
        
        />  
             <Tab.Screen 
            name="Users" 
            component={UserStack} 
            options={{headerShown:false,
              tabBarLabel: 'Users',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'user'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
           
            }}
            
            />  
             <Tab.Screen 
            name="Riders" 
            component={RiderStack} 
            options={{headerShown:false,
              tabBarLabel: 'Riders',
              tabBarIcon: ({focused, color, size, tintColor}) => (
                <AntDesign name={'contacts'} size={25} color={color}  style={{ paddingTop: 2}} active={focused}/>
              ),
           
            }}
            
            />   
    </Tab.Navigator>
  );
}


function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{headerShown:false}}
      />
      
       
    </Stack.Navigator>
  );
}

const App = () => {
    useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('remoteMessage: ', remoteMessage)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'notif',
      });
  
      // Display a notification
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
          sound: 'notif',
        },
      });
    });

    return unsubscribe;
  }, []);
  return (
      <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown:false}}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown:false}}
          />
         <Stack.Screen
            name="Home"
            component={appDrawer}
            options={{headerShown:false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  shadow:{
    shadowColor: '#7f5df0',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius:3.5,
    elevation:5
  }
})

export default App;
