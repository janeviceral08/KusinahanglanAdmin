import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const SCREEN_WIDTH = Dimensions.get('window').width;
const styles = StyleSheet.create({
 
  categoriesPhoto: {
    width: '100%',
    height: 150,
    shadowColor: 'blue',
    shadowOffset: {
      width: 0,
      height: 3
    },
    
    shadowRadius: 5,
    shadowOpacity: 1.0,
    elevation: 3
  },
  productPhoto: {
    width: '100%',
    height: 150,
    shadowColor: 'blue',
    backgroundColor:'#cccccc',
    shadowOffset: {
      width: 0,
      height: 3
    },
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    elevation: 3
  },
  favorite: {
    zIndex: 3,
    elevation: 3,
    position:'absolute',
    justifyContent: "flex-end",
    marginLeft : 10,
    marginVertical : 10
  },
  subtitlSale: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position:'absolute',
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 5,
    borderTopLeftRadius: 20
  },
  subtitleopen: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position:'absolute',
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 5,
    borderTopLeftRadius: 20
  },
  subtitleclose: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position:'absolute',
    flex: 1,
    backgroundColor: '#e53935',
    padding: 5,
    borderTopLeftRadius: 20
  },
  textoverlay: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '100',
    fontStyle: 'italic',
    zIndex: 3,
    elevation: 3,
    position:'absolute',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    color: '#ffffff'
  },
  categoriesName: { 
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#043D08',
    padding : 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  categoriesStoreName: { 
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    padding : 1,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 20,
   

  },
  categoriesAddress: {
    fontSize: 15,
    textAlign: 'center',
    color: '#043D08',
    paddingBottom : 5,
  },
  categoriesPrice: {
    fontSize: 15,
    paddingLeft: 20,
    fontWeight: "bold",
    color: 'tomato',
    padding : 1,
  
  },
  categoriesPriceSale: {
    fontSize: 10,
    color: '#043D08',
    padding : 1,
    textDecorationLine: 'line-through',
  
  },
  categoriesInfo: {
    marginTop: 3,
    marginBottom: 5
  },
  text: {
    width: Dimensions.get('window').width / 2 - 10,
    height: 200,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    color: '#fdfdfd',
    fontSize: 15,
    fontWeight: '900'
  },
  categoriesItemContainer:{
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    margin : 5,
    backgroundColor: '#ffffb2'
  }
});

export default styles;
