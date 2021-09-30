import React,{ Component} from 'react';
import { 
    View, 
    Text, 
    Button, 
    TouchableOpacity, 
    Dimensions,
    TextInput,
    Platform,
    StyleSheet ,
    StatusBar,
    BackHandler,
    Alert,ScrollView
} from 'react-native';
import {Card, Container} from 'native-base'
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Loader from '../component/Loader';
import messaging from '@react-native-firebase/messaging';

export default class Login extends Component  {
    constructor() {
        super();
        this.state = {
          user: null,
          email: "",
          password: "",
          formValid: true,
          errorMessage: "",
          loading: false
        };
      }

    async componentDidMount(){
      const loggedIn = await AsyncStorage.getItem('uid');
   messaging().getToken().then(token=>{
      console.log('Admintoken: ', token)
      AsyncStorage.setItem('Admintoken', token)
    })
      if (loggedIn){
        this.props.navigation.navigate('Home')
      }else{
        this.props.navigation.navigate('Login')
      }
    }

    userLogin = async() => {
     
        if(this.state.email === '' && this.state.password === '') {
          Alert.alert('Enter details to signin!')
        } else {
          this.setState({
            loading: true,
          })
          const token= await AsyncStorage.getItem('Admintoken');
        auth()
          .signInWithEmailAndPassword(this.state.email, this.state.password)
          .then((res) => {      
            AsyncStorage.setItem('uid', auth().currentUser.uid);           
            this.setState({loading: false })
             const updateRef = firestore().collection('admin_token').doc('token');
        updateRef.update({
          tokens: firestore.FieldValue.arrayUnion(token)
        });
            this.props.navigation.navigate('Home')
          })
          .catch(error => this.setState({ errorMessage: error.message, loading: false }))
        }
      }
        
    render(){
    return (
      <Container style={styles.container}>
          <Loader loading={this.state.loading}/>
        <ScrollView>
        <View style={styles.header}>
            <Text style={styles.error}>{this.state.errorMessage}</Text>
        </View>
        <View style={styles.header}>
    <Text style={styles.text_header}>Welcome!</Text>
        </View>

        <Card style={{backgroundColor: '#ffffff'}}>
            <Text style={styles.text_footer}>Email</Text>
            <View style={styles.action}>
                <FontAwesome 
                    name="user-o"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Email"
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(text) => this.setState({email: text})}
                />
               
            </View>

            <Text style={[styles.text_footer, {
               
            }]}>Password</Text>
            <View style={styles.action}>
                <Feather 
                    name="lock"
                    color="#05375a"
                    size={20}
                />
                <TextInput 
                    placeholder="Your Password"
                    secureTextEntry={true}
                    style={styles.textInput}
                    autoCapitalize="none"
                    onChangeText={(text) => this.setState({password: text})}
                    
                />
                <TouchableOpacity
                   
                >
                </TouchableOpacity>
            </View>

            <TouchableOpacity  onPress={() => this.props.navigation.navigate('ForgotPass')}>
                <Text style={{color: 'red', marginTop:15, justifyContent: "center", alignSelf: "center"}}>Forgot password?</Text>
            </TouchableOpacity>
            <View style={styles.button}>
            <TouchableOpacity   style={[styles.signIn, {
                        borderColor: 'red',
                        borderWidth: 1,
                        marginTop: 15,
                    }]} onPress={()=> this.userLogin()}>
                <LinearGradient
                    colors={['tomato', 'red']}
                    style={styles.signIn}
                >
                    <Text style={[styles.textSign, {
                        color:'#fff'
                    }]}>Sign In</Text>
                </LinearGradient>
                </TouchableOpacity>
            </View>
        </Card>
        </ScrollView>
      </Container>
    );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1, 
      backgroundColor: 'red'
    },
    header: {
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 50
    },
    footer: {
        
        width: 300,
        height: 200,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 30,
        marginBottom: 300
    },
    text_header: {
        marginTop: 50,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 30
    },
    error: {
        marginTop: 10,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        justifyContent: "center",
        alignContent: "center"
    },
    text_footer: {
        color: '#05375a',
        fontSize: 18,
        paddingHorizontal: 10,
        paddingTop: 10
    },
    action: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    textInput: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 0 : -12,
        paddingLeft: 10,
        color: '#05375a',
    },
    button: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    signIn: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    
    },
    textSign: {
        fontSize: 18,
        fontWeight: 'bold'
    }
  });
